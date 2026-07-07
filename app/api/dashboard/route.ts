import { NextRequest, NextResponse } from "next/server";
import { getDashboardData, type MarketFilter, type Period } from "@/lib/actions/dashboard";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const period = (searchParams.get("period") as Period) ?? "month";
  const marketParam = searchParams.get("market") as MarketFilter | null;

  const data = await getDashboardData(period, marketParam ?? undefined);
  return NextResponse.json(data);
}
