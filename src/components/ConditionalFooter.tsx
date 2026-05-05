"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function ConditionalFooter() {
  const pathname = usePathname();

  // Ukryj footer na stronie asystenta
  if (pathname?.startsWith("/asystent")) {
    return null;
  }

  return <Footer />;
}
