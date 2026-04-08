'use client';
import { useEffect, useState } from 'react';
import { fetchSummary, fetchCategories } from '@/lib/api';
import SummaryCard from '@/app/components/SummaryCard';
import { Search } from 'lucide-react';


type Row = { item: string; category: string; [key: string]: unknown };

const CATEGORY_CONFIG = {
  Vegetables: { icon: '🥦', active: 'bg-emerald-500 text-white border-emerald-500', inactive: 'bg-white text-emerald-600 border-emerald-200 hover:border-emerald-300' },
  Fruits:     { icon: '🍎', active: 'bg-amber-500 text-white border-amber-500',   inactive: 'bg-white text-amber-600 border-amber-200 hover:border-amber-300' },
  Other:      { icon: '🛒', active: 'bg-blue-500 text-white border-blue-500',     inactive: 'bg-white text-blue-600 border-blue-200 hover:border-blue-300' },
};

export default function HomePage() {
  const [rows, setRows]             = useState<Row[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActive] = useState('');
  const [search, setSearch]         = useState('');
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    fetchCategories()
      .then(d => setCategories(Array.isArray(d) ? d : []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchSummary(activeCategory)
      .then(d => setRows(Array.isArray(d) ? (d as Row[]) : []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [activeCategory]);

  const filtered = rows.filter(r =>
    r.item.toLowerCase().includes(search.toLowerCase())
  ).reverse();

  return (
    <div className="min-h-screen" style={{ background: '#f0f4ff' }}>

      {/* Hero header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">🇱🇰</span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Lanka Market Prices
                </h1>
              </div>
              <p className="text-sm text-slate-500">
                CBSL daily price report · Tap any item to explore historical trends
              </p>
            </div>
            {/* Live indicator */}
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5 self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-700">Live data</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">

        {/* Filter bar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Category pills */}
            <div className="flex flex-wrap gap-2 flex-1">
              <button
                onClick={() => setActive('')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all duration-150
                  ${!activeCategory ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
              >
                All items
              </button>
              {categories.map(cat => {
                const cfg = CATEGORY_CONFIG[cat as keyof typeof CATEGORY_CONFIG];
                return (
                  <button key={cat}
                    onClick={() => setActive(cat)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all duration-150
                      ${activeCategory === cat ? cfg?.active : cfg?.inactive}`}
                  >
                    <span>{cfg?.icon}</span>
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div className="relative sm:w-52">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-sm">    <Search size={20}/></span>
              <input
                placeholder="Search item…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-4 py-2 text-sm border-2 border-slate-200 rounded-xl bg-slate-50
                  focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400
                  transition-all placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-xs text-slate-400 mb-4 font-medium">
            {filtered.length} item{filtered.length !== 1 ? 's' : ''} shown
            {activeCategory ? ` · ${activeCategory}` : ''}
            {search ? ` · "${search}"` : ''}
          </p>
        )}

        {/* Skeleton loader */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="rounded-2xl p-4 h-32 skeleton" />
            ))}
          </div>
        )}

        {/* Cards grid */}
        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filtered.map((row, i) => (
              <div key={row.item} style={{ animationDelay: `${i * 30}ms` }}>
                <SummaryCard row={row} />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <span className="text-5xl">    <Search /></span>
            <p className="font-semibold text-slate-600">No items found</p>
            <p className="text-sm text-slate-400">Try a different search or category</p>
            <button onClick={() => { setSearch(''); setActive(''); }}
              className="mt-2 text-sm text-blue-500 underline underline-offset-2 hover:text-blue-700 transition-colors">
              Clear filters
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-400">
            Data sourced from Central Bank of Sri Lanka (CBSL) daily price reports
          </p>
        </div>
      </div>
    </div>
  );
}
