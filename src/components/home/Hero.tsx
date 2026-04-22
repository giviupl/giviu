"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./Hero.module.css";

const HERO_SLIDES = [
  {
    brandName: "Knirps",
    title: "Knirps",
    subtitle: "Parasole premium z personalizacją",
    color: "#1a1a1a",
    image: "/images/hero/knirps.webp",
  },
  {
    brandName: "Stanley",
    title: "Stanley",
    subtitle: "Termosy i kubki termiczne",
    color: "#166534",
    image: "/images/hero/stanley.webp",
  },
  {
    brandName: "Moleskine",
    title: "Moleskine",
    subtitle: "Notesy i akcesoria",
    color: "#374151",
    image: "/images/hero/moleskine.webp",
  },
  {
    brandName: "CamelBak",
    title: "CamelBak",
    subtitle: "Butelki i systemy nawadniania",
    color: "#2563eb",
    image: "/images/hero/camelbak.webp",
  },
  {
    brandName: "Thule",
    title: "Thule",
    subtitle: "Torby i akcesoria podróżne",
    color: "#1d4ed8",
    image: "/images/hero/thule.webp",
  },
];

const SLIDE_DURATION = 3000;

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [animationKey, setAnimationKey] = useState(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedRef = useRef(0);
  const startTimeRef = useRef(Date.now());

  // Swipe
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const hasMoved = useRef(false);

  // Timer logic
  useEffect(() => {
    if (isPaused) {
      elapsedRef.current += Date.now() - startTimeRef.current;
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const remaining = SLIDE_DURATION - elapsedRef.current;
    startTimeRef.current = Date.now();

    timerRef.current = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
      elapsedRef.current = 0;
      setAnimationKey((k) => k + 1);
    }, remaining);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPaused, currentSlide]);

  const goToSlide = (index: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCurrentSlide(index);
    elapsedRef.current = 0;
    startTimeRef.current = Date.now();
    setAnimationKey((k) => k + 1);
  };

  const handlePrev = () => {
    goToSlide((currentSlide - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const handleNext = () => {
    goToSlide((currentSlide + 1) % HERO_SLIDES.length);
  };

  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
    hasMoved.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
    hasMoved.current = true;
  };

  const handleTouchEnd = () => {
    if (!hasMoved.current) return; // tap, nie swipe

    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (diff > threshold) handleNext();
    else if (diff < -threshold) handlePrev();
  };

  return (
    <section className={styles["hero-section"]} aria-labelledby="hero-heading">
      <div className={styles["hero-grid"]}>
        {/* Lewy panel - tekst */}
        <div className={styles["hero-left"]}>
          <div className={styles["hero-left-inner"]}>
            <div className={styles["hero-spacer"]} />

            <div className={styles["hero-text-content"]}>
              <h1 id="hero-heading" className={styles["hero-heading"]}>
                <span className={styles["hero-heading-dark"]}>
                  Prezenty biznesowe,
                  <br />
                  z których Twoi klienci
                  <br />
                </span>
                <span className={styles["hero-heading-primary"]}>
                  będą korzystać
                  <br />
                  codziennie.
                </span>
              </h1>
              <p className={styles["hero-subtext"]}>
                Markowa jakość, która przetrwa lata.
              </p>
              <Link href="/kolekcje" className={styles["hero-cta"]}>
                Zobacz kolekcje
              </Link>
            </div>

            <div className={styles["hero-spacer"]} />
          </div>
        </div>

        {/* Prawy panel - slider ze zdjęciami */}
        <div className={styles["hero-right"]}>
          <div
            className={styles["hero-slider"]}
            onPointerEnter={(e) => {
              if (e.pointerType === "mouse") setIsPaused(true);
            }}
            onPointerLeave={(e) => {
              if (e.pointerType === "mouse") setIsPaused(false);
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <Link
              href={`/marki/${HERO_SLIDES[currentSlide].brandName.toLowerCase().replace(/ /g, "-")}`}
              className={styles["hero-slide-link"]}
              aria-label={`${HERO_SLIDES[currentSlide].brandName} — zobacz markę`}
            >
              {/* Kolor tła jako fallback zanim zdjęcie się załaduje */}
              <div
                className={styles["hero-slide-bg"]}
                style={{ backgroundColor: HERO_SLIDES[currentSlide].color }}
              />

              {/* Zdjęcie — next/image z fill + object-fit cover */}
              <Image
                src={HERO_SLIDES[currentSlide].image}
                alt={`${HERO_SLIDES[currentSlide].brandName} — prezenty firmowe premium`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
                fetchPriority="high"
                className={styles["hero-slide-image"]}
              />

              {/* Overlay z tekstem */}
              <div className={styles["hero-slide-overlay"]}>
                <h2 className={styles["hero-slide-title"]}>
                  {HERO_SLIDES[currentSlide].title}
                </h2>
                <p className={styles["hero-slide-subtitle"]}>
                  {HERO_SLIDES[currentSlide].subtitle}
                </p>
              </div>
            </Link>

            {/* Dots — poza Link, nie triggerują nawigacji */}
            <div
              className={styles["hero-dots"]}
              role="tablist"
              aria-label="Nawigacja karuzeli"
            >
              {HERO_SLIDES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={styles["hero-dot-btn"]}
                  aria-label={`Slajd ${index + 1}`}
                  aria-selected={currentSlide === index}
                  role="tab"
                >
                  <span
                    className={`${styles["hero-dot"]} ${currentSlide === index ? styles["hero-dot-active"] : ""}`}
                  >
                    {currentSlide === index && (
                      <span
                        key={animationKey}
                        className={`${styles["hero-dot-progress"]} ${isPaused ? styles.paused : ""}`}
                      />
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

