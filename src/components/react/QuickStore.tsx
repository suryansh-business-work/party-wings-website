import React, { useEffect, useState } from 'react';

type Product = {
  id: string;
  title: string;
  price: number;
  description?: string;
  image?: string;
  stock?: number;
};

type CartItem = {
  productId: string;
  qty: number;
};

const STORAGE_KEY = 'partywings_store_cart';

const PRODUCTS: Product[] = [
  { id: 'return-gifts', title: 'Return Gifts', price: 299, description: 'Curated return gift packs for guests.', image: '/assets/return-gifts.svg' },
  { id: 'flower-bouquet', title: 'Flower Bouquet', price: 899, description: 'Fresh seasonal bouquet, wrapped and ready.', image: '/assets/flower-bouquet.svg' },
  { id: 'entry-badges', title: 'Custom Entry Badges', price: 49, description: 'Personalised entry badges for attendees (per piece).', image: '/assets/entry-badges.svg' },
  { id: 'balloon-pack', title: 'Balloon Pack', price: 499, description: 'Colourful balloon decoration pack.', image: '/assets/balloon-pack.svg' },
];

function formatINR(n: number) {
  return `₹${n.toLocaleString('en-IN')}`;
}

export default function QuickStore() {
  const [products] = useState<Product[]>(PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) as CartItem[] : [];
    } catch {
      return [];
    }
  });

  const [checkout, setCheckout] = useState({ name: '', email: '', phone: '', address: '' });
  const [placing, setPlacing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {}
  }, [cart]);

  function addToCart(pid: string, qty = 1) {
    setCart(c => {
      const exists = c.find(i => i.productId === pid);
      if (exists) {
        return c.map(i => i.productId === pid ? { ...i, qty: i.qty + qty } : i);
      }
      return [...c, { productId: pid, qty }];
    });
  }

  function updateQty(pid: string, qty: number) {
    if (qty <= 0) {
      setCart(c => c.filter(i => i.productId !== pid));
    } else {
      setCart(c => c.map(i => i.productId === pid ? { ...i, qty } : i));
    }
  }

  function clearCart() {
    setCart([]);
  }

  const cartWithDetails = cart.map(ci => {
    const p = products.find(x => x.id === ci.productId)!;
    return { ...ci, product: p, lineTotal: p.price * ci.qty };
  });

  const subtotal = cartWithDetails.reduce((s, it) => s + it.lineTotal, 0);
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;

  function handleCheckoutSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!checkout.name || !checkout.email || !checkout.phone) {
      alert('Please enter name, email and phone to place the order.');
      return;
    }
    if (cart.length === 0) {
      alert('Your cart is empty. Add at least one item.');
      return;
    }

    setPlacing(true);
    // Simulate API call
    setTimeout(() => {
      const id = `PW-${Date.now()}`;
      setOrderId(id);
      clearCart();
      setPlacing(false);
    }, 900);
  }

  if (orderId) {
    return (
      <div className="p-4">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Order placed</h2>
          <p className="mt-4 text-gray-700">Thank you, {checkout.name || 'Customer'}. Your order <strong>{orderId}</strong> has been placed.</p>
          <p className="mt-4 text-gray-700">We will email you the confirmation at <strong>{checkout.email}</strong> and contact you on <strong>{checkout.phone}</strong>.</p>
          <div className="mt-6">
            <a href="/" className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-md">Back to home</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-bold mb-4">Shop — Quick Commerce</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map(p => (
              <div key={p.id} className="bg-white rounded-lg shadow p-4 flex flex-col">
                <div className="h-40 bg-gray-100 rounded-md mb-3 overflow-hidden flex items-center justify-center">
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.title}
                      className="object-cover h-full w-full"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/favicon.svg'; }}
                    />
                  ) : (
                    <img src="/favicon.svg" alt="placeholder" className="object-contain h-24 w-24 opacity-60" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{p.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{p.description}</p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-indigo-600 font-bold">{formatINR(p.price)}</div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => addToCart(p.id, 1)} className="bg-indigo-600 text-white px-3 py-1 rounded">Add</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

  <aside className="bg-white rounded-lg shadow p-4 lg:sticky lg:top-24">
          <h2 className="font-semibold">Your Cart</h2>
          {cartWithDetails.length === 0 ? (
            <p className="text-sm text-gray-500 mt-4">Cart is empty</p>
          ) : (
            <div className="space-y-3 mt-3">
              {cartWithDetails.map(i => (
                <div key={i.productId} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{i.product.title}</div>
                    <div className="text-sm text-gray-500">{formatINR(i.product.price)} x {i.qty} = {formatINR(i.lineTotal)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(i.productId, i.qty - 1)} className="px-2 py-1 border rounded">-</button>
                    <span className="w-6 text-center">{i.qty}</span>
                    <button onClick={() => updateQty(i.productId, i.qty + 1)} className="px-2 py-1 border rounded">+</button>
                  </div>
                </div>
              ))}

              <div className="border-t pt-3">
                <div className="flex justify-between text-sm text-gray-700"><span>Subtotal</span><span>{formatINR(subtotal)}</span></div>
                <div className="flex justify-between text-sm text-gray-700"><span>GST (18%)</span><span>{formatINR(gst)}</span></div>
                <div className="flex justify-between font-bold mt-2"><span>Total</span><span>{formatINR(total)}</span></div>
              </div>

              <div className="mt-3">
                <button onClick={clearCart} className="w-full border text-sm py-2 rounded">Clear cart</button>
              </div>
            </div>
          )}

          <form onSubmit={handleCheckoutSubmit} className="mt-4 space-y-3">
            <h3 className="font-medium">Checkout</h3>
            <input className="w-full border rounded px-3 py-2" placeholder="Name" value={checkout.name} onChange={e => setCheckout(s => ({ ...s, name: e.target.value }))} />
            <input className="w-full border rounded px-3 py-2" placeholder="Email" value={checkout.email} onChange={e => setCheckout(s => ({ ...s, email: e.target.value }))} />
            <input className="w-full border rounded px-3 py-2" placeholder="Phone" value={checkout.phone} onChange={e => setCheckout(s => ({ ...s, phone: e.target.value }))} />
            <textarea className="w-full border rounded px-3 py-2" placeholder="Address / Delivery notes" value={checkout.address} onChange={e => setCheckout(s => ({ ...s, address: e.target.value }))} />

            <div>
              <button type="submit" disabled={placing} className="w-full bg-indigo-600 text-white py-2 rounded">{placing ? 'Placing...' : `Place order — ${formatINR(total)}`}</button>
            </div>
          </form>
        </aside>
      </div>
    </div>
  );
}
