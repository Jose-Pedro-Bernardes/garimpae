import { GET } from "./route";
import { NextRequest } from "next/server";

describe("GET /api/search", () => {
  afterEach(() => {
    jest.restoreAllMocks();
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
  });

  describe("configuração", () => {
    it("deve retornar 500 quando a API Key não estiver configurada", async () => {
      const originalApiKey = process.env.GOOGLE_PLACES_API_KEY;

      delete process.env.GOOGLE_PLACES_API_KEY;

      const request = new NextRequest(
        "http://localhost:3000/api/search?q=restaurantes",
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);

      expect(data).toEqual({
        error: "Chave da Google Places não configurada.",
      });

      if (originalApiKey === undefined) {
        delete process.env.GOOGLE_PLACES_API_KEY;
      } else {
        process.env.GOOGLE_PLACES_API_KEY = originalApiKey;
      }
    });
  });

  describe("resposta da Google Places API", () => {
    describe("sucesso", () => {
      it("deve retornar os resultados de uma pesquisa válida", async () => {
        process.env.GOOGLE_PLACES_API_KEY = "test-api-key";

        jest.spyOn(global, "fetch").mockResolvedValue(
          new Response(
            JSON.stringify({
              places: [
                {
                  displayName: {
                    text: "Restaurante Teste",
                  },
                  formattedAddress: "Niterói - RJ",
                  nationalPhoneNumber: "+55 21 99999-9999",
                  websiteUri: "https://example.com",
                },
              ],
            }),
            {
              status: 200,
              headers: {
                "Content-Type": "application/json",
              },
            },
          ),
        );

        const request = new NextRequest(
          "http://localhost:3000/api/search?q=restaurantes",
        );

        const response = await GET(request);
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
        });
      });

      it("deve retornar uma lista vazia quando nenhum resultado for encontrado", async () => {
        process.env.GOOGLE_PLACES_API_KEY = "test-api-key";

        jest.spyOn(global, "fetch").mockResolvedValue(
          new Response(
            JSON.stringify({
              places: [],
            }),
            {
              status: 200,
              headers: {
                "Content-Type": "application/json",
              },
            },
          ),
        );

        const request = new NextRequest(
          "http://localhost:3000/api/search?q=estabelecimento-inexistente",
        );

        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);

        expect(data).toEqual({
          results: [],
        });
      });

      it("deve lidar com campos ausentes na resposta do Google", async () => {
        process.env.GOOGLE_PLACES_API_KEY = "test-api-key";

        jest.spyOn(global, "fetch").mockResolvedValue(
          new Response(
            JSON.stringify({
              places: [
                {
                  displayName: {
                    text: "Restaurante Sem Contato",
                  },
                  formattedAddress: "Niterói - RJ",
                },
              ],
            }),
            {
              status: 200,
              headers: {
                "Content-Type": "application/json",
              },
            },
          ),
        );

        const request = new NextRequest(
          "http://localhost:3000/api/search?q=restaurante",
        );

        const response = await GET(request);
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
      it("deve retornar erro quando a Google Places API falhar", async () => {
        process.env.GOOGLE_PLACES_API_KEY = "test-api-key";

        jest.spyOn(global, "fetch").mockResolvedValue(
          new Response(
            JSON.stringify({
              error: {
                message: "Google Places API error",
              },
            }),
            {
              status: 500,
              headers: {
                "Content-Type": "application/json",
              },
            },
          ),
        );

        const request = new NextRequest(
          "http://localhost:3000/api/search?q=restaurantes",
        );

        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(500);

        expect(data).toEqual({
          error: "Google Places API error",
        });
      });
    });
  });

  describe("requisição para a Google Places API", () => {
    it("deve realizar a requisição com os parâmetros corretos", async () => {
      process.env.GOOGLE_PLACES_API_KEY = "test-api-key";

      const fetchMock = jest.spyOn(global, "fetch").mockResolvedValue(
        new Response(
          JSON.stringify({
            places: [],
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      );

      const request = new NextRequest(
        "http://localhost:3000/api/search?q=restaurantes",
      );

      await GET(request);

      expect(fetchMock).toHaveBeenCalledWith(
        "https://places.googleapis.com/v1/places:searchText",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": "test-api-key",
            "X-Goog-FieldMask":
              "places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri",
          },
          body: JSON.stringify({
            textQuery: "restaurantes",
          }),
        },
      );
    });
  });
});
