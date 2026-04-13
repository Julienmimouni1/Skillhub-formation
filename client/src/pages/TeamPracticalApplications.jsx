import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    Loader2,
    Search,
    Filter,
    ClipboardCheck,
    User,
    Calendar,
    ArrowRight,
    CheckCircle
} from 'lucide-react';
import clsx from 'clsx';

export default function TeamPracticalApplications() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchTeamRequests();
    }, []);

    const fetchTeamRequests = async () => {
        try {
            const { data } = await axios.get('/requests');
            // Filter for team members (not self) and validated statuses
            const teamRequests = data.requests.filter(req =>
                req.user_id !== user.id &&
                ['APPROVED', 'PLANNED', 'COMPLETED'].includes(req.status)
            );
            setRequests(teamRequests);
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredRequests = requests.filter(req =>
        req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${req.user.first_name} ${req.user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin h-8 w-8 text-navy-600" />
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Mise en pratique de l'équipe</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Suivez l'application des compétences de vos collaborateurs après leurs formations.
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher un collaborateur ou une formation..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-navy-500 focus:border-navy-500 sm:text-sm"
                    />
                </div>
            </div>

            {/* Grid */}
            {filteredRequests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRequests.map((request) => (
                        <div key={request.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col">
                            <div className="p-6 flex-1">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-navy-50 flex items-center justify-center text-navy-600 font-bold">
                                            {request.user.first_name[0]}{request.user.last_name[0]}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-900">
                                                {request.user.first_name} {request.user.last_name}
                                            </h3>
                                            <p className="text-xs text-gray-500">{request.department?.name}</p>
                                        </div>
                                    </div>
                                    <span className={clsx(
                                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                        request.status === 'COMPLETED' ? "bg-navy-50 text-navy-700" : "bg-green-50 text-green-700"
                                    )}>
                                        {request.status === 'COMPLETED' ? 'Terminée' : 'Validée'}
                                    </span>
                                </div>

                                <h4 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
                                    {request.title}
                                </h4>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center text-xs text-gray-500">
                                        <Calendar className="h-3.5 w-3.5 mr-2" />
                                        {new Date(request.created_at).toLocaleDateString()}
                                    </div>
                                </div>

                                {/* Impact Score Badge - Visible if validated */}
                                {request.application_plan?.manager_reviewed_at && (
                                    <div className="flex items-center justify-between mb-4 bg-gray-50 p-2 rounded-lg border border-gray-100">
                                        <span className="text-xs font-semibold text-gray-600">Score d'impact</span>
                                        <div className="flex items-center gap-1">
                                            <span className="text-sm font-bold text-navy-600">
                                                {request.application_plan.impact_score || 0}/100
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-xl">
                                <button
                                    onClick={() => navigate(`/practical-application/${request.id}`)}
                                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-navy-600 hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500 transition-colors"
                                >
                                    <ClipboardCheck className="h-4 w-4 mr-2" />
                                    Voir le plan d'action
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
                    <ClipboardCheck className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune formation trouvée</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Aucune formation validée pour votre équipe correspondant à vos critères.
                    </p>
                </div>
            )}
        </div>
    );
}
