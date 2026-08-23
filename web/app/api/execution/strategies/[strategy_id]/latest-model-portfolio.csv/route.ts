import { NextResponse } from "next/server";
import { getStrategy } from "@/lib/data";
import {
  executionScopes,
  getExecutionAuthorizedUserId,
  hasActiveExecutionSubscription
} from "@/lib/execution-auth";
import { buildLatestModelPortfolioCsv } from "@/lib/execution-exports";

function csvResponse(filename: string, body: string) {
  return new NextResponse(body, {
    headers: {
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": "text/csv; charset=utf-8"
    }
  });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ strategy_id: string }> }
) {
  const { strategy_id: strategyId } = await params;
  const userId = await getExecutionAuthorizedUserId(request, executionScopes.latestModelPortfolio);
  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const strategy = getStrategy(strategyId);
  if (!strategy || !strategy.exports?.latestModelPortfolioCsv || strategy.holdings.length === 0) {
    return NextResponse.json({ error: "Export not found" }, { status: 404 });
  }

  if (!(await hasActiveExecutionSubscription(userId, strategy.slug))) {
    return NextResponse.json({ error: "Active subscription required" }, { status: 403 });
  }

  return csvResponse(`${strategy.slug}-latest-model-portfolio.csv`, buildLatestModelPortfolioCsv(strategy));
}
