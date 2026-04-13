import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ClipboardCheck, ArrowRight, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function PracticalApplicationPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            // Fetch requests for the user (assuming endpoint exists and returns user's requests)
            // Filtering for APPROVED, PLANNED, COMPLETED
            const response = await axios.get('/requests', { withCredentials: true });
            const validStatuses = ['APPROVED', 'PLANNED', 'COMPLETED'];
            // API returns { requests: [...] }
            const filtered = (response.data.requests || []).filter(r => validStatuses.includes(r.status));
            setRequests(filtered);
        } catch (error) {
            console.error("Error fetching requests:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Chargement...</div>;

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Ma mise en pratique</h1>
                <p className="text-gray-500 mt-1">Suivez l'application de vos formations et définissez vos plans d'action.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {requests.map(request => (
                    <div key={request.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-2 bg-navy-50 rounded-lg text-navy-600">
                                <ClipboardCheck className="w-6 h-6" />
                            </div>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${request.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                request.status === 'PLANNED' ? 'bg-navy-100 text-navy-800' :
                                    'bg-navy-100 text-navy-800'
                                }`}>
                                {request.status}
                            </span>
                        </div>

                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{request.title}</h3>

                        <div className="flex items-center text-sm text-gray-500 mb-4">
                            <Calendar className="w-4 h-4 mr-2" />
                            {request.start_date ? new Date(request.start_date).toLocaleDateString() : 'Date à définir'}
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

                        <button
                            onClick={() => navigate(`/practical-application/${request.id}`)}
                            className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-navy-700 bg-navy-50 hover:bg-navy-100 transition-colors"
                        >
                            Voir le plan d'action
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </button>
                    </div>
                ))}

                {requests.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                        <ClipboardCheck className="mx-auto h-12 w-12 text-gray-300" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune formation à suivre</h3>
                        <p className="mt-1 text-sm text-gray-500">Vos formations validées apparaîtront ici.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
