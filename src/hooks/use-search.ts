import { useQuery } from "@tanstack/react-query";
import type { SearchResponse } from "@/types/search";

export function useSearch(query: string) {
  return useQuery<SearchResponse>({
    queryKey: ["search", query],
    queryFn: async () => {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}`,
      );

      if (!response.ok) {
        throw new Error("Erro ao realizar pesquisa.");
      }

      return response.json();
    },
    enabled: query.length > 0,
  });
}
