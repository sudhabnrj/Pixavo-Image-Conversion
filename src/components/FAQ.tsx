import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: 'Does Pixavo upload images?',
    answer: 'No. Your images are decoded and converted locally in your browser and never sent to a server.',
  },
  {
    question: 'Is Pixavo free?',
    answer: 'Yes. You can use the browser-based converter without an account, subscription, or installation.',
  },
  {
    question: 'Which RAW formats are supported?',
    answer: 'Pixavo supports common camera formats including CR2, CR3, NEF, ARW, RW2, RAF, ORF, PEF, DNG, and RAW. Support can vary by camera model and file variant.',
  },
  {
    question: 'Does conversion affect quality?',
    answer: 'JPEG is a compressed format, but Pixavo gives you direct control over output quality and dimensions so you can choose the right balance for your needs.',
  },
  {
    question: 'Can I convert multiple files?',
    answer: 'Yes. Add multiple images to the queue, convert them as a batch, and download successful results together as a ZIP file.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes. Processing stays on your device, so your photos are not stored in a database or exposed through a cloud upload.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl divide-y divide-slate-100 overflow-hidden rounded-3xl border border-slate-100 bg-white/80 shadow-sm backdrop-blur-md">
      {faqItems.map((item, index) => {
        const isOpen = openIndex === index;
        const panelId = `faq-panel-${index}`;
        const buttonId = `faq-button-${index}`;

        return (
          <div key={item.question}>
            <h3>
              <button
                id={buttonId}
                type="button"
                className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50/50 hover:text-slate-900 sm:px-6"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
                aria-controls={panelId}
              >
                {item.question}
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 ${
                    isOpen ? 'rotate-180 text-brand-violet' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={`grid transition-[grid-template-rows,opacity] duration-300 ${
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="min-h-0">
                <p className="px-5 pb-5 text-sm leading-6 text-slate-500 sm:px-6">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
