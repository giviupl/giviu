'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  changeInquiryStatusAction,
  updateInquiryAction,
  createClientFromInquiryAction,
  convertInquiryToOfferAction,
} from '../actions';
import { useConfirm } from '@/components/admin/ConfirmProvider';
import styles from './InquiryView.module.css';

const STATUS_OPTIONS = [
  { value: 'new', label: 'Nowe', color: 'orange' },
  { value: 'in_progress', label: 'W obróbce', color: 'blue' },
  { value: 'quoted', label: 'Wycenione', color: 'green' },
  { value: 'rejected', label: 'Odrzucone', color: 'red' },
];

interface Inquiry {
  id: string;
  company_name: string | null;
  contact_person: string;
  email: string;
  phone: string | null;
  nip: string | null;
  status: string;
  notes: string | null;
  address_street: string | null;
  address_city: string | null;
  address_postal_code: string | null;
  attached_logo_url: string | null;
  client_id: string | null;
  converted_offer_id: string | null;
  created_at: string;
}

interface InquiryItem {
  id: string;
  product_id: string | null;
  color_name: string | null;
  color_hex: string | null;
  quantities: unknown;
  products?: {
    id: string;
    name: string;
    brand_name: string;
    code: string | null;
    image_url: string | null;
    slug: string;
  } | null;
}

