"use client";

import { usePathname } from "next/navigation";
import LiveChatWidget from "./LiveChatWidget";

export default function LiveChatHost() {
  const pathname = usePathname() || "";
  return <LiveChatWidget pathname={pathname} />;
}
