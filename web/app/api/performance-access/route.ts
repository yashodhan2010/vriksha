import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getStrategy } from "@/lib/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const acknowledgementSchema = z.object({
  acknowledgementKey: z.string().min(1).max(160),
  strategySlug: z.string().min(1).max(120).optional(),
  disclaimerVersion: z.string().min(1).max(80).default("v1")
});

export async function POST(request: Request) {
  const parsed = acknowledgementSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid acknowledgement payload" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ ok: true, mode: "local-demo" });
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  if (parsed.data.strategySlug && !getStrategy(parsed.data.strategySlug)) {
    return NextResponse.json({ error: "Strategy not found" }, { status: 404 });
  }

  const headerStore = await headers();
  const forwardedFor = headerStore.get("x-forwarded-for");
  const ipAddress = forwardedFor?.split(",")[0]?.trim() ?? null;

  const { error } = await supabase.from("performance_access_logs").insert({
    user_id: user.id,
    strategy_slug: parsed.data.strategySlug ?? null,
    acknowledgement_key: parsed.data.acknowledgementKey,
    disclaimer_version: parsed.data.disclaimerVersion,
    user_agent: headerStore.get("user-agent"),
    ip_address: ipAddress
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

