import { useState, useEffect } from 'react';
// import { Star, AlertCircle } from 'lucide-react'; // Commented out for debug

export default function ManagerEvaluationForm({ onSubmit, onCancel }) {
    console.log('ManagerEvaluationForm mounting');
    const [evaluation, setEvaluation] = useState({
        alignment_strategy: 3,
        competence_gap: 3,
        operational_impact: 3,
        roe_expectation: 3,
        content_relevance: 3,
        comment: ''
    });

    const [score, setScore] = useState(0);

    const criteria = [
        {
            key: 'alignment_strategy',
            label: 'Alignement avec la stratégie',
            description: 'La formation est-elle en lien avec les priorités stratégiques ?',
            weight: 3,
            importance: 'Très important'
        },
        {
            key: 'competence_gap',
            label: 'Écart de compétences',
            description: 'Existe-t-il un écart de compétences significatif justifiant la formation ?',
            weight: 3,
            importance: 'Très important'
        },
        {
            key: 'operational_impact',
            label: 'Impact opérationnel attendu',
            description: 'Quel impact sur la performance du collaborateur ou de l\'équipe ?',
            weight: 2,
            importance: 'Important'
        },
        {
            key: 'roe_expectation',
            label: 'Retour sur les attentes (ROE)',
            description: 'Le coût est-il justifié par les bénéfices attendus ?',
            weight: 2,
            importance: 'Important'
        },
        {
            key: 'content_relevance',
            label: 'Pertinence du contenu',
            description: 'Le contenu est-il adapté aux besoins spécifiques ?',
            weight: 1,
            importance: 'Moyen'
        }
    ];

    useEffect(() => {
        let totalScore = 0;
        criteria.forEach(c => {
            totalScore += evaluation[c.key] * c.weight;
        });
        setScore(totalScore);
    }, [evaluation]);

    const handleChange = (key, value) => {
        setEvaluation(prev => ({ ...prev, [key]: parseInt(value) }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ ...evaluation, score });
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Évaluation de la demande</h3>
            <p className="text-sm text-gray-500 mb-6">
                Veuillez évaluer la pertinence de cette formation selon les critères suivants avant validation.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                {criteria.map((c) => (
                    <div key={c.key} className="border-b border-gray-100 pb-4 last:border-0">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-900">{c.label}</label>
                                <p className="text-xs text-gray-500 mt-1">{c.description}</p>
                            </div>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                Coeff. {c.weight}
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min="1"
                                max="5"
                                value={evaluation[c.key]}
                                onChange={(e) => handleChange(c.key, e.target.value)}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-navy-600"
                            />
                            <span className="text-lg font-bold text-navy-600 w-8 text-center">{evaluation[c.key]}</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>Faible</span>
                            <span>Élevé</span>
                        </div>
                    </div>
                ))}

                <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Commentaire (Optionnel)</label>
                    <textarea
                        value={evaluation.comment}
                        onChange={(e) => setEvaluation(prev => ({ ...prev, comment: e.target.value }))}
                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-navy-500 focus:ring-navy-500 sm:text-sm"
                        rows={3}
                        placeholder="Précisions sur l'évaluation..."
                    />
                </div>

                <div className="bg-navy-50 rounded-xl p-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-navy-900">Score de pertinence</span>
                    <span className="text-2xl font-bold text-navy-600">{score} / 55</span>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-navy-600 border border-transparent rounded-xl hover:bg-navy-700 shadow-sm"
                    >
                        Valider et Approuver
                    </button>
                </div>
            </form>
        </div>
    );
}
