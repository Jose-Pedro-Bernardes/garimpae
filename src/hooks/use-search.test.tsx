/**
 * @jest-environment jsdom
 */

import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useSearch } from "./use-search";

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  return Wrapper;
};

describe("useSearch", () => {
  it("não deve executar a pesquisa quando a query estiver vazia", () => {
    const wrapper = createWrapper();

    const fetchMock = jest.fn();

    global.fetch = fetchMock as typeof fetch;

    renderHook(() => useSearch(""), {
      wrapper,
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("deve executar a pesquisa quando a query for válida", async () => {
    const wrapper = createWrapper();

    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        results: [],
      }),
    });

    global.fetch = fetchMock as typeof fetch;

    renderHook(() => useSearch("restaurantes"), {
      wrapper,
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/search?q=restaurantes");
    });
  });

  it("deve disponibilizar os resultados em data", async () => {
    const wrapper = createWrapper();

    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        results: [
          {
            name: "Restaurante Teste",
            address: "Niterói - RJ",
            phone: "+55 21 99999-9999",
            website: "https://example.com",
          },
        ],
      }),
    });

    global.fetch = fetchMock as typeof fetch;

    const { result } = renderHook(() => useSearch("restaurantes"), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({
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
  });

  it("deve apresentar estado de loading enquanto a pesquisa estiver em andamento", () => {
    const wrapper = createWrapper();

    const fetchMock = jest.fn().mockReturnValue(new Promise(() => {}));

    global.fetch = fetchMock as typeof fetch;

    const { result } = renderHook(() => useSearch("restaurantes"), {
      wrapper,
    });

    expect(result.current.isLoading).toBe(true);
  });

  it("deve disponibilizar o erro quando a pesquisa falhar", async () => {
    const wrapper = createWrapper();

    const fetchMock = jest
      .fn()
      .mockRejectedValue(new Error("Erro ao realizar pesquisa."));

    global.fetch = fetchMock as typeof fetch;

    const { result } = renderHook(() => useSearch("restaurantes"), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.error).toEqual(
        new Error("Erro ao realizar pesquisa."),
      );
    });
  });
});
