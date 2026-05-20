"use client";

import Link from "next/link";
import { useState, useLayoutEffect, useMemo, useEffect } from "react";
import { usePathname } from "next/navigation";
import { CATEGORIES, NAV_LINKS } from "@/data/navigation";
import { useQuoteStore } from "@/stores/quoteStore";
import styles from "./Header.module.css";

function QuoteBadge() {
  const [count, setCount] = useState(0);
  const [pulseKey, setPulseKey] = useState(0);

  useEffect(() => {
    setCount(useQuoteStore.getState().getItemCount());

    const unsubscribe = useQuoteStore.subscribe(() => {
      const newCount = useQuoteStore.getState().getItemCount();
      setCount(newCount);
      setPulseKey((prev) => prev + 1);
    });

    return () => unsubscribe();
  }, []);

  if (count === 0) return null;

  return (
    <span key={pulseKey} className="quote-badge quote-badge-pulse">
      {count}
    </span>
  );
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productCategorySlug, setProductCategorySlug] = useState<string | null>(
    null,
  );
  const pathname = usePathname();

  // Zamknij menu po zmianie strony
  useLayoutEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Odczytaj kategorię produktu po hydratacji (unika hydration mismatch)
  useEffect(() => {
    if (pathname.startsWith("/produkty/")) {
      setProductCategorySlug(sessionStorage.getItem("giviu-product-category"));
    } else {
      setProductCategorySlug(null);
    }
  }, [pathname]);

  // Memoizuj nav links i kategorie dla performance
  const memoizedNavLinks = useMemo(
    () =>
      NAV_LINKS.map((link) => ({
        ...link,
        isActive: pathname === link.href,
      })),
    [pathname],
  );

  const memoizedCategories = useMemo(() => {
    return CATEGORIES.map((cat) => ({
      ...cat,
      isActive:
        pathname.startsWith(`/kategorie/${cat.slug}`) ||
        productCategorySlug === cat.slug,
    }));
  }, [pathname, productCategorySlug]);

  // Focus trap i Escape key handling
  useLayoutEffect(() => {
    if (!mobileMenuOpen) return;

    const menu = document.getElementById("mobile-menu");
    if (!menu) return;

    const focusableElements = menu.querySelectorAll(
      'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])',
    ) as NodeListOf<HTMLElement>;
    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];

    first?.focus();

    const trapFocus = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      } else if (e.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", trapFocus);
    return () => document.removeEventListener("keydown", trapFocus);
  }, [mobileMenuOpen]);

  // Blokuj scroll gdy menu jest otwarte
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      <header role="banner" className={styles["header-wrapper"]}>
        {/* Górny pasek */}
        <div className={styles["header-top"]}>
          {/* Logo z efektem roll (GIVIU ↔ PREZENTUJ WARTOŚĆ) */}
          <h1 className={styles["header-logo"]}>
            <Link
              href="/"
              aria-label="Giviu - Strona główna"
              className={styles["header-logo-link"]}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <span className={styles["logo-roll"]}>
                <span className={styles["logo-roll-default"]}>
                  <img
                    src="/giviu-logo.svg"
                    alt="Giviu"
                    className={styles["header-logo-img"]}
                  />
                </span>
                <span
                  className={styles["logo-roll-hover"]}
                  aria-hidden="true"
                >
                  <img
                    src="/prezentuj-wartosc.svg"
                    alt=""
                    className={styles["header-logo-img"]}
                  />
                </span>
              </span>
            </Link>
          </h1>

          {/* Desktop Navigation */}
          <nav
            role="navigation"
            aria-label="Główna nawigacja"
            className={styles["desktop-nav"]}
          >
            {memoizedNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles["nav-link"]} ${link.isActive ? styles.active : ""}`}
                aria-current={link.isActive ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}

            {/* Ikona listy wyceny - Desktop */}
            <Link
              href="/wycena"
              className={`${styles["nav-link"]} quote-icon-wrapper ${pathname === "/wycena" ? styles.active : ""}`}
              aria-label="Lista wyceny"
              aria-current={pathname === "/wycena" ? "page" : undefined}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                role="img"
                aria-label="Ikona listy wyceny"
                focusable="false"
              >
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
                <path d="M9 12h6M9 16h6" />
              </svg>
              <QuoteBadge />
            </Link>
          </nav>

          {/* Mobile: Ikona wyceny + Burger menu */}
          <div className={styles["mobile-controls"]}>
            <Link
              href="/wycena"
              aria-label="Lista wyceny"
              className={`quote-icon-wrapper ${styles["mobile-quote-link"]} ${pathname === "/wycena" ? styles.active : ""}`}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                role="img"
                aria-label="Ikona listy wyceny"
                focusable="false"
              >
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
                <path d="M9 12h6M9 16h6" />
              </svg>
              <QuoteBadge />
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Zamknij menu" : "Otwórz menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              className={styles["burger-button"]}
            >
              {mobileMenuOpen ? (
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#4b5563"
                  strokeWidth="2"
                  role="img"
                  aria-label="Zamknij menu"
                  focusable="false"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#4b5563"
                  strokeWidth="2"
                  role="img"
                  aria-label="Otwórz menu"
                  focusable="false"
                >
                  <path d="M3 12h18M3 6h18M3 18h18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Niebieska linia - dekoracyjna */}
        <div className={styles["header-accent-line"]} aria-hidden="true" />

        {/* Kategorie - tylko desktop */}
        <nav
          role="navigation"
          aria-label="Kategorie produktów"
          className={styles["category-bar"]}
        >
          <div className={styles["category-bar-inner"]}>
            {memoizedCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/kategorie/${cat.slug}`}
                className={`${styles["nav-link"]} ${cat.isActive ? styles.active : ""}`}
                aria-current={cat.isActive ? "page" : undefined}
              >
                {cat.name}
              </Link>
            ))}
            <Link
              href="/marki"
              className={`${styles["nav-link"]} ${styles["nav-link-separator"]} ${pathname === "/marki" ? styles.active : ""}`}
              aria-current={pathname === "/marki" ? "page" : undefined}
            >
              MARKI
            </Link>
            <Link
              href="/nowosci"
              className={`${styles["nav-link"]} ${pathname === "/nowosci" ? styles.active : ""}`}
              aria-current={pathname === "/nowosci" ? "page" : undefined}
            >
              NOWOŚCI
            </Link>
          </div>
        </nav>
      </header>

      {/* Overlay dla mobile menu */}
      {mobileMenuOpen && (
        <div
          className={styles["header-overlay"]}
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu */}
      <nav
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu mobilne"
        aria-hidden={!mobileMenuOpen}
        className={`${styles["mobile-menu"]} ${mobileMenuOpen ? styles["mobile-menu-visible"] : styles["mobile-menu-hidden"]}`}
      >
        <div className={styles["mobile-menu-section"]}>
          <p
            id="mobile-categories-label"
            className={styles["mobile-menu-label"]}
          >
            Kategorie
          </p>
          <ul
            aria-labelledby="mobile-categories-label"
            className={styles["mobile-menu-list"]}
          >
            {memoizedCategories.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={`/kategorie/${cat.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={cat.isActive ? "page" : undefined}
                  className={`${styles["mobile-menu-link"]} ${cat.isActive ? styles.active : ""}`}
                >
                  {cat.name}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/marki"
                onClick={() => setMobileMenuOpen(false)}
                aria-current={pathname === "/marki" ? "page" : undefined}
                className={`${styles["mobile-menu-link"]} ${pathname === "/marki" ? styles.active : ""}`}
              >
                MARKI
              </Link>
            </li>
            <li>
              <Link
                href="/nowosci"
                onClick={() => setMobileMenuOpen(false)}
                aria-current={pathname === "/nowosci" ? "page" : undefined}
                className={`${styles["mobile-menu-link"]} ${pathname === "/nowosci" ? styles.active : ""}`}
              >
                NOWOŚCI
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p id="mobile-menu-label" className={styles["mobile-menu-label"]}>
            Menu
          </p>
          <ul
            aria-labelledby="mobile-menu-label"
            className={styles["mobile-menu-list"]}
          >
            {memoizedNavLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={link.isActive ? "page" : undefined}
                  className={`${styles["mobile-menu-link"]} ${link.isActive ? styles.active : ""}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Spacer */}
      <div className={styles["header-spacer"]} aria-hidden="true" />
    </>
  );
}
