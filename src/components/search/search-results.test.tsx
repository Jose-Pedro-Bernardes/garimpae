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
    expect(screen.getByText("https://example.com")).toBeInTheDocument();
  });

  it("não deve renderizar resultados quando a lista estiver vazia", () => {
    render(<SearchResults results={[]} />);

    expect(screen.queryByText("Restaurante Teste")).not.toBeInTheDocument();
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

    expect(screen.getByText("Restaurante A")).toBeInTheDocument();
    expect(screen.getByText("Centro - Niterói")).toBeInTheDocument();
    expect(screen.getByText("+55 21 11111-1111")).toBeInTheDocument();
    expect(screen.getByText("https://restaurante-a.com")).toBeInTheDocument();

    expect(screen.getByText("Restaurante B")).toBeInTheDocument();
    expect(screen.getByText("Icaraí - Niterói")).toBeInTheDocument();
    expect(screen.getByText("+55 21 22222-2222")).toBeInTheDocument();
    expect(screen.getByText("https://restaurante-b.com")).toBeInTheDocument();
  });
});
