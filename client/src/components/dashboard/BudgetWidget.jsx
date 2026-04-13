import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Wallet } from 'lucide-react';

const data = [
  { name: 'Engagé', value: 400 },
  { name: 'Disponible', value: 600 },
];
const COLORS = ['#E5E7EB', '#D4AF37']; // Grey for used, Gold for available

const BudgetWidget = ({ total = 1500, used = 450 }) => {
  const available = total - used;
  const chartData = [
    { name: 'Utilisé', value: used },
    { name: 'Restant', value: available },
  ];
  const percentage = Math.round((used / total) * 100);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gold-100 p-6 flex flex-col justify-between h-full relative overflow-hidden">
      <div className="flex items-center justify-between z-10">
        <div>
           <h3 className="text-sm font-bold text-navy-500 uppercase tracking-wide font-serif">Mon Budget</h3>
           <p className="text-2xl font-bold text-navy-900 mt-1">{available} € <span className="text-xs text-navy-400 font-normal">disponibles</span></p>
        </div>
        <div className="p-2 bg-gold-50 rounded-lg text-gold-600">
            <Wallet className="h-5 w-5" />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center relative mt-4">
        <div className="w-full h-32">
            <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                data={chartData}
                cx="50%"
                cy="100%"
                startAngle={180}
                endAngle={0}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={0}
                dataKey="value"
                stroke="none"
                >
                <Cell key="used" fill="#E5E7EB" />
                <Cell key="available" fill="#D4AF37" />
                </Pie>
                <Tooltip 
                    formatter={(value) => `${value} €`}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
            </PieChart>
            </ResponsiveContainer>
             {/* Center Label positioned absolutely */}
            <div className="absolute bottom-0 left-0 right-0 text-center pb-2">
                 <span className="text-xs font-bold text-navy-400">Total: {total}€</span>
            </div>
        </div>
      </div>
      
      <div className="mt-4 z-10">
         <div className="w-full bg-gray-100 rounded-full h-2">
            <div className="bg-gold-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
         </div>
         <p className="text-xs text-right text-navy-400 mt-1">{percentage}% utilisé</p>
      </div>
    </div>
  );
};

export default BudgetWidget;
