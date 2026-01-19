export const API_URL = process.env.NEXT_PUBLIC_API_URL as string;
export const JWT_SECRET = process.env.JWT_EXPIRY as string;
export const JWT_EXPIRY = Number(process.env.JWT_EXPIRY as string);

export const CODE_LANGUAGE_OPTIONS = [
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "tsx", label: "TSX" },
  { value: "go", label: "Go" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "json", label: "JSON" },
  { value: "sql", label: "SQL" },
];

export const CACHE_TAGS = {
  BLOG_LIST: "blogs",
};
