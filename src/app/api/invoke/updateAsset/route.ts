import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { apiPut, QUERY_CACHE_TAG } from "@/lib/api";

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await apiPut("/invoke/updateAsset", body);
    revalidateTag(QUERY_CACHE_TAG);
    return NextResponse.json(data);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
