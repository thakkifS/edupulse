"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import FullScreenLoader from "./FullScreenLoader";

/**
 * App Router: same full-screen Loader as pages/_app.js when the path changes.
 */
export default function NavigationProgress() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setShow(true);
    const t = window.setTimeout(() => setShow(false), 700);
    return () => window.clearTimeout(t);
  }, [pathname]);

  if (!show) return null;
  return <FullScreenLoader />;
}
