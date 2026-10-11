/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { SearchResults } from "./search-results";

describe("SearchResults", () => {
  it("deve renderizar os dados dos resultados", () => {
    const results = [
      {
        name: "Restaurante Teste",
        address: "Niterói - RJ",
        phone: "+55 21 99999-9999",
        website: "https://example.com",
      },
    ];

    render(<SearchResults results={results} />);

    expect(screen.getByText("Restaurante Teste")).toBeInTheDocument();
    expect(screen.getByText("Niterói - RJ")).toBeInTheDocument();
    expect(screen.getByText("+55 21 99999-9999")).toBeInTheDocument();
    expect(screen.getByText("example.com")).toBeInTheDocument();
  });

  it("não deve renderizar resultados quando a lista estiver vazia", () => {
    render(<SearchResults results={[]} />);

    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  it("deve renderizar todos os resultados recebidos", () => {
    const results = [
      {
        name: "Restaurante A",
        address: "Centro - Niterói",
        phone: "+55 21 11111-1111",
        website: "https://restaurante-a.com",
      },
      {
        name: "Restaurante B",
        address: "Icaraí - Niterói",
        phone: "+55 21 22222-2222",
        website: "https://restaurante-b.com",
      },
    ];

    render(<SearchResults results={results} />);

    expect(screen.getAllByRole("listitem")).toHaveLength(2);

    expect(screen.getByText("Restaurante A")).toBeInTheDocument();
    expect(screen.getByText("Centro - Niterói")).toBeInTheDocument();
    expect(screen.getByText("+55 21 11111-1111")).toBeInTheDocument();
    expect(screen.getByText("restaurante-a.com")).toBeInTheDocument();

    expect(screen.getByText("Restaurante B")).toBeInTheDocument();
    expect(screen.getByText("Icaraí - Niterói")).toBeInTheDocument();
    expect(screen.getByText("+55 21 22222-2222")).toBeInTheDocument();
    expect(screen.getByText("restaurante-b.com")).toBeInTheDocument();
  });

  it("deve exibir o site como link que abre em nova aba", () => {
    const results = [
      {
        name: "Restaurante Teste",
        address: "Niterói - RJ",
        phone: "+55 21 99999-9999",
        website: "https://www.example.com/",
      },
    ];

    render(<SearchResults results={results} />);

    const link = screen.getByRole("link", { name: "example.com" });

    expect(link).toHaveAttribute("href", "https://www.example.com/");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("deve exibir mensagens quando não houver telefone nem site", () => {
    const results = [
      {
        name: "Restaurante Teste",
        address: "Niterói - RJ",
        phone: "",
        website: "",
      },
    ];

    render(<SearchResults results={results} />);

    expect(screen.getByText("telefone não encontrado")).toBeInTheDocument();
    expect(screen.getByText("site não encontrado")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
