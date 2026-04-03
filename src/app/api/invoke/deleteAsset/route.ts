import { NextRequest, NextResponse } from "next/server";
import { apiDelete } from "@/lib/api";

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await apiDelete("/invoke/deleteAsset", body);
    return NextResponse.json(data);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
