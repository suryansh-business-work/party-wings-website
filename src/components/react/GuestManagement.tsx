import React, { useEffect, useMemo, useState } from 'react';

type Guest = {
  id: string;
  name: string;
  type: 'Adult' | 'Child';
  attending: 'Yes' | 'No' | 'Maybe' | 'Unknown';
  group?: string;
  notes?: string;
};

const STORAGE_KEY = 'partywings_guest_list';

function uid(prefix = 'g') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
}

export default function GuestManagement(): JSX.Element {
  const [guests, setGuests] = useState<Guest[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as Guest[];
    } catch {
      return [];
    }
  });

  const [name, setName] = useState('');
  const [type, setType] = useState<Guest['type']>('Adult');
  const [group, setGroup] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(guests));
    } catch {}
  }, [guests]);

  const summary = useMemo(() => {
    const total = guests.length;
    const adults = guests.filter(g => g.type === 'Adult').length;
    const children = guests.filter(g => g.type === 'Child').length;
    const attending = guests.filter(g => g.attending === 'Yes').length;
    const maybe = guests.filter(g => g.attending === 'Maybe').length;
    return { total, adults, children, attending, maybe };
  }, [guests]);

  function addGuest() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const g: Guest = { id: uid(), name: trimmed, type, attending: 'Unknown', group: group.trim() || undefined, notes: notes.trim() || undefined };
    setGuests(s => [g, ...s]);
    setName(''); setGroup(''); setNotes(''); setType('Adult');
  }

  function updateGuest(id: string, patch: Partial<Guest>) {
    setGuests(s => s.map(g => g.id === id ? { ...g, ...patch } : g));
  }

  function removeGuest(id: string) {
    setGuests(s => s.filter(g => g.id !== id));
  }

  function clearAll() {
    if (!confirm('Clear all guests? This cannot be undone.')) return;
    setGuests([]);
  }

  function exportCSV() {
    const headers = ['id','name','type','attending','group','notes'];
    const rows = guests.map(g => headers.map(h => JSON.stringify((g as any)[h] ?? '')).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'guest-list.csv'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  function importCSV(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      if (lines.length === 0) return;
      const headers = lines[0].split(',').map(h => h.replace(/(^"|"$)/g, '').trim());
      const newGuests: Guest[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(c => c.replace(/(^"|"$)/g, '').trim());
        if (cols.length === 0) continue;
        const obj: any = {};
        headers.forEach((h, idx) => { obj[h] = cols[idx] ?? ''; });
        const g: Guest = {
          id: uid(),
          name: obj.name || obj.Name || 'Guest',
          type: (obj.type === 'Child') ? 'Child' : 'Adult',
          attending: (['Yes','No','Maybe'].includes(obj.attending) ? obj.attending : 'Unknown') as Guest['attending'],
          group: obj.group || obj.Group || undefined,
          notes: obj.notes || obj.Notes || undefined
        };
        newGuests.push(g);
      }
      if (newGuests.length) setGuests(s => [...newGuests, ...s]);
    };
    reader.readAsText(file);
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border rounded-lg p-4 shadow">
        <h2 className="text-lg font-semibold">Guest Management</h2>
        <p className="text-sm text-slate-500">Add, edit, import or export your guest list. Data is saved to local storage.</p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <input className="col-span-2 border rounded px-3 py-2" placeholder="Guest name" value={name} onChange={e => setName(e.target.value)} />
          <select className="border rounded px-3 py-2" value={type} onChange={e => setType(e.target.value as Guest['type'])}>
            <option>Adult</option>
            <option>Child</option>
          </select>
          <input className="border rounded px-3 py-2" placeholder="Group (optional)" value={group} onChange={e => setGroup(e.target.value)} />
          <textarea className="md:col-span-4 border rounded px-3 py-2 mt-2" placeholder="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} />
          <div className="md:col-span-4 flex items-center gap-2 mt-2">
            <button className="px-4 py-2 bg-amber-500 text-white rounded" onClick={addGuest}>Add Guest</button>
            <button className="px-3 py-2 bg-white border rounded" onClick={exportCSV}>Export CSV</button>
            <label className="px-3 py-2 bg-white border rounded cursor-pointer">
              Import CSV
              <input type="file" accept=".csv,text/csv" className="hidden" onChange={e => importCSV(e.target.files?.[0] ?? null)} />
            </label>
            <button className="ml-auto text-sm text-red-600" onClick={clearAll}>Clear all</button>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-4 shadow">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Guests ({summary.total})</h3>
          <div className="text-sm text-slate-500">Adults: {summary.adults} • Children: {summary.children} • Attending: {summary.attending} • Maybe: {summary.maybe}</div>
        </div>

        <div className="mt-4 space-y-2">
          {guests.length === 0 ? (
            <div className="text-sm text-slate-500">No guests yet. Add one above or import a CSV.</div>
          ) : (
            guests.map(g => (
              <div key={g.id} className="flex flex-col sm:flex-row sm:items-center sm:gap-4 border rounded p-3">
                <div className="flex-1">
                  <div className="font-medium">{g.name}</div>
                  <div className="text-xs text-slate-500">{g.group ? `Group: ${g.group}` : ''}</div>
                  {g.notes && <div className="text-xs text-slate-500 mt-1">{g.notes}</div>}
                </div>

                <div className="flex items-center gap-2 mt-3 sm:mt-0">
                  <select value={g.attending} onChange={e => updateGuest(g.id, { attending: e.target.value as Guest['attending'] })} className="border rounded px-2 py-1 text-sm">
                    <option>Unknown</option>
                    <option>Yes</option>
                    <option>Maybe</option>
                    <option>No</option>
                  </select>
                  <select value={g.type} onChange={e => updateGuest(g.id, { type: e.target.value as Guest['type'] })} className="border rounded px-2 py-1 text-sm">
                    <option>Adult</option>
                    <option>Child</option>
                  </select>
                  <button className="text-sm text-red-600" onClick={() => removeGuest(g.id)}>Remove</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
