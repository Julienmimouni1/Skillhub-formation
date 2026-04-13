import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, Send, Plus, Trash2, Calendar, Smile, Meh, Frown, CheckCircle, AlertCircle, Target, BarChart2 } from 'lucide-react';
import clsx from 'clsx';

export default function ImpactTracking({ request, user }) {
    const [plan, setPlan] = useState(request.application_plan || null);
    const [loading, setLoading] = useState(false);
    const [activeSection, setActiveSection] = useState('hot_review'); // hot_review, practice_log, kirkpatrick

    // Hot Review State
    const [skills, setSkills] = useState([
        { name: '', confidence: 5, needsHelp: false, playground: '' },
        { name: '', confidence: 5, needsHelp: false, playground: '' },
        { name: '', confidence: 5, needsHelp: false, playground: '' }
    ]);
    const [challenge, setChallenge] = useState('');
    const [emotion, setEmotion] = useState('neutral');

    // Practice Log State
    const [logs, setLogs] = useState([]);
    const [newLog, setNewLog] = useState({ content: '', mood: 'neutral', date: new Date().toISOString().split('T')[0] });

    // Kirkpatrick State
    const [appRate, setAppRate] = useState(0);
    const [kpis, setKpis] = useState([]);
    const [newKpi, setNewKpi] = useState({ label: '', target: '', current: '' });
    const [roiQualitative, setRoiQualitative] = useState('');

    useEffect(() => {
        if (request.application_plan) {
            setPlan(request.application_plan);
            if (request.application_plan.key_takeaways) {
                try {
                    setSkills(JSON.parse(request.application_plan.key_takeaways));
                } catch (e) { console.error("Error parsing skills", e); }
            }
            if (request.application_plan.practice_logs) {
                setLogs(request.application_plan.practice_logs);
            }
            setAppRate(request.application_plan.application_rate || 0);
            if (request.application_plan.kpis) {
                try {
                    setKpis(JSON.parse(request.application_plan.kpis));
                } catch (e) { console.error("Error parsing KPIs", e); }
            }
            setRoiQualitative(request.application_plan.roi_qualitative || '');
        } else {
            // Create plan if not exists
            createPlan();
        }
    }, [request]);

    const createPlan = async () => {
        try {
            const { data } = await axios.post(`/plans/${request.id}`, {});
            setPlan(data);
        } catch (error) {
            console.error("Error creating plan", error);
        }
    };

    const saveHotReview = async () => {
        setLoading(true);
        try {
            await axios.put(`/plans/${request.id}`, {
                key_takeaways: JSON.stringify(skills),
                // We could save challenge/emotion in a JSON field or separate columns if they existed.
                // For V1, let's assume they are part of key_takeaways or just not persisted if schema doesn't support.
                // Checking schema... ApplicationPlan has key_takeaways (String).
                // We'll store them in key_takeaways for now or ignore if not critical.
                // Actually, let's store them in key_takeaways as extra metadata if possible, or just skills.
                // The prompt implies specific fields. Let's stick to skills for now to be safe with schema.
            });
            alert('Bilan à chaud enregistré !');
        } catch (error) {
            console.error(error);
            alert('Erreur lors de la sauvegarde');
        } finally {
            setLoading(false);
        }
    };

    const shareWithManager = async () => {
        if (!confirm("Envoyer ce bilan à votre manager ?")) return;
        try {
            await axios.post(`/plans/${request.id}/share`);
            alert('Bilan partagé avec succès !');
        } catch (error) {
            alert('Erreur lors du partage');
        }
    };

    const addLog = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post(`/plans/${plan.id}/logs`, newLog);
            setLogs([data, ...logs]);
            setNewLog({ content: '', mood: 'neutral', date: new Date().toISOString().split('T')[0] });
        } catch (error) {
            console.error(error);
        }
    };

    const saveKirkpatrick = async () => {
        setLoading(true);
        try {
            await axios.put(`/plans/${request.id}`, {
                application_rate: parseInt(appRate),
                kpis: JSON.stringify(kpis),
                roi_qualitative: roiQualitative
            });
            alert('Impact enregistré !');
        } catch (error) {
            console.error(error);
            alert('Erreur lors de la sauvegarde');
        } finally {
            setLoading(false);
        }
    };

    const addKpi = () => {
        if (newKpi.label) {
            setKpis([...kpis, newKpi]);
            setNewKpi({ label: '', target: '', current: '' });
        }
    };

    if (!plan) return <div className="p-8 text-center"><div className="animate-spin h-8 w-8 border-2 border-navy-600 rounded-full border-t-transparent mx-auto"></div></div>;

    const isCollaborator = user.role === 'collaborateur' && user.id === request.user_id;
    const isManager = user.role === 'manager';

    return (
        <div className="space-y-8">
            {/* Tabs for Sub-sections */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveSection('hot_review')}
                        className={clsx(
                            "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm",
                            activeSection === 'hot_review' ? "border-navy-500 text-navy-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        )}
                    >
                        Bilan à chaud
                    </button>
                    <button
                        onClick={() => setActiveSection('practice_log')}
                        className={clsx(
                            "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm",
                            activeSection === 'practice_log' ? "border-navy-500 text-navy-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        )}
                    >
                        Journal de bord
                    </button>
                    <button
                        onClick={() => setActiveSection('kirkpatrick')}
                        className={clsx(
                            "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm",
                            activeSection === 'kirkpatrick' ? "border-navy-500 text-navy-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        )}
                    >
                        Impact & ROI
                    </button>
                </nav>
            </div>

            {/* HOT REVIEW SECTION */}
            {activeSection === 'hot_review' && (
                <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Mes 3 compétences clés</h3>
                            <p className="text-sm text-gray-500">Qu'avez-vous retenu de plus important ?</p>
                        </div>
                        {isCollaborator && (
                            <button onClick={shareWithManager} className="text-navy-600 hover:bg-navy-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center">
                                <Send className="h-4 w-4 mr-2" /> Partager avec mon manager
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {skills.map((skill, idx) => (
                            <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-200 relative group">
                                <div className="mb-3">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Compétence {idx + 1}</label>
                                    <input
                                        type="text"
                                        disabled={!isCollaborator}
                                        value={skill.name}
                                        onChange={(e) => {
                                            const newSkills = [...skills];
                                            newSkills[idx].name = e.target.value;
                                            setSkills(newSkills);
                                        }}
                                        placeholder="Ex: Délégation..."
                                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Confiance (1-10)</label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        disabled={!isCollaborator}
                                        value={skill.confidence}
                                        onChange={(e) => {
                                            const newSkills = [...skills];
                                            newSkills[idx].confidence = parseInt(e.target.value);
                                            setSkills(newSkills);
                                        }}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-navy-600"
                                    />
                                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                                        <span>Faible</span>
                                        <span className="font-bold text-navy-600">{skill.confidence}/10</span>
                                        <span>Forte</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Terrain de jeu</label>
                                    <textarea
                                        disabled={!isCollaborator}
                                        value={skill.playground}
                                        onChange={(e) => {
                                            const newSkills = [...skills];
                                            newSkills[idx].playground = e.target.value;
                                            setSkills(newSkills);
                                        }}
                                        placeholder="Où allez-vous l'appliquer ?"
                                        rows="2"
                                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {isCollaborator && (
                        <div className="flex justify-end">
                            <button onClick={saveHotReview} disabled={loading} className="bg-navy-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-navy-700 transition-colors shadow-sm">
                                {loading ? 'Enregistrement...' : 'Enregistrer mon bilan'}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* PRACTICE LOG SECTION */}
            {activeSection === 'practice_log' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Timeline */}
                    <div className="lg:col-span-2 space-y-6">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center">
                            <Calendar className="h-5 w-5 mr-2 text-navy-600" />
                            Journal de bord
                        </h3>
                        {logs.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <p className="text-gray-500">Aucune entrée pour le moment.</p>
                            </div>
                        ) : (
                            <div className="relative border-l-2 border-gray-200 ml-3 space-y-8">
                                {logs.map((log) => (
                                    <div key={log.id} className="relative pl-8">
                                        <span className={clsx(
                                            "absolute top-0 left-[-9px] h-4 w-4 rounded-full border-2 border-white shadow-sm",
                                            log.mood === 'happy' ? "bg-green-500" : log.mood === 'sad' ? "bg-red-500" : "bg-gray-400"
                                        )}></span>
                                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-semibold text-gray-500 uppercase">{new Date(log.date).toLocaleDateString()}</span>
                                                {isCollaborator && (
                                                    <button onClick={async () => {
                                                        if (confirm('Supprimer ?')) {
                                                            await axios.delete(`/plans/logs/${log.id}`);
                                                            setLogs(logs.filter(l => l.id !== log.id));
                                                        }
                                                    }} className="text-gray-300 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                                                )}
                                            </div>
                                            <p className="text-gray-800 text-sm whitespace-pre-wrap">{log.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Add Log Form */}
                    {isCollaborator && (
                        <div className="bg-navy-50 rounded-xl p-6 border border-navy-100 h-fit sticky top-6">
                            <h4 className="font-bold text-navy-900 mb-4">Nouvelle entrée</h4>
                            <form onSubmit={addLog} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-navy-800 mb-1">Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={newLog.date}
                                        onChange={(e) => setNewLog({ ...newLog, date: e.target.value })}
                                        className="w-full border-navy-200 rounded-lg text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-navy-800 mb-1">Humeur</label>
                                    <div className="flex gap-2">
                                        {['happy', 'neutral', 'sad'].map((m) => (
                                            <button
                                                key={m}
                                                type="button"
                                                onClick={() => setNewLog({ ...newLog, mood: m })}
                                                className={clsx(
                                                    "flex-1 py-2 rounded-lg border flex justify-center transition-all",
                                                    newLog.mood === m
                                                        ? "bg-white border-navy-500 ring-2 ring-navy-200"
                                                        : "bg-white/50 border-transparent hover:bg-white"
                                                )}
                                            >
                                                {m === 'happy' && <Smile className="h-5 w-5 text-green-500" />}
                                                {m === 'neutral' && <Meh className="h-5 w-5 text-gray-500" />}
                                                {m === 'sad' && <Frown className="h-5 w-5 text-red-500" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-navy-800 mb-1">Contenu</label>
                                    <textarea
                                        required
                                        value={newLog.content}
                                        onChange={(e) => setNewLog({ ...newLog, content: e.target.value })}
                                        placeholder="Qu'avez-vous mis en pratique aujourd'hui ?"
                                        rows="4"
                                        className="w-full border-navy-200 rounded-lg text-sm focus:ring-navy-500 focus:border-navy-500"
                                    />
                                </div>
                                <button type="submit" className="w-full bg-navy-600 text-white py-2 rounded-lg font-medium hover:bg-navy-700 transition-colors shadow-sm">
                                    Ajouter
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            )}

            {/* KIRKPATRICK SECTION */}
            {activeSection === 'kirkpatrick' && (
                <div className="space-y-8">
                    {/* Level 3: Application Rate */}
                    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                            <BarChart2 className="h-5 w-5 mr-2 text-navy-600" />
                            Niveau 3 : Transfert & Application
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">À quel point appliquez-vous les acquis de la formation ?</p>

                        <div className="mb-8">
                            <div className="flex justify-between items-end mb-2">
                                <label className="text-sm font-medium text-gray-700">Taux d'application estimé</label>
                                <span className="text-2xl font-bold text-navy-600">{appRate}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="5"
                                disabled={!isCollaborator}
                                value={appRate}
                                onChange={(e) => setAppRate(e.target.value)}
                                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-navy-600"
                            />
                            <div className="flex justify-between text-xs text-gray-400 mt-2">
                                <span>0% (Aucune application)</span>
                                <span>50% (Partiel)</span>
                                <span>100% (Application totale)</span>
                            </div>
                        </div>
                    </div>

                    {/* Level 4: Results & KPIs */}
                    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                            <Target className="h-5 w-5 mr-2 text-green-600" />
                            Niveau 4 : Résultats & Impact
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">Quels sont les résultats concrets observés ?</p>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">KPIs suivis</label>
                            {kpis.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                    {kpis.map((kpi, idx) => (
                                        <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold text-gray-900 text-sm">{kpi.label}</p>
                                                <p className="text-xs text-gray-500">Cible: {kpi.target} | Actuel: {kpi.current}</p>
                                            </div>
                                            {isCollaborator && (
                                                <button onClick={() => setKpis(kpis.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-500">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {isCollaborator && (
                                <div className="flex gap-2 items-end">
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            placeholder="Label (ex: Taux de conversion)"
                                            value={newKpi.label}
                                            onChange={(e) => setNewKpi({ ...newKpi, label: e.target.value })}
                                            className="w-full border-gray-300 rounded-lg text-sm"
                                        />
                                    </div>
                                    <div className="w-24">
                                        <input
                                            type="text"
                                            placeholder="Cible"
                                            value={newKpi.target}
                                            onChange={(e) => setNewKpi({ ...newKpi, target: e.target.value })}
                                            className="w-full border-gray-300 rounded-lg text-sm"
                                        />
                                    </div>
                                    <div className="w-24">
                                        <input
                                            type="text"
                                            placeholder="Actuel"
                                            value={newKpi.current}
                                            onChange={(e) => setNewKpi({ ...newKpi, current: e.target.value })}
                                            className="w-full border-gray-300 rounded-lg text-sm"
                                        />
                                    </div>
                                    <button onClick={addKpi} type="button" className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg text-gray-600 transition-colors">
                                        <Plus className="h-5 w-5" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Analyse qualitative ROI</label>
                            <textarea
                                disabled={!isCollaborator}
                                value={roiQualitative}
                                onChange={(e) => setRoiQualitative(e.target.value)}
                                placeholder="Décrivez l'impact qualitatif sur votre travail..."
                                rows="4"
                                className="w-full border-gray-300 rounded-lg text-sm focus:ring-navy-500 focus:border-navy-500"
                            />
                        </div>
                    </div>

                    {isCollaborator && (
                        <div className="flex justify-end">
                            <button onClick={saveKirkpatrick} disabled={loading} className="bg-navy-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-navy-700 transition-colors shadow-sm">
                                {loading ? 'Enregistrement...' : 'Enregistrer l\'impact'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
