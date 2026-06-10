/**
 * Minimal, typed GraphQL fetch utility built on the native `fetch` API.
 *
 * The endpoint is derived exclusively from `NEXT_PUBLIC_PAYLOAD_URL` — URLs are
 * never hardcoded. Payload serves its built-in GraphQL API at `/api/graphql`.
 */

const PAYLOAD_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL

export type GraphQLResponse<TData> = {
  data?: TData
  errors?: Array<{ message: string }>
}

export async function graphqlFetch<
  TData,
  TVariables extends Record<string, unknown> = Record<string, unknown>,
>(query: string, variables?: TVariables, init?: RequestInit): Promise<TData> {
  if (!PAYLOAD_URL) {
    throw new Error('NEXT_PUBLIC_PAYLOAD_URL is not defined')
  }

  const response = await fetch(`${PAYLOAD_URL}/api/graphql`, {
    method: 'POST',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    body: JSON.stringify({ query, variables }),
  })

  if (!response.ok) {
    throw new Error(
      `GraphQL request failed: ${response.status} ${response.statusText}`,
    )
  }

  const result = (await response.json()) as GraphQLResponse<TData>

  if (result.errors?.length) {
    throw new Error(result.errors.map((error) => error.message).join('; '))
  }

  if (!result.data) {
    throw new Error('GraphQL response contained no data')
  }

  return result.data
}
