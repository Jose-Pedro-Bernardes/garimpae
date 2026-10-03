import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");

  if (!query) {
    return NextResponse.json(
      { error: "A pesquisa é obrigatória." },
      { status: 400 },
    );
  }

  return NextResponse.json({
    query,
  });
}
