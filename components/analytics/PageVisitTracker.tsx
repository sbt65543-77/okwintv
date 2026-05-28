"use client";

import { trackPageVisit } from "@/services/dashboard";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const visitorIdKey = "okwin_visitor_id";

const getVisitorId = () => {
  const storedVisitorId = window.localStorage.getItem(visitorIdKey);

  if (storedVisitorId) {
    return storedVisitorId;
  }

  const visitorId =
    window.crypto?.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  window.localStorage.setItem(visitorIdKey, visitorId);

  return visitorId;
};

function PageVisitTracker() {
  const pathname = usePathname();
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (hasTrackedRef.current) {
      return;
    }

    hasTrackedRef.current = true;

    trackPageVisit({
      visitorId: getVisitorId(),
      path: pathname || "/",
    }).catch(() => undefined);
  }, [pathname]);

  return null;
}

export default PageVisitTracker;
