import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, ComposedChart, Line
} from 'recharts';
import {
    Building,
    UserCircle,
    LayoutDashboard,
    TrendingUp,
    Users,
    Euro,
    AlertCircle,
    CheckCircle,
    Briefcase,
    Target,
    Clock,
    Award,
    Scale,
    Download
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';

export default function RHPilotagePage() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [scope, setScope] = useState('GLOBAL'); // 'GLOBAL' or 'MY_SCOPE'
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        fetchStats();
    }, [scope]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`/budget/company-stats?scope=${scope}`);
            setStats(data);
        } catch (error) {
            console.error('Error fetching pilotage stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            const response = await axios.get(`/budget/export-kpis?scope=${scope}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Export_KPI_Skillhub_${scope}_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Export error:', error);
            alert('Erreur lors de l\'export des données.');
        } finally {
            setExporting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-navy-500 border-t-transparent"></div>
            </div>
        );
    }

    if (!stats) return <div className="text-center p-12 text-gray-500">Données indisponibles.</div>;

    const { initial, engaged, consumed, remaining, kpis, charts } = stats;
    const isOverBudget = remaining < 0;

    const typeColors = {
        'OBLIGATOIRE': '#ef4444',
        'PLAN_DEV': '#8b5cf6',
        'CPF': '#10b981',
        'AUTRE': '#9ca3af'
    };

    const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308'];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in pb-20">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <LayoutDashboard className="h-8 w-8 text-navy-600" />
                        Pilotage des indicateurs RH
                    </h1>
                    <p className="mt-2 text-gray-500 text-lg">
                        Vision 360° : Budget, Performance Sociale et Conformité.
                    </p>
                </div>

                {/* Scope Toggle & Badge */}
                {user?.role === 'rh' && (
                    <div className="flex items-center gap-3">
                        {/* Scope Name Badge - Only visible in MY_SCOPE */}
                        {scope === 'MY_SCOPE' && stats?.scopeName && (
                            <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold bg-navy-600 text-white shadow-md animate-in fade-in slide-in-from-right-4 duration-300">
                                {stats.scopeName}
                            </span>
                        )}

                        <div className="bg-white p-1.5 rounded-xl shadow-sm border border-gray-200 flex">
                            <button
                                onClick={() => setScope('GLOBAL')}
                                className={clsx(
                                    "px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
                                    scope === 'GLOBAL' ? "bg-navy-600 text-white shadow-md" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                )}
                            >
                                <Building className="h-4 w-4" />
                                Vue Entreprise
                            </button>
                            <button
                                onClick={() => setScope('MY_SCOPE')}
                                className={clsx(
                                    "px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
                                    scope === 'MY_SCOPE' ? "bg-navy-600 text-white shadow-md" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                )}
                            >
                                <UserCircle className="h-4 w-4" />
                                Mon Périmètre
                            </button>
                        </div>

                        <button
                            onClick={handleExport}
                            disabled={exporting}
                            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            <Download className={clsx("h-4 w-4", exporting && "animate-bounce")} />
                            {exporting ? 'Export en cours...' : 'Exporter les KPI (CSV)'}
                        </button>
                    </div>
                )}
            </div>

            {/* --- SECTION 1: FINANCIAL PERFORMANCE --- */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Euro className="h-6 w-6 text-navy-500" /> Performance Financière
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Initial */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Budget Annuel</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-2">{initial.toLocaleString()} €</h3>
                        <div className="mt-4 flex items-center text-sm text-gray-400">
                            <Building className="h-4 w-4 mr-1" /> Alloué par la direction
                        </div>
                    </div>

                    {/* Engaged */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                        <p className="text-sm font-semibold text-navy-600 uppercase tracking-wider">Engagé</p>
                        <h3 className="text-3xl font-bold text-navy-900 mt-2">{engaged.toLocaleString()} €</h3>
                        <div className="mt-4 w-full bg-gray-100 rounded-full h-1.5">
                            <div className="bg-navy-500 h-1.5 rounded-full" style={{ width: `${(engaged / initial) * 100}%` }}></div>
                        </div>
                    </div>

                    {/* Consumed */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                        <p className="text-sm font-semibold text-navy-600 uppercase tracking-wider">Consommé</p>
                        <h3 className="text-3xl font-bold text-navy-900 mt-2">{consumed.toLocaleString()} €</h3>
                        <div className="mt-4 w-full bg-gray-100 rounded-full h-1.5">
                            <div className="bg-navy-500 h-1.5 rounded-full" style={{ width: `${(consumed / initial) * 100}%` }}></div>
                        </div>
                    </div>

                    {/* Remaining */}
                    <div className={clsx("p-6 rounded-2xl shadow-sm border relative overflow-hidden group hover:shadow-md transition-all", isOverBudget ? "bg-red-50 border-red-100" : "bg-white border-gray-100")}>
                        <p className={clsx("text-sm font-semibold uppercase tracking-wider", isOverBudget ? "text-red-600" : "text-gray-500")}>Reste à Engager</p>
                        <h3 className={clsx("text-3xl font-bold mt-2", isOverBudget ? "text-red-700" : "text-green-600")}>{remaining.toLocaleString()} €</h3>
                        {isOverBudget && (
                            <div className="mt-4 flex items-center text-sm text-red-600 bg-red-100 py-1 px-2 rounded-lg w-fit">
                                <AlertCircle className="h-4 w-4 mr-1" /> Dépassement critique
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- SECTION 2: SOCIAL & EQUITY --- */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Users className="h-6 w-6 text-pink-500" /> Équité & Démographie
                </h2>

                {/* KPI Grid for Social */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold text-gray-500 uppercase">Taux d'Accès</p>
                            <Target className="h-5 w-5 text-navy-400" />
                        </div>
                        <p className="text-3xl font-extrabold text-gray-900">{kpis.accessRate}%</p>
                        <p className="text-xs text-gray-400 mt-1">{kpis.trainedCount} formés / {kpis.totalEmployees}</p>
                    </div>

                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold text-gray-500 uppercase">Coût Moyen</p>
                            <Euro className="h-5 w-5 text-green-400" />
                        </div>
                        <p className="text-3xl font-extrabold text-gray-900">{kpis.averageCostPerEmployee} €</p>
                        <p className="text-xs text-gray-400 mt-1">par collaborateur formé</p>
                    </div>

                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold text-gray-500 uppercase">Ancienneté Moy.</p>
                            <Clock className="h-5 w-5 text-orange-400" />
                        </div>
                        <p className="text-3xl font-extrabold text-gray-900">{kpis.avgSeniorityYears} ans</p>
                        <p className="text-xs text-gray-400 mt-1">Population active</p>
                    </div>

                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold text-gray-500 uppercase">Parité (H/F)</p>
                            <Scale className="h-5 w-5 text-navy-400" />
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1">
                                <div className="text-lg font-bold text-navy-600">{kpis.parity?.maleHours}h</div>
                                <div className="h-1 bg-navy-200 rounded-full overflow-hidden"><div className="h-full bg-navy-500" style={{ width: `${(kpis.parity.maleHours / (kpis.parity.maleHours + kpis.parity.femaleHours || 1)) * 100}%` }}></div></div>
                            </div>
                            <div className="flex-1">
                                <div className="text-lg font-bold text-pink-600">{kpis.parity?.femaleHours}h</div>
                                <div className="h-1 bg-pink-200 rounded-full overflow-hidden"><div className="h-full bg-pink-500" style={{ width: `${(kpis.parity.femaleHours / (kpis.parity.maleHours + kpis.parity.femaleHours || 1)) * 100}%` }}></div></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Pyramide des Ages */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Pyramide des Âges</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer>
                                <BarChart data={charts.agePyramid}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                    <YAxis hide />
                                    <Tooltip cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Répartition CSP */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Répartition CSP</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={charts.cspDistribution} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                                        {charts.cspDistribution?.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Taux d'Accès par CSP */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Accès Formation par CSP (%)</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer>
                                <BarChart data={charts.cspAnalysis} layout="vertical" margin={{ left: 30 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                    <XAxis type="number" domain={[0, 100]} hide />
                                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={60} />
                                    <Tooltip cursor={{ fill: 'transparent' }} formatter={(val) => `${val}%`} />
                                    <Bar dataKey="accessRate" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- SECTION 3: OPERATIONAL ANALYSIS --- */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Briefcase className="h-6 w-6 text-orange-500" /> Analyse Opérationnelle
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-wide">Budget par Département</h3>
                        <div className="h-80 w-full">
                            <ResponsiveContainer>
                                <ComposedChart data={charts.departmentAnalysis} margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid stroke="#f3f4f6" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                    <YAxis tickFormatter={(val) => `${val / 1000}k€`} />
                                    <Tooltip formatter={(val) => `${val.toLocaleString()} €`} />
                                    <Legend />
                                    <Bar dataKey="used" name="Consommé" stackId="a" fill="#8b5cf6" barSize={30} radius={[0, 0, 4, 4]} />
                                    <Bar dataKey="remaining" name="Restant" stackId="a" fill="#e5e7eb" barSize={30} radius={[4, 4, 0, 0]} />
                                    <Line type="monotone" dataKey="budget" name="Alloué" stroke="#4f46e5" strokeWidth={2} dot={false} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Training Type Distribution */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-wide">Répartition par Dispositif</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={charts.typeDistribution}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {charts.typeDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={typeColors[entry.name] || '#9ca3af'} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} iconSize={10} wrapperStyle={{ fontSize: '11px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Formations Obligatoires</span>
                                <span className="font-bold text-gray-900">{kpis.regulatory?.mandatoryCompleted || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Volume Horaire Total</span>
                                <span className="font-bold text-gray-900">{kpis.totalTrainingHours} h</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
