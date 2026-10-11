import { NextRequest, NextResponse } from "next/server";
import { reserveRequest } from "@/lib/usage-limit";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");
  const pageToken = request.nextUrl.searchParams.get("pageToken");

  if (!query) {
    return NextResponse.json(
      { error: "A pesquisa é obrigatória." },
      { status: 400 },
    );
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Chave da Google Places não configurada." },
      { status: 500 },
    );
  }

  const usage = await reserveRequest();

  if (!usage.ok) {
    return NextResponse.json(
      { error: "Limite mensal de pesquisas atingido. Volte no próximo mês." },
      { status: 429 },
    );
  }

  let response: Response;

  try {
    response = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,nextPageToken",
        },
        body: JSON.stringify({
          textQuery: query,
          pageSize: 20,
          ...(pageToken ? { pageToken } : {}),
        }),
      },
    );
  } catch {
    return NextResponse.json(
      { error: "Não foi possível consultar o Google Places." },
      { status: 502 },
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("Google Places:", response.status, data.error?.message);

    return NextResponse.json(
      {
        error:
          response.status === 429
            ? "Limite diário do Google Places atingido. Tente novamente amanhã."
            : "Erro ao consultar Google Places.",
      },
      { status: response.status },
    );
  }

  const results = (data.places ?? []).map(
    (place: {
      displayName?: { text?: string };
      formattedAddress?: string;
      nationalPhoneNumber?: string;
      websiteUri?: string;
    }) => ({
      name: place.displayName?.text ?? "",
      address: place.formattedAddress ?? "",
      phone: place.nationalPhoneNumber ?? "",
      website: place.websiteUri ?? "",
    }),
  );

  return NextResponse.json({
    results,
    ...(data.nextPageToken ? { nextPageToken: data.nextPageToken } : {}),
  });
}
