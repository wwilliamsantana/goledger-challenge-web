import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { apiPost, QUERY_CACHE_TAG } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await apiPost("/invoke/createAsset", body);
    revalidateTag(QUERY_CACHE_TAG);
    return NextResponse.json(data);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
