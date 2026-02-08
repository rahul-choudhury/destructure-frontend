import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(date))
}

export function debounce<T extends unknown[]>(
  fn: (...args: T) => void,
  limit = 500,
) {
  let timer: ReturnType<typeof setTimeout> | undefined

  return (...args: T) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), limit)
  }
}
