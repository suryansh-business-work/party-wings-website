import React, { useEffect, useMemo, useState } from "react";

type AddedItem = {
  id: string;
  key: string; // service key
  label: string;
  data: Record<string, any>;
};

const SERVICES = [
  {
    key: "balloon",
    label: "Balloon Decoration",
    description: "Balloons, arches and decorative setups.",
    icon: "fas fa-gift",
  },
  {
    key: "mehandi",
    label: "Mehandi",
    description: "Mehandi artist charges per person.",
    icon: "fas fa-palette",
  },
  {
    key: "catering",
    label: "Catering",
    description: "Per person catering pricing.",
    icon: "fas fa-utensils",
  },
  {
    key: "photography",
    label: "Photography",
    description: "Photographer hourly rates.",
    icon: "fas fa-camera",
  },
  {
    key: "cake",
    label: "Cake Ordering",
    description: "Cakes by size and flavor.",
    icon: "fas fa-birthday-cake",
  },
  {
    key: "makeup",
    label: "Makeup",
    description: "Makeup artist per person.",
    icon: "fas fa-magic",
  },
];

const STORAGE_KEY = "partywings_price_calc_items";

function uid(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export default function PriceCalculator() {
  const [items, setItems] = useState<AddedItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as AddedItem[];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      // ignore
    }
  }, [items]);

  function addService(key: string) {
    const def = SERVICES.find((s) => s.key === key)!;
    // default data per service
    let data: Record<string, any> = {};
    switch (key) {
      case "balloon":
        data = { qty: 100, unitPrice: 15, minUnit: 5, maxUnit: 30 };
        break;
      case "mehandi":
        data = { persons: 20, perPerson: 500, minPer: 200, maxPer: 2000 };
        break;
      case "catering":
        data = { persons: 50, perPerson: 450, minPer: 150, maxPer: 2000 };
        break;
      case "photography":
        data = { hours: 4, rate: 2500, minRate: 500, maxRate: 10000 };
        break;
      case "cake":
        data = { size: "medium", options: { small: 1200, medium: 2200, large: 3500 } };
        break;
      case "makeup":
        data = { persons: 1, perPerson: 1200, minPer: 500, maxPer: 5000 };
        break;
      default:
        data = {};
    }

    setItems((s) => [...s, { id: uid("item"), key: def.key, label: def.label, data }]);
  }

  function updateItem(id: string, newData: Record<string, any>) {
    setItems((list) => list.map((it) => (it.id === id ? { ...it, data: { ...it.data, ...newData } } : it)));
  }

  function removeItem(id: string) {
    setItems((list) => list.filter((it) => it.id !== id));
  }

  function computeTotal(item: AddedItem) {
    const d = item.data;
    switch (item.key) {
      case "balloon": {
        const qty = Number(d.qty || 0);
        let price = Number(d.unitPrice || 0);
        const min = Number(d.minUnit || 0);
        const max = Number(d.maxUnit || 9999999);
        if (price < min) price = min;
        if (price > max) price = max;
        return qty * price;
      }
      case "mehandi": {
        const persons = Number(d.persons || 0);
        let per = Number(d.perPerson || 0);
        per = Math.max(Number(d.minPer || 0), Math.min(Number(d.maxPer || per), per));
        return persons * per;
      }
      case "catering": {
        const persons = Number(d.persons || 0);
        let per = Number(d.perPerson || 0);
        per = Math.max(Number(d.minPer || 0), Math.min(Number(d.maxPer || per), per));
        return persons * per;
      }
      case "photography": {
        const hours = Number(d.hours || 0);
        let rate = Number(d.rate || 0);
        rate = Math.max(Number(d.minRate || 0), Math.min(Number(d.maxRate || rate), rate));
        return hours * rate;
      }
      case "cake": {
        const size = d.size || "medium";
        const price = Number(d.options?.[size] ?? 0);
        return price;
      }
      case "makeup": {
        const persons = Number(d.persons || 0);
        let per = Number(d.perPerson || 0);
        per = Math.max(Number(d.minPer || 0), Math.min(Number(d.maxPer || per), per));
        return persons * per;
      }
      default:
        return 0;
    }
  }

  const grandTotal = useMemo(() => items.reduce((acc, it) => acc + computeTotal(it), 0), [items]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <aside className="md:col-span-1">
        <div className="bg-white border rounded p-4 shadow-sm">
          <h3 className="font-semibold mb-3">Available Calculators</h3>
          <ul className="space-y-3">
            {SERVICES.map((s) => (
              <li key={s.key} className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {s.icon && <i className={`${s.icon} text-amber-400 w-6 h-6`} aria-hidden="true" />}
                  <div>
                    <div className="font-medium">{s.label}</div>
                    <div className="text-xs text-slate-500">{s.description}</div>
                  </div>
                </div>
                <div>
                  <button className="text-sm px-3 py-1 bg-amber-500 text-white rounded" onClick={() => addService(s.key)}>
                    Add
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 bg-white border rounded p-4 shadow-sm">
          <h4 className="font-semibold">Estimate</h4>
          <div className="mt-2 text-xl font-bold text-slate-800">₹{grandTotal.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-1">This is an estimated total. Final price may vary.</div>
        </div>
      </aside>

      <section className="md:col-span-2">
        <div className="bg-white border rounded p-4 shadow-sm">
          <h3 className="font-semibold mb-3">Selected Services</h3>

          {items.length === 0 ? (
            <div className="text-sm text-slate-500">No services added — click Add to begin.</div>
          ) : (
            <div className="space-y-4">
              {items.map((it) => (
                <div key={it.id} className="border rounded p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">{it.label}</div>
                      <div className="text-xs text-slate-500">ID: {it.id}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">₹{computeTotal(it).toLocaleString()}</div>
                      <button className="mt-2 text-xs text-red-600" onClick={() => removeItem(it.id)}>Remove</button>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {it.key === "balloon" && (
                      <>
                        <label className="text-sm">Number of balloons
                          <input type="number" value={it.data.qty} min={0} className="w-full mt-1 border rounded px-2 py-1"
                            onChange={(e) => updateItem(it.id, { qty: Number(e.target.value) })} />
                        </label>
                        <label className="text-sm">Price per balloon (₹)
                          <input type="number" value={it.data.unitPrice} min={it.data.minUnit} max={it.data.maxUnit} className="w-full mt-1 border rounded px-2 py-1"
                            onChange={(e) => updateItem(it.id, { unitPrice: Number(e.target.value) })} />
                        </label>
                      </>
                    )}

                    {it.key === "mehandi" && (
                      <>
                        <label className="text-sm">People
                          <input type="number" value={it.data.persons} min={0} className="w-full mt-1 border rounded px-2 py-1"
                            onChange={(e) => updateItem(it.id, { persons: Number(e.target.value) })} />
                        </label>
                        <label className="text-sm">Per person (₹)
                          <input type="number" value={it.data.perPerson} min={it.data.minPer} max={it.data.maxPer} className="w-full mt-1 border rounded px-2 py-1"
                            onChange={(e) => updateItem(it.id, { perPerson: Number(e.target.value) })} />
                        </label>
                      </>
                    )}

                    {it.key === "catering" && (
                      <>
                        <label className="text-sm">Guests
                          <input type="number" value={it.data.persons} min={0} className="w-full mt-1 border rounded px-2 py-1"
                            onChange={(e) => updateItem(it.id, { persons: Number(e.target.value) })} />
                        </label>
                        <label className="text-sm">Per person (₹)
                          <input type="number" value={it.data.perPerson} min={it.data.minPer} max={it.data.maxPer} className="w-full mt-1 border rounded px-2 py-1"
                            onChange={(e) => updateItem(it.id, { perPerson: Number(e.target.value) })} />
                        </label>
                      </>
                    )}

                    {it.key === "photography" && (
                      <>
                        <label className="text-sm">Hours
                          <input type="number" value={it.data.hours} min={1} className="w-full mt-1 border rounded px-2 py-1"
                            onChange={(e) => updateItem(it.id, { hours: Number(e.target.value) })} />
                        </label>
                        <label className="text-sm">Rate per hour (₹)
                          <input type="number" value={it.data.rate} min={it.data.minRate} max={it.data.maxRate} className="w-full mt-1 border rounded px-2 py-1"
                            onChange={(e) => updateItem(it.id, { rate: Number(e.target.value) })} />
                        </label>
                      </>
                    )}

                    {it.key === "cake" && (
                      <>
                        <label className="text-sm">Size
                          <select value={it.data.size} className="w-full mt-1 border rounded px-2 py-1" onChange={(e) => updateItem(it.id, { size: e.target.value })}>
                            {Object.keys(it.data.options || {}).map((k) => (
                              <option key={k} value={k}>{k} — ₹{it.data.options[k]}</option>
                            ))}
                          </select>
                        </label>
                        <div />
                      </>
                    )}

                    {it.key === "makeup" && (
                      <>
                        <label className="text-sm">People
                          <input type="number" value={it.data.persons} min={0} className="w-full mt-1 border rounded px-2 py-1"
                            onChange={(e) => updateItem(it.id, { persons: Number(e.target.value) })} />
                        </label>
                        <label className="text-sm">Per person (₹)
                          <input type="number" value={it.data.perPerson} min={it.data.minPer} max={it.data.maxPer} className="w-full mt-1 border rounded px-2 py-1"
                            onChange={(e) => updateItem(it.id, { perPerson: Number(e.target.value) })} />
                        </label>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
