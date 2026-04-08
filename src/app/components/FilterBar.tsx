'use client';

const currentYear = new Date().getFullYear();
// +1 to include the current year itself
const YEARS = Array.from({ length: currentYear - 2020 }, (_, i) => 2021 + i);

const MONTHS = [
  { v: '01', l: 'Jan' }, { v: '02', l: 'Feb' }, { v: '03', l: 'Mar' },
  { v: '04', l: 'Apr' }, { v: '05', l: 'May' }, { v: '06', l: 'Jun' },
  { v: '07', l: 'Jul' }, { v: '08', l: 'Aug' }, { v: '09', l: 'Sep' },
  { v: '10', l: 'Oct' }, { v: '11', l: 'Nov' }, { v: '12', l: 'Dec' },
];

type Filters = { startDate: string; endDate: string; groupBy: string };

export default function FilterBar({ filters, onChange }: {
  filters: Filters;
  onChange: (f: Filters) => void;
}) {
  const selYear  = filters.startDate?.slice(0, 4) || '';
  const selMonth = filters.startDate?.slice(5, 7) || '';
  // isMonthView = user drilled into a specific month (groupBy=day + a month is selected)
  const isMonthView = filters.groupBy === 'day' && selMonth.length === 2;

  const selectAll = () => onChange({
    ...filters, startDate: '2021-01-01',
    endDate: new Date().toISOString().slice(0, 10), groupBy: 'month',
  });

  const selectYear = (y: string) => onChange({
    ...filters, startDate: `${y}-01-01`,
    endDate: y === String(currentYear) ? new Date().toISOString().slice(0, 10) : `${y}-12-31`,
    groupBy: 'month',
  });

  const selectMonth = (m: string) => {
    if (!selYear) return;
    const last = new Date(parseInt(selYear), parseInt(m), 0).getDate();
    onChange({ ...filters, startDate: `${selYear}-${m}-01`, endDate: `${selYear}-${m}-${last}`, groupBy: 'day' });
  };

  const isAllActive   = filters.startDate === '2021-01-01' && filters.groupBy === 'month';
  // A year pill is active when that year is selected but no specific month is drilled into
  const isYearActive  = (y: string) => selYear === y && !isMonthView;
  const isMonthActive = (m: string) => isMonthView && selMonth === m;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 space-y-3 shadow-sm">

      {/* Year row */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Year</p>
        <div className="flex flex-wrap gap-1.5">
          <Pill active={isAllActive} color="slate" onClick={selectAll}>All</Pill>
          {YEARS.map(y => (
            <Pill key={y} active={isYearActive(String(y))} color="blue" onClick={() => selectYear(String(y))}>
              {y}
            </Pill>
          ))}
        </div>
      </div>

      {/* Month row */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Month {selYear ? <span className="text-slate-300 font-normal normal-case">— {selYear}</span> : ''}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {MONTHS.map(m => (
            <Pill key={m.v} active={isMonthActive(m.v)} color="emerald" onClick={() => selectMonth(m.v)}
              disabled={!selYear}>
              {m.l}
            </Pill>
          ))}
        </div>
      </div>

      {/* Custom range + groupBy */}
      <div className="flex flex-wrap gap-3 items-end pt-1 border-t border-slate-100">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400 font-medium">From</label>
          <input type="date" value={filters.startDate}
            onChange={e => onChange({ ...filters, startDate: e.target.value })}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400 font-medium">To</label>
          <input type="date" value={filters.endDate}
            onChange={e => onChange({ ...filters, endDate: e.target.value })}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400 font-medium">Group by</label>
          <select value={filters.groupBy} onChange={e => onChange({ ...filters, groupBy: e.target.value })}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all">
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function Pill({ active, color, onClick, disabled = false, children }: {
  active: boolean; color: string; onClick: () => void; disabled?: boolean; children: React.ReactNode;
}) {
  const colors: Record<string, string> = {
    slate:   'bg-slate-700 text-white border-slate-700',
    blue:    'bg-blue-500 text-white border-blue-500',
    emerald: 'bg-emerald-500 text-white border-emerald-500',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-2.5 py-1 rounded-full text-xs font-semibold border transition-all duration-150
        ${active ? colors[color] : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {children}
    </button>
  );
}
