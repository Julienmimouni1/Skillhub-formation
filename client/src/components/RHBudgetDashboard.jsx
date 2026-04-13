import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import {
    Euro,
    Users,
    TrendingUp,
    Scale,
    AlertCircle,
    CheckCircle,
    Building,
    UserCircle,
    Briefcase
} from 'lucide-react';
import clsx from 'clsx';

export default function RHBudgetDashboard({ user }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [scope, setScope] = useState('GLOBAL'); // 'GLOBAL' or 'MY_SCOPE'

    useEffect(() => {
        fetchStats();
    }, [scope]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`/budget/company-stats?scope=${scope}`);
            setStats(data);
        } catch (error) {
            console.error('Error fetching RH stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-navy-500 border-t-transparent"></div>
            </div>
        );
    }

    if (!stats) return <div className="text-center p-8 text-gray-500">Aucune donnée disponible.</div>;

    const { initial, engaged, consumed, remaining, kpis } = stats;

    const budgetData = [
        { name: 'Consommé', value: consumed, color: '#8b5cf6' }, // Purple
        { name: 'Engagé', value: engaged, color: '#60a5fa' },   // Blue
        { name: 'Restant', value: Math.max(0, remaining), color: '#e5e7eb' } // Gray
    ];

    const parityData = [
        { name: 'Hommes', value: kpis.parity?.maleHours || 0, color: '#3b82f6' },
        { name: 'Femmes', value: kpis.parity?.femaleHours || 0, color: '#ec4899' },
    ];

    const isOverBudget = remaining < 0;

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Header & Toggle */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Building className="h-6 w-6 text-navy-600" />
                        Pilotage Formation
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Vue d'ensemble et indicateurs réglementaires
                    </p>
                </div>

                <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button
                        onClick={() => setScope('GLOBAL')}
                        className={clsx(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                            scope === 'GLOBAL' ? "bg-white text-navy-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        <Building className="h-4 w-4" />
                        Vue Entreprise
                    </button>
                    <button
                        onClick={() => setScope('MY_SCOPE')}
                        className={clsx(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                            scope === 'MY_SCOPE' ? "bg-white text-navy-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        <UserCircle className="h-4 w-4" />
                        Mon Périmètre
                    </button>
                </div>
            </div>

            {/* Budget Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-navy-50 rounded-lg text-navy-600">
                            <Euro className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-semibold text-gray-400 uppercase">Budget Initial</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{initial.toLocaleString()} €</h3>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-navy-50 rounded-lg text-navy-600">
                            <CheckCircle className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-semibold text-gray-400 uppercase">Consommé</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{consumed.toLocaleString()} €</h3>
                    <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                        <div className="bg-navy-500 h-1.5 rounded-full" style={{ width: `${(consumed / initial) * 100}%` }}></div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-navy-50 rounded-lg text-navy-600">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-semibold text-gray-400 uppercase">Engagé</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{engaged.toLocaleString()} €</h3>
                    <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                        <div className="bg-navy-500 h-1.5 rounded-full" style={{ width: `${(engaged / initial) * 100}%` }}></div>
                    </div>
                </div>

                <div className={clsx("p-6 rounded-2xl shadow-sm border transition-colors", isOverBudget ? "bg-red-50 border-red-100" : "bg-white border-gray-100")}>
                    <div className="flex justify-between items-start mb-4">
                        <div className={clsx("p-2 rounded-lg", isOverBudget ? "bg-red-100 text-red-600" : "bg-green-50 text-green-600")}>
                            {isOverBudget ? <AlertCircle className="h-5 w-5" /> : <Euro className="h-5 w-5" />}
                        </div>
                        <span className={clsx("text-xs font-semibold uppercase", isOverBudget ? "text-red-500" : "text-gray-400")}>Restant</span>
                    </div>
                    <h3 className={clsx("text-2xl font-bold", isOverBudget ? "text-red-700" : "text-gray-900")}>
                        {remaining.toLocaleString()} €
                    </h3>
                </div>
            </div>

            {/* Regulatory & KPI Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Parity Widget */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Scale className="h-5 w-5 text-navy-500" />
                        Index Parité (Heures)
                    </h3>
                    <div className="h-48 w-full">
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={parityData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {parityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `${value} h`} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 text-center text-sm text-gray-500">
                        Total: {((kpis.parity?.maleHours || 0) + (kpis.parity?.femaleHours || 0))} heures
                    </div>
                </div>

                {/* Access Rate & Mandatory */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Taux d'accès */}
                    <div className="bg-gradient-to-br from-navy-600 to-navy-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center gap-3 mb-4 opacity-90">
                            <Users className="h-6 w-6" />
                            <h4 className="font-semibold text-lg">Taux d'accès</h4>
                        </div>
                        <div className="flex items-end gap-2 mb-2">
                            <span className="text-5xl font-bold">{kpis.accessRate}%</span>
                            <span className="text-navy-200 mb-1">des collaborateurs</span>
                        </div>
                        <div className="w-full bg-black/20 rounded-full h-2 mt-4">
                            <div className="bg-white h-2 rounded-full transition-all duration-1000" style={{ width: `${kpis.accessRate}%` }}></div>
                        </div>
                        <p className="mt-4 text-sm text-navy-100">
                            {kpis.trainedCount} collaborateurs formés sur {kpis.totalEmployees} actifs.
                        </p>
                    </div>

                    {/* Quick Stats Regulatory */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
                        <h4 className="text-gray-500 text-sm uppercase font-semibold mb-4">Conformité Légale</h4>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium text-gray-700">Formations Obligatoires</span>
                                    <span className="text-sm font-bold text-gray-900">{kpis.regulatory?.mandatoryCompleted || 0} validées</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }}></div> {/* Mocked percentage for now as we lack total mandatory target */}
                                </div>
                            </div>

                            <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                                <span className="block text-xs font-bold text-orange-700 uppercase mb-1">Point d'attention</span>
                                <p className="text-sm text-gray-700">
                                    Pensez à vérifier les entretiens professionnels biannuels pour {new Date().getFullYear()}.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
