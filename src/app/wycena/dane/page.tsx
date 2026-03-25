'use client';

import SectionLine from '@/components/SectionLine';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useQuoteStore } from '@/stores/quoteStore';
import InspirationCarouselSimple from '@/components/InspirationCarouselSimple';

interface CustomerData {
  firstName: string;
  lastName: string;
  company: string;
  phone: string;
  email: string;
  nip: string;
  address: string;
  city: string;
  postalCode: string;
  notes: string;
  website: string;
}

export default function WycenaDanePage() {
  const { items } = useQuoteStore();
  const [isHydrated, setIsHydrated] = useState(false);
  const [customerData, setCustomerData] = useState<CustomerData>({
    firstName: '',
    lastName: '',
    company: '',
    phone: '',
    email: '',
    nip: '',
    address: '',
    city: '',
    postalCode: '',
    notes: '',
    website: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ id: string; name: string; size: number }>>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [fileFormatError, setFileFormatError] = useState<string | null>(null);

  const firstNameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && items.length > 0 && window.innerWidth > 768) {
      firstNameRef.current?.focus();
    }
  }, [isHydrated, items.length]);

  const requiredFields: (keyof CustomerData)[] = ['firstName', 'lastName', 'company', 'phone', 'email'];

  const updateField = (field: keyof CustomerData, value: string) => {
    setCustomerData(prev => ({ ...prev, [field]: value }));
  };

  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isFormValid = (): boolean => {
    return requiredFields.every(field => customerData[field].trim() !== '') &&
      isValidEmail(customerData.email);
  };

  const getFieldErrorClass = (field: keyof CustomerData): string => {
    if (!submitted) return '';
    if (!requiredFields.includes(field)) return '';
    if (field === 'email' && customerData.email && !isValidEmail(customerData.email)) return 'cta-input--error';
    if (!customerData[field].trim()) return 'cta-input--error';
    return '';
  };

  const getErrorMessage = (): string => {
    if (customerData.email && !isValidEmail(customerData.email)) {
      return '* Podaj poprawny adres e-mail';
    }
    return '* Wypełnij wszystkie wymagane pola, aby wysłać zapytanie';
  };

  const handleSubmit = async () => {
    if (customerData.website) {
      setIsSuccess(true);
      return;
    }

    setSubmitted(true);

    if (!isFormValid()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Błąd wysyłki:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const allowedExtensions = ['.pdf', '.ai', '.eps', '.cdr', '.svg'];

  const validateFile = (file: File): boolean => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    return allowedExtensions.includes(ext);
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const validFiles: Array<{ id: string; name: string; size: number }> = [];
    const invalidFiles: string[] = [];

    Array.from(files).forEach(file => {
      if (validateFile(file)) {
        validFiles.push({
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size
        });
      } else {
        invalidFiles.push(file.name);
      }
    });

    if (invalidFiles.length > 0) {
      setFileFormatError(`Nieprawidłowy format: ${invalidFiles.join(', ')}. Dozwolone: ${allowedExtensions.join(', ')}`);
    }

    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (!isHydrated) {
    return (
      <section className="wycena-dane-page">
        <div className="wycena-dane-container">
          <div className="wycena-dane-loading">
            <div className="spinner"></div>
          </div>
        </div>
      </section>
    );
  }

  if (isSuccess) {
    return (
      <section className="wycena-dane-page">
        <div className="wycena-thankyou-wrapper">
          <div className="wycena-thankyou">
            <div className="wycena-thankyou-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>

            <h1 className="wycena-thankyou-title">
              Dziękujemy za Twoje zapytanie!
            </h1>

            <p className="wycena-thankyou-subtitle">
              Twoja wycena jest już w drodze do naszego zespołu
            </p>

            <p className="wycena-thankyou-text">
              Nasi eksperci przygotują dla Ciebie spersonalizowaną ofertę i skontaktują się
              z Tobą w ciągu <strong>24 godzin</strong>. Sprawdź swoją skrzynkę mailową –
              niedługo otrzymasz od nas wiadomość!
            </p>

            <div className="wycena-thankyou-box">
              <h2 className="wycena-thankyou-box-title">Co dalej?</h2>
              <div className="wycena-thankyou-steps">
                <div className="wycena-thankyou-step">
                  <svg width="32" height="32" fill="none" stroke="#595d66" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  <div>
                    <p className="wycena-thankyou-step-title">Otrzymasz e-mail</p>
                    <p className="wycena-thankyou-step-desc">z potwierdzeniem zapytania</p>
                  </div>
                </div>
                <div className="wycena-thankyou-step">
                  <svg width="32" height="32" fill="none" stroke="#595d66" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                  <div>
                    <p className="wycena-thankyou-step-title">Skontaktujemy się</p>
                    <p className="wycena-thankyou-step-desc">aby omówić szczegóły</p>
                  </div>
                </div>
                <div className="wycena-thankyou-step">
                  <svg width="32" height="32" fill="none" stroke="#595d66" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                  </svg>
                  <div>
                    <p className="wycena-thankyou-step-title">Przygotujemy ofertę</p>
                    <p className="wycena-thankyou-step-desc">dopasowaną do Twoich potrzeb</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="inspiration-wrapper">
            <InspirationCarouselSimple />
          </div>

          <div className="wycena-thankyou-footer">
            <Link href="/" className="wycena-thankyou-btn">
              Wróć na stronę główną
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="wycena-dane-page">
        <div className="wycena-dane-container">
          <div className="wycena-dane-empty">
            <p className="wycena-dane-empty-text">Twoja lista produktów jest pusta</p>
            <Link href="/kolekcje" className="quote-btn-primary">
              Wróć do zakupów
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="wycena-dane-page">
      <div className="wycena-dane-spacer"></div>
      <div className="wycena-dane-container">

        <header className="wycena-dane-header">
          <div className="wycena-dane-title-wrapper">
            <SectionLine spacing="sm" />
            <h1 className="wycena-dane-title">Dane kontaktowe</h1>
          </div>
          <p className="wycena-dane-subtitle">
            Wypełnij formularz, abyśmy mogli przygotować dla Ciebie spersonalizowaną ofertę.
          </p>
        </header>

        <div className="quote-progress">
          <Link href="/wycena" className="quote-step quote-step-link">1. Zapytanie</Link>
          <div className="quote-step-line"></div>
          <span className="quote-step active">2. Dane</span>
        </div>

        <form className="wycena-dane-form" noValidate onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <input
            type="text"
            name="website"
            value={customerData.website}
            onChange={(e) => updateField('website', e.target.value)}
            className="cta-honeypot"
            tabIndex={-1}
            autoComplete="off"
          />

          <div className="wycena-dane-form-row">
            <div className="kontakt-form-field">
              <label className="kontakt-label" htmlFor="firstName">Imię *</label>
              <input
                ref={firstNameRef}
                id="firstName"
                type="text"
                name="given-name"
                autoComplete="given-name"
                value={customerData.firstName}
                onChange={(e) => updateField('firstName', e.target.value)}
                placeholder="Jan"
                className={`kontakt-input ${getFieldErrorClass('firstName')}`}
              />
            </div>
            <div className="kontakt-form-field">
              <label className="kontakt-label" htmlFor="lastName">Nazwisko *</label>
              <input
                id="lastName"
                type="text"
                name="family-name"
                autoComplete="family-name"
                value={customerData.lastName}
                onChange={(e) => updateField('lastName', e.target.value)}
                placeholder="Kowalski"
                className={`kontakt-input ${getFieldErrorClass('lastName')}`}
              />
            </div>
          </div>

          <div className="wycena-dane-form-row">
            <div className="kontakt-form-field">
              <label className="kontakt-label" htmlFor="company">Firma *</label>
              <input
                id="company"
                type="text"
                name="organization"
                autoComplete="organization"
                value={customerData.company}
                onChange={(e) => updateField('company', e.target.value)}
                placeholder="Nazwa firmy"
                className={`kontakt-input ${getFieldErrorClass('company')}`}
              />
            </div>
            <div className="kontakt-form-field">
              <label className="kontakt-label" htmlFor="phone">Telefon *</label>
              <input
                id="phone"
                type="tel"
                name="tel"
                autoComplete="tel"
                value={customerData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="000 000 000"
                className={`kontakt-input ${getFieldErrorClass('phone')}`}
              />
            </div>
          </div>

          <div className="wycena-dane-form-row">
            <div className="kontakt-form-field">
              <label className="kontakt-label" htmlFor="email">E-mail *</label>
              <input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                value={customerData.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="jan.kowalski@firma.pl"
                className={`kontakt-input ${getFieldErrorClass('email')}`}
              />
            </div>
            <div className="kontakt-form-field">
              <label className="kontakt-label" htmlFor="nip">NIP</label>
              <input
                id="nip"
                type="text"
                name="nip"
                value={customerData.nip}
                onChange={(e) => updateField('nip', e.target.value)}
                placeholder="1234567890"
                className="kontakt-input"
              />
            </div>
          </div>

          <div className="wycena-dane-form-row">
            <div className="kontakt-form-field">
              <label className="kontakt-label" htmlFor="address">Adres</label>
              <input
                id="address"
                type="text"
                name="street-address"
                autoComplete="street-address"
                value={customerData.address}
                onChange={(e) => updateField('address', e.target.value)}
                placeholder="ul. Przykładowa 1"
                className="kontakt-input"
              />
            </div>
            <div className="wycena-dane-city-row">
              <div className="kontakt-form-field wycena-dane-city-field">
                <label className="kontakt-label" htmlFor="city">Miasto</label>
                <input
                  id="city"
                  type="text"
                  name="address-level2"
                  autoComplete="address-level2"
                  value={customerData.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  placeholder="Warszawa"
                  className="kontakt-input"
                />
              </div>
              <div className="kontakt-form-field wycena-dane-postal-field">
                <label className="kontakt-label" htmlFor="postalCode">Kod pocztowy</label>
                <input
                  id="postalCode"
                  type="text"
                  name="postal-code"
                  autoComplete="postal-code"
                  value={customerData.postalCode}
                  onChange={(e) => updateField('postalCode', e.target.value)}
                  placeholder="00-000"
                  className="kontakt-input"
                />
              </div>
            </div>
          </div>

          <div className="kontakt-form-field">
            <label className="kontakt-label" htmlFor="notes">Uwagi do zapytania</label>
            <textarea
              id="notes"
              name="notes"
              value={customerData.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="Dodatkowe informacje, pytania..."
              rows={4}
              className="kontakt-textarea"
            />
          </div>

          <div className="wycena-dane-upload">
            <div
              className={`wycena-dane-dropzone ${isDragging ? 'dragging' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <input
                id="file-input"
                type="file"
                multiple
                accept=".pdf,.ai,.eps,.cdr,.svg"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="wycena-dane-file-input"
              />

              <svg className="wycena-dane-upload-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>

              <h2 className="wycena-dane-upload-title">
                Załącz logotyp – przygotujemy darmową wizualizację
                <span className="wycena-dane-upload-optional">(Opcjonalnie)</span>
              </h2>
              <p className="wycena-dane-upload-desc">Przeciągnij plik tutaj lub kliknij, aby wybrać.</p>
              <p className="wycena-dane-upload-formats">Formaty: .pdf, .ai, .eps, .cdr, .svg</p>
            </div>

            {fileFormatError && (
              <div className="wycena-dane-upload-error">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p>{fileFormatError}</p>
                <button type="button" onClick={() => setFileFormatError(null)} className="wycena-dane-upload-error-close">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {uploadedFiles.length > 0 && (
              <div className="wycena-dane-files">
                {uploadedFiles.map(file => (
                  <div key={file.id} className="wycena-dane-file">
                    <div className="wycena-dane-file-info">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                        <polyline points="14,2 14,8 20,8" />
                      </svg>
                      <div>
                        <p className="wycena-dane-file-name">{file.name}</p>
                        <p className="wycena-dane-file-size">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => removeFile(file.id)} className="wycena-dane-file-remove">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                        <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        <div className="quote-actions">
          <Link href="/wycena" className="quote-btn-secondary">
            ← Wróć do zapytania
          </Link>

          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className={`quote-btn-primary ${submitted && !isFormValid() ? 'error' : ''}`}
          >
            {isLoading ? 'Wysyłanie...' : 'Wyślij zapytanie →'}
          </button>
        </div>

        {submitted && !isFormValid() && (
          <p className="quote-error-message">
            {getErrorMessage()}
          </p>
        )}
      </div>
    </section>
  );
}