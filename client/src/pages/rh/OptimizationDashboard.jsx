import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingDown, Users, ArrowRight, Loader } from 'lucide-react';

const OptimizationDashboard = () => {
    const [opportunities, setOpportunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOpportunities = async () => {
            try {
                const response = await axios.get('/optimization/opportunities');
                setOpportunities(response.data);
            } catch (err) {
                console.error('Error fetching optimization opportunities:', err);
                setError('Impossible de charger les opportunités d\'optimisation.');
            } finally {
                setLoading(false);
            }
        };

        fetchOpportunities();
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <Loader className="w-8 h-8 text-navy-600 animate-spin" />
        </div>
    );

    if (error) return (
        <div className="p-6 bg-red-50 text-red-700 rounded-lg">
            {error}
        </div>
    );

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Optimisation des Sessions</h1>
                <p className="mt-2 text-gray-600">
                    Détection automatique des opportunités de regroupement pour réduire les coûts.
                </p>
            </div>

            {opportunities.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
                    <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Aucune opportunité détectée</h3>
                    <p className="mt-2 text-gray-500">
                        Le système n'a pas trouvé de groupes de demandes similaires (5+) éligibles à une session intra.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {opportunities.map((opp, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-navy-50 rounded-lg">
                                        <Users className="w-6 h-6 text-navy-600" />
                                    </div>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        {opp.count} demandes
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2" title={opp.title}>
                                    {opp.title}
                                </h3>

                                <div className="space-y-3 mt-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Coût actuel (cumulé)</span>
                                        <span className="font-medium text-gray-900">{formatCurrency(opp.totalCost)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Estim. Session Intra</span>
                                        <span className="font-medium text-gray-900">{formatCurrency(opp.estimatedSessionCost)}</span>
                                    </div>
                                    <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                                        <span className="text-sm font-medium text-green-600">Économie potentielle</span>
                                        <span className="text-lg font-bold text-green-600">{formatCurrency(opp.potentialSavings)}</span>
                                    </div>
                                </div>

                                <button
                                    className="mt-6 w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-navy-600 hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500"
                                    onClick={() => alert('Fonctionnalité de conversion bientôt disponible !')}
                                >
                                    Convertir en Session Intra
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </button>
                            </div>
                            <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
                                <p className="text-xs text-gray-500 text-center">
                                    Basé sur une réduction estimée de 35%
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Helper icon component since CheckCircle was used but not imported in the empty state
const CheckCircle = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

export default OptimizationDashboard;
