import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    History,
    Search,
    Filter,
    ArrowLeft,
    Download,
    Calendar,
    User,
    Award,
    Clock,
    TrendingUp,
    ChevronRight,
    Loader2,
    CheckCircle2,
    FileText,
    PieChart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

export default function TrainingHistoryPage() {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDept, setFilterDept] = useState('ALL');
    const [filterYear, setFilterYear] = useState('ALL');

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/compliance/training-history');
            setHistory(data.history);
        } catch (error) {
            console.error('Error fetching training history:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            // We use the request export with status=COMPLETED
            const response = await axios.get('/requests/actions/export?status=COMPLETED', {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Historique_Formations_${new Date().getFullYear()}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Export error:', error);
            alert('Erreur lors de l\'export.');
        } finally {
            setExporting(false);
        }
    };

    const departments = Array.from(new Set(history.map(h => h.user.department?.name))).filter(Boolean);
    const years = Array.from(new Set(history.map(h => new Date(h.actual_end_date || h.updated_at).getFullYear()))).sort((a, b) => b - a);

    const filteredHistory = history.filter(item => {
        const matchesSearch =
            item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            `${item.user.first_name} ${item.user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = filterDept === 'ALL' || item.user.department?.name === filterDept;
        const matchesYear = filterYear === 'ALL' || new Date(item.actual_end_date || item.updated_at).getFullYear().toString() === filterYear;
        return matchesSearch && matchesDept && matchesYear;
    });

    const totalCost = filteredHistory.reduce((acc, curr) => acc + parseFloat(curr.cost || 0), 0);
    const totalHours = filteredHistory.reduce((acc, curr) => acc + (curr.duration_hours || 0), 0);
    const avgScore = filteredHistory.reduce((acc, curr) => acc + (curr.application_plan?.impact_score || 0), 0) / (filteredHistory.length || 1);

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <Loader2 className="h-10 w-10 text-navy-600 animate-spin" />
            <p className="text-gray-500 font-bold">Chargement de l'historique...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-navy-600 hover:border-navy-100 shadow-sm transition-all"
                    >
                        <ArrowLeft className="h-6 w-6" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <History className="h-5 w-5 text-navy-500" />
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Historique des Formations</h1>
                        </div>
                        <p className="text-gray-500 font-medium">Consultez l'ensemble des formations réalisées et leur impact.</p>
                    </div>
                </div>
                <button
                    className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50"
                    onClick={handleExport}
                    disabled={exporting}
                >
                    <Download className={clsx("h-5 w-5 text-gray-400", exporting && "animate-bounce")} />
                    {exporting ? 'Export en cours...' : 'Exporter'}
                </button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Formations Total', value: filteredHistory.length, icon: Award, color: 'navy' },
                    { label: 'Investissement', value: new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalCost), icon: TrendingUp, color: 'green' },
                    { label: 'Heures Total', value: totalHours + 'h', icon: Clock, color: 'navy' },
                    { label: 'Impact Moyen', value: avgScore.toFixed(0) + '%', icon: PieChart, color: 'amber' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <stat.icon className={clsx("h-6 w-6", {
                                'text-navy-500': stat.color === 'navy',
                                'text-green-500': stat.color === 'green',
                                'text-navy-500': stat.color === 'navy',
                                'text-amber-500': stat.color === 'amber',
                            })} />
                            <span className="text-2xl font-black text-gray-900">{stat.value}</span>
                        </div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher une formation, un collaborateur..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-gray-100 rounded-2xl focus:ring-2 focus:ring-navy-500 focus:bg-white transition-all text-sm font-bold"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <select
                            value={filterDept}
                            onChange={(e) => setFilterDept(e.target.value)}
                            className="w-full pl-11 pr-4 py-4 bg-gray-50 border-gray-100 rounded-2xl focus:ring-2 focus:ring-navy-500 focus:bg-white transition-all text-sm font-bold appearance-none"
                        >
                            <option value="ALL">Tous les départements</option>
                            {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                        </select>
                    </div>
                    <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <select
                            value={filterYear}
                            onChange={(e) => setFilterYear(e.target.value)}
                            className="w-full pl-11 pr-4 py-4 bg-gray-50 border-gray-100 rounded-2xl focus:ring-2 focus:ring-navy-500 focus:bg-white transition-all text-sm font-bold appearance-none"
                        >
                            <option value="ALL">Toutes les années</option>
                            {years.map(year => <option key={year} value={year}>{year}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Formation</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Collaborateur</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date Fin</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Impact Score</th>
                                <th className="px-8 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredHistory.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-xl bg-navy-50 text-navy-600 flex items-center justify-center mr-4">
                                                <Award className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-900">{item.title}</div>
                                                <div className="text-xs text-gray-400 font-medium">{item.provider?.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-navy-500 to-navy-600 flex items-center justify-center text-white text-[10px] font-bold mr-3 border-2 border-white shadow-sm">
                                                {item.user.first_name[0]}{item.user.last_name[0]}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-700">{item.user.first_name} {item.user.last_name}</div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{item.user.department?.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-500 font-bold">
                                        {new Date(item.actual_end_date || item.updated_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 w-24 bg-gray-100 h-2 rounded-full overflow-hidden">
                                                <div
                                                    className={clsx(
                                                        "h-full rounded-full transition-all",
                                                        (item.application_plan?.impact_score || 0) > 70 ? "bg-green-500" : (item.application_plan?.impact_score || 0) > 40 ? "bg-amber-500" : "bg-red-500"
                                                    )}
                                                    style={{ width: `${item.application_plan?.impact_score || 0}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs font-black text-gray-900">{item.application_plan?.impact_score || 0}%</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap text-right">
                                        <button
                                            onClick={() => navigate(`/requests/${item.id}`)}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-xs font-bold hover:bg-navy-600 hover:text-white transition-all shadow-sm"
                                        >
                                            DÉTAILS
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredHistory.length === 0 && (
                    <div className="p-12 text-center">
                        <div className="bg-gray-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                            <Search className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Aucun résultat trouvé</h3>
                        <p className="text-gray-400 font-medium">Réessayez avec d'autres filtres ou termes de recherche.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

