"use client";
import { useEffect, useRef, useState, useCallback } from "react";

import MarketSelector, { MARKETS } from "./MarketSelector";
import { fetchPrices } from "@/lib/api";

// Lazy-load ECharts to keep bundle small
let echartsPromise: Promise<any> | null = null;
function loadECharts() {
  if (!echartsPromise) {
    echartsPromise = import("echarts");
  }
  return echartsPromise;
}

const MARKET_COLORS = Object.fromEntries(MARKETS.map((m) => [m.key, m.color]));

const QUICK_RANGES = [
  { label: "1M", months: 1 },
  { label: "3M", months: 3 },
  { label: "6M", months: 6 },
  { label: "1Y", months: 12 },
  { label: "YTD", ytd: true },
  { label: "ALL", all: true },
];

function getRangeDate(opt: (typeof QUICK_RANGES)[number]): {
  start: string;
  end: string;
} {
  const today = new Date();
  const end = today.toISOString().slice(0, 10);
  if ((opt as any).all) return { start: "2021-01-01", end };
  if ((opt as any).ytd) {
    return { start: `${today.getFullYear()}-01-01`, end };
  }
  const d = new Date(today);
  d.setMonth(d.getMonth() - (opt as any).months);
  return { start: d.toISOString().slice(0, 10), end };
}

