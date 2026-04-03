import { useRouter } from "next/router";
import Footer from "./Footer";
import LiveChatWidget from "./LiveChatWidget";

const HIDE_FOOTER_ON = ["/admin"];

export default function Layout({ children }) {
  const router = useRouter();
  const hideFooter = HIDE_FOOTER_ON.includes(router.pathname);

  return (
    <>
      {children}
      {!hideFooter && <Footer />}
      <LiveChatWidget pathname={router.pathname} />
    </>
  );
}
