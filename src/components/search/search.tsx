"use client";

import { useState } from "react";
import {
  ArrowDown,
  CircleAlert,
  Download,
  Loader2,
  Search as SearchIcon,
} from "lucide-react";
import { useSearch } from "@/hooks/use-search";
import { SearchResults } from "@/components/search/search-results";
import { exportToXlsx } from "@/services/export/xlsx";

const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-gold px-5 py-3 font-medium text-on-gold transition hover:brightness-95 disabled:cursor-not-allowed cursor-pointer disabled:opacity-60";

const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-5 py-3 text-foreground transition hover:border-gold disabled:cursor-not-allowed cursor-pointer disabled:opacity-50";

export function Search() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");

  const {
    data,
    isLoading,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useSearch(submittedQuery);

  return (
    <div className="flex w-full max-w-3xl flex-col gap-4">
      <h1 className="text-3xl font-bold text-brand">Garimpaê</h1>
      <p className="text-muted">Faça sua pesquisa de forma rápida e prática!</p>

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
          className="flex-1 rounded-lg border border-border bg-surface px-4 py-3 text-foreground outline-none placeholder:text-muted focus:border-gold focus:ring-2 focus:ring-gold/40"
        />

        <button type="submit" disabled={isLoading} className={primaryButton}>
          {isLoading ? (
            <Loader2 className="size-5 animate-spin" aria-hidden="true" />
          ) : (
            <SearchIcon className="size-5" aria-hidden="true" />
          )}
          {isLoading ? "Garimpando..." : "Garimpar"}
        </button>
      </form>

      <button
        type="button"
        disabled={!data?.results.length || isLoading}
        onClick={() =>
          data?.results.length &&
          exportToXlsx(data.results, "garimpae-resultados.xlsx")
        }
        className={secondaryButton}
      >
        <Download className="size-5" aria-hidden="true" />
        Baixar Planilha
      </button>

      {isLoading && (
        <p className="flex items-center gap-2 text-muted">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Carregando...
        </p>
      )}

      {error && (
        <p className="flex items-center gap-2 text-red-700 dark:text-red-400">
          <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
          Erro ao realizar pesquisa.
        </p>
      )}

      {submittedQuery && data?.results.length === 0 && (
        <p className="text-muted">Nenhum resultado encontrado.</p>
      )}

      {data && <SearchResults results={data.results} />}

      {hasNextPage && (
        <button
          type="button"
          disabled={isFetchingNextPage}
          onClick={() => void fetchNextPage()}
          className={secondaryButton}
        >
          {isFetchingNextPage ? (
            <Loader2 className="size-5 animate-spin" aria-hidden="true" />
          ) : (
            <ArrowDown className="size-5" aria-hidden="true" />
          )}
          {isFetchingNextPage
            ? "Carregando mais resultados..."
            : "Carregar mais resultados"}
        </button>
      )}
    </div>
  );
}
