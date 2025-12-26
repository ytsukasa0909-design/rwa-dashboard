"use client";

import React, { useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Chart.js の初期設定
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function RWADashboard() {
  // 1. 投資パラメータの状態管理 (State)
  const [principal, setPrincipal] = useState(10000);
  const [yieldRate, setYieldRate] = useState(15);
  const [months, setMonths] = useState(24);

  // 2. 金融計算ロジック (Duration & Convexity)
  // パラメータが変わった時だけ再計算する (useMemo)
  const metrics = useMemo(() => {
    const r = yieldRate / 100 / 12; // 月利
    const n = months;
    const currentR = yieldRate / 100 / 12;

    // 毎月の元利均等返済額 (C)
    const C = (principal * currentR) / (1 - Math.pow(1 + currentR, -n));

    let price = 0;
    let durationSum = 0;
    let convexitySum = 0;

    for (let t = 1; t <= n; t++) {
      const pv = C / Math.pow(1 + r, t); // 現在価値
      price += pv;
      durationSum += t * pv;
      convexitySum += pv * (t * t + t);
    }

    const macDurYears = (durationSum / price) / 12; // 年単位
    const convexity = convexitySum / (price * Math.pow(1 + r, 2) * 144); // 年単位

    return { macDurYears, convexity, price };
  }, [principal, yieldRate, months]);

  // 3. グラフ用の感応度分析データ
  const chartData = {
    labels: [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map(v => `${yieldRate + v}%`),
    datasets: [{
      label: '債権価値の変動感応度',
      data: [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map(v => {
        const testR = (yieldRate + v) / 100 / 12;
        const testC = (principal * (yieldRate/100/12)) / (1 - Math.pow(1 + (yieldRate/100/12), -months));
        let p = 0;
        for (let t = 1; t <= months; t++) p += testC / Math.pow(1 + testR, t);
        return p;
      }),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#1d4ed8'
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => `価値: $${Math.round(context.raw).toLocaleString()}`
        }
      }
    },
    scales: {
      y: {
        grid: { color: '#f3f4f6' },
        ticks: { callback: (val: any) => '$' + val.toLocaleString() }
      },
      x: { grid: { display: false } }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-12 text-slate-900">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between border-b pb-6">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              Global RWA <span className="text-blue-600">Risk Engine</span>
            </h1>
            <p className="mt-2 text-slate-500 font-medium">Radical Transparency: Real-time Yield Analytics</p>
          </div>
          <div className="mt-4 md:mt-0 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-bold border border-blue-100">
            Status: Live on Local
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左側：操作パネル */}
          <section className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
            <h2 className="text-xl font-bold mb-8 flex items-center">
              <span className="w-2 h-6 bg-blue-600 rounded-full mr-3"></span>
              Parameters
            </h2>
            
            <div className="space-y-10">
              <div className="group">
                <div className="flex justify-between mb-3">
                  <label className="text-sm font-semibold text-slate-600">融資元本 (Principal)</label>
                  <span className="text-blue-600 font-bold">${principal.toLocaleString()}</span>
                </div>
                <input 
                  type="range" min="1000" max="100000" step="1000" 
                  value={principal} 
                  onChange={(e) => setPrincipal(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between mb-3">
                  <label className="text-sm font-semibold text-slate-600">適用金利 (Annual Yield)</label>
                  <span className="text-blue-600 font-bold">{yieldRate.toFixed(1)}%</span>
                </div>
                <input 
                  type="range" min="1" max="30" step="0.5" 
                  value={yieldRate} 
                  onChange={(e) => setYieldRate(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between mb-3">
                  <label className="text-sm font-semibold text-slate-600">融資期間 (Loan Tenure)</label>
                  <span className="text-blue-600 font-bold">{months}ヶ月</span>
                </div>
                <input 
                  type="range" min="6" max="60" step="6" 
                  value={months} 
                  onChange={(e) => setMonths(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>

            <div className="mt-12 p-5 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">VC Pitch Note</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                このダッシュボードは、金利変動に対するポートフォリオの脆弱性を可視化します。
                <strong>Duration</strong>が短いほど、金利上昇時の資産価値下落を抑制できていることを示します。
              </p>
            </div>
          </section>

          {/* 右側：指標とチャート */}
          <main className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl overflow-hidden relative">
                <div className="relative z-10">
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Macaulay Duration</p>
                  <p className="text-5xl font-black">{metrics.macDurYears.toFixed(2)} <span className="text-xl font-medium text-slate-500">Years</span></p>
                </div>
                <div className="absolute -right-4 -bottom-4 text-slate-800 text-9xl font-black select-none opacity-20">D</div>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Convexity Score</p>
                  <p className="text-5xl font-black text-blue-600">{metrics.convexity.toFixed(2)}</p>
                </div>
                <div className="absolute -right-4 -bottom-4 text-blue-50 text-9xl font-black select-none">C</div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800">Interest Rate Sensitivity Analysis</h3>
                <span className="text-xs text-slate-400 font-mono">Real-time simulation</span>
              </div>
              <div className="h-[350px]">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
