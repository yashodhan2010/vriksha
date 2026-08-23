import { NextResponse } from "next/server";
import { getActiveExecutionSubscriptionRows, getExecutionUser } from "@/lib/execution-auth";
import { buildExecutionSubscriptions } from "@/lib/execution-exports";
import { strategies } from "@/lib/data";

export async function GET() {
  const user = await getExecutionUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const rows = await getActiveExecutionSubscriptionRows(user.id);
  return NextResponse.json(buildExecutionSubscriptions(strategies, rows));
}

