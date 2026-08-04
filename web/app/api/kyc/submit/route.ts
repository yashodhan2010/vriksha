import crypto from "crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/access";
import {
  hashSensitiveValue,
  isValidPan,
  kycAcceptedMimeTypes,
  kycMaxFileBytes,
  kycStorageBucket,
  kycVersions,
  maskPan,
  normalizePan,
  normalizePincode,
  type KycDocumentType
} from "@/lib/kyc";
import { triggerKycWorker } from "@/lib/kyc-worker-trigger";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const kycSchema = z.object({
  clientType: z.enum(["individual", "huf", "non_individual", "accredited_investor"]),
  firstName: z.string().min(1).max(80),
  middleName: z.string().max(80).optional(),
  lastName: z.string().min(1).max(80),
  pan: z.string().min(10).max(20),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  mobile: z.string().min(8).max(20),
  email: z.string().email().max(160),
  addressLine1: z.string().min(5).max(240),
  addressLine2: z.string().max(240).optional(),
  city: z.string().min(2).max(120),
  state: z.string().min(2).max(120),
  pincode: z.string().min(6).max(12),
  familyGroupName: z.string().max(160).optional(),
  dependentFamilyDeclaration: z.boolean(),
  consentAccepted: z.literal(true)
});

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function getBoolean(formData: FormData, key: string) {
  return formData.get(key) === "true";
}

function getFile(formData: FormData, key: string) {
  const value = formData.get(key);
  return value instanceof File && value.size > 0 ? value : null;
}

