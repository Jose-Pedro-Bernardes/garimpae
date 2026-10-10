/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { Search } from "./search";
import { useSearch } from "@/hooks/use-search";
import { exportToXlsx } from "@/services/export/xlsx";

jest.mock("@/hooks/use-search", () => ({
  useSearch: jest.fn(() => ({
    data: undefined,
    isLoading: false,
    error: null,
  })),
}));

jest.mock("@/services/export/xlsx", () => ({
  exportToXlsx: jest.fn(),
}));

describe("Search", () => {
  it("deve renderizar o campo de pesquisa", () => {
    render(<Search />);

    expect(
      screen.getByPlaceholderText("Ex: restaurantes em Niterói"),
    ).toBeInTheDocument();
  });

  it("deve permitir preencher o campo de pesquisa", async () => {
    const user = userEvent.setup();

    render(<Search />);

    const input = screen.getByPlaceholderText("Ex: restaurantes em Niterói");

    await user.type(input, "restaurantes");

    expect(input).toHaveValue("restaurantes");
  });

  it("deve realizar a pesquisa ao enviar o formulário", async () => {
    const user = userEvent.setup();

    render(<Search />);

    const input = screen.getByPlaceholderText("Ex: restaurantes em Niterói");

    await user.type(input, "restaurantes");

    await user.click(screen.getByRole("button", { name: "Pesquisar" }));

    expect(useSearch).toHaveBeenLastCalledWith("restaurantes");
  });

  it("deve exibir o estado de loading durante a pesquisa", () => {
    jest.mocked(useSearch).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as ReturnType<typeof useSearch>);

    render(<Search />);

    expect(screen.getByText("Pesquisando...")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Pesquisando..." }),
    ).toBeDisabled();
  });

  it("deve exibir uma mensagem de erro quando a pesquisa falhar", () => {
    jest.mocked(useSearch).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("Erro ao realizar pesquisa."),
    } as ReturnType<typeof useSearch>);

    render(<Search />);

    expect(screen.getByText("Erro ao realizar pesquisa.")).toBeInTheDocument();
  });

  it("deve exibir uma mensagem quando nenhum resultado for encontrado", async () => {
    const user = userEvent.setup();

    jest.mocked(useSearch).mockReturnValue({
      data: {
        results: [],
      },
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useSearch>);

    render(<Search />);

    const input = screen.getByPlaceholderText("Ex: restaurantes em Niterói");

    await user.type(input, "restaurantes");

    await user.click(screen.getByRole("button", { name: "Pesquisar" }));

    expect(
      screen.getByText("Nenhum resultado encontrado."),
    ).toBeInTheDocument();
  });

  it("deve remover espaços extras da pesquisa", async () => {
    const user = userEvent.setup();

    render(<Search />);

    const input = screen.getByPlaceholderText("Ex: restaurantes em Niterói");

    await user.type(input, "  restaurantes  ");

    await user.click(screen.getByRole("button", { name: "Pesquisar" }));

    expect(useSearch).toHaveBeenLastCalledWith("restaurantes");
  });

  it("deve exportar os resultados da pesquisa atual", async () => {
    const user = userEvent.setup();

    const results = [
      {
        name: "Restaurante Teste",
        address: "Niterói - RJ",
        phone: "+55 21 99999-9999",
        website: "https://example.com",
      },
    ];

    jest.mocked(useSearch).mockReturnValue({
      data: {
        results,
      },
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useSearch>);

    render(<Search />);

    await user.click(screen.getByRole("button", { name: "Exportar XLSX" }));

    expect(exportToXlsx).toHaveBeenCalledWith(
      results,
      "garimpae-resultados.xlsx",
    );
  });

  it("deve desabilitar a exportação quando não houver resultados", () => {
    jest.mocked(useSearch).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useSearch>);

    render(<Search />);

    expect(
      screen.getByRole("button", { name: "Exportar XLSX" }),
    ).toBeDisabled();
  });

  it("deve carregar a próxima página ao clicar no botão", async () => {
    const user = userEvent.setup();
    const fetchNextPage = jest.fn();

    jest.mocked(useSearch).mockReturnValue({
      data: {
        results: [
          {
            name: "Restaurante A",
            address: "Centro - Niterói",
            phone: "+55 21 11111-1111",
            website: "https://restaurante-a.com",
          },
        ],
        nextPageToken: "token-proxima-pagina",
      },
      isLoading: false,
      error: null,
      hasNextPage: true,
      isFetchingNextPage: false,
      fetchNextPage,
    } as unknown as ReturnType<typeof useSearch>);

    render(<Search />);

    await user.click(
      screen.getByRole("button", {
        name: "Carregar mais resultados",
      }),
    );

    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });
});
