import React, { useEffect, useMemo, useState } from 'react';

type Todo = {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
};

const STORAGE_KEY = 'partywings_todos';

function uid(prefix = 't') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
}

export default function TodoTool(): JSX.Element {
  const [items, setItems] = useState<Todo[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as Todo[];
    } catch {
      return [];
    }
  });

  const [text, setText] = useState('');
  const [filter, setFilter] = useState<'all'|'active'|'done'>('all');

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
  }, [items]);

  const stats = useMemo(() => ({ total: items.length, done: items.filter(i => i.done).length, active: items.filter(i => !i.done).length }), [items]);

  function add() {
    const t = text.trim(); if (!t) return; const n = { id: uid(), text: t, done: false, createdAt: Date.now() } as Todo; setItems(s => [n, ...s]); setText('');
  }

  function toggle(id: string) { setItems(s => s.map(i => i.id === id ? { ...i, done: !i.done } : i)); }
  function remove(id: string) { setItems(s => s.filter(i => i.id !== id)); }
  function clearDone() { setItems(s => s.filter(i => !i.done)); }

  function exportCSV() {
    const headers = ['id','text','done','createdAt'];
    const rows = items.map(it => headers.map(h => JSON.stringify((it as any)[h] ?? '')).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'todos.csv'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  function importCSV(file: File | null) {
    if (!file) return; const reader = new FileReader(); reader.onload = () => {
      const txt = String(reader.result || ''); const lines = txt.split(/\r?\n/).map(l => l.trim()).filter(Boolean); if (!lines.length) return;
      const headers = lines[0].split(',').map(h => h.replace(/(^"|"$)/g,'').trim()); const parsed: Todo[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(c => c.replace(/(^"|"$)/g,'').trim()); if (!cols.length) continue;
        const obj: any = {}; headers.forEach((h, idx) => obj[h] = cols[idx] ?? ''); parsed.push({ id: uid(), text: obj.text || obj.Text || 'Todo', done: obj.done === 'true' || obj.done === '1', createdAt: Number(obj.createdAt) || Date.now() });
      }
      if (parsed.length) setItems(s => [...parsed, ...s]);
    }; reader.readAsText(file);
  }

  const visible = items.filter(i => filter === 'all' ? true : (filter === 'done' ? i.done : !i.done));

  return (
    <div className="space-y-4">
      <div className="bg-white border rounded-lg p-4 shadow">
        <div className="flex gap-2">
          <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') add(); }} placeholder="Add a task" className="flex-1 border rounded px-3 py-2" />
          <button onClick={add} className="px-4 py-2 bg-amber-500 text-white rounded">Add</button>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="text-sm text-slate-500">Filter:</div>
          <button className={`px-2 py-1 rounded ${filter==='all'?'bg-slate-100':'bg-white'}`} onClick={() => setFilter('all')}>All</button>
          <button className={`px-2 py-1 rounded ${filter==='active'?'bg-slate-100':'bg-white'}`} onClick={() => setFilter('active')}>Active</button>
          <button className={`px-2 py-1 rounded ${filter==='done'?'bg-slate-100':'bg-white'}`} onClick={() => setFilter('done')}>Done</button>
          <div className="ml-auto text-sm text-slate-500">{stats.total} • Active: {stats.active} • Done: {stats.done}</div>
        </div>
        <div className="mt-3 flex gap-2">
          <button className="px-3 py-1 border rounded" onClick={exportCSV}>Export CSV</button>
          <label className="px-3 py-1 border rounded cursor-pointer">Import CSV<input type="file" accept=".csv,text/csv" className="hidden" onChange={e => importCSV(e.target.files?.[0] ?? null)} /></label>
          <button className="ml-auto text-sm text-red-600" onClick={clearDone}>Clear done</button>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-4 shadow">
        {visible.length === 0 ? <div className="text-sm text-slate-500">No tasks</div> : (
          <ul className="space-y-2">
            {visible.map(i => (
              <li key={i.id} className="flex items-center gap-3">
                <input type="checkbox" checked={i.done} onChange={() => toggle(i.id)} />
                <div className={`flex-1 ${i.done ? 'line-through text-slate-400' : ''}`}>{i.text}</div>
                <div className="text-xs text-slate-400">{new Date(i.createdAt).toLocaleString()}</div>
                <button className="text-sm text-red-600 ml-2" onClick={() => remove(i.id)}>Remove</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
