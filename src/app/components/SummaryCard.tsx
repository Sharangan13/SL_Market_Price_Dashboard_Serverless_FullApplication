'use client';
import Link from 'next/link';
import ProductImage from './ProductImage';

const CATEGORY_CONFIG = {
  Vegetables: {
    gradient: 'from-emerald-50 to-teal-50',
    border: 'border-emerald-200',
    badge: 'bg-emerald-500 text-white',
    hover: 'hover:border-emerald-300 hover:shadow-emerald-100',
  },
  Fruits: {
    gradient: 'from-amber-50 to-orange-50',
    border: 'border-amber-200',
    badge: 'bg-amber-500 text-white',
    hover: 'hover:border-amber-300 hover:shadow-amber-100',
  },
  Other: {
    gradient: 'from-blue-50 to-indigo-50',
    border: 'border-blue-200',
    badge: 'bg-blue-500 text-white',
    hover: 'hover:border-blue-300 hover:shadow-blue-100',
  },
};

export default function SummaryCard({ row }: { row: any }) {
  const cfg = CATEGORY_CONFIG[row.category as keyof typeof CATEGORY_CONFIG] || CATEGORY_CONFIG.Other;
  const rt  = parseFloat(row.pettah_rt);
  const avg = parseFloat(row.avg_30d);
  const changePct = avg ? (((rt - avg) / avg) * 100) : null;
  const up = changePct !== null && changePct > 0;
  const unitLabel = row.unit?.replace('Rs./', '') || 'kg';

  return (
    <Link href={`/item/${encodeURIComponent(row.item)}`} className="block group">
      <div className={`
        relative bg-gradient-to-br ${cfg.gradient}
        border ${cfg.border} ${cfg.hover}
        rounded-2xl p-4 cursor-pointer
        transition-all duration-200 ease-out
        hover:shadow-lg hover:-translate-y-0.5
        animate-fade-up
      `}>
        {/* Product image */}
        <div className="flex items-start justify-between mb-3">
          <ProductImage
            item={row.item}
            category={row.category}
            size={48}
            className="shadow-sm ring-1 ring-black/5 flex-shrink-0"
          />
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badge} shrink-0 mt-0.5`}>
            {row.category}
          </span>
        </div>

        {/* Item name */}
        <p className="font-semibold text-slate-800 text-sm leading-tight mb-2">{row.item}</p>

        {/* Price */}
        <div className="mb-2">
          <div className="flex items-baseline gap-1">
            <span className="text-xs text-slate-400 font-medium">Rs.</span>
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: "'DM Mono', monospace" }}>
              {isNaN(rt) ? '—' : rt.toFixed(0)}
            </span>
            <span className="text-xs text-slate-400">/{unitLabel}</span>
          </div>
        </div>

        {/* Change badge */}
        {changePct !== null && !isNaN(changePct) && (
          <div className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full
            ${up ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
            <span>{up ? '↑' : '↓'}</span>
            <span>{Math.abs(changePct).toFixed(1)}% vs 30d avg</span>
          </div>
        )}

        {/* Date */}
        <div className="mt-2 text-[11px] text-slate-400">
          Pettah retail · {row.report_date?.slice(0, 10)}
        </div>

        {/* Hover arrow */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 text-xs">
          →
        </div>
      </div>
    </Link>
  );
}
