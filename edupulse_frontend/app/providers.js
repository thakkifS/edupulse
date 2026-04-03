"use client";

import { AuthProvider } from "../context/AuthContext";
import NavigationProgress from "../components/NavigationProgress";
import LiveChatHost from "../components/LiveChatHost";

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <NavigationProgress />
      {children}
      <LiveChatHost />
    </AuthProvider>
  );
}

