
import React from 'react';

const HISTORY_DATA = [
    { date: 'Jan 18, 2024', customer: 'Himesh Nath', reward: 'Coffee', points: 20 },
    { date: 'Jan 8, 2024', customer: 'Ravi Kalauni', reward: 'Dessert treat', points: 300 },
    { date: 'Jan 18, 2024', customer: 'Sumit Rokaya', reward: 'Momo', points: 150 },
    { date: 'Jan 17, 2024', customer: 'Anita Sherpa', reward: 'Pizza Slice', points: 400 },
    { date: 'Jan 15, 2024', customer: 'Bikash Gurung', reward: 'Coke', points: 50 },
];

export default function AdminRedemptionHistory() {
  return (
    <div className="bg-[#f0fdf4] rounded-[24px] p-6 shadow-sm border border-green-100 flex-1 flex flex-col min-h-0">
        <h3 className="text-lg font-black text-green-700 mb-4">Recent Redemption</h3>
        
        <div className="bg-white rounded-2xl overflow-hidden border border-green-100 shadow-sm flex-1">
            <div className="overflow-x-auto no-scrollbar h-full">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-200 text-gray-600 sticky top-0 z-10">
                        <tr>
                            <th className="py-3 px-4 text-xs font-bold uppercase tracking-wide">Date</th>
                            <th className="py-3 px-4 text-xs font-bold uppercase tracking-wide">Customer</th>
                            <th className="py-3 px-4 text-xs font-bold uppercase tracking-wide">Reward</th>
                            <th className="py-3 px-4 text-xs font-bold uppercase tracking-wide text-right">Points Used</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-green-50">
                        {HISTORY_DATA.map((item, index) => (
                            <tr key={index} className="hover:bg-green-50/50 transition-colors">
                                <td className="py-3 px-4 text-xs font-medium text-gray-600 whitespace-nowrap">{item.date}</td>
                                <td className="py-3 px-4 text-sm font-bold text-gray-800 whitespace-nowrap">{item.customer}</td>
                                <td className="py-3 px-4 text-sm font-medium text-gray-700 whitespace-nowrap">{item.reward}</td>
                                <td className="py-3 px-4 text-sm font-bold text-gray-800 text-right">{item.points}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
}
