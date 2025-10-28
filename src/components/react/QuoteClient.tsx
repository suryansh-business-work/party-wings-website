import { useEffect } from 'react';
import { useQuote } from './QuoteProvider';

// Expose quote helpers to window for backward compatibility with non-React code.
export default function QuoteClient(): null {
  const { add, remove, clear, items } = useQuote();

  useEffect(() => {
    // Attach helpers
    // @ts-ignore
    window.addToQuote = (s) => add(s);
    // @ts-ignore
    window.removeFromQuote = (id) => remove(id);
    // @ts-ignore
    window.clearQuote = () => clear();
    // @ts-ignore
    window.getQuote = () => items;

    return () => {
      // cleanup
      try {
        // @ts-ignore
        delete window.addToQuote;
        // @ts-ignore
        delete window.removeFromQuote;
        // @ts-ignore
        delete window.clearQuote;
        // @ts-ignore
        delete window.getQuote;
      } catch (e) {}
    };
  }, [add, remove, clear, items]);

  return null;
}
