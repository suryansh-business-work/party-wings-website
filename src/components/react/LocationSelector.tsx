import React, { useEffect, useState } from 'react';

const STORAGE_KEY = 'partywings_city';

export default function LocationSelector() {
  const [open, setOpen] = useState(false);
  const [city, setCity] = useState('');

  useEffect(() => {
    const existing = localStorage.getItem(STORAGE_KEY) || '';
    if (existing) setCity(existing);
    else {
      // default to first non-empty option if present
      const defaultCity = 'Ghaziabad - Raj Nagar Extention';
      setCity(defaultCity);
    }
  }, []);

  function save(selected: string) {
    try { localStorage.setItem(STORAGE_KEY, selected); } catch (e) { }
    setCity(selected);
    setOpen(false);
    window.dispatchEvent(new CustomEvent('locationChanged', { detail: selected }));
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="px-3 py-2 min-w-[200px] text-left rounded-md text-sm bg-transparent border-none text-white text-slate-700 border border-slate-200">
        {city || 'Select City'}
      </button>
      {open ? (
        <div className="absolute right-0 mt-2 w-64 bg-white  border rounded-md p-3 shadow-lg z-30">
          <label className="block text-xs font-semibold">Choose your city</label>
          <select defaultValue={city} className="mt-2 block w-full text-black rounded-md border px-2 py-2 text-sm width-[240px]" onChange={(e) => setCity(e.currentTarget.value)}>
            <option value="">-- Select city --</option>
            <option value="Ghaziabad - Raj Nagar Extention">Ghaziabad - Raj Nagar Extention</option>
          </select>
          <div className="mt-3 flex justify-end">
            <button className="px-3 py-1 bg-amber-500 text-white rounded-md text-sm" onClick={() => save(city)}>Save</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
