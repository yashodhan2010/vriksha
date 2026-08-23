import { NextResponse } from "next/server";
import {
  executionScopes,
  getActiveExecutionSubscriptionRows,
  getExecutionAuthorizedUserId
} from "@/lib/execution-auth";
import { buildExecutionSubscriptions } from "@/lib/execution-exports";
import { strategies } from "@/lib/data";

export async function GET(request: Request) {
  const userId = await getExecutionAuthorizedUserId(request, executionScopes.subscriptions);
  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const rows = await getActiveExecutionSubscriptionRows(userId);
  return NextResponse.json(buildExecutionSubscriptions(strategies, rows));
}
