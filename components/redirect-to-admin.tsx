"use client";

import { redirect, RedirectType, usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function RedirectToAdmin() {
  const pathname = usePathname();
  const isLeaderPressed = useRef(false);

  const isInAdminRoute = pathname.startsWith("/admin");

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isInAdminRoute) return;

      if (e.metaKey && e.key === "k") {
        e.preventDefault();
        isLeaderPressed.current = true;
        timeout = setTimeout(() => (isLeaderPressed.current = false), 1000);
      } else if (isLeaderPressed.current && e.key === "a") {
        e.preventDefault();
        isLeaderPressed.current = false;
        redirect("/admin", RedirectType.push);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timeout);
    };
  }, [isInAdminRoute]);

  return null;
}
