import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { BadgeCheck, BarChart2, Wallet } from "lucide-react";
import AnalyticsPage from './analytics/page';

const HomePage = () => {
  const pools = [
    { name: "Indonesia Motorcycle Loan", apy: "12.5%", term: "12 Months", risk: "A" },
    { name: "India SME Working Capital", apy: "15.2%", term: "24 Months", risk: "B+" },
    { name: "Singapore Trade Finance", apy: "8.5%", term: "6 Months", risk: "AA" },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <section className="py-24 bg-white border-b border-slate-200 text-center px-4">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
          Institutional <span className="text-blue-600">RWA Yields</span>
        </h1>
        <p className="text-slate-500 text-lg mb-10 max-w-2xl mx-auto font-medium">
          機関投資家向けの実物資産（RWA）利回りに、透明性と高度な分析を。
        </p>
        <button className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-xl font-bold mx-auto hover:bg-slate-800 transition-all shadow-xl hover:scale-105">
          <Wallet size={20} /> Invest Now
        </button>
      </section>

      <section className="max-w-6xl mx-auto py-20 px-6">
        <h2 className="text-2xl font-bold mb-12 flex items-center gap-3">
          <BadgeCheck className="text-blue-600" size={28} /> アクティブな案件一覧
        </h2>
        <div className="grid gap-8 grid-cols-1 md:grid-cols-3">
          {pools.map((pool) => (
            <div key={pool.name} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-2xl transition-all flex flex-col group">
              <div className="mb-6">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100 uppercase tracking-wider">Active</span>
                <h3 className="text-xl font-bold mt-4 leading-snug group-hover:text-blue-600 transition-colors">{pool.name}</h3>
              </div>
              <div className="space-y-4 mb-10">
                <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                  <span className="text-slate-400 font-medium">想定利回り (APY)</span>
                  <span className="font-black text-blue-600 text-lg">{pool.apy}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                  <span className="text-slate-400 font-medium">運用期間</span>
                  <span className="font-bold text-slate-700">{pool.term}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-medium">リスク格付</span>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-bold border border-slate-200">{pool.risk}</span>
                </div>
              </div>
              <div className="mt-auto flex flex-col gap-3">
                <Link to="/analytics" className="w-full py-3 text-sm font-bold bg-blue-600 text-white rounded-xl text-center hover:bg-blue-700 shadow-lg shadow-blue-100">Invest</Link>
                <Link to="/analytics" className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                  <BarChart2 size={16} /> Risk Analysis
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
      </Routes>
    </Router>
  );
}