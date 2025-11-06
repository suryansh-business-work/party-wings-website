import React from 'react';
import type { Service } from './QuoteProvider';
import { useQuote } from './QuoteProvider';

export default function ServiceCard({ service }: { service: Service }) {
  const { add } = useQuote();
  return (
    <article className="card-shadow rounded-lg overflow-hidden bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:transform hover:-translate-y-1 transition-transform duration-200">
      {service?.image ? (
        <div className="h-40 md:h-44 w-full bg-gray-100 dark:bg-slate-700">
          <img src={service.image} alt={service.title || 'Service image'} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="h-40 md:h-44 w-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-slate-500">No image</div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">{service?.title ?? 'Untitled Service'}</h3>
            {service?.category ? <div className="text-xs text-amber-600 font-medium mt-1">{service.category}</div> : null}
            {service?.description ? <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{service.description}</p> : null}
          </div>
        </div>
        <div>
          {service?.price ? <div className="text-sm text-amber-600 font-bold">{service.price}</div> : null}
          <button onClick={() => add(service)} disabled={!service?.id} className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-500 text-white text-sm hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed">Add to package</button>
        </div>
      </div>
    </article>
  );
}
