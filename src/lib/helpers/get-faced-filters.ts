import { ReadonlyURLSearchParams } from "next/navigation"

import { buildFacetFilterClauses } from "./catalog-search"

/**
 * Translates the current URL search params into an Algolia filter suffix
 * (" AND ..." or empty). Only whitelisted facet params are used — unrelated
 * params (sector, industry, page, query, …) are ignored.
 */
export const getFacedFilters = (filters: ReadonlyURLSearchParams): string => {
  const params = Object.fromEntries(filters.entries())
  const clauses = buildFacetFilterClauses(params)

  return clauses.length ? ` AND ${clauses.join(" AND ")}` : ""
}
