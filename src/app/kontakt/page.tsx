'use client';

import { useState, useRef, useEffect } from 'react';
import SectionLine from '@/components/SectionLine';

export default function KontaktPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    website: '' // Honeypot
  });
  const [submitted, setSubmitted] = useState(false);
  const [success, setSuccess] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Autofocus
  useEffect(() => {
    if (window.innerWidth > 768) {
      nameInputRef.current?.focus();
    }
  }, []);

  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isFormValid = formData.name && formData.email && isValidEmail(formData.email) && formData.message;

  const handleSubmit = () => {
    // Honeypot check - jeśli wypełnione = bot
    if (formData.website) {
      setSuccess(true); // Udajemy sukces dla bota
      return;
    }

    setSubmitted(true);
    if (isFormValid) {
      setSuccess(true);
    }
  };

  const getFieldErrorClass = (field: keyof typeof formData) => {
    if (!submitted) return '';
    if (field === 'email' && formData.email && !isValidEmail(formData.email)) return 'cta-input--error';
    if (!formData[field]) return 'cta-input--error';
    return '';
  };

  return (
    <main className="kontakt-page">

      <div className="kontakt-spacer"></div>

      <div className="kontakt-container">

        <div className="kontakt-header">
          <div className="kontakt-title-wrapper">
            <SectionLine spacing="sm" />
            <h1 className="kontakt-title">Kontakt</h1>
          </div>
          <p className="kontakt-description">
            Masz pytania? Chętnie pomożemy! Skontaktuj się z nami w dogodny dla Ciebie sposób.
          </p>
        </div>

        <section className="kontakt-info-section">
          <h2 className="kontakt-section-title">Dane kontaktowe</h2>

          <div className="kontakt-info-grid">
            <div className="kontakt-info-item">
              <svg className="kontakt-info-icon" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              <div className="kontakt-info-content">
                <h3 className="kontakt-info-label">E-mail</h3>
                <a href="mailto:kontakt@giviu.pl" className="kontakt-info-value">
                  kontakt@giviu.pl
                </a>
              </div>
            </div>

            <div className="kontakt-info-item">
              <svg className="kontakt-info-icon" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              <div className="kontakt-info-content">
                <h3 className="kontakt-info-label">Telefon</h3>
                <a href="tel:+48123456789" className="kontakt-info-value">
                  +48 123 456 789
                </a>
              </div>
            </div>

            <div className="kontakt-info-item">
              <svg className="kontakt-info-icon" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <div className="kontakt-info-content">
                <h3 className="kontakt-info-label">Adres</h3>
                <p className="kontakt-info-value">
                  ul. Przykładowa 123<br />
                  00-001 Warszawa
                </p>
              </div>
            </div>

            <div className="kontakt-info-item">
              <svg className="kontakt-info-icon" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="kontakt-info-content">
                <h3 className="kontakt-info-label">Godziny pracy</h3>
                <p className="kontakt-info-value">
                  Pon - Pt: 9:00 - 17:00
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="kontakt-form-section">
          <h2 className="kontakt-section-title">Napisz do nas</h2>

          {success ? (
            <div className="kontakt-success">
              <div className="kontakt-success-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <h3 className="kontakt-success-title">Wiadomość wysłana!</h3>
              <p className="kontakt-success-text">
                Dziękujemy za kontakt. Odpowiemy najszybciej jak to możliwe.
              </p>
            </div>
          ) : (
            <form className="kontakt-form" noValidate onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
              {/* Honeypot - ukryte pole */}
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="cta-honeypot"
                tabIndex={-1}
                autoComplete="off"
              />

              <div className="kontakt-form-row">
                <div className="kontakt-form-field">
                  <label className="kontakt-label" htmlFor="name">Imię i nazwisko</label>
                  <input
                    ref={nameInputRef}
                    id="name"
                    type="text"
                    name="name"
                    autoComplete="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`kontakt-input ${getFieldErrorClass('name')}`}
                    placeholder="Jan Kowalski"
                  />
                </div>
                <div className="kontakt-form-field">
                  <label className="kontakt-label" htmlFor="email">E-mail</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`kontakt-input ${getFieldErrorClass('email')}`}
                    placeholder="jan.kowalski@firma.pl"
                  />
                </div>
              </div>

              <div className="kontakt-form-field">
                <label className="kontakt-label" htmlFor="message">Wiadomość</label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className={`kontakt-textarea ${getFieldErrorClass('message')}`}
                  placeholder="Twoja wiadomość..."
                />
              </div>

              <button
                type="submit"
                className={`kontakt-button ${submitted && !isFormValid ? 'cta-button--error' : ''}`}
              >
                Wyślij wiadomość
              </button>

              {submitted && !isFormValid && (
                <p className="kontakt-error">
                  {formData.email && !isValidEmail(formData.email)
                    ? '* Podaj poprawny adres e-mail'
                    : '* Wypełnij wszystkie wymagane pola, aby wysłać wiadomość'
                  }
                </p>
              )}
            </form>
          )}
        </section>

      </div>
    </main>
  );
}
