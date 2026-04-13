import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    ArrowLeft,
    Search,
    Filter,
    Briefcase,
    Calendar,
    AlertCircle,
    CheckCircle2,
    Clock,
    User,
    ChevronRight,
    Loader2,
    Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

const STATUS_CONFIG = {
    'UP_TO_DATE': { label: 'À jour', color: 'green', icon: CheckCircle2 },
    'UPCOMING': { label: 'À planifier', color: 'amber', icon: Clock },
    'LATE': { label: 'En retard', color: 'red', icon: AlertCircle },
    'REQUIRED': { label: 'Obligatoire', color: 'red', icon: AlertCircle }
};

export default function ProfessionalInterviewsPage() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    useEffect(() => {
        fetchInterviews();
    }, []);

    const fetchInterviews = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/compliance/professional-interviews');
            setUsers(data.users);
        } catch (error) {
            console.error('Error fetching interviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            const response = await axios.get('/compliance/professional-interviews/export', {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Export_Entretiens_Pro_${new Date().getFullYear()}.csv`);
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

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'ALL' || user.status === filterStatus;
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
                            <Briefcase className="h-5 w-5 text-navy-500" />
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Entretiens Professionnels</h1>
                        </div>
                        <p className="text-gray-500 font-medium">Suivi de la périodicité légale de 2 ans et des bilans de parcours.</p>
                    </div>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Effectif', value: users.length, icon: User, color: 'navy' },
                    { label: 'En Retard', value: users.filter(u => u.status === 'LATE').length, icon: AlertCircle, color: 'red' },
                    { label: 'À Planifier', value: users.filter(u => u.status === 'UPCOMING').length, icon: Clock, color: 'amber' },
                    { label: 'À Jour', value: users.filter(u => u.status === 'UP_TO_DATE').length, icon: CheckCircle2, color: 'green' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <stat.icon className={clsx("h-6 w-6", {
                                'text-navy-500': stat.color === 'navy',
                                'text-red-500': stat.color === 'red',
                                'text-amber-500': stat.color === 'amber',
                                'text-green-500': stat.color === 'green',
                            })} />
                            <span className="text-3xl font-black text-gray-900">{stat.value}</span>
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
                            <option value="UP_TO_DATE">À jour</option>
                            <option value="UPCOMING">À planifier</option>
                            <option value="LATE">En retard</option>
                            <option value="REQUIRED">Obligatoire</option>
                        </select>
                    </div>
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="bg-navy-600 text-white rounded-2xl font-bold hover:bg-navy-700 transition-colors shadow-lg shadow-navy-100 py-4 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Download className={clsx("h-5 w-5", exporting && "animate-bounce")} />
                        {exporting ? 'Export en cours...' : 'Exporter (Excel)'}
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Collaborateur</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Dernier Entretien</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Échéance</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Statut</th>
                                <th className="px-8 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredUsers.map((user) => {
                                const cfg = STATUS_CONFIG[user.status] || STATUS_CONFIG.UP_TO_DATE;
                                return (
                                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-navy-500 to-navy-600 flex items-center justify-center text-white text-xs font-bold mr-4 border-2 border-white shadow-sm">
                                                    {user.first_name[0]}{user.last_name[0]}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900">{user.first_name} {user.last_name}</div>
                                                    <div className="text-xs font-medium text-gray-400">{user.department?.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-500 font-bold">
                                            {user.last_professional_interview ? new Date(user.last_professional_interview).toLocaleDateString() : 'Jamais'}
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-500 font-bold">
                                            {user.next_date ? new Date(user.next_date).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className={clsx(
                                                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold",
                                                cfg.color === 'green' && "bg-green-50 text-green-700",
                                                cfg.color === 'amber' && "bg-amber-50 text-amber-700",
                                                cfg.color === 'red' && "bg-red-50 text-red-700"
                                            )}>
                                                <cfg.icon className="h-3.5 w-3.5" />
                                                {cfg.label}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap text-right">
                                            <button className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-xs font-bold hover:bg-navy-600 hover:text-white transition-all">
                                                PLANIFIER
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
