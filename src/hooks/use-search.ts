import { useInfiniteQuery } from "@tanstack/react-query";
import type { SearchResponse } from "@/types/search";

export function useSearch(query: string) {
  return useInfiniteQuery({
    queryKey: ["search", query],

    initialPageParam: undefined as string | undefined,

    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({ q: query });

      if (pageParam) {
        params.set("pageToken", pageParam);
      }

      const response = await fetch(`/api/search?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Erro ao realizar pesquisa.");
      }

      return (await response.json()) as SearchResponse;
    },

    getNextPageParam: (lastPage) => lastPage.nextPageToken,

    select: (data) => {
      const lastPage = data.pages[data.pages.length - 1];

      return {
        results: data.pages.flatMap((page) => page.results),
        nextPageToken: lastPage?.nextPageToken,
      };
    },

    enabled: query.length > 0,
  });
}
