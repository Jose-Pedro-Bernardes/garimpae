import { Gem, Globe, Phone } from "lucide-react";
import type { SearchResult } from "@/types/search";

type SearchResultsProps = {
  results: SearchResult[];
};

function formatWebsite(url: string) {
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

export function SearchResults({ results }: SearchResultsProps) {
  return (
    <ul className="flex w-full max-w-3xl flex-col gap-3">
      {results.map((result) => (
        <li
          key={`${result.name}-${result.address}`}
          className="flex gap-3 rounded-xl border border-border bg-surface p-3 sm:p-4"
        >
          <div
            aria-hidden="true"
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gold-soft text-brand"
          >
            <Gem className="size-5" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-medium text-foreground">{result.name}</p>
            <p className="text-sm text-muted">{result.address}</p>

            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              <span className="flex items-center gap-1.5">
                <Phone
                  className="size-4 shrink-0 text-muted"
                  aria-hidden="true"
                />
                {result.phone ? (
                  <span className="text-foreground">{result.phone}</span>
                ) : (
                  <span className="text-muted">telefone não encontrado</span>
                )}
              </span>

              <span className="flex min-w-0 items-center gap-1.5">
                <Globe
                  className="size-4 shrink-0 text-muted"
                  aria-hidden="true"
                />
                {result.website ? (
                  <a
                    href={result.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-brand hover:underline"
                  >
                    {formatWebsite(result.website)}
                  </a>
                ) : (
                  <span className="text-muted">site não encontrado</span>
                )}
              </span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
