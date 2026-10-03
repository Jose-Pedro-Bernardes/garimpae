"use client";

import { useState } from "react";
import { useSearch } from "@/hooks/use-search";

export function Search() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");

  const { data, isLoading, error } = useSearch(submittedQuery);

  return (
    <div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSubmittedQuery(query.trim());
        }}
      >
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Pesquise por um estabelecimento"
        />

        <button type="submit">Pesquisar</button>
      </form>

      {isLoading && <p>Carregando...</p>}

      {error && <p>Erro ao realizar pesquisa.</p>}

      {data?.results.map((result) => (
        <div key={`${result.name}-${result.address}`}>
          <p>{result.name}</p>
          <p>{result.address}</p>
          <p>{result.phone}</p>
          <p>{result.website}</p>
        </div>
      ))}
    </div>
  );
}
