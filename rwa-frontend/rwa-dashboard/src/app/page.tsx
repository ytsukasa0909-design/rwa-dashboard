// "use client";

// import Link from "next/link";
// import { useCallback } from "react";
// import { BadgeCheck, BarChart2, ArrowRight, Wallet } from "lucide-react";

// const pools = [
//   {
//     name: "Indonesia Motorcycle Loan Pool",
//     apy: "12.5%",
//     term: "12 Months",
//     risk: "A",
//   },
//   {
//     name: "India SME Working Capital",
//     apy: "15.2%",
//     term: "24 Months",
//     risk: "B+",
//   },
//   {
//     name: "Singapore Trade Finance",
//     apy: "8.5%",
//     term: "6 Months",
//     risk: "AA",
//   },
// ];

// export default function Home() {
//   const onInvestClick = useCallback(() => {
//     window.alert("Wallet Connection Required");
//   }, []);

//   return (
//     <main className="min-h-screen bg-gray-50">
//       {/* Hero Section */}
//       <section className="w-full py-24 flex flex-col items-center bg-white border-b border-gray-100">
//         <div className="max-w-2xl text-center">
//           <h1 className="text-3xl md:text-5xl font-semibold text-gray-900 mb-6 tracking-tight">
//             機関投資家グレードの
//             <span className="text-blue-600"> RWA利回り </span>
//             へのアクセス
//           </h1>
//           <button
//             onClick={onInvestClick}
//             className="mt-6 px-8 py-3 flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition text-white font-medium text-lg shadow"
//           >
//             <Wallet size={20} className="mr-1" /> Invest Now
//           </button>
//         </div>
//       </section>

//       {/* Pools Section */}
//       <section className="max-w-5xl mx-auto py-16 px-4">
//         <h2 className="text-2xl font-semibold text-gray-900 mb-8 flex items-center gap-3">
//           <BadgeCheck className="text-blue-600" /> 案件一覧
//         </h2>
//         <div className="grid gap-8 grid-cols-1 md:grid-cols-3">
//           {pools.map(({ name, apy, term, risk }, idx) => (
//             <div
//               key={name}
//               className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col"
//             >
//               <div className="flex items-center gap-2 mb-3">
//                 <BarChart2 className="text-blue-600" size={20} />
//                 <span className="text-lg font-medium text-gray-900">{name}</span>
//               </div>
//               <dl className="flex flex-col gap-2 text-gray-700 mb-6">
//                 <div className="flex justify-between">
//                   <dt className="font-medium">APY</dt>
//                   <dd>{apy}</dd>
//                 </div>
//                 <div className="flex justify-between">
//                   <dt className="font-medium">Term</dt>
//                   <dd>{term}</dd>
//                 </div>
//                 <div className="flex justify-between">
//                   <dt className="font-medium">Risk</dt>
//                   <dd>
//                     <span
//                       className="inline-block px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-semibold"
//                     >
//                       {risk}
//                     </span>
//                   </dd>
//                 </div>
//               </dl>
//               <div className="mt-auto flex gap-3">
//                 <Link
//                   href="/analytics"
//                   className="flex-1 inline-flex items-center justify-center gap-1 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition focus-visible:outline-blue-600"
//                 >
//                   <BarChart2 size={18} /> Analyze Risk <ArrowRight size={16} />
//                 </Link>
//                 <button
//                   onClick={onInvestClick}
//                   className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 transition text-white font-semibold rounded-lg"
//                 >
//                   <Wallet size={18} /> Invest
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </section>
//     </main>
//   );
// }
