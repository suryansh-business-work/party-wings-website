import React, { useEffect, useState } from 'react';

const LS_KEY = 'partywings_quote';

function readItems() {
  try {
    const raw = localStorage.getItem(LS_KEY) || '[]';
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (e) {
    return [];
  }
}

export default function CartButton() {
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setItems(readItems());

    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key === LS_KEY) setItems(readItems());
    };
    const onCustom = () => setItems(readItems());

    window.addEventListener('storage', onStorage as EventListener);
    window.addEventListener('quoteUpdated', onCustom as EventListener);
    return () => {
      window.removeEventListener('storage', onStorage as EventListener);
      window.removeEventListener('quoteUpdated', onCustom as EventListener);
    };
  }, []);

  function remove(id: string) {
    // prefer window helper if present
    // @ts-ignore
    if (window.removeFromQuote) {
      // @ts-ignore
      window.removeFromQuote(id);
      setItems(readItems());
      return;
    }

    const filtered = readItems().filter((i: any) => i.id !== id);
    try { localStorage.setItem(LS_KEY, JSON.stringify(filtered)); } catch (e) {}
    window.dispatchEvent(new CustomEvent('quoteUpdated'));
    setItems(filtered);
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} className="rounded-md text-sm bg-transparent text-white hover:text-amber-300 flex items-center gap-2">
        <i className="fa-solid fa-cart-shopping"></i>
        <span className="sr-only">View package cart</span>
        <span className="inline-block bg-amber-500 text-white text-xs rounded-full px-2 py-0.5">{items.length}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 border rounded-md p-3 shadow-lg z-50">
          <h4 className="font-semibold mb-2">Package ({items.length})</h4>
          {items.length === 0 ? (
            <div className="text-sm text-slate-600">No items in your package.</div>
          ) : (
            <ul className="space-y-2 max-h-48 overflow-auto">
              {items.map((it: any) => (
                <li key={it.id} className="flex items-center justify-between">
                  <div className="text-sm">{it.title}</div>
                  <div className="flex items-center gap-2">
                    {it.price ? <div className="text-amber-600 text-sm">{it.price}</div> : null}
                    <button onClick={() => remove(it.id)} className="text-xs text-red-500">Remove</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 flex justify-between">
            <a href="#package" className="text-sm bg-amber-500 text-white rounded-md">Open Package</a>
            <button onClick={() => { try { /* @ts-ignore */ window.clearQuote?.(); } catch(e){} setItems([]); }} className="text-sm px-3 py-1 border rounded-md">Clear</button>
          </div>
        </div>
      )}
    </div>
  );
}
