'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { CATEGORIES } from '@/data/navigation';
import styles from './Footer.module.css';

type FormData = { name: string; email: string };

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function NewsletterForm() {
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData & { website: string }>({ name: '', email: '', website: '' });

  useEffect(() => {
    if (newsletterSuccess) {
      const timer = setTimeout(() => setNewsletterSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [newsletterSuccess]);

  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isFormValid = formData.name && formData.email && isValidEmail(formData.email);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Honeypot check
    if (formData.website) {
      setNewsletterSuccess(true);
      return;
    }

    setSubmitted(true);
    
    if (!isFormValid) {
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setNewsletterSuccess(true);
    setFormData({ name: '', email: '', website: '' });
    setSubmitted(false);
    setIsSubmitting(false);
  };

  const getFieldErrorClass = (field: 'name' | 'email') => {
    if (!submitted) return '';
    if (field === 'email' && formData.email && !isValidEmail(formData.email)) return styles['footer-input-error'];
    if (!formData[field]) return styles['footer-input-error'];
    return '';
  };

  if (newsletterSuccess) {
    return (
      <p className={styles['footer-success']} role="alert" aria-live="polite">
        Dziękujemy za dołączenie! Wkrótce otrzymasz od nas inspirujące wiadomości.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubscribe} className={styles['footer-form']} noValidate>
      {/* Honeypot */}
      <input
        type="text"
        name="website"
        value={formData.website}
        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
        className="cta-honeypot"
        tabIndex={-1}
        autoComplete="off"
      />

      <label htmlFor="newsletter-name" className="visually-hidden">Imię</label>
      <input
        id="newsletter-name"
        type="text"
        placeholder="Imię"
        className={`${styles['footer-input']} ${getFieldErrorClass('name')}`}
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        autoComplete="given-name"
        disabled={isSubmitting}
      />
      
      <label htmlFor="newsletter-email" className="visually-hidden">Email</label>
      <input
        id="newsletter-email"
        type="email"
        placeholder="Email"
        className={`${styles['footer-input']} ${getFieldErrorClass('email')}`}
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        autoComplete="email"
        disabled={isSubmitting}
      />
      
      <button 
        type="submit" 
        className={`${styles['footer-button']} ${submitted && !isFormValid ? styles['footer-button-error'] : ''}`}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
           <span className={styles['footer-spinner']} />
        ) : 'Subskrybuj'}
      </button>

      {submitted && !isFormValid && (
        <p className={styles['footer-error']}>
          {formData.email && !isValidEmail(formData.email) 
            ? '* Podaj poprawny adres e-mail'
            : '* Wypełnij wszystkie pola'
          }
        </p>
      )}
    </form>
  );
}

// === Główny komponent Footer ===
export default function Footer() {
  return (
    <footer role="contentinfo" className={styles['footer-container']}>
      <div className={styles['footer-inner']}>
        
        {/* Desktop Layout */}
        <div className={`${styles['footer-columns']} ${styles['footer-desktop']}`}>
          
          {/* Column 1 - Newsletter */}
          <section className={styles['footer-newsletter']} aria-labelledby="newsletter-heading">
            <h2 id="newsletter-heading" className={styles['footer-title']}>
              Bądź o krok przed rynkiem
            </h2>
            <p className={styles['footer-desc']}>
              Zapisz się na newsletter i dowiaduj się pierwszy o nowościach oraz trendach w upominkach biznesowych.
            </p>
            
            <NewsletterForm />
          </section>
          
          {/* Right side - 3 columns */}
          <div className={styles['footer-right']}>
            
            {/* Column 2 - Kategorie */}
            <nav className={styles['footer-col']} aria-labelledby="footer-categories-heading">
              <h2 id="footer-categories-heading" className={styles['footer-col-title']}>Kategorie</h2>
              <ul className={styles['footer-list']}>
                {CATEGORIES.map((cat) => (
                  <li key={cat.slug}>
                    <Link href={`/kategorie/${cat.slug}`} className={styles['footer-link']}>
                      {capitalize(cat.name)}
                    </Link>
                  </li>
                ))}
                <li><Link href="/marki" className={styles['footer-link']}>Marki</Link></li>
                <li><Link href="/nowosci" className={styles['footer-link']}>Nowości</Link></li>
              </ul>
            </nav>
            
            {/* Column 3 - O nas */}
            <nav className={styles['footer-col']} aria-labelledby="footer-about-heading">
              <h2 id="footer-about-heading" className={styles['footer-col-title']}>O nas</h2>
              <ul className={styles['footer-list']}>
                <li><Link href="/inspiracje" className={styles['footer-link']}>Inspiracje</Link></li>
                <li><Link href="/o-nas" className={styles['footer-link']}>O Giviu</Link></li>
                <li><Link href="/jak-dzialamy" className={styles['footer-link']}>Jak działamy</Link></li>
                <li><Link href="/ekologia" className={styles['footer-link']}>Ekologia</Link></li>
                <li><Link href="/faq" className={styles['footer-link']}>FAQ</Link></li>
                <li><Link href="/polityka-prywatnosci" className={styles['footer-link']}>Polityka prywatności</Link></li>
                <li><Link href="/regulamin" className={styles['footer-link']}>Regulamin</Link></li>
                <li><Link href="/cookies" className={styles['footer-link']}>Cookies</Link></li>
              </ul>
            </nav>
            
            {/* Column 4 - Kontakt */}
            <section className={`${styles['footer-col']} ${styles['footer-col-last']}`} aria-labelledby="footer-contact-heading">
              <h2 id="footer-contact-heading" className={styles['footer-col-title']}>Kontakt</h2>
              <address className={styles['footer-address']}>
                <ul className={styles['footer-list']}>
                  <li><span className={styles['footer-text']}>Giviu Store Sp. z o.o.</span></li>
                  <li><span className={styles['footer-text']}>ul. Przykładowa 123</span></li>
                  <li><span className={styles['footer-text']}>00-000 Warszawa</span></li>
                  <li>
                    <a href="tel:+48555555555" className={styles['footer-link']}>
                      Tel: 555-555-555
                    </a>
                  </li>
                  <li>
                    <a href="mailto:kontakt@giviu.pl" className={styles['footer-link']}>
                      Email: kontakt@giviu.pl
                    </a>
                  </li>
                </ul>
              </address>
              
              <div className={styles['footer-social']} role="list" aria-label="Social media">
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className={styles['footer-icon']} aria-label="LinkedIn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--color-background)" aria-hidden="true" focusable="false">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="https://x.com" target="_blank" rel="noopener noreferrer" className={styles['footer-icon']} aria-label="X (Twitter)">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--color-background)" aria-hidden="true" focusable="false">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              </div>
            </section>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className={styles['footer-mobile']}>
          <section className={styles['footer-mobile-section']} aria-labelledby="newsletter-heading-mobile">
            <h2 id="newsletter-heading-mobile" className={styles['footer-title']}>
              Bądź o krok przed rynkiem
            </h2>
            <p className={styles['footer-desc']}>
              Zapisz się na newsletter i dowiaduj się pierwszy o nowościach oraz trendach w upominkach biznesowych.
            </p>
            <NewsletterForm />
          </section>

          <div className={styles['footer-mobile-grid']}>
            <nav aria-labelledby="footer-categories-mobile">
              <h2 id="footer-categories-mobile" className={styles['footer-col-title']}>Kategorie</h2>
              <ul className={styles['footer-list']}>
                {CATEGORIES.map((cat) => (
                  <li key={cat.slug}>
                    <Link href={`/kategorie/${cat.slug}`} className={styles['footer-link']}>
                      {capitalize(cat.name)}
                    </Link>
                  </li>
                ))}
                <li><Link href="/marki" className={styles['footer-link']}>Marki</Link></li>
                <li><Link href="/nowosci" className={styles['footer-link']}>Nowości</Link></li>
              </ul>
            </nav>
            
            <nav aria-labelledby="footer-about-mobile">
              <h2 id="footer-about-mobile" className={styles['footer-col-title']}>O nas</h2>
              <ul className={styles['footer-list']}>
                <li><Link href="/inspiracje" className={styles['footer-link']}>Inspiracje</Link></li>
                <li><Link href="/o-nas" className={styles['footer-link']}>O Giviu</Link></li>
                <li><Link href="/jak-dzialamy" className={styles['footer-link']}>Jak działamy</Link></li>
                <li><Link href="/ekologia" className={styles['footer-link']}>Ekologia</Link></li>
                <li><Link href="/faq" className={styles['footer-link']}>FAQ</Link></li>
                <li><Link href="/polityka-prywatnosci" className={styles['footer-link']}>Polityka prywatności</Link></li>
                <li><Link href="/regulamin" className={styles['footer-link']}>Regulamin</Link></li>
                <li><Link href="/cookies" className={styles['footer-link']}>Cookies</Link></li>
              </ul>
            </nav>
          </div>

          <section className={styles['footer-mobile-section']} aria-labelledby="footer-contact-mobile">
            <h2 id="footer-contact-mobile" className={styles['footer-col-title']}>Kontakt</h2>
            <address className={styles['footer-address']}>
              <ul className={styles['footer-list']}>
                <li><span className={styles['footer-text']}>Giviu Store Sp. z o.o.</span></li>
                <li><span className={styles['footer-text']}>ul. Przykładowa 123, 00-000 Warszawa</span></li>
                <li><a href="tel:+48555555555" className={styles['footer-link']}>Tel: 555-555-555</a></li>
                <li><a href="mailto:kontakt@giviu.pl" className={styles['footer-link']}>Email: kontakt@giviu.pl</a></li>
              </ul>
            </address>
            
            <div className={styles['footer-social']} role="list" aria-label="Social media">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className={styles['footer-icon']} aria-label="LinkedIn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--color-background)" aria-hidden="true" focusable="false">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" className={styles['footer-icon']} aria-label="X (Twitter)">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--color-background)" aria-hidden="true" focusable="false">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </section>
        </div>
        
        <div className={styles['footer-copyright']}>
          <p className={styles['footer-copyright-text']}>
            © 2026 Giviu. Wszystkie prawa zastrzeżone.
          </p>
        </div>
      </div>
    </footer>
  );
}
