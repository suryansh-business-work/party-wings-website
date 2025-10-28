import React, { useState } from 'react';
import { useQuote } from './QuoteProvider';

export default function QuoteForm() {
  const { items, remove, clear } = useQuote();
  const [status, setStatus] = useState('');

  async function submit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const form = ev.currentTarget;
    const data = new FormData(form);
    const payload: any = Object.fromEntries(data as any);
    payload.selectedServices = items;
    setStatus('Sending...');
    try {
      const res = await fetch('/api/submit-quote', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (res.ok) {
        setStatus('Quote request sent! We will contact you shortly.');
        clear();
        form.reset();
      } else {
        setStatus(json?.error || 'Submission failed.');
      }
    } catch (e) {
      setStatus('Network error.');
    }
  }

  return (
    <section className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-lg p-6 card-shadow">
      <h2 className="text-xl font-semibold">Request a Quote</h2>
      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Selected services will appear below. Fill your details and submit.</p>

      <div className="mt-4 space-y-2 text-sm text-slate-700 dark:text-slate-200">
        {items.length === 0 ? <div className="text-sm text-slate-500">No services selected yet.</div> : items.map((i) => (
          <div key={i.id} className="flex items-center justify-between border rounded p-2">
            <div>
              <div className="font-semibold">{i.title}</div>
              <div className="text-xs text-slate-500">{i.category}</div>
            </div>
            <div>
              <button onClick={() => i.id && remove(i.id)} className="text-xs text-rose-500">Remove</button>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={submit} className="mt-4 space-y-3">
        <div>
          <label className="block text-sm">Name</label>
          <input name="name" required className="mt-1 block w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm">Phone</label>
          <input name="phone" required className="mt-1 block w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm">Email</label>
          <input name="email" type="email" required className="mt-1 block w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm">Event Date & Location</label>
          <input name="eventDate" type="date" className="mt-1 block w-full rounded-md border px-3 py-2" />
          <input name="eventLocation" placeholder="City or Venue" className="mt-2 block w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm">Notes (optional)</label>
          <textarea name="notes" className="mt-1 block w-full rounded-md border px-3 py-2" rows={3}></textarea>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className="px-4 py-2 bg-amber-500 text-white rounded-md">Send Quote Request</button>
          <button type="button" onClick={() => clear()} className="px-3 py-2 border rounded-md text-sm">Clear Selection</button>
        </div>

        <div className="text-sm mt-2">{status}</div>
      </form>
    </section>
  );
}
