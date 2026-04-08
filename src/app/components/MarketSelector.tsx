'use client';

export const MARKETS = [
  { key: 'pettah_ws',      label: 'Pettah Wholesale',       shortLabel: 'P.WS',  color: '#3b82f6', tw: 'blue'    },
  { key: 'dambulla_ws',    label: 'Dambulla Wholesale',      shortLabel: 'D.WS',  color: '#10b981', tw: 'emerald' },
  { key: 'pettah_rt',      label: 'Pettah Retail',    shortLabel: 'P.RT',  color: '#f59e0b', tw: 'amber'   },
  { key: 'dambulla_rt',    label: 'Dambulla Retail',  shortLabel: 'D.RT',  color: '#ef4444', tw: 'red'     },
  { key: 'narahenpita_rt', label: 'Narahenpita Retail',   shortLabel: 'N.RT',  color: '#8b5cf6', tw: 'violet'  },
];

export default function MarketSelector({ selected, onChange }: {
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (key: string) => {
    const next = selected.includes(key)
      ? selected.filter(k => k !== key)
      : [...selected, key];
    if (next.length > 0) onChange(next);
  };

  const allSelected = selected.length === MARKETS.length;
  const toggleAll = () => onChange(allSelected ? [MARKETS[0].key] : MARKETS.map(m => m.key));

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Markets</span>
        <button
          onClick={toggleAll}
          className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2 transition-colors"
        >
          {allSelected ? 'Deselect all' : 'Select all'}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {MARKETS.map(m => {
          const active = selected.includes(m.key);
          return (
            <button
              key={m.key}
              onClick={() => toggle(m.key)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
                border-2 transition-all duration-150
                ${active ? 'text-white shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}
              `}
              style={active ? { background: m.color, borderColor: m.color } : {}}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: active ? 'rgba(255,255,255,0.7)' : m.color }}
              />
              <span className="hidden sm:inline">{m.label}</span>
              <span className="sm:hidden">{m.shortLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