function validateFile(file: File, label: string) {
  if (!kycAcceptedMimeTypes.has(file.type)) {
    return `${label} must be a PDF, JPEG, PNG, or WebP file.`;
  }
  if (file.size > kycMaxFileBytes) {
    return `${label} must be 10 MB or smaller.`;
  }
  return null;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Login required before KYC submission." }, { status: 401 });
  }

  const formData = await request.formData();
  const parsed = kycSchema.safeParse({
    clientType: getString(formData, "clientType"),
    firstName: getString(formData, "firstName"),
    middleName: getString(formData, "middleName"),
    lastName: getString(formData, "lastName"),
    pan: getString(formData, "pan"),
    dob: getString(formData, "dob"),
    mobile: getString(formData, "mobile"),
    email: getString(formData, "email"),
    addressLine1: getString(formData, "addressLine1"),
    addressLine2: getString(formData, "addressLine2"),
    city: getString(formData, "city"),
    state: getString(formData, "state"),
    pincode: getString(formData, "pincode"),
    familyGroupName: getString(formData, "familyGroupName"),
    dependentFamilyDeclaration: getBoolean(formData, "dependentFamilyDeclaration"),
    consentAccepted: getBoolean(formData, "consentAccepted")
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Please complete all required KYC fields." }, { status: 400 });
  }

  const pan = normalizePan(parsed.data.pan);
  if (!isValidPan(pan)) {
    return NextResponse.json({ error: "Please enter a valid PAN format." }, { status: 400 });
  }

  const pincode = normalizePincode(parsed.data.pincode);
  if (pincode.length !== 6) {
    return NextResponse.json({ error: "Please enter a valid 6 digit pincode." }, { status: 400 });
  }

  const panFile = getFile(formData, "panDocument");
  const addressFile = getFile(formData, "addressDocument");
  if (!panFile || !addressFile) {
    return NextResponse.json({ error: "PAN and address proof documents are required." }, { status: 400 });
  }

  const panError = validateFile(panFile, "PAN document");
  const addressError = validateFile(addressFile, "Address Proof");
  if (panError || addressError) {
    return NextResponse.json({ error: panError ?? addressError }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "KYC storage is not configured." }, { status: 500 });
  }

  const headerStore = await headers();
  const forwardedFor = headerStore.get("x-forwarded-for");
  const ipAddress = forwardedFor?.split(",")[0]?.trim() ?? null;
  const userAgent = headerStore.get("user-agent");

  const firstName = parsed.data.firstName.trim();
  const middleName = parsed.data.middleName?.trim() || "";
  const lastName = parsed.data.lastName.trim();
  const fullName = [firstName, middleName, lastName].filter(Boolean).join(" ");

  const { data: profile, error: profileError } = await supabase
    .from("kyc_profiles")
    .insert({
      user_id: user.id,
      client_type: parsed.data.clientType,
      full_name: fullName,
      first_name: firstName,
      middle_name: middleName || null,
      last_name: lastName,
      pan_last4: maskPan(pan),
      pan_hash: hashSensitiveValue(pan),
      dob: parsed.data.dob,
      mobile: parsed.data.mobile.trim(),
      email: parsed.data.email.trim().toLowerCase(),
      address_line1: parsed.data.addressLine1.trim(),
      address_line2: parsed.data.addressLine2?.trim() || null,
      city: parsed.data.city.trim(),
      state: parsed.data.state.trim(),
      pincode,
      family_group_name: parsed.data.familyGroupName?.trim() || null,
      dependent_family_declaration: parsed.data.dependentFamilyDeclaration,
      status: "queued_for_validation",
      source: "manual_upload"
    })
    .select("id")
    .single();

  if (profileError || !profile) {
    return NextResponse.json(
      {
        error: "Could not create KYC profile.",
        detail: process.env.NODE_ENV !== "production" ? profileError?.message : undefined
      },
      { status: 500 }
    );
  }

  const files: Array<{ file: File; documentType: KycDocumentType }> = [
    { file: panFile, documentType: "pan" },
    { file: addressFile, documentType: "address_proof" }
  ];

  const documentIds: string[] = [];
  for (const item of files) {
    const extension = item.file.name.split(".").pop()?.toLowerCase() || "bin";
    const documentId = crypto.randomUUID();
    const storagePath = `${user.id}/${profile.id}/${documentId}.${extension}`;
    const arrayBuffer = await item.file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    const fileHash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

    const upload = await supabase.storage
      .from(kycStorageBucket)
      .upload(storagePath, fileBuffer, {
        contentType: item.file.type,
        upsert: false
      });

    if (upload.error) {
      return NextResponse.json({ error: `Could not upload ${item.documentType} document.` }, { status: 500 });
    }

    const { data: documentRow, error: documentError } = await supabase
      .from("kyc_documents")
      .insert({
        id: documentId,
        kyc_profile_id: profile.id,
        user_id: user.id,
        document_type: item.documentType,
        storage_bucket: kycStorageBucket,
        storage_path: storagePath,
        original_filename: item.file.name,
        file_sha256: fileHash,
        mime_type: item.file.type,
        size_bytes: item.file.size,
        status: "queued"
      })
      .select("id")
      .single();

    if (documentError || !documentRow) {
      return NextResponse.json({ error: `Could not record ${item.documentType} document.` }, { status: 500 });
    }

    documentIds.push(documentRow.id);
  }

  await supabase.from("kyc_consents").insert({
    user_id: user.id,
    kyc_profile_id: profile.id,
    privacy_policy_version: kycVersions.privacyPolicy,
    terms_version: kycVersions.terms,
    mitc_version: kycVersions.mitc,
    kyc_consent_version: kycVersions.consent,
    ip_address: ipAddress,
    user_agent: userAgent
  });

  await supabase.from("kyc_audit_events").insert({
    user_id: user.id,
    kyc_profile_id: profile.id,
    event_type: "kyc_submitted",
    metadata: {
      document_ids: documentIds,
      source: "manual_upload"
    }
  });

  await supabase.from("kyc_validation_jobs").insert(
    documentIds.map((documentId) => ({
      kyc_profile_id: profile.id,
      document_id: documentId,
      source: "ocr",
      status: "pending"
    }))
  );

  const workerTrigger = await triggerKycWorker(documentIds.length);

  return NextResponse.json({
    ok: true,
    kycProfileId: profile.id,
    status: "queued_for_validation",
    workerTrigger
  });
}
