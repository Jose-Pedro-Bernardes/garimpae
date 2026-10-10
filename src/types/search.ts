export type SearchResult = {
  name: string;
  address?: string;
  phone?: string;
  website?: string;
};

export type SearchParams = {
  query: string;
};

export type SearchResponse = {
  results: SearchResult[];
  nextPageToken?: string;
};
