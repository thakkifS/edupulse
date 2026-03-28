import { useRouter } from "next/router";
import Footer from "./Footer";

const HIDE_FOOTER_ON = ["/admin"];

export default function Layout({ children }) {
  const router = useRouter();
  const hideFooter = HIDE_FOOTER_ON.includes(router.pathname);

  return (
    <>
      {children}
      {!hideFooter && <Footer />}
    </>
  );
}
