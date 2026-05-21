'use client';

import { useState, useTransition } from 'react';
import {
  addContactAction,
  updateContactAction,
  deleteContactAction,
} from './actions';
import styles from './ClientPage.module.css';

interface Contact {
  id: string;
  name: string;
  position?: string | null;
  email?: string | null;
  phone?: string | null;
  is_primary?: boolean;
  notes?: string | null;
}

interface ContactsManagerProps {
  clientId: string;
  contacts: Contact[];
}

type FormMode = { type: 'closed' } | { type: 'add' } | { type: 'edit'; contact: Contact };

export default function ContactsManager({ clientId, contacts }: ContactsManagerProps) {
  const [mode, setMode] = useState<FormMode>({ type: 'closed' });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = (contact: Contact) => {
    if (!confirm(`Usunąć kontakt ${contact.name}?`)) return;
    startTransition(async () => {
      const result = await deleteContactAction(contact.id, clientId);
      if (!result.ok) setError(result.error || 'Błąd usuwania');
    });
  };

  return (
    <div className={styles.contactsManager}>
      {contacts.length === 0 && mode.type === 'closed' && (
        <p className={styles.emptyText}>Brak osób kontaktowych. Dodaj pierwszy kontakt.</p>
      )}

      {contacts.length > 0 && (
        <div className={styles.contactsList}>
          {contacts.map((contact) => (
            <div key={contact.id} className={styles.contactCard}>
              <div className={styles.contactMain}>
                <div className={styles.contactHeader}>
                  <strong className={styles.contactName}>{contact.name}</strong>
                  {contact.is_primary && (
                    <span className={styles.primaryBadge}>Główny</span>
                  )}
                </div>
                {contact.position && (
                  <div className={styles.contactPosition}>{contact.position}</div>
                )}
                <div className={styles.contactDetails}>
                  {contact.email && (
                    <a href={`mailto:${contact.email}`} className={styles.link}>
                      {contact.email}
                    </a>
                  )}
                  {contact.email && contact.phone && (
                    <span className={styles.separator}>·</span>
                  )}
                  {contact.phone && (
                    <a href={`tel:${contact.phone}`} className={styles.link}>
                      {contact.phone}
                    </a>
                  )}
                </div>
                {contact.notes && (
                  <div className={styles.contactNotes}>{contact.notes}</div>
                )}
              </div>
              <div className={styles.contactActions}>
                <button
                  type="button"
                  onClick={() => setMode({ type: 'edit', contact })}
                  className={styles.btnSmall}
                  disabled={isPending}
                >
                  Edytuj
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(contact)}
                  className={`${styles.btnSmall} ${styles.btnDanger}`}
                  disabled={isPending}
                >
                  Usuń
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {mode.type !== 'closed' && (
        <ContactForm
          clientId={clientId}
          contact={mode.type === 'edit' ? mode.contact : undefined}
          onClose={() => {
            setMode({ type: 'closed' });
            setError(null);
          }}
          onError={setError}
        />
      )}

      {mode.type === 'closed' && (
        <button
          type="button"
          onClick={() => setMode({ type: 'add' })}
          className={styles.btnAddContact}
        >
          + Dodaj kontakt
        </button>
      )}

      {error && <p className={styles.formError}>{error}</p>}
    </div>
  );
}

// =====================================
// Inline form
// =====================================
function ContactForm({
  clientId,
  contact,
  onClose,
  onError,
}: {
  clientId: string;
  contact?: Contact;
  onClose: () => void;
  onError: (msg: string | null) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    name: contact?.name || '',
    position: contact?.position || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    is_primary: contact?.is_primary || false,
    notes: contact?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onError(null);
    startTransition(async () => {
      const result = contact
        ? await updateContactAction(contact.id, clientId, formData)
        : await addContactAction(clientId, formData);

      if (result.ok) {
        onClose();
      } else {
        onError(result.error || 'Błąd zapisu');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.contactForm}>
      <h4 className={styles.formTitle}>
        {contact ? 'Edytuj kontakt' : 'Nowy kontakt'}
      </h4>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>
            Imię i nazwisko <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={styles.input}
            required
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Stanowisko</label>
          <input
            type="text"
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            className={styles.input}
            placeholder="np. HR Manager"
          />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={styles.input}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Telefon</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className={styles.input}
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Notatki</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className={styles.textarea}
          rows={2}
        />
      </div>

      <label className={styles.checkboxRow}>
        <input
          type="checkbox"
          checked={formData.is_primary}
          onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
        />
        <span>Główna osoba kontaktowa</span>
      </label>

      <div className={styles.formActions}>
        <button type="button" onClick={onClose} className={styles.btnSecondary} disabled={isPending}>
          Anuluj
        </button>
        <button type="submit" className={styles.btnPrimary} disabled={isPending}>
          {isPending ? 'Zapisywanie…' : contact ? 'Zapisz zmiany' : 'Dodaj kontakt'}
        </button>
      </div>
    </form>
  );
}
