import React from 'react';
import QuoteProvider from './QuoteProvider';
import ServiceCard from './ServiceCard';
import QuoteForm from './QuoteForm';
import QuoteClient from './QuoteClient';

export default function App({ services }: { services: any[] }) {
  return (
    <QuoteProvider>
      <QuoteClient />
      <section className="text-center py-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-amber-600">Welcome to Party Wings</h1>
        <p className="mt-3 max-w-2xl mx-auto text-slate-700 dark:text-slate-300">Full-service party and event management: decoration, catering, planning, photography and more. Select your city and add services to a quote — then submit a request.</p>
      </section>

      <section id="services" className="max-w-[1200px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-5">
        {services.map((s) => (
          <ServiceCard key={s.id} service={s} />
        ))}
      </section>
    </QuoteProvider>
  );
}
