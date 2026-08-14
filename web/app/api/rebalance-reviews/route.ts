import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, hasStrategyAccess } from "@/lib/access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const reviewSchema = z.object({
  strategySlug: z.string().min(1),
  rebalanceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reviewedChangeIds: z.array(z.string()).default([]),
  visitedViews: z.array(z.enum(["guided", "comparison", "full"])).default([]),
  reviewedAt: z.string().datetime().nullable().optional()
});

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  const supabase = await createSupabaseServerClient();

  if (!user || !supabase) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  const parsed = reviewSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid review payload" }, { status: 400 });
  }

  if (!(await hasStrategyAccess(parsed.data.strategySlug))) {
    return NextResponse.json({ error: "Subscription required" }, { status: 403 });
  }

  const { error, data } = await supabase
    .from("rebalance_reviews")
    .upsert({
      user_id: user.id,
      strategy_slug: parsed.data.strategySlug,
      rebalance_date: parsed.data.rebalanceDate,
      reviewed_change_ids: parsed.data.reviewedChangeIds,
      visited_views: parsed.data.visitedViews,
      reviewed_at: parsed.data.reviewedAt ?? null,
      updated_at: new Date().toISOString()
    }, {
      onConflict: "user_id,strategy_slug,rebalance_date"
    })
    .select("reviewed_change_ids, visited_views, reviewed_at")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Could not save rebalance review state" }, { status: 500 });
  }

  return NextResponse.json({
    reviewedChangeIds: data?.reviewed_change_ids ?? parsed.data.reviewedChangeIds,
    visitedViews: data?.visited_views ?? parsed.data.visitedViews,
    reviewedAt: data?.reviewed_at ?? parsed.data.reviewedAt ?? null
  });
}
