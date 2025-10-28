import React, { createContext, useContext, useEffect, useState } from 'react';

export type Service = { id?: string; title?: string; price?: string; description?: string; category?: string; image?: string };

type QuoteContextValue = {
  items: Service[];
  add: (s: Service) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const LS_KEY = 'partywings_quote';

// Provide a safe default so consumers can destructure without runtime errors
const defaultContext: QuoteContextValue = {
  items: [],
  add: () => {},
  remove: () => {},
  clear: () => {},
};

const QuoteContext = createContext<QuoteContextValue>(defaultContext);

function readStored(): Service[] {
  try {
    const raw = localStorage.getItem(LS_KEY) || '[]';
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((i: any) => i && typeof i.id === 'string');
  } catch (e) {
    return [];
  }
}

export const QuoteProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Service[]>([]);
  const lastEventId = React.useRef<string | null>(null);

  useEffect(() => {
    // initialize from localStorage
    setItems(readStored());
    // Listen for storage events (cross-tab) and optional custom events.
    const onStorageEvent = (e: StorageEvent) => {
      if (e.key === LS_KEY) {
        setItems(readStored());
      }
    };

    // Some legacy code may dispatch a custom 'quoteUpdated' event.
    const onCustom = (e: any) => {
      // ignore events we dispatched ourselves
      try {
        const incomingId = e?.detail?.id;
        if (incomingId && incomingId === lastEventId.current) return;
      } catch (err) {}
      setItems(readStored());
    };

    window.addEventListener('storage', onStorageEvent as EventListener);
    window.addEventListener('quoteUpdated', onCustom as EventListener);
    return () => {
      window.removeEventListener('storage', onStorageEvent as EventListener);
      window.removeEventListener('quoteUpdated', onCustom as EventListener);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(items));
    } catch (e) {
      // ignore
    }
    // Notify same-window listeners (but include an id so we can ignore self-dispatch)
    try {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      lastEventId.current = id;
      window.dispatchEvent(new CustomEvent('quoteUpdated', { detail: { id, items } }));
    } catch (err) {
      // ignore
    }
  }, [items]);

  function add(s: Service) {
    if (!s || !s.id) return;
    setItems((prev) => {
      if (prev.find((p) => p.id === s.id)) return prev;
      return [...prev, s];
    });
  }

  function remove(id: string) {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }

  function clear() {
    setItems([]);
  }

  return <QuoteContext.Provider value={{ items, add, remove, clear }}>{children}</QuoteContext.Provider>;
};

export function useQuote() {
  // Return the context; it will at least contain safe no-op defaults so
  // destructuring in consumers won't throw if the provider is missing.
  return useContext(QuoteContext);
}

export default QuoteProvider;
