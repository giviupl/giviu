'use client';

import { useState, useRef, useEffect } from 'react';
import SectionLine from '@/components/SectionLine';

interface FormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  website: string;
}

export default function CTASection() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
    website: '',
  });

  const [showErrors, setShowErrors] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSuccess && successRef.current) {
      successRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isSuccess]);

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = (): boolean => {
    return (
      formData.name.trim() !== '' &&
      formData.email.trim() !== '' &&
      isValidEmail(formData.email) &&
      formData.message.trim() !== ''
    );
  };

  const handleSubmit = async () => {
    // Honeypot check
    if (formData.website) {
      setIsSuccess(true);
      return;
    }

    setShowErrors(true);

    if (!isFormValid()) {
      return;
    }

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSuccess(true);
    } catch (error) {
      console.error('Błąd wysyłki:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const getFieldErrorClass = (field: keyof FormData): string => {
    if (!showErrors) return '';
    if (field === 'phone' || field === 'company') return '';
    if (field === 'email' && formData.email && !isValidEmail(formData.email)) return 'cta-input--error';
    if (!formData[field].trim()) return 'cta-input--error';
    return '';
  };

  if (isSuccess) {
    return (
      <section className="cta-section" ref={successRef}>
        <div className="cta-container">
          <SectionLine spacing="md" />
          <div className="cta-success">
            <h3 className="cta-success-title">Dziękujemy za wiadomość!</h3>
            <p className="cta-success-text">
              Skontaktujemy się z Tobą w następnym dniu roboczym.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="cta-section">
      <div className="cta-container">
        <SectionLine spacing="md" />

        <h2 className="cta-title">
          Szukasz markowych prezentów, które zostaną z Twoim klientem na lata?
        </h2>
        <p className="cta-subtitle">
          Porozmawiajmy o tym, jak dobrać produkty, które wzmocnią wizerunek Twojej firmy.
        </p>
        <p className="cta-subtitle">
          Umów się na darmową konsultację.
        </p>

        <form className="cta-form" noValidate onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          {/* Honeypot */}
          <input
            type="text"
            name="website"
            value={formData.website}
            onChange={(e) => updateField('website', e.target.value)}
            className="cta-honeypot"
            tabIndex={-1}
            autoComplete="off"
          />

          <div className="cta-form-left">
            <input
              type="text"
              name="name"
              autoComplete="name"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Imię i nazwisko"
              className={`cta-input ${getFieldErrorClass('name')}`}
            />
            <input
              type="email"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="Email"
              className={`cta-input ${getFieldErrorClass('email')}`}
            />
            <input
              type="tel"
              name="tel"
              autoComplete="tel"
              value={formData.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder="Telefon"
              className={`cta-input ${getFieldErrorClass('phone')}`}
            />
            <input
              type="text"
              name="organization"
              autoComplete="organization"
              value={formData.company}
              onChange={(e) => updateField('company', e.target.value)}
              placeholder="Firma"
              className={`cta-input ${getFieldErrorClass('company')}`}
            />
          </div>

          <div className="cta-form-right">
            <textarea
              name="message"
              value={formData.message}
              onChange={(e) => updateField('message', e.target.value)}
              placeholder="Wiadomość"
              className={`cta-textarea ${getFieldErrorClass('message')}`}
            />
            <button
              type="submit"
              disabled={isLoading}
              className={`cta-button ${showErrors && !isFormValid() ? 'cta-button--error' : ''}`}
            >
              {isLoading ? 'Wysyłanie...' : 'Wyślij'}
            </button>
          </div>
        </form>

        {showErrors && !isFormValid() && (
          <p className="cta-error">
            {formData.email && !isValidEmail(formData.email)
              ? '* Podaj poprawny adres e-mail'
              : '* Wypełnij wszystkie wymagane pola, aby wysłać wiadomość'
            }
          </p>
        )}
        <p className="cta-phone">
          Lub zadzwoń bezpośrednio: 555-555-555
        </p>
      </div>
    </section>
  );
}