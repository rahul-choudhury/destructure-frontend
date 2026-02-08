import { notFound } from "next/navigation"
import { API_URL } from "./config"
import { ApiResponse } from "./definitions"

type RequestOptions = {
  method?: string
  headers?: Record<string, string>
  body?: unknown
  cookie?: string
  params?: Record<string, string | number | boolean | undefined | null>
  cache?: RequestCache
  next?: NextFetchRequestConfig
}

function buildUrlWithParams(
  url: string,
  params?: RequestOptions["params"],
): string {
  if (!params) return url
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null,
    ),
  )
  if (Object.keys(filteredParams).length === 0) return url
  const queryString = new URLSearchParams(
    filteredParams as Record<string, string>,
  ).toString()
  return `${url}?${queryString}`
}

async function fetchApi<T>(
  url: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> {
  const { method = "GET", headers = {}, body, params, cache, next } = options

  const fullUrl = buildUrlWithParams(`${API_URL}${url}`, params)

  const isFormData = body instanceof FormData

  const response = await fetch(fullUrl, {
    method,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      Accept: "application/json",
      ...headers,
    },
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    cache,
    next,
  })

  if (method === "GET" && response.status === 404) {
    notFound()
  }

  if (!response.ok) {
    const message = (await response.json()).message || response.statusText
    throw new Error(message)
  }

  return response.json()
}

export const api = {
  get<T>(url: string, options?: RequestOptions) {
    return fetchApi<T>(url, { ...options, method: "GET" })
  },
  post<T>(url: string, body?: unknown, options?: RequestOptions) {
    return fetchApi<T>(url, { ...options, method: "POST", body })
  },
  put<T>(url: string, body?: unknown, options?: RequestOptions) {
    return fetchApi<T>(url, { ...options, method: "PUT", body })
  },
  patch<T>(url: string, body?: unknown, options?: RequestOptions) {
    return fetchApi<T>(url, { ...options, method: "PATCH", body })
  },
  delete<T>(url: string, options?: RequestOptions) {
    return fetchApi<T>(url, { ...options, method: "DELETE" })
  },
}
