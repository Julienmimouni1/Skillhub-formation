import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus,
    Clock,
    CheckCircle,
    TrendingUp,
    FileText,
    ArrowRight,
    ClipboardCheck,
    Building,
    UserCircle
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/common/StatusBadge';
import ActiveCampaignBanner from '../components/dashboard/ActiveCampaignBanner';
import MarqueeBanner from '../components/common/MarqueeBanner';
import BudgetWidget from '../components/dashboard/BudgetWidget'; // Import new widget
import clsx from 'clsx';

export default function Dashboard() {
    const { user, viewRole } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeScope, setActiveScope] = useState('my_scope'); // 'all' or 'my_scope' for RH
    const [scopeName, setScopeName] = useState('');

    useEffect(() => {
        fetchRequests();
    }, [user, viewRole, activeScope]);

    const fetchRequests = async () => {
        try {
            // Fetch scope name if RH
            if (viewRole === 'rh' && !scopeName) {
                const meRes = await axios.get('/auth/me');
                if (meRes.data.user.department?.name) {
                    setScopeName(meRes.data.user.department.name);
                }
            }

            // If RH and scope is 'my_scope', pass it as query param
            const params = {};
            if (viewRole === 'rh' && activeScope === 'my_scope') {
                params.scope = 'my_scope';
            }

            const response = await axios.get('/requests', { params });
            setRequests(response.data.requests);
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    // Logic to identify "Missing Practical Application"
    const pendingPracticalApplications = requests.filter(req => {
        if (viewRole === 'collaborateur') {
            const isApproved = req.status === 'APPROVED' || req.status === 'PLANNED' || req.status === 'COMPLETED';
            const hasPlan = req.application_plan;
            const isPlanComplete = hasPlan && req.application_plan.progress === 100;
            return isApproved && (!hasPlan || !isPlanComplete);
        }
        if (viewRole === 'manager') {
            const hasPlan = req.application_plan;
            const isReviewed = hasPlan && req.application_plan.manager_reviewed_at;
            return hasPlan && !isReviewed;
        }
        return false;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500"></div>
            </div>
        );
    }

    // Stats Calculation
    const pendingCount = requests.filter(r => r.status.includes('PENDING') || r.status === 'PRIORITY_2').length;
    const approvedCount = requests.filter(r => r.status === 'APPROVED' || r.status === 'PLANNED').length;

    return (
        <div className="space-y-8">
            {/* Header Section with Welcome & Primary Action */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-serif font-bold text-navy-900 tracking-tight">
                        Bonjour, {user?.first_name}
                    </h1>
                    <p className="mt-2 text-navy-500 max-w-xl">
                        {viewRole === 'collaborateur' 
                            ? "Votre développement est une priorité. Voici un aperçu de votre activité formation."
                            : "Pilotez la montée en compétence de vos équipes."}
                    </p>
                </div>
                
                <div className="flex flex-wrap gap-3">
                    {/* RH Scope Toggles */}
                    {viewRole === 'rh' && (
                        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gold-100">
                            <button onClick={() => setActiveScope('my_scope')} className={clsx("px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2", activeScope === 'my_scope' ? "bg-navy-800 text-white shadow-md" : "text-navy-500 hover:text-navy-900 hover:bg-navy-50")}>
                                <UserCircle className="h-4 w-4" /> <span className="hidden sm:inline">Mon Périmètre</span>
                            </button>
                            <button onClick={() => setActiveScope('all')} className={clsx("px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2", activeScope === 'all' ? "bg-navy-800 text-white shadow-md" : "text-navy-500 hover:text-navy-900 hover:bg-navy-50")}>
                                <Building className="h-4 w-4" /> <span className="hidden sm:inline">Entreprise</span>
                            </button>
                        </div>
                    )}

                    {viewRole === 'collaborateur' && (
                        <Link to="/new-request" className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-lg shadow-gold-500/20 text-sm font-medium text-white bg-gold-500 hover:bg-gold-600 transition-all hover:-translate-y-0.5">
                            <Plus className="h-5 w-5 mr-2" />
                            Nouvelle demande
                        </Link>
                    )}
                </div>
            </div>

            {/* Alerts & Banners */}
            <div className="space-y-4">
                {pendingPracticalApplications.length > 0 && viewRole === 'collaborateur' && (
                    <MarqueeBanner message="⚠️ Mises en pratique en attente ! Complétez vos fiches pour valider vos acquis." type="warning" />
                )}
                {(viewRole === 'manager' || viewRole === 'collaborateur') && <ActiveCampaignBanner />}
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column: KPI & Quick Stats (2/3 width on large screens) */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gold-100 p-5 flex flex-col justify-between hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-navy-500">En attente</p>
                                    <p className="text-3xl font-serif font-bold text-navy-900 mt-1">{pendingCount}</p>
                                </div>
                                <div className="p-2 bg-gold-50 rounded-lg group-hover:bg-gold-100 transition-colors">
                                    <Clock className="h-5 w-5 text-gold-600" />
                                </div>
                            </div>
                             <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-gold-500 w-1/3"></div> {/* Fake progress for visual */}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gold-100 p-5 flex flex-col justify-between hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-navy-500">Validées</p>
                                    <p className="text-3xl font-serif font-bold text-navy-900 mt-1">{approvedCount}</p>
                                </div>
                                <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors">
                                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                                </div>
                            </div>
                            <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-2/3"></div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gold-100 p-5 flex flex-col justify-between hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-navy-500">Total</p>
                                    <p className="text-3xl font-serif font-bold text-navy-900 mt-1">{requests.length}</p>
                                </div>
                                <div className="p-2 bg-navy-50 rounded-lg group-hover:bg-navy-100 transition-colors">
                                    <TrendingUp className="h-5 w-5 text-navy-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Requests List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gold-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gold-100 bg-navy-50/30 flex justify-between items-center">
                            <h3 className="font-serif font-bold text-navy-900">Activité Récente</h3>
                            <Link to="/my-trainings" className="text-sm font-medium text-gold-600 hover:text-gold-700">Voir tout</Link>
                        </div>
                        {requests.length === 0 ? (
                            <div className="p-8 text-center text-navy-400">
                                <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
                                <p>Aucune activité récente.</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {requests.slice(0, 5).map((request) => (
                                    <li key={request.id} className="hover:bg-navy-50/50 transition-colors">
                                        <Link to={`/requests/${request.id}`} className="block px-6 py-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4 min-w-0">
                                                     <div className="h-10 w-10 flex-shrink-0 text-xs font-bold font-serif rounded-full bg-navy-900 text-gold-400 flex items-center justify-center border border-gold-500/30">
                                                        {request.user?.first_name?.charAt(0)}{request.user?.last_name?.charAt(0)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-navy-900 truncate">{request.title}</p>
                                                        <p className="text-xs text-navy-500">{new Date(request.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <StatusBadge status={request.status} />
                                                    <ArrowRight className="h-4 w-4 text-navy-300" />
                                                </div>
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Right Column: Widgets (1/3 width) */}
                <div className="space-y-6">
                    
                    {/* Skill Wallet Teaser */}
                    {viewRole === 'collaborateur' && (
                        <div className="bg-navy-900 rounded-xl p-6 text-white relative overflow-hidden group">
                             <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 rounded-full bg-gold-500/20 blur-3xl"></div>
                            
                            <div className="flex items-center gap-3 mb-4 relative z-10">
                                <div className="p-2 bg-white/10 rounded-lg">
                                    <ClipboardCheck className="h-5 w-5 text-gold-400" />
                                </div>
                                <h3 className="font-serif font-bold text-lg">Skill Wallet</h3>
                            </div>
                            <p className="text-sm text-navy-200 mb-4 relative z-10">
                                Retrouvez toutes vos certifications et compétences validées.
                            </p>
                            <Link to="/skill-wallet" className="inline-block w-full text-center py-2 bg-gold-500 hover:bg-gold-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors relative z-10">
                                Ouvrir mon portefeuille
                            </Link>
                        </div>
                    )}

                    {/* Pending Actions (if any) */}
                    {pendingPracticalApplications.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gold-100 p-5">
                            <h3 className="font-serif font-bold text-navy-900 mb-3 flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-red-500"></span>
                                À traiter
                            </h3>
                            <div className="space-y-3">
                                {pendingPracticalApplications.slice(0, 3).map(req => (
                                    <Link key={req.id} to={`/practical-application/${req.id}`} className="block p-3 bg-red-50 rounded-lg border border-red-100 hover:shadow-sm transition-all">
                                        <p className="text-sm font-medium text-navy-900 truncate">{req.title}</p>
                                        <p className="text-xs text-red-600 font-bold mt-1 uppercase">Mise en pratique manquante</p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
