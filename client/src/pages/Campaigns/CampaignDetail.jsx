import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, CheckCircle, XCircle, Clock, Filter, Download } from 'lucide-react';

const CampaignDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [campaign, setCampaign] = useState(null);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, cost: 0, approved: 0 });

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const campaignRes = await axios.get('/campaigns');
            const foundCampaign = campaignRes.data.find(c => c.id === parseInt(id));
            setCampaign(foundCampaign);

            const requestsRes = await axios.get(`/requests?campaign_id=${id}`);
            setRequests(requestsRes.data.requests);

            const totalCost = requestsRes.data.requests.reduce((acc, r) => acc + parseFloat(r.cost || 0), 0);
            const approvedCount = requestsRes.data.requests.filter(r => r.status === 'APPROVED' || r.status === 'PLANNED').length;
            setStats({
                total: requestsRes.data.requests.length,
                cost: totalCost,
                approved: approvedCount
            });

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleArbitration = async (requestId, action, comment = '') => {
        try {
            await axios.post(`/requests/${requestId}/validate`, {
                action,
                comment
            });
            fetchData();
        } catch (error) {
            alert('Erreur lors de l\'arbitrage');
        }
    };

    const handleExport = async () => {
        try {
            const response = await axios.get(`/requests/actions/export?campaign_id=${id}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `campagne_${id}_export.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert('Erreur lors de l\'export');
        }
    };

    if (loading) return <div className="p-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-600"></div></div>;
    if (!campaign) return <div className="p-6 text-center text-gray-500">Campagne introuvable</div>;

    const budgetProgress = campaign.budget_target ? Math.min((stats.cost / campaign.budget_target) * 100, 100) : 0;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <button onClick={() => navigate('/campaigns')} className="flex items-center text-gray-500 hover:text-gray-700 mb-6 transition-colors">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux campagnes
            </button>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-gray-900">{campaign.title}</h1>
                            {campaign.status === 'OPEN' && <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold uppercase tracking-wide rounded-full">En cours</span>}
                            {campaign.status === 'DRAFT' && <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-bold uppercase tracking-wide rounded-full">Brouillon</span>}
                            {campaign.status === 'CLOSED' && <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-bold uppercase tracking-wide rounded-full">Clôturée</span>}
                        </div>
                        <p className="text-gray-500 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Du {new Date(campaign.start_date).toLocaleDateString()} au {new Date(campaign.end_date).toLocaleDateString()}
                        </p>
                    </div>

                    {campaign.status === 'OPEN' && (
                        <button
                            onClick={async () => {
                                if (confirm('Voulez-vous vraiment clôturer cette campagne ? Les managers ne pourront plus soumettre de besoins.')) {
                                    await axios.put(`/campaigns/${campaign.id}/close`);
                                    fetchData();
                                }
                            }}
                            className="mt-4 md:mt-0 px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl font-medium transition-colors border border-red-200"
                        >
                            Clôturer la campagne
                        </button>
                    )}
                    {campaign.status === 'DRAFT' && (
                        <button
                            onClick={async () => {
                                if (confirm('Voulez-vous vraiment ouvrir cette campagne ? Elle sera visible par tous les collaborateurs.')) {
                                    await axios.put(`/campaigns/${campaign.id}/open`);
                                    fetchData();
                                }
                            }}
                            className="mt-4 md:mt-0 px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-xl font-medium transition-colors border border-green-200"
                        >
                            Ouvrir la campagne
                        </button>
                    )}
                </div>

                {campaign.description && (
                    <div className="bg-navy-50 rounded-xl p-4 mb-6 border border-navy-100">
                        <h3 className="text-sm font-semibold text-navy-900 mb-1">Contexte & Objectifs</h3>
                        <p className="text-navy-800 text-sm whitespace-pre-line">{campaign.description}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Budget Engagé</p>
                        <div className="flex items-end gap-2">
                            <p className="text-2xl font-bold text-navy-600">{stats.cost.toLocaleString()} €</p>
                            {campaign.budget_target && <span className="text-sm text-gray-400 mb-1">/ {campaign.budget_target.toLocaleString()} €</span>}
                        </div>
                        {campaign.budget_target && (
                            <div className="mt-3 w-full bg-gray-100 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all duration-500 ${budgetProgress > 100 ? 'bg-red-500' : 'bg-navy-500'}`}
                                    style={{ width: `${budgetProgress}%` }}
                                ></div>
                            </div>
                        )}
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Total Demandes</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Taux d'approbation</p>
                        <p className="text-2xl font-bold text-green-600">
                            {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-900">Arbitrage des besoins</h3>
                    <button
                        onClick={handleExport}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Exporter CSV
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Titre / Demandeur</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Coût</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Priorité</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {requests.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">Aucune demande pour le moment.</td>
                                </tr>
                            ) : (
                                requests.map((request) => (
                                    <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{request.title}</div>
                                            <div className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                                                <span className="font-medium">{request.user.first_name} {request.user.last_name}</span>
                                                <span>•</span>
                                                <span>{request.department.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                            {request.cost} €
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-navy-50 text-navy-700 border border-navy-100">
                                                Normal
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full border ${request.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-100' :
                                                request.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-100' :
                                                    'bg-yellow-50 text-yellow-700 border-yellow-100'
                                                }`}>
                                                {request.status === 'PENDING_RH' ? 'À Valider' : request.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {request.status === 'PENDING_RH' && (
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleArbitration(request.id, 'APPROVED')}
                                                        className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 p-1.5 rounded-lg transition-colors"
                                                        title="Valider"
                                                    >
                                                        <CheckCircle className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const reason = prompt("Motif du refus ?");
                                                            if (reason) handleArbitration(request.id, 'REJECTED', reason);
                                                        }}
                                                        className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-1.5 rounded-lg transition-colors"
                                                        title="Refuser"
                                                    >
                                                        <XCircle className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CampaignDetail;
