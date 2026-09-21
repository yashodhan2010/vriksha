# KYC Operations

## Public App Pages

```text
/kyc
/checkout
/admin/kyc
```

Checkout is blocked unless the logged-in user has a KYC profile with status `auto_verified` or
`verified`.

## Required Production Environment Variables

The Next.js app needs:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_EMAILS=yashodhan@example.com,compliance@example.com
RESEND_API_KEY=
CONTACT_FROM_EMAIL=Vriksha Capital <enquiry@vriksha-capital.com>
CONTACT_TO_EMAIL=enquiry@vriksha-capital.com
KYC_WORKER_TRIGGER_URL=https://your-worker-domain.example.com/jobs/process
KYC_WORKER_SECRET=long-random-worker-trigger-secret
KYC_VALIDATION_MODE=ocr
KYC_FIELD_ENCRYPTION_KEY=long-random-field-encryption-secret
```

The OCR worker needs:

```text
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
KYC_WORKER_ID=production-kyc-worker-01
KYC_ADMIN_EMAIL=enquiry@vriksha-capital.com
RESEND_API_KEY=
CONTACT_FROM_EMAIL=Vriksha Capital <enquiry@vriksha-capital.com>
KYC_WORKER_SECRET=long-random-worker-trigger-secret
KYC_FIELD_ENCRYPTION_KEY=long-random-field-encryption-secret
```

Do not expose `SUPABASE_SERVICE_ROLE_KEY` in browser code or client-visible settings.

## CVL KRA Validation Mode

Set the website to create KRA jobs instead of OCR jobs:

```text
KYC_VALIDATION_MODE=kra
KYC_FIELD_ENCRYPTION_KEY=long-random-field-encryption-secret
```

`KYC_FIELD_ENCRYPTION_KEY` must be identical in Vercel and the worker environment. It is used to
encrypt the PAN into the private validation job payload so the worker can query CVL without storing
plain PAN in `kyc_profiles`.

Put CVL credentials only in the worker environment:

```text
CVL_KRA_ENV=production
CVL_KRA_STATUS_URL=https://www.cvlkra.com/PanInquiry.asmx/GetPanStatus
CVL_KRA_LOGIN_CODE=
CVL_KRA_POS_CODE=
CVL_KRA_PASSWORD=
CVL_KRA_PASS_KEY=
CVL_KRA_TIMEOUT_SECONDS=30
```

Keep the actual `CVL_KRA_LOGIN_CODE`, `CVL_KRA_POS_CODE`, and `CVL_KRA_PASSWORD` out of chat,
`CVL_KRA_PASS_KEY` out of chat, source control, frontend code, and screenshots. CVL's public
PANInquiry docs show `GetPanStatus` as an HTTP form POST using `panNo`, `userName`, `PosCode`,
`password`, and `PassKey`.

## Admin Access

Admin is granted when either condition is true:

```text
1. User email is listed in ADMIN_EMAILS
2. public.profiles.role is admin, research_analyst, or compliance
```

Supabase SQL fallback:

```sql
update public.profiles
set role = 'admin'
where lower(email) = lower('your-login-email@example.com');
```

## Local Worker

```powershell
cd "C:\Users\Yashodhan\OneDrive\Documents\Vriksha\vriksha\kyc_worker"
.\.venv\Scripts\Activate.ps1
python worker.py --once
```

Continuous local polling:

```powershell
python worker.py
```

Local HTTP trigger service:

```powershell
$env:KYC_WORKER_SECRET="long-random-worker-trigger-secret"
uvicorn server:app --host 127.0.0.1 --port 8088
```

Then set the web app locally:

```text
KYC_WORKER_TRIGGER_URL=http://127.0.0.1:8088/jobs/process
KYC_WORKER_SECRET=long-random-worker-trigger-secret
```

## Production Worker

Run `kyc_worker/worker.py` as a persistent background worker on a small VPS or worker platform.
Do not run OCR inside Vercel request handlers.

Recommended first deployment:

```text
1 vCPU / 1-2 GB RAM VPS
Python venv
pip install -r kyc_worker/requirements.txt
systemd service running python worker.py
```

Recommended automatic mode:

```text
Run uvicorn server:app behind HTTPS
Set KYC_WORKER_TRIGGER_URL in Vercel to https://worker-domain/jobs/process
Set the same KYC_WORKER_SECRET in Vercel and the worker environment
Keep python worker.py or a scheduled process as a fallback poller if desired
```

## KYC Status Flow

```text
submitted
queued_for_validation
ocr_processing
auto_verified
manual_review_required
verified
needs_resubmission
rejected
```

HITL cases land at `/admin/kyc?tab=queue`.

## Go-Live Checklist

```text
1. Apply Supabase migrations.
2. Set production environment variables.
3. Deploy Next.js website.
4. Deploy OCR worker.
5. Log in with an ADMIN_EMAILS account.
6. Submit a test KYC.
7. Confirm OCR auto-verifies clean documents.
8. Confirm manual-review cases appear in /admin/kyc.
9. Confirm checkout is blocked before KYC and unlocked after verification.
```
