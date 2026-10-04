"use client";

import { useState } from "react";
import { useSearch } from "@/hooks/use-search";
import { SearchResults } from "@/components/search/search-results";

export function Search() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");

  const { data, isLoading, error } = useSearch(submittedQuery);

  return (
    <div className="flex w-full max-w-3xl flex-col gap-4">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
        Garimpaê
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        Faça sua pesquisa de forma rápida e prática!
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSubmittedQuery(query.trim());
        }}
        className="flex w-full max-w-3xl gap-2"
      >
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ex: restaurantes em Niterói"
          className="flex-1 rounded-lg border px-4 py-3 outline-none"
        />

        <button
          type="submit"
          disabled={isLoading}
          className="rounded-lg px-5 py-3"
        >
          {isLoading ? "Pesquisando..." : "Pesquisar"}
        </button>
      </form>

      {isLoading && <p>Carregando...</p>}

      {error && <p>Erro ao realizar pesquisa.</p>}

      {submittedQuery && data?.results.length === 0 && (
        <p>Nenhum resultado encontrado.</p>
      )}

      {data && <SearchResults results={data.results} />}
    </div>
  );
}
