import type { SearchResult } from "@/types/search";

type SearchResultsProps = {
  results: SearchResult[];
};

export function SearchResults({ results }: SearchResultsProps) {
  return (
    <div className="flex w-full max-w-3xl flex-col gap-4">
      {results.map((result) => (
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
