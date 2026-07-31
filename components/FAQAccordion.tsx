'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

type FAQItem = {
  question: string;
  answer: string;
};

export default function FAQAccordion({ items }: { items: readonly FAQItem[] }) {
  const [openKey, setOpenKey] = useState(items[0]?.question ?? '');

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const isOpen = openKey === item.question;

        return (
          <div
            key={item.question}
            className="rounded-[24px] border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 backdrop-blur"
          >
            <button
              type="button"
              onClick={() =>
                setOpenKey((current) => (current === item.question ? '' : item.question))
              }
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              aria-expanded={isOpen}
            >
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">{item.question}</h3>
              <ChevronDown
                className={`h-5 w-5 flex-none text-cyan-600 dark:text-cyan-300 transition-transform ${
                  isOpen ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
              />
            </button>
            {isOpen ? (
              <div className="border-t border-slate-200 dark:border-white/10 px-6 pb-6 pt-4">
                <p className="text-slate-600 dark:text-slate-300">{item.answer}</p>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
