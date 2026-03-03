"use client";
import { useEffect, useState } from "react";

export function usePartnerAuth(slug: string): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("partner_auth") === "1") {
      setReady(true);
    } else {
      window.location.replace(`/login/?next=/${slug}/`);
    }
  }, [slug]);

  return ready;
}