export default function PriceChart({
  item,
  unit,
}: {
  item: string;
  unit: string;
}) {
  const chartRef = useRef<HTMLDivElement>(null);
  const ecInstance = useRef<any>(null);

  const [rawData, setRawData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMarkets, setSelectedMarkets] = useState(
    MARKETS.map((m) => m.key)
  );
  const [activeRange, setActiveRange] = useState("ALL");
  const [groupBy, setGroupBy] = useState<"day" | "week" | "month">("day");
  const [startDate, setStartDate] = useState("2021-01-01");
  const [endDate, setEndDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Fetch data whenever params change
  useEffect(() => {
    if (!item) return;
    setLoading(true);
    setError(null);
    fetchPrices({ item, markets: selectedMarkets, startDate, endDate, groupBy })
      .then((res) => {
        if (!res) {
          setError("Could not reach the API — is the backend running?");
          setRawData(null);
        } else setRawData(res);
      })
      .catch((e: Error) => {
        setError(e.message);
        setRawData(null);
      })
      .finally(() => setLoading(false));
  }, [item, selectedMarkets, startDate, endDate, groupBy]);

  // Build / update ECharts
  useEffect(() => {
    if (!chartRef.current || loading || !rawData?.data?.length) return;

    loadECharts().then((echarts) => {
      if (!chartRef.current) return;

      if (!ecInstance.current) {
        ecInstance.current = echarts.init(chartRef.current, null, {
          renderer: "canvas",
        });
      }
      const chart = ecInstance.current;

      const labels = rawData.data.map((r: any) => {
        const d = r.date?.slice(0, 10);
        return groupBy === "month" ? d?.slice(0, 7) : d;
      });

      const unitLabel = unit?.replace("Rs./", "") || "kg";

      const series = selectedMarkets
        .filter((m) => MARKET_COLORS[m])
        .map((m) => {
          const color = MARKET_COLORS[m];
          const marketObj = MARKETS.find((mk) => mk.key === m);
          const label = isMobile
            ? marketObj?.shortLabel || m
            : marketObj?.label || m;
          const values = rawData.data.map((r: any) =>
            r[m] != null ? parseFloat(r[m]) : null
          );
          if (!values.some((v: any) => v !== null)) return null;
          return {
            name: label,
            type: "line",
            data: values,
            smooth: 0.35,
            symbol: groupBy === "day" ? "circle" : "emptyCircle",
            symbolSize: groupBy === "day" ? 4 : 6,
            lineStyle: { color, width: 2.5 },
            itemStyle: { color },
            areaStyle: { color: color + "18" },
            connectNulls: true,
          };
        })
        .filter(Boolean);

      const option = {
        backgroundColor: "transparent",
        animation: true,
        animationDuration: 400,
        grid: {
          top: 48,
          right: isMobile ? 8 : 24,
          bottom: 80,
          left: isMobile ? 56 : 64,
          containLabel: false,
        },
        tooltip: {
          trigger: "axis",
          backgroundColor: "#0f172a",
          borderColor: "#1e293b",
          borderWidth: 1,
          padding: [10, 14],
          textStyle: {
            color: "#f1f5f9",
            fontSize: 12,
            fontFamily: "'DM Mono', monospace",
          },
          axisPointer: {
            type: "cross",
            lineStyle: { color: "#94a3b8", width: 1, type: "dashed" },
            crossStyle: { color: "#94a3b8" },
          },
          formatter: (params: any[]) => {
            if (!params?.length) return "";
            const date = params[0].axisValue;
            let html = `<div style="font-size:11px;color:#94a3b8;margin-bottom:6px">${date}</div>`;
            params.forEach((p: any) => {
              if (p.value == null) return;
              html += `<div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">
                <span style="width:8px;height:8px;border-radius:50%;background:${p.color};display:inline-block;flex-shrink:0"></span>
                <span style="color:#94a3b8;font-size:11px">${p.seriesName}</span>
                <span style="margin-left:auto;font-weight:700;font-size:12px">Rs.&nbsp;${Number(p.value).toLocaleString()}<span style="color:#64748b;font-weight:400">/${unitLabel}</span></span>
              </div>`;
            });
            return html;
          },
        },
        legend: {
          top: 4,
          textStyle: { color: "#64748b", fontSize: isMobile ? 9 : 11 },
          itemWidth: 14,
          itemHeight: 8,
          icon: "roundRect",
        },
        xAxis: {
          type: "category",
          data: labels,
          boundaryGap: false,
          axisLine: { lineStyle: { color: "#e2e8f0" } },
          axisTick: { show: false },
          axisLabel: {
            color: "#94a3b8",
            fontSize: isMobile ? 9 : 10,
            interval: "auto",
          },
          splitLine: { show: false },
        },
        yAxis: {
          type: "value",
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            color: "#94a3b8",
            fontSize: isMobile ? 9 : 10,
            formatter: (v: number) =>
              isMobile ? `${v >= 1000 ? (v / 1000).toFixed(1) + "k" : v}` : `Rs.${v.toLocaleString()}`,
          },
          splitLine: { lineStyle: { color: "#f1f5f9", type: "dashed" } },
        },
        dataZoom: [
          {
            type: "inside",
            start: 0,
            end: 100,
            zoomOnMouseWheel: true,
            moveOnMouseMove: true,
          },
          {
            type: "slider",
            start: 0,
            end: 100,
            height: 20,
            bottom: 8,
            borderColor: "#e2e8f0",
            fillerColor: "rgba(59,130,246,0.08)",
            handleStyle: { color: "#3b82f6", borderColor: "#3b82f6" },
            moveHandleStyle: { color: "#3b82f6" },
            selectedDataBackground: {
              lineStyle: { color: "#3b82f6" },
              areaStyle: { color: "#3b82f620" },
            },
            textStyle: { color: "#94a3b8", fontSize: 9 },
            brushSelect: false,
          },
        ],
        series,
      };

      chart.setOption(option, { notMerge: true });
    });
  }, [rawData, selectedMarkets, groupBy, unit, loading, isMobile]);

  // Resize observer
  useEffect(() => {
    if (!chartRef.current) return;
    const ro = new ResizeObserver(() => ecInstance.current?.resize());
    ro.observe(chartRef.current);
    return () => ro.disconnect();
  }, []);

  // Destroy on unmount
  useEffect(
    () => () => {
      ecInstance.current?.dispose();
      ecInstance.current = null;
    },
    []
  );

  const applyRange = useCallback((r: (typeof QUICK_RANGES)[number]) => {
    setActiveRange(r.label);
    const { start, end } = getRangeDate(r);
    setStartDate(start);
    setEndDate(end);
    const months = (r as any).months;
    if ((r as any).all) setGroupBy("month");
    else if (months <= 3) setGroupBy("day");
    else if (months <= 12) setGroupBy("week");
    else setGroupBy("month");
  }, []);

  // Stat cards
  const statCards = (() => {
    if (!rawData?.data?.length) return [];
    return selectedMarkets
      .filter((m) => MARKET_COLORS[m])
      .map((m) => {
        const label = MARKETS.find((mk) => mk.key === m)?.label || m;
        const shortLabel = MARKETS.find((mk) => mk.key === m)?.shortLabel || m;
        const color = MARKET_COLORS[m];
        const vals = rawData.data
          .map((r: any) => (r[m] != null ? parseFloat(r[m]) : null))
          .filter((v: any) => v !== null) as number[];
        if (!vals.length) return null;
        const avg =
          vals.reduce((a: number, b: number) => a + b, 0) / vals.length;
        const latestIndex = rawData.data
          .map((r: any) => r[m])
          .map((v: any, i: number) => (v != null ? i : -1))
          .filter((i: number) => i !== -1)
          .pop();
        if (latestIndex === undefined) return null;
        const latest = vals[vals.length - 1];
        const latestDate = rawData.data[latestIndex]?.date?.slice(0, 10);
        const min = Math.min(...vals);
        const max = Math.max(...vals);
        const changePct = avg ? ((latest - avg) / avg) * 100 : null;
        return { label, shortLabel, color, avg, latest, min, max, changePct, latestDate };
      })
      .filter(Boolean) as any[];
  })();

  return (
    <div className="space-y-3 sm:space-y-4">

      {/* ── Controls card ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        {/* Top strip: Range + Group */}
        <div className="px-3 pt-3 pb-2 sm:px-4 sm:pt-4">

          {/* Range pills — horizontal scroll on mobile */}
          <div className="flex items-center gap-1.5 sm:gap-2 mb-3 overflow-x-auto no-scrollbar pb-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0 mr-0.5">
              Range
            </span>
            {QUICK_RANGES.map((r) => (
              <button
                key={r.label}
                onClick={() => applyRange(r)}
                className={`shrink-0 px-3 py-1.5 sm:py-1 rounded-full text-xs font-bold border-2 transition-all duration-150 touch-manipulation
                  ${
                    activeRange === r.label
                      ? "bg-blue-500 text-white border-blue-500 shadow-sm"
                      : "bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-500 active:bg-blue-50"
                  }`}
              >
                {r.label}
              </button>
            ))}

            {/* Divider — hidden on very small screens */}
            <div className="h-5 w-px bg-slate-200 mx-0.5 shrink-0 hidden xs:block" />

            {/* Group by pills */}
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0 ml-1 sm:ml-0 ps-5">
              Group By
            </span>
            {(["day", "week", "month"] as const).map((g) => (
              <button
                key={g}
                onClick={() => {
                  setGroupBy(g);
                  setActiveRange("");
                }}
                className={`shrink-0 px-3 py-1.5 sm:py-1 rounded-full text-xs font-bold border-2 transition-all duration-150 touch-manipulation
                  ${
                    groupBy === g
                      ? "bg-slate-700 text-white border-slate-700"
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-700 active:bg-slate-50"
                  }`}
              >
                {isMobile ? g.charAt(0).toUpperCase() : g.charAt(0).toUpperCase() + g.slice(1)}
              </button>
            ))}
          </div>

          {/* Date pickers — full-width row on mobile, right-aligned on desktop */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">
              From
            </span>
            <input
              type="date"
              value={startDate}
              max={endDate}
              onChange={(e) => {
                const newStart = e.target.value;
                if (newStart > endDate) setEndDate(newStart);
                setStartDate(newStart);
                setActiveRange("");
              }}
              className="flex-1 min-w-0 text-xs border border-slate-200 rounded-lg px-2.5 py-2 sm:py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all touch-manipulation"
            />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">
              To
            </span>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => {
                const newEnd = e.target.value;
                if (newEnd < startDate) return;
                setEndDate(newEnd);
                setActiveRange("");
              }}
              className="flex-1 min-w-0 text-xs border border-slate-200 rounded-lg px-2.5 py-2 sm:py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all touch-manipulation"
            />
          </div>
        </div>

        {/* Market selector — borderless top edge */}
        <div className="border-t border-slate-100 px-3 py-2.5 sm:px-4">
          <MarketSelector
            selected={selectedMarkets}
            onChange={setSelectedMarkets}
          />
        </div>
      </div>

      {/* ── Chart card ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3 sm:p-4">
        {loading && (
          <div className="flex flex-col items-center justify-center h-60 sm:h-72 gap-3">
            <div
              className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-blue-500"
              style={{ animation: "spin 0.8s linear infinite" }}
            />
            <span className="text-sm text-slate-400">Loading price data…</span>
          </div>
        )}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
            <span className="text-xl mt-0.5">⚠️</span>
            <div>
              <p className="font-semibold text-red-700 text-sm">API Error</p>
              <p className="text-red-500 text-xs mt-0.5 break-all">{error}</p>
            </div>
          </div>
        )}
        {!loading && !error && !rawData?.data?.length && (
          <div className="flex flex-col items-center justify-center h-60 sm:h-72 gap-2 text-center px-4">
            <span className="text-4xl">📭</span>
            <p className="font-semibold text-slate-600 mt-2">No data found</p>
            <p className="text-sm text-slate-400">
              Try a wider date range or different market selection
            </p>
          </div>
        )}

        {/* ECharts canvas */}
        <div
          ref={chartRef}
          style={{
            width: "100%",
            height: isMobile ? 300 : 380,
            display:
              loading || error || !rawData?.data?.length ? "none" : "block",
          }}
        />

        {!loading && rawData?.data?.length && (
          <p className="text-[10px] text-slate-400 text-center mt-2 leading-relaxed">
            {isMobile
              ? "Pinch to zoom · Drag to pan"
              : "Drag on chart to zoom · Scroll to zoom in/out · Use the slider to pan"}
          </p>
        )}
      </div>

      {/* ── Stat cards ── */}
      {statCards.length > 0 && (
        <>
          {/* Mobile: horizontal scrollable row */}
          <div className="sm:hidden flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
            {statCards.map((s: any) => (
              <div
                key={s.label}
                className="shrink-0 w-36 bg-white rounded-xl border border-slate-200 p-3 shadow-sm"
                style={{ borderLeftWidth: 3, borderLeftColor: s.color }}
              >
                <p className="text-[10px] font-bold text-slate-500 mb-1 truncate uppercase tracking-wide">
                  {s.shortLabel || s.label}
                </p>
                <p
                  className="text-lg font-extrabold text-slate-900 leading-none"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  Rs.{s.latest.toFixed(0)}
                </p>
                <p className="text-[10px] text-slate-400 mt-1.5">
                  {s.latestDate || "—"}
                </p>
                {s.changePct !== null && (
                  <p
                    className={`text-[10px] font-bold mt-0.5 ${
                      s.changePct >= 0 ? "text-emerald-500" : "text-red-500"
                    }`}
                  >
                    {s.changePct >= 0 ? "▲" : "▼"}{" "}
                    {Math.abs(s.changePct).toFixed(1)}% vs avg
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Desktop: grid */}
          <div className="hidden sm:grid grid-cols-3 lg:grid-cols-5 gap-3">
            {statCards.map((s: any) => (
              <div
                key={s.label}
                className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm"
                style={{ borderLeftWidth: 3, borderLeftColor: s.color }}
              >
                <p className="text-[11px] font-semibold text-slate-500 mb-1 truncate">
                  {s.label}
                </p>
                <p
                  className="text-base font-extrabold text-slate-900"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  Rs.{s.latest.toFixed(0)}
                </p>
                <p className="text-[11px] font-semibold mt-1 text-gray-400">
                  {s.latestDate || "No date"}
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Global style for hiding scrollbar */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}