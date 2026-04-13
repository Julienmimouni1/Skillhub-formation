import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    ArrowLeft,
    Search,
    Filter,
    ShieldCheck,
    AlertCircle,
    CheckCircle2,
    Clock,
    User,
    ChevronRight,
    Loader2,
    Download,
    Building
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

export default function AuthorizationsPage() {
    const navigate = useNavigate();
    const [certifications, setCertifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    useEffect(() => {
        fetchCertifications();
    }, []);

    const fetchCertifications = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/compliance/authorizations');
            setCertifications(data.certifications);
        } catch (error) {
            console.error('Error fetching authorizations:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatus = (cert) => {
        if (!cert.expires_at) return 'VALID';
        const expiry = new Date(cert.expires_at);
        const today = new Date();
        const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'EXPIRED';
        if (diffDays < 30) return 'EXPIRING_SOON';
        return 'VALID';
    };

    const filteredCerts = certifications.filter(cert => {
        const matchesSearch =
            cert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            `${cert.user.first_name} ${cert.user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
        const status = getStatus(cert);
        const matchesStatus = filterStatus === 'ALL' || status === filterStatus;
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
                            <ShieldCheck className="h-5 w-5 text-amber-500" />
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Registre des Habilitations</h1>
                        </div>
                        <p className="text-gray-500 font-medium">Gestion et suivi des certifications de sécurité et habilitations techniques.</p>
                    </div>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Certificats', value: certifications.length, icon: ShieldCheck, color: 'navy' },
                    { label: 'Expirés', value: certifications.filter(c => getStatus(c) === 'EXPIRED').length, icon: AlertCircle, color: 'red' },
                    { label: 'À Renouveler', value: certifications.filter(c => getStatus(c) === 'EXPIRING_SOON').length, icon: Clock, color: 'amber' },
                    { label: 'En Conformité', value: certifications.filter(c => getStatus(c) === 'VALID').length, icon: CheckCircle2, color: 'green' },
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher une habilitation ou un collaborateur..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-gray-100 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all text-sm font-bold"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full pl-11 pr-4 py-4 bg-gray-50 border-gray-100 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all text-sm font-bold appearance-none"
                        >
                            <option value="ALL">Tous les statuts</option>
                            <option value="VALID">Valide</option>
                            <option value="EXPIRING_SOON">À renouveler</option>
                            <option value="EXPIRED">Expiré</option>
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
                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Habilitation</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Collaborateur</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Délivré par / le</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Échéance</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Statut</th>
                                <th className="px-8 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredCerts.map((cert) => {
                                const status = getStatus(cert);
                                return (
                                    <tr key={cert.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 mr-4 shadow-sm">
                                                    <ShieldCheck className="h-6 w-6" />
                                                </div>
                                                <div className="text-sm font-bold text-gray-900">{cert.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-[10px] font-bold mr-3 border border-white shadow-sm">
                                                    {cert.user.first_name[0]}{cert.user.last_name[0]}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900">{cert.user.first_name} {cert.user.last_name}</div>
                                                    <div className="text-xs font-medium text-gray-400">{cert.user.department?.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                                <Building className="h-3.5 w-3.5 text-gray-400" />
                                                {cert.issuing_org || '-'}
                                            </div>
                                            <div className="text-xs font-medium text-gray-400">Le {new Date(cert.obtained_at).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-500 font-bold">
                                            {cert.expires_at ? new Date(cert.expires_at).toLocaleDateString() : 'Permanent'}
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className={clsx(
                                                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold",
                                                status === 'VALID' && "bg-green-50 text-green-700",
                                                status === 'EXPIRING_SOON' && "bg-amber-50 text-amber-700",
                                                status === 'EXPIRED' && "bg-red-50 text-red-700"
                                            )}>
                                                {status === 'VALID' && <CheckCircle2 className="h-3.5 w-3.5" />}
                                                {status === 'EXPIRING_SOON' && <Clock className="h-3.5 w-3.5" />}
                                                {status === 'EXPIRED' && <AlertCircle className="h-3.5 w-3.5" />}
                                                {status === 'VALID' ? 'Valide' : status === 'EXPIRING_SOON' ? 'À renouveler' : 'Expiré'}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap text-right">
                                            <div className="flex justify-end gap-2">
                                                <button className="p-2 text-gray-400 hover:text-navy-600 hover:bg-navy-50 rounded-lg transition-all" title="Télécharger justificatif">
                                                    <Download className="h-5 w-5" />
                                                </button>
                                                <button className="p-2 text-gray-400 hover:text-navy-600 hover:bg-navy-50 rounded-lg transition-all" title="Modifier">
                                                    <ChevronRight className="h-5 w-5" />
                                                </button>
                                            </div>
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
