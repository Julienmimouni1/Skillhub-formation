import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    ArrowLeft,
    Search,
    Filter,
    History,
    AlertCircle,
    CheckCircle2,
    Clock,
    User,
    ChevronRight,
    Loader2,
    Info,
    TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

const STATUS_CONFIG = {
    'COMPLIANT': { label: 'Conforme', color: 'green', icon: CheckCircle2, desc: 'Critères légaux respectés.' },
    'NON_COMPLIANT': { label: 'Non-Conforme', color: 'red', icon: AlertCircle, desc: 'Défaut de formation non-obligatoire.' },
    'NOT_APPLICABLE': { label: 'En cours', color: 'navy', icon: Clock, desc: 'Cycle des 6 ans non atteint.' },
    'UNKNOWN': { label: 'Inconnu', color: 'gray', icon: Info, desc: 'Données insuffisantes.' }
};

export default function SixYearReviewPage() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    useEffect(() => {
        fetchBilan();
    }, []);

    const fetchBilan = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/compliance/bilan-6-years');
            setUsers(data.users);
        } catch (error) {
            console.error('Error fetching 6y bilan:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'ALL' || user.compliance_6y === filterStatus;
        return matchesSearch && matchesStatus;
    });

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin h-10 w-10 text-navy-600" /></div>;

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/rh/compliance')}
                        className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-navy-600 hover:border-navy-100 shadow-sm transition-all"
                    >
                        <ArrowLeft className="h-6 w-6" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <History className="h-5 w-5 text-navy-500" />
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Bilan Récapitulatif à 6 ans</h1>
                        </div>
                        <p className="text-gray-500 font-medium">Contrôle légal : 3 entretiens + au moins 1 formation non-obligatoire sur le cycle.</p>
                    </div>
                </div>
            </div>

            {/* Info Banner */}
            <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6 flex gap-4">
                <div className="p-2 bg-amber-100 rounded-xl h-fit">
                    <AlertCircle className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                    <h4 className="text-amber-900 font-bold mb-1">Rappel Réglementaire (Loi du 5 mars 2014)</h4>
                    <p className="text-amber-800 text-sm font-medium">
                        Tous les 6 ans, l'employeur doit réaliser un état des lieux récapitulatif du parcours professionnel.
                        Si le salarié n'a pas bénéficié des entretiens ET d'au moins une formation "non-obligatoire", l'entreprise s'expose à un abondement correctif du CPF de 3000€.
                    </p>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Effectif Total', value: users.length, icon: User, color: 'navy' },
                    { label: 'Non-Conformes', value: users.filter(u => u.compliance_6y === 'NON_COMPLIANT').length, icon: AlertCircle, color: 'red' },
                    { label: 'Risque Financier', value: users.filter(u => u.compliance_6y === 'NON_COMPLIANT').length * 3000 + ' €', icon: TrendingUp, color: 'amber' },
                    { label: 'Conformes', value: users.filter(u => u.compliance_6y === 'COMPLIANT').length, icon: CheckCircle2, color: 'green' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <stat.icon className={clsx("h-6 w-6", {
                                'text-navy-500': stat.color === 'navy',
                                'text-red-500': stat.color === 'red',
                                'text-amber-500': stat.color === 'amber',
                                'text-green-500': stat.color === 'green',
                            })} />
                            <span className="text-2xl font-black text-gray-900">{stat.value}</span>
                        </div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un collaborateur..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-gray-100 rounded-2xl focus:ring-2 focus:ring-navy-500 focus:bg-white transition-all text-sm font-bold"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full pl-11 pr-4 py-4 bg-gray-50 border-gray-100 rounded-2xl focus:ring-2 focus:ring-navy-500 focus:bg-white transition-all text-sm font-bold appearance-none"
                        >
                            <option value="ALL">Tous les statuts</option>
                            <option value="COMPLIANT">Conforme</option>
                            <option value="NON_COMPLIANT">Non-Conforme</option>
                            <option value="NOT_APPLICABLE">En cours (cycle &lt; 6 ans)</option>
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
                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Collaborateur</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Ancienneté</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Formations Non-Oblig.</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Verdict 6 ans</th>
                                <th className="px-8 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredUsers.map((user) => {
                                const cfg = STATUS_CONFIG[user.compliance_6y] || STATUS_CONFIG.UNKNOWN;
                                return (
                                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-navy-500 to-navy-600 flex items-center justify-center text-white text-xs font-bold mr-4 border-2 border-white shadow-sm">
                                                    {user.first_name[0]}{user.last_name[0]}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900">{user.first_name} {user.last_name}</div>
                                                    <div className="text-xs font-medium text-gray-400">Embauché le {new Date(user.hired_at).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            {user.compliance_6y === 'NOT_APPLICABLE' ? (
                                                <div className="w-full max-w-[100px]">
                                                    <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1">
                                                        <span>{user.progress}%</span>
                                                        <span>6 ans</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-navy-400 rounded-full transition-all duration-1000"
                                                            style={{ width: `${user.progress}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-sm font-bold text-gray-700">&gt; 6 ans</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className={clsx(
                                                "inline-flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg text-sm font-bold",
                                                user.has_training ? "text-green-700" : "text-red-700"
                                            )}>
                                                {user.has_training ? (
                                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                                )}
                                                {user.trainings_count || 0} réalisée(s)
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className={clsx(
                                                "flex flex-col",
                                                cfg.color === 'green' && "text-green-700",
                                                cfg.color === 'red' && "text-red-700",
                                                cfg.color === 'navy' && "text-navy-700"
                                            )}>
                                                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                                                    <cfg.icon className="h-3.5 w-3.5" />
                                                    {cfg.label}
                                                </div>
                                                <div className="text-[10px] font-medium text-gray-400 mt-0.5">{cfg.desc}</div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap text-right">
                                            <button className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-xs font-bold hover:bg-navy-600 hover:text-white transition-all">
                                                DÉTAILS
                                                <ChevronRight className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
