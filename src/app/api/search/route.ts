import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");

  if (!query) {
    return NextResponse.json(
      { error: "A pesquisa é obrigatória." },
      { status: 400 },
    );
  }

  NextResponse.json({
    results: [],
  });

  NextResponse.json({ error: "Erro de teste." }, { status: 500 });

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Chave da Google Places não configurada." },
      { status: 500 },
    );
  }

  const response = await fetch(
    "https://places.googleapis.com/v1/places:searchText",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri",
      },
      body: JSON.stringify({
        textQuery: query,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(
      { error: data.error?.message ?? "Erro ao consultar Google Places." },
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
  });
}
