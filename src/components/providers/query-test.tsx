"use client";

import { useQuery } from "@tanstack/react-query";

export function QueryTest() {
  const { data, isLoading } = useQuery({
    queryKey: ["test"],
    queryFn: async () => {
      return "TanStack Query funcionando!";
    },
  });

  if (isLoading) {
    return <p>Carregando...</p>;
  }

  return <p>{data}</p>;
}
