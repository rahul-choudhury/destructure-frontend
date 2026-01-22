"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export function RedirectToAdmin() {
  const pathname = usePathname();
  const router = useRouter();

  const isLeaderPressed = useRef(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (pathname.startsWith("/admin")) return;

      if (e.metaKey && e.key === "k") {
        e.preventDefault();
        isLeaderPressed.current = true;
        timeout = setTimeout(() => (isLeaderPressed.current = false), 1000);
      } else if (isLeaderPressed.current && e.key === "a") {
        e.preventDefault();
        isLeaderPressed.current = false;

        if (pathname === "/") {
          router.push("/admin");
        } else if (pathname.match(/^\/.+$/)) {
          // the regex matches with any [slug] route
          router.push(`/admin/blogs${pathname}`);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timeout);
    };
  }, [pathname, router]);

  return null;
}
