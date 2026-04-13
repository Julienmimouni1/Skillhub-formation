import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Plus, Calendar, AlertCircle, CheckCircle } from 'lucide-react';

const CampaignList = () => {
    const { user } = useAuth();
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showGuide, setShowGuide] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        budget_target: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            const { data } = await axios.get('/campaigns');
            setCampaigns(data);
        } catch (error) {
            console.error('Error fetching campaigns:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await axios.post('/campaigns', formData);
            setSuccess('Campagne créée avec succès !');
            setShowModal(false);
            setFormData({ title: '', description: '', start_date: '', end_date: '', budget_target: '' });
            fetchCampaigns();
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la création');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const getStatusBadge = (status) => {
        const styles = {
            DRAFT: 'bg-gray-100 text-gray-800',
            OPEN: 'bg-green-100 text-green-800',
            CLOSED: 'bg-red-100 text-red-800'
        };
        const labels = {
            DRAFT: 'Brouillon',
            OPEN: 'Ouverte',
            CLOSED: 'Clôturée'
        };
        return (
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status]}`}>
                {labels[status]}
            </span>
        );
    };

    if (loading) return <div className="p-6 text-center">Chargement...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Campagnes de Recueil</h1>
                    <p className="text-gray-500 mt-2 text-lg">Gérez les périodes de collecte des besoins de formation.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowGuide(!showGuide)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all"
                    >
                        <AlertCircle className="h-5 w-5 mr-2 text-navy-500" />
                        Guide RH
                    </button>
                    {user.role === 'rh' && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-navy-600 hover:bg-navy-700 transition-all"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Nouvelle Campagne
                        </button>
                    )}
                </div>
            </div>

            {showGuide && (
                <div className="mb-8 bg-navy-50 border border-navy-100 rounded-2xl p-6 relative">
                    <button onClick={() => setShowGuide(false)} className="absolute top-4 right-4 text-navy-400 hover:text-navy-600">
                        <span className="sr-only">Fermer</span>
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                    <h3 className="text-lg font-semibold text-navy-900 mb-2">Comment fonctionne une campagne ?</h3>
                    <div className="grid md:grid-cols-3 gap-6 text-navy-800 text-sm">
                        <div>
                            <span className="font-bold block mb-1">1. Création & Lancement</span>
                            Définissez les dates et le budget cible. La campagne commence en statut "Brouillon". Une fois prête, passez-la en "Ouverte" pour permettre aux collaborateurs de soumettre leurs demandes.
                        </div>
                        <div>
                            <span className="font-bold block mb-1">2. Collecte & Validation</span>
                            Les collaborateurs saisissent leurs vœux. Les managers valident et priorisent les demandes de leurs équipes. Vous suivez l'évolution du budget en temps réel.
                        </div>
                        <div>
                            <span className="font-bold block mb-1">3. Clôture & Arbitrage</span>
                            Une fois la date de fin atteinte, clôturez la campagne. Vous pourrez alors arbitrer les demandes finales et générer le plan de formation.
                        </div>
                    </div>
                </div>
            )}

            {error && <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-xl flex items-center border border-red-100"><AlertCircle className="h-5 w-5 mr-2" />{error}</div>}
            {success && <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-xl flex items-center border border-green-100"><CheckCircle className="h-5 w-5 mr-2" />{success}</div>}

            <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Titre</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Période</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Budget Cible</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Créée le</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {campaigns.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                    <div className="flex flex-col items-center justify-center">
                                        <Calendar className="h-12 w-12 text-gray-300 mb-3" />
                                        <p>Aucune campagne trouvée.</p>
                                        {user.role === 'rh' && <p className="text-sm mt-1">Commencez par en créer une nouvelle.</p>}
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            campaigns.map((campaign) => (
                                <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        <a href={`/campaigns/${campaign.id}`} className="text-navy-600 hover:text-navy-900 hover:underline">
                                            {campaign.title}
                                        </a>
                                        {campaign.description && <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{campaign.description}</p>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(campaign.start_date).toLocaleDateString()} - {new Date(campaign.end_date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {campaign.budget_target ? `${campaign.budget_target} €` : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(campaign.status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(campaign.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <a href={`/campaigns/${campaign.id}`} className="text-navy-600 hover:text-navy-900 bg-navy-50 hover:bg-navy-100 px-3 py-1 rounded-lg transition-colors">Gérer</a>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={() => setShowModal(false)}></div>

                    <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 transform transition-all scale-100 overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <div className="p-2 bg-navy-100 rounded-lg">
                                    <Calendar className="h-5 w-5 text-navy-600" />
                                </div>
                                Nouvelle Campagne
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-500 transition-colors">
                                <span className="sr-only">Fermer</span>
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Titre de la campagne</label>
                                <input type="text" name="title" value={formData.title} onChange={handleChange} required className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-navy-500 focus:border-navy-500 sm:text-sm" placeholder="Ex: Plan de formation 2026" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description / Instructions</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-navy-500 focus:border-navy-500 sm:text-sm" placeholder="Instructions pour les managers et collaborateurs..."></textarea>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                                    <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} required className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-navy-500 focus:border-navy-500 sm:text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                                    <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} required className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-navy-500 focus:border-navy-500 sm:text-sm" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Budget Cible (€)</label>
                                <input type="number" name="budget_target" value={formData.budget_target} onChange={handleChange} className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-navy-500 focus:border-navy-500 sm:text-sm" placeholder="Optionnel" />
                            </div>

                            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors">
                                    Annuler
                                </button>
                                <button type="submit" className="px-4 py-2 bg-navy-600 text-white rounded-lg hover:bg-navy-700 font-medium shadow-sm transition-colors">
                                    Créer la campagne
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CampaignList;