interface LinkedClient {
  id: string;
  company_name: string | null;
  contact_person: string;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export default function InquiryView({
  inquiry: initialInquiry,
  items,
  linkedClient: initialLinkedClient,
}: {
  inquiry: Inquiry;
  items: InquiryItem[];
  linkedClient: LinkedClient | null;
}) {
  const router = useRouter();
  const confirm = useConfirm();
  const [inquiry, setInquiry] = useState(initialInquiry);
  const [linkedClient, setLinkedClient] = useState<LinkedClient | null>(
    initialLinkedClient,
  );
  const [formData, setFormData] = useState({ notes: initialInquiry.notes || '' });
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [isCreatingClient, startCreateClient] = useTransition();
  const [isConverting, startConvert] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(false);

  // Auto-save notatek
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    setStatus('saving');

    timerRef.current = setTimeout(async () => {
      const result = await updateInquiryAction(inquiry.id, formData);
      if (result.ok) {
        setStatus('saved');
        setTimeout(() => setStatus('idle'), 2000);
      } else {
        setStatus('error');
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const handleStatusChange = async (newStatus: string) => {
    setIsChangingStatus(true);
    const result = await changeInquiryStatusAction(inquiry.id, newStatus);
    if (result.ok) {
      setInquiry({ ...inquiry, status: newStatus });
    }
    setIsChangingStatus(false);
  };

  const handleCreateClient = async () => {
    setErrorMsg(null);
    startCreateClient(async () => {
      const result = await createClientFromInquiryAction(inquiry.id);
      if (result.ok) {
        if (result.existed) {
          // Klient już istniał (po NIP) — pokaż info
          await confirm({
            title: 'Klient już istnieje',
            message: `Klient "${result.clientName}" już istniał w bazie z tym NIP-em. Zapytanie zostało powiązane z istniejącym kontem.`,
            confirmLabel: 'OK',
            cancelLabel: '—',
            variant: 'info',
          });
        }
        setInquiry((prev) => ({ ...prev, client_id: result.clientId ?? null }));
        setLinkedClient({
          id: result.clientId!,
          company_name: inquiry.company_name,
          contact_person: inquiry.contact_person,
        });
      } else {
        setErrorMsg(result.error || 'Nie udało się utworzyć klienta');
      }
    });
  };

  const handleConvertToOffer = async () => {
    if (!inquiry.client_id) {
      setErrorMsg('Najpierw powiąż zapytanie z klientem (utwórz nowego lub wybierz istniejącego)');
      return;
    }

    const ok = await confirm({
      title: 'Utworzyć ofertę z tego zapytania?',
      message: `Powstanie nowa oferta z ${items.length} pozycjami. Status zapytania zmieni się na "Wycenione".`,
      confirmLabel: 'Utwórz ofertę',
      variant: 'info',
    });
    if (!ok) return;

    setErrorMsg(null);
    startConvert(async () => {
      const result = await convertInquiryToOfferAction(inquiry.id);
      if (result.ok && result.offerId) {
        router.push(`/admin/offers/${result.offerId}`);
      } else {
        setErrorMsg(result.error || 'Nie udało się utworzyć oferty');
      }
    });
  };

  const currentStatusInfo = STATUS_OPTIONS.find((s) => s.value === inquiry.status);

  return (
    <div className={styles.view}>
      {/* Status bar */}
      <div className={styles.statusBar}>
        <div className={styles.statusBarLeft}>
          <label className={styles.label}>Status</label>
          <div className={styles.statusPickerWrap}>
            <span
              className={`${styles.statusBadge} ${styles[`status_${currentStatusInfo?.color || 'gray'}`]}`}
            >
              {currentStatusInfo?.label || inquiry.status}
            </span>
            <select
              value={inquiry.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={isChangingStatus}
              className={styles.statusSelect}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <span className={styles.metaText}>
            Otrzymano: {new Date(inquiry.created_at).toLocaleString('pl-PL')}
          </span>
        </div>

        <div className={styles.statusBarRight}>
          <div className={styles.saveIndicator}>
            {status === 'saving' && <span className={styles.statusSaving}>Zapisywanie…</span>}
            {status === 'saved' && <span className={styles.statusSaved}>✓ Zapisano</span>}
            {status === 'error' && <span className={styles.statusError}>⚠ Błąd</span>}
          </div>

          {inquiry.converted_offer_id ? (
            <Link
              href={`/admin/offers/${inquiry.converted_offer_id}`}
              className={styles.convertBtn}
            >
              Zobacz utworzoną ofertę →
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleConvertToOffer}
              disabled={isConverting || !inquiry.client_id || items.length === 0}
              className={styles.convertBtn}
              title={
                !inquiry.client_id
                  ? 'Najpierw powiąż zapytanie z klientem'
                  : items.length === 0
                    ? 'Zapytanie nie ma pozycji'
                    : ''
              }
            >
              {isConverting ? 'Tworzenie oferty…' : 'Utwórz ofertę →'}
            </button>
          )}
        </div>
      </div>

      {errorMsg && <div className={styles.errorBox}>{errorMsg}</div>}

      {/* DANE KLIENTA */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Dane klienta</h2>
          {!linkedClient && (
            <button
              type="button"
              onClick={handleCreateClient}
              disabled={isCreatingClient}
              className={styles.btnPrimary}
            >
              {isCreatingClient ? 'Tworzenie…' : '+ Utwórz klienta z tych danych'}
            </button>
          )}
          {linkedClient && (
            <Link href={`/admin/clients/${linkedClient.id}`} className={styles.btnSecondary}>
              Karta klienta →
            </Link>
          )}
        </div>

        {linkedClient && (
          <div className={styles.linkedBox}>
            ✓ Powiązano z klientem:{' '}
            <strong>{linkedClient.company_name || linkedClient.contact_person}</strong>
          </div>
        )}

        <div className={styles.clientGrid}>
          <div>
            <div className={styles.fieldLabel}>Firma</div>
            <div className={styles.fieldValue}>{inquiry.company_name || '—'}</div>
          </div>
          <div>
            <div className={styles.fieldLabel}>NIP</div>
            <div className={styles.fieldValue}>{inquiry.nip || '—'}</div>
          </div>
          <div>
            <div className={styles.fieldLabel}>Osoba kontaktowa</div>
            <div className={styles.fieldValue}>{inquiry.contact_person}</div>
          </div>
          <div>
            <div className={styles.fieldLabel}>Email</div>
            <div className={styles.fieldValue}>
              <a href={`mailto:${inquiry.email}`} className={styles.link}>
                {inquiry.email}
              </a>
            </div>
          </div>
          <div>
            <div className={styles.fieldLabel}>Telefon</div>
            <div className={styles.fieldValue}>
              {inquiry.phone ? (
                <a href={`tel:${inquiry.phone}`} className={styles.link}>
                  {inquiry.phone}
                </a>
              ) : (
                '—'
              )}
            </div>
          </div>
          <div>
            <div className={styles.fieldLabel}>Adres</div>
            <div className={styles.fieldValue}>
              {inquiry.address_street || inquiry.address_city ? (
                <>
                  {inquiry.address_street && <div>{inquiry.address_street}</div>}
                  {(inquiry.address_postal_code || inquiry.address_city) && (
                    <div>
                      {inquiry.address_postal_code} {inquiry.address_city}
                    </div>
                  )}
                </>
              ) : (
                '—'
              )}
            </div>
          </div>
        </div>

        {inquiry.attached_logo_url && (
          <div className={styles.logoBox}>
            <span className={styles.fieldLabel}>Załączony logotyp:</span>
            <a
              href={inquiry.attached_logo_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
              style={{ marginLeft: 8 }}
            >
              Pobierz plik →
            </a>
          </div>
        )}
      </section>

      {/* POZYCJE Z WARIANTAMI */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          Produkty <span className={styles.count}>({items.length})</span>
        </h2>

        {items.length === 0 && (
          <p className={styles.emptyText}>Zapytanie nie zawiera żadnych pozycji.</p>
        )}

        <div className={styles.itemsList}>
          {items.map((item) => {
            const product = item.products;
            const quantities = Array.isArray(item.quantities)
              ? (item.quantities as Array<string | number>)
              : [];
            const totalUnits = quantities.reduce<number>((sum, q) => {
              const n = typeof q === 'string' ? parseInt(q) : Number(q);
              return sum + (Number.isFinite(n) ? n : 0);
            }, 0);

            return (
              <article key={item.id} className={styles.itemCard}>
                <div className={styles.itemImageWrap}>
                  {product?.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      width={72}
                      height={72}
                      className={styles.itemImage}
                    />
                  ) : (
                    <div className={styles.itemImagePlaceholder}>📦</div>
                  )}
                </div>

                <div className={styles.itemMain}>
                  {product?.brand_name && (
                    <div className={styles.itemBrand}>{product.brand_name.toUpperCase()}</div>
                  )}
                  <div className={styles.itemName}>
                    {product?.name || 'Produkt niedostępny w bazie'}
                  </div>
                  {item.color_name && (
                    <div className={styles.itemColor}>
                      <span
                        className={styles.itemColorDot}
                        style={{ backgroundColor: item.color_hex || '#999' }}
                      />
                      {item.color_name}
                    </div>
                  )}
                  {product?.code && (
                    <div className={styles.itemCode}>Kod: {product.code}</div>
                  )}
                </div>

                <div className={styles.itemQuantities}>
                  <div className={styles.itemQuantitiesLabel}>
                    Warianty ilościowe ({quantities.length})
                  </div>
                  <div className={styles.quantitiesList}>
                    {quantities.length === 0 ? (
                      <div className={styles.quantityChip}>Brak ilości</div>
                    ) : (
                      quantities.map((q, idx) => (
                        <div key={idx} className={styles.quantityChip}>
                          <span className={styles.quantityChipNum}>{q}</span>
                          <span className={styles.quantityChipUnit}>szt</span>
                        </div>
                      ))
                    )}
                  </div>
                  {totalUnits > 0 && quantities.length > 1 && (
                    <div className={styles.itemQuantitiesTotal}>
                      Razem: {totalUnits} szt
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* UWAGI */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Uwagi do zapytania</h2>
        {inquiry.notes && (
          <div className={styles.notesOriginal}>
            <div className={styles.fieldLabel}>Treść od klienta:</div>
            <div className={styles.notesValue}>{inquiry.notes}</div>
          </div>
        )}
        <div className={styles.field}>
          <label className={styles.label}>
            {inquiry.notes ? 'Edytuj uwagi' : 'Dodaj uwagi'} (auto-save)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={4}
            className={styles.textarea}
            placeholder="Notatki wewnętrzne o tym zapytaniu, ustalenia z klientem itd."
          />
        </div>
      </section>
    </div>
  );
}
