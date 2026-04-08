'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchItemMeta, fetchItemSummary } from '@/lib/api';
import PriceChart from '@/app/components/PriceChart';
import ProductImage from '@/app/components/ProductImage';
import { ArrowLeft } from 'lucide-react';
import { MARKETS } from '@/app/components/MarketSelector';

const CATEGORY_CONFIG = {
  Vegetables: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  Fruits:     { color: 'bg-amber-100 text-amber-700 border-amber-200',       dot: 'bg-amber-500'   },
  Other:      { color: 'bg-blue-100 text-blue-700 border-blue-200',          dot: 'bg-blue-500'    },
};

export default function ItemPage() {
  const { name } = useParams();
  const item = decodeURIComponent(name as string);

  const [meta, setMeta] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchItemMeta(item), fetchItemSummary(item)])
      .then(([m, s]) => {
        setMeta(m);
        setSummary(s);
      })
      .finally(() => setLoading(false));
  }, [item]);

  const cfg = meta ? CATEGORY_CONFIG[meta.category as keyof typeof CATEGORY_CONFIG] : null;
  const unitLabel = (meta?.unit || 'Rs./kg').replace('Rs./', '');

  // ✅ Build latest market prices dynamically with 30-day avg and deviation
  const latestPrices = MARKETS.map(m => {
    const value = summary?.[m.key];
    const avg30 = summary?.[`${m.key}_avg_30d`];

    if (value == null || avg30 == null) return null;

    const price = parseFloat(value);
    const avg = parseFloat(avg30);
    const diff = price - avg;
    const pct = avg ? (diff / avg) * 100 : 0;

    return {
      key: m.key,
      label: m.label,
      color: m.color,
      price,
      avg,
      diff,
      pct
    };
  }).filter(Boolean) as any[];

  return (
    <div className="min-h-screen" style={{ background: '#f0f4ff' }}>
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          {/* BACK BUTTON */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-blue-500 pt-8 hover:text-blue-700 font-medium transition-colors mb-3 group"
          >
            <span className="group-hover:-translate-x-0.5 transition-transform">
              <ArrowLeft />
            </span>
            Back to dashboard
          </Link>

          {/* HEADER CONTENT */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* LEFT: IMAGE + TITLE */}
            <div className="flex items-center gap-4">
              <ProductImage
                item={item}
                category={meta?.category || 'Other'}
                size={72}
                className="shadow-md ring-1 ring-black/5 flex-shrink-0"
              />
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {item}
                </h1>
                {!loading && meta && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg?.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg?.dot}`} />
                      {meta.category}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-400 font-medium">{meta.unit}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

   
{/* MARKET PRICE CARDS */}
{!loading && latestPrices.length > 0 && (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-4">
    {latestPrices.map((m) => (
      <div
        key={m.key}
        className="bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-sm"
        style={{ borderLeft: `3px solid ${m.color}` }}
      >
        <p className="text-xs text-slate-400 font-medium">{m.label}</p>

        {/* Current Price */}
        <p className="text-lg font-extrabold text-slate-900" style={{ fontFamily: "'DM Mono', monospace" }}>
          Rs. {m.price.toFixed(0)}
          <span className="text-xs text-slate-400 ml-1">/{unitLabel}</span>
        </p>

        {/* Explicit 30 Day Average */}
        <p className="text-[110px] text-slate-400 mt-1">
          Last 30 Days Avg: Rs. {m.avg.toFixed(0)}
        </p>

        {/* Deviation */}
        <p className={`text-[11px] font-semibold mt-1 ${m.diff > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
          {m.diff > 0 ? '↑' : '↓'} {Math.abs(m.pct).toFixed(1)}% 
          <span className="text-[10px] ml-1">(Rs. {Math.abs(m.diff).toFixed(0)})</span>
        </p>

        {/* Date */}
        {summary?.report_date && (
          <p className="text-[10px] text-slate-300 mt-1">{summary.report_date.slice(0, 10)}</p>
        )}
      </div>
    ))}
  </div>
)}
        </div>
      </div>

      {/* CHART */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <PriceChart item={item} unit={meta?.unit || 'Rs./kg'} />

        {/* FOOTER */}
        <div className="mt-8 pt-4 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-400">
            Data sourced from Central Bank of Sri Lanka (CBSL) · Prices are market wholesale/retail
          </p>
        </div>
      </div>
    </div>
  );
}