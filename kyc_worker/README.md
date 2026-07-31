# KYC OCR Worker

This worker is the background harness for KYC validation. It is intentionally separate from the
Next.js/Vercel app because OCR/ONNX processing is CPU-heavy and should run as a worker process.

## Runtime

Required environment variables:

```text
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
KYC_WORKER_ID=local-kyc-worker
```

Local test:

```powershell
cd kyc_worker
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python worker.py --once
```

Production target:

```text
User submits KYC
-> Supabase creates pending kyc_validation_jobs
-> worker polls jobs automatically
-> worker downloads private storage object
-> RapidOCR extracts text
-> field extractor + scorer writes pass/fail
-> clean submissions become auto_verified
-> exceptions become manual_review_required
```

Future KRA/CKYC/DigiLocker integrations should create validation jobs with `source = kra`, `ckyc`,
or `digilocker`, then write the same profile status fields used by OCR.
