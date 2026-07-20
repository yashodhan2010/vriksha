import { NextResponse } from "next/server";
import { hasStrategyAccess } from "@/lib/access";
import { getStrategy } from "@/lib/data";

type CsvValue = string | number | null | undefined;

function csvEscape(value: CsvValue) {
  const text = value === null || value === undefined ? "" : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

function toCsv(headers: string[], rows: CsvValue[][]) {
  return [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n") + "\n";
}

function csvResponse(filename: string, body: string) {
  return new NextResponse(body, {
    headers: {
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": "text/csv; charset=utf-8"
    }
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; kind: string }> }
) {
  const { slug, kind } = await params;
  const strategy = getStrategy(slug);

  if (!strategy) {
    return NextResponse.json({ error: "Strategy not found" }, { status: 404 });
  }

  if (!hasStrategyAccess(slug)) {
    return NextResponse.json({ error: "Subscription required" }, { status: 403 });
  }

  if (kind === "latest-model-portfolio") {
    const headers = ["symbol", "company", "sector", "marketcap", "weight", "note"];
    const rows = strategy.holdings.map((holding) => [
      holding.symbol,
      holding.company,
      holding.sector,
      holding.marketcap,
      holding.weight,
      holding.note
    ]);
    return csvResponse(`${slug}-latest-model-portfolio.csv`, toCsv(headers, rows));
  }

  if (kind === "rebalance-history") {
    const headers = ["date", "symbol", "action", "old_weight", "new_weight", "summary"];
    const rows = strategy.rebalances.flatMap((rebalance) =>
      rebalance.changes.map((change) => [
        rebalance.date,
        change.symbol,
        change.action,
        change.oldWeight,
        change.newWeight,
        rebalance.summary
      ])
    );
    return csvResponse(`${slug}-rebalance-history.csv`, toCsv(headers, rows));
  }

  return NextResponse.json({ error: "Unknown export kind" }, { status: 404 });
}
