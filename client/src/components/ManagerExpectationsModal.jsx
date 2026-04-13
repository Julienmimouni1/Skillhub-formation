import { useState } from 'react';
import { Target, AlertCircle } from 'lucide-react';

export default function ManagerExpectationsModal({ onSubmit, onCancel, evaluationData }) {
    const [expectations, setExpectations] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        if (!expectations.trim()) {
            setError('Les attentes et objectifs sont obligatoires');
            return;
        }
        onSubmit({ ...evaluationData, manager_expectations: expectations });
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-navy-100 p-3 rounded-lg">
                    <Target className="w-6 h-6 text-navy-600" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Attentes & Objectifs</h3>
                    <p className="text-sm text-gray-500">Définissez ce que vous attendez du collaborateur après cette formation</p>
                </div>
            </div>

            <div className="bg-navy-50 border border-navy-100 rounded-lg p-4 mb-6">
                <div className="flex gap-2">
                    <AlertCircle className="w-5 h-5 text-navy-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-navy-800">
                        <p className="font-semibold mb-1">Pourquoi c'est important ?</p>
                        <p>Ces objectifs serviront de référence pour évaluer l'impact réel de la formation. Ils seront visibles par le collaborateur et discutés lors du bilan post-formation.</p>
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quels sont vos objectifs concrets pour ce collaborateur ? <span className="text-red-500">*</span>
                </label>
                <textarea
                    value={expectations}
                    onChange={(e) => {
                        setExpectations(e.target.value);
                        setError('');
                    }}
                    rows={6}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-navy-500 focus:ring-navy-500 p-4"
                    placeholder="Exemples :&#10;- Être capable de mener une réunion en anglais sans support écrit d'ici 3 mois&#10;- Réduire le temps de traitement des dossiers de 20%&#10;- Former 2 collègues sur les nouvelles compétences acquises"
                />
                {error && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </p>
                )}
                <p className="mt-2 text-xs text-gray-500">
                    Soyez spécifique et mesurable. Ces objectifs seront utilisés pour évaluer le ROI de la formation.
                </p>
            </div>

            <div className="flex justify-end gap-3">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                    Annuler
                </button>
                <button
                    onClick={handleSubmit}
                    className="px-6 py-2 text-sm font-medium text-white bg-navy-600 hover:bg-navy-700 rounded-lg shadow-sm transition-all"
                >
                    Valider et Approuver
                </button>
            </div>
        </div>
    );
}
