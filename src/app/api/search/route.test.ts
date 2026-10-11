import { GET } from "./route";
import { NextRequest } from "next/server";
import { reserveRequest } from "@/lib/usage-limit";

jest.mock("@/lib/usage-limit", () => ({
  reserveRequest: jest.fn(),
}));

const originalApiKey = process.env.GOOGLE_PLACES_API_KEY;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function searchRequest(query = "restaurantes", extra = "") {
  return new NextRequest(`http://localhost:3000/api/search?q=${query}${extra}`);
}

describe("GET /api/search", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    process.env.GOOGLE_PLACES_API_KEY = "test-api-key";

    jest
      .mocked(reserveRequest)
      .mockResolvedValue({ ok: true, used: 1, limit: 800 });

    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();

    if (originalApiKey === undefined) {
      delete process.env.GOOGLE_PLACES_API_KEY;
    } else {
      process.env.GOOGLE_PLACES_API_KEY = originalApiKey;
    }
  });

  describe("validação da query", () => {
    it("deve retornar 400 quando o parâmetro q não for informado", async () => {
      const request = new NextRequest("http://localhost:3000/api/search");

      const response = await GET(request);

      expect(response.status).toBe(400);
    });

    it("deve retornar 400 quando o parâmetro q estiver vazio", async () => {
      const request = new NextRequest("http://localhost:3000/api/search?q=");

      const response = await GET(request);

      expect(response.status).toBe(400);
    });

    it("não deve consumir o limite mensal quando a query for inválida", async () => {
      await GET(new NextRequest("http://localhost:3000/api/search"));

      expect(reserveRequest).not.toHaveBeenCalled();
    });
  });

  describe("configuração", () => {
    it("deve retornar 500 quando a API Key não estiver configurada", async () => {
      delete process.env.GOOGLE_PLACES_API_KEY;

      const response = await GET(searchRequest());
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: "Chave da Google Places não configurada.",
      });
    });

    it("não deve consumir o limite mensal quando a API Key não estiver configurada", async () => {
      delete process.env.GOOGLE_PLACES_API_KEY;

      await GET(searchRequest());

      expect(reserveRequest).not.toHaveBeenCalled();
    });
  });

  describe("limite mensal", () => {
    it("deve retornar 429 e não chamar o Google quando o limite for atingido", async () => {
      jest
        .mocked(reserveRequest)
        .mockResolvedValue({ ok: false, used: 800, limit: 800 });

      const fetchMock = jest.spyOn(global, "fetch");

      const response = await GET(searchRequest());
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data).toEqual({
        error: "Limite mensal de pesquisas atingido. Volte no próximo mês.",
      });
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe("resposta da Google Places API", () => {
    describe("sucesso", () => {
      it("deve retornar os resultados de uma pesquisa válida", async () => {
        jest.spyOn(global, "fetch").mockResolvedValue(
          jsonResponse({
            places: [
              {
                displayName: { text: "Restaurante Teste" },
                formattedAddress: "Niterói - RJ",
                nationalPhoneNumber: "+55 21 99999-9999",
                websiteUri: "https://example.com",
              },
            ],
            nextPageToken: "token-proxima-pagina",
          }),
        );

        const response = await GET(searchRequest());
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual({
          results: [
            {
              name: "Restaurante Teste",
              address: "Niterói - RJ",
              phone: "+55 21 99999-9999",
              website: "https://example.com",
            },
          ],
          nextPageToken: "token-proxima-pagina",
        });
        expect(reserveRequest).toHaveBeenCalledTimes(1);
      });

      it("deve retornar uma lista vazia quando nenhum resultado for encontrado", async () => {
        jest
          .spyOn(global, "fetch")
          .mockResolvedValue(jsonResponse({ places: [] }));

        const response = await GET(
          searchRequest("estabelecimento-inexistente"),
        );
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual({ results: [] });
      });

      it("deve lidar com campos ausentes na resposta do Google", async () => {
        jest.spyOn(global, "fetch").mockResolvedValue(
          jsonResponse({
            places: [
              {
                displayName: { text: "Restaurante Sem Contato" },
                formattedAddress: "Niterói - RJ",
              },
            ],
          }),
        );

        const response = await GET(searchRequest("restaurante"));
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual({
          results: [
            {
              name: "Restaurante Sem Contato",
              address: "Niterói - RJ",
              phone: "",
              website: "",
            },
          ],
        });
      });
    });

    describe("erro", () => {
      it("deve retornar uma mensagem genérica quando a Google Places API falhar", async () => {
        jest
          .spyOn(global, "fetch")
          .mockResolvedValue(
            jsonResponse(
              { error: { message: "Google Places API error" } },
              500,
            ),
          );

        const response = await GET(searchRequest());
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: "Erro ao consultar Google Places." });
        expect(console.error).toHaveBeenCalledWith(
          "Google Places:",
          500,
          "Google Places API error",
        );
      });

      it("deve retornar uma mensagem amigável quando o Google responder 429", async () => {
        jest
          .spyOn(global, "fetch")
          .mockResolvedValue(
            jsonResponse({ error: { message: "Quota exceeded" } }, 429),
          );

        const response = await GET(searchRequest());
        const data = await response.json();

        expect(response.status).toBe(429);
        expect(data).toEqual({
          error:
            "Limite diário do Google Places atingido. Tente novamente amanhã.",
        });
      });

      it("deve retornar 502 quando a requisição ao Google falhar", async () => {
        jest.spyOn(global, "fetch").mockRejectedValue(new Error("rede"));

        const response = await GET(searchRequest());
        const data = await response.json();

        expect(response.status).toBe(502);
        expect(data).toEqual({
          error: "Não foi possível consultar o Google Places.",
        });
      });

      it("deve lidar com uma resposta de erro que não seja JSON", async () => {
        jest
          .spyOn(global, "fetch")
          .mockResolvedValue(
            new Response("<html>erro</html>", { status: 503 }),
          );

        const response = await GET(searchRequest());
        const data = await response.json();

        expect(response.status).toBe(503);
        expect(data).toEqual({ error: "Erro ao consultar Google Places." });
      });
    });
  });

  describe("requisição para a Google Places API", () => {
    it("deve realizar a requisição com os parâmetros corretos", async () => {
      const fetchMock = jest
        .spyOn(global, "fetch")
        .mockResolvedValue(jsonResponse({ places: [] }));

      await GET(searchRequest());

      expect(fetchMock).toHaveBeenCalledWith(
        "https://places.googleapis.com/v1/places:searchText",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": "test-api-key",
            "X-Goog-FieldMask":
              "places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,nextPageToken",
          },
          body: JSON.stringify({
            textQuery: "restaurantes",
            pageSize: 20,
          }),
        },
      );
    });

    it("deve enviar o pageToken ao consultar a próxima página", async () => {
      const fetchMock = jest
        .spyOn(global, "fetch")
        .mockResolvedValue(jsonResponse({ places: [] }));

      await GET(
        searchRequest("restaurantes", "&pageToken=token-segunda-pagina"),
      );

      expect(fetchMock).toHaveBeenCalledWith(
        "https://places.googleapis.com/v1/places:searchText",
        expect.objectContaining({
          body: JSON.stringify({
            textQuery: "restaurantes",
            pageSize: 20,
            pageToken: "token-segunda-pagina",
          }),
        }),
      );
    });
  });
});
