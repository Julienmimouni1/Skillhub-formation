import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TeamBudget = () => {
    const [budgetStats, setBudgetStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBudgetStats = async () => {
            try {
                const response = await axios.get('/budget/team-stats');
                setBudgetStats(response.data);
            } catch (err) {
                console.error('Error fetching budget stats:', err);
                setError('Impossible de charger les données budgétaires.');
            } finally {
                setLoading(false);
            }
        };

        fetchBudgetStats();
    }, []);

    if (loading) return <div className="p-6">Chargement...</div>;
    if (error) return <div className="p-6 text-red-500">{error}</div>;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Budget Équipe</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Budget Initial */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-500">Budget Initial</h3>
                        <div className="p-2 bg-navy-50 rounded-lg">
                            <svg className="w-6 h-6 text-navy-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(budgetStats.initial)}</p>
                    <p className="text-xs text-gray-500 mt-1">Alloué pour l'année en cours</p>
                </div>

                {/* Budget Engagé */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-500">Budget Engagé</h3>
                        <div className="p-2 bg-yellow-50 rounded-lg">
                            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(budgetStats.engaged)}</p>
                    <p className="text-xs text-gray-500 mt-1">Formations validées ou planifiées</p>
                </div>

                {/* Budget Consommé */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-500">Budget Consommé</h3>
                        <div className="p-2 bg-green-50 rounded-lg">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(budgetStats.consumed)}</p>
                    <p className="text-xs text-gray-500 mt-1">Formations réalisées</p>
                </div>

                {/* Budget Restant */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-500">Budget Restant</h3>
                        <div className="p-2 bg-navy-50 rounded-lg">
                            <svg className="w-6 h-6 text-navy-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                            </svg>
                        </div>
                    </div>
                    <p className={`text-2xl font-bold ${budgetStats.remaining < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                        {formatCurrency(budgetStats.remaining)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Disponible pour nouvelles demandes</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-8 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Utilisation du Budget</h3>
                <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-navy-600 bg-navy-200">
                                Progression
                            </span>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-semibold inline-block text-navy-600">
                                {Math.min(100, Math.round(((budgetStats.engaged + budgetStats.consumed) / budgetStats.initial) * 100))}%
                            </span>
                        </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-navy-200">
                        <div style={{ width: `${Math.min(100, (budgetStats.consumed / budgetStats.initial) * 100)}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500" title="Consommé"></div>
                        <div style={{ width: `${Math.min(100, (budgetStats.engaged / budgetStats.initial) * 100)}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-yellow-500" title="Engagé"></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div> Consommé
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div> Engagé
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-navy-200 rounded-full mr-1"></div> Restant
                        </div>
                    </div>
                </div>
            </div>

            {/* Regulatory & Performance KPIs */}
            {budgetStats.kpis && (
                <div className="mt-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Pilotage & Réglementaire</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Taux d'accès (Participation) */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-navy-400 to-navy-500"></div>
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Taux d'accès à la formation</h3>
                            <div className="relative h-32 w-32 flex items-center justify-center">
                                <svg className="transform -rotate-90 w-full h-full">
                                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100" />
                                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent"
                                        strokeDasharray={351.86}
                                        strokeDashoffset={351.86 - (351.86 * budgetStats.kpis.participationRate) / 100}
                                        className="text-navy-600 transition-all duration-1000 ease-out"
                                    />
                                </svg>
                                <span className="absolute text-2xl font-bold text-gray-900">{budgetStats.kpis.participationRate}%</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2 text-center">
                                {budgetStats.kpis.trainedCount} collaborateurs formés sur {budgetStats.kpis.teamSize}
                            </p>
                        </div>

                        {/* Volume de Formation (Heures) */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-4">Volume de Formation</h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold text-gray-900">{budgetStats.kpis.totalTrainingHours}</span>
                                    <span className="text-sm text-gray-500">heures</span>
                                </div>
                            </div>
                            <div className="mt-4">
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>Total Jours</span>
                                    <span>{budgetStats.kpis.totalTrainingDays} j</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5">
                                    <div
                                        className="bg-teal-500 h-1.5 rounded-full"
                                        style={{ width: `${Math.min(100, ((budgetStats.kpis.totalTrainingDays / budgetStats.kpis.teamSize) / 3) * 100)}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-400 mt-1 text-right">Moyenne: {(budgetStats.kpis.totalTrainingHours / (budgetStats.kpis.teamSize || 1)).toFixed(0)}h / collab</p>
                            </div>
                        </div>

                        {/* Répartition Obligatoire / Non-Obligatoire */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-500"></div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-4">Type de Formation</h3>
                                {(() => {
                                    const obligatory = budgetStats.kpis.budgetByType.find(b => b.type === 'OBLIGATOIRE')?.amount || 0;
                                    const total = budgetStats.engaged + budgetStats.consumed;
                                    const percentObligatory = total > 0 ? Math.round((obligatory / total) * 100) : 0;

                                    return (
                                        <>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-4xl font-bold text-gray-900">{percentObligatory}%</span>
                                                <span className="text-sm text-gray-500">Obligatoire</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                                                <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${percentObligatory}%` }}></div>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                {100 - percentObligatory}% Développement des compétences
                                            </p>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>

                    {/* Budget Distribution Chart */}
                    <div className="mt-6 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <h3 className="text-sm font-medium text-gray-500 mb-6">Répartition Stratégique du Budget</h3>
                        <div className="space-y-4">
                            {budgetStats.kpis.budgetByType.map((item) => (
                                <div key={item.type}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-gray-700">
                                            {item.type === 'OBLIGATOIRE' ? 'Formation Obligatoire / Sécurité' :
                                                item.type === 'PLAN_DEV' ? 'Plan de Développement des Compétences' :
                                                    item.type === 'CPF_CO' ? 'Co-construction CPF' : item.type}
                                        </span>
                                        <span className="font-bold text-gray-900">{formatCurrency(item.amount)}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                                        <div
                                            className={`h-2.5 rounded-full ${item.type === 'OBLIGATOIRE' ? 'bg-red-500' :
                                                item.type === 'PLAN_DEV' ? 'bg-navy-500' : 'bg-navy-500'
                                                }`}
                                            style={{ width: `${Math.min(100, (item.amount / (budgetStats.engaged + budgetStats.consumed)) * 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                            {budgetStats.kpis.budgetByType.length === 0 && (
                                <p className="text-sm text-gray-400 italic text-center">Aucune donnée de répartition disponible.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamBudget;
