import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom'; 
import { Line } from 'react-chartjs-2';
import { ArrowLeft } from 'lucide-react';
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
  ChartOptions,
  ChartData
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function AnalyticsPage() {
  const [principal, setPrincipal] = useState<number>(10000);
  const [yieldRate, setYieldRate] = useState<number>(15);
  const [months, setMonths] = useState<number>(24);

  const metrics = useMemo(() => {
    const r = yieldRate / 100 / 12;
    const n = months;
    const currentR = yieldRate / 100 / 12;
    const C = (principal * currentR) / (1 - Math.pow(1 + currentR, -n));

    let price = 0;
    let durationSum = 0;
    let convexitySum = 0;

    for (let t = 1; t <= n; t++) {
      const pv = C / Math.pow(1 + r, t);
      price += pv;
      durationSum += t * pv;
      convexitySum += pv * (t * t + t);
    }

    const macDurYears = (durationSum / price) / 12;
    const convexity = convexitySum / (price * Math.pow(1 + r, 2) * 144);

    return { macDurYears, convexity, price };
  }, [principal, yieldRate, months]);

  const chartData: ChartData<'line'> = {
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
    }]
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-12 text-slate-900">
      <div className="max-w-6xl mx-auto">
        <Link to="/" className="inline-flex items-center text-blue-600 font-bold mb-6 hover:underline">
          <ArrowLeft size={16} className="mr-1" /> Back to Marketplace
        </Link>
        
        <header className="mb-10 border-b pb-6">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Risk <span className="text-blue-600">Analytics</span>
          </h1>
          <p className="mt-2 text-slate-500 font-medium font-mono">POOL: Indonesia Motorcycle Loan Pool</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
            <h2 className="text-xl font-bold mb-8 flex items-center">
              <span className="w-2 h-6 bg-blue-600 rounded-full mr-3"></span>
              Parameters
            </h2>
            <div className="space-y-10">
              <div>
                <div className="flex justify-between mb-3 text-sm font-semibold text-slate-600">
                  <span>元本</span><span>${principal.toLocaleString()}</span>
                </div>
                <input type="range" min="1000" max="100000" step="1000" value={principal} onChange={(e) => setPrincipal(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
              </div>
              <div>
                <div className="flex justify-between mb-3 text-sm font-semibold text-slate-600">
                  <span>年利</span><span>{yieldRate.toFixed(1)}%</span>
                </div>
                <input type="range" min="1" max="30" step="0.5" value={yieldRate} onChange={(e) => setYieldRate(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
              </div>
              <div>
                <div className="flex justify-between mb-3 text-sm font-semibold text-slate-600">
                  <span>期間</span><span>{months}ヶ月</span>
                </div>
                <input type="range" min="6" max="60" step="6" value={months} onChange={(e) => setMonths(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
              </div>
            </div>
          </section>

          <main className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                <p className="text-slate-400 text-sm font-bold uppercase mb-2">Macaulay Duration</p>
                <p className="text-5xl font-black">{metrics.macDurYears.toFixed(2)} <span className="text-xl font-medium text-slate-500">Years</span></p>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 relative overflow-hidden">
                <p className="text-slate-400 text-sm font-bold uppercase mb-2">Convexity Score</p>
                <p className="text-5xl font-black text-blue-600">{metrics.convexity.toFixed(2)}</p>
              </div>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 h-[400px]">
               <Line data={chartData} options={chartOptions} />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}