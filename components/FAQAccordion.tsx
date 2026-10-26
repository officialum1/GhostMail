// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

type FAQItem = {
  question: string
  answer: string
}

export default function FAQAccordion({ items }: { items: readonly FAQItem[] }) {
  const [openKey, setOpenKey] = useState(items[0]?.question ?? '')

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isOpen = openKey === item.question

        return (
          <div
            key={item.question}
            className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0c1017]/70 backdrop-blur transition-all"
          >
            <button
              type="button"
              onClick={() =>
                setOpenKey((current) => (current === item.question ? '' : item.question))
              }
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              aria-expanded={isOpen}
            >
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">{item.question}</h3>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-cyan-600 dark:text-cyan-400 transition-transform duration-200 ${
                  isOpen ? 'rotate-180 text-cyan-500' : ''
                }`}
                aria-hidden="true"
              />
            </button>
            {isOpen && (
              <div className="border-t border-slate-200/60 dark:border-white/5 px-5 pb-5 pt-3">
                <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">{item.answer}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
