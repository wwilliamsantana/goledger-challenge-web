import { NextRequest, NextResponse } from "next/server";
import { apiPut } from "@/lib/api";

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await apiPut("/invoke/updateAsset", body);
    return NextResponse.json(data);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
