export async function triggerKycWorker(limit = 5) {
  const triggerUrl = process.env.KYC_WORKER_TRIGGER_URL;
  const secret = process.env.KYC_WORKER_SECRET;

  if (!triggerUrl || !secret) {
    return { triggered: false, reason: "worker trigger not configured" };
  }

  try {
    const response = await fetch(triggerUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${secret}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ limit }),
      cache: "no-store"
    });

    if (!response.ok) {
      return { triggered: false, reason: `worker returned ${response.status}` };
    }

    return { triggered: true, reason: null };
  } catch (error) {
    return {
      triggered: false,
      reason: error instanceof Error ? error.message : "worker trigger failed"
    };
  }
}
