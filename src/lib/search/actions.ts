"use server";

import { search as runSearch, type SearchResult } from "@/services/search.service";

/** Thin Server Action wrapper so the quick-search client component can call the DB-backed search. */
export async function quickSearchAction(query: string): Promise<SearchResult[]> {
  return runSearch(query, 8);
}
