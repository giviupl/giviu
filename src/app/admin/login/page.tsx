'use client';

import { useState, useTransition } from 'react';
import { loginAction } from './actions';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await loginAction(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>Giviu Admin</h1>
        <p className={styles.subtitle}>Panel ofertowy</p>

        <form action={handleSubmit} className={styles.form}>
          <input
            type="password"
            name="password"
            placeholder="Hasło"
            className={styles.input}
            required
            autoFocus
          />

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.button} disabled={isPending}>
            {isPending ? 'Logowanie…' : 'Zaloguj'}
          </button>
        </form>
      </div>
    </div>
  );
}
