import React, { useState } from 'react';
import axios from 'axios';
import { Calendar, Plus, Trash2, CheckCircle2, AlertCircle, MinusCircle, BookOpen } from 'lucide-react';
import clsx from 'clsx';

const MOODS = {
    success: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100', label: 'Succès' },
    neutral: { icon: MinusCircle, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Neutre' },
    struggle: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Difficulté' }
};

export default function PracticeLogTimeline({ plan, skills, onAddLog, onDeleteLog, readOnly, filterSkillIndex = null, hideSkillSelect = false }) {
    const [isAdding, setIsAdding] = useState(false);
    const [newLog, setNewLog] = useState({
        date: new Date().toISOString().split('T')[0],
        content: '',
        skill_index: filterSkillIndex !== null ? filterSkillIndex : '',
        mood: 'neutral'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newLog.content) return;

        await onAddLog({
            ...newLog,
            skill_index: newLog.skill_index === '' ? null : parseInt(newLog.skill_index)
        });

        setNewLog({
            date: new Date().toISOString().split('T')[0],
            content: '',
            skill_index: filterSkillIndex !== null ? filterSkillIndex : '',
            mood: 'neutral'
        });
        setIsAdding(false);
    };

    // Filter logs if filterSkillIndex is provided
    const logs = (plan?.practice_logs || []).filter(log =>
        filterSkillIndex === null || log.skill_index === filterSkillIndex
    );

    return (
        <div className="space-y-8">
            {/* Header / Add Button */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Journal de Bord {filterSkillIndex !== null ? '(Cette compétence)' : ''}</h3>
                    <p className="text-sm text-gray-500">Notez vos essais, vos réussites et vos difficultés au fil de l'eau.</p>
                </div>
                {!readOnly && !isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="inline-flex items-center px-4 py-2 bg-navy-600 text-white rounded-lg hover:bg-navy-700 font-medium shadow-sm transition-colors"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter une entrée
                    </button>
                )}
            </div>

            {/* Add Form */}
            {isAdding && (
                <div className="bg-white border border-navy-100 rounded-xl p-6 shadow-sm animate-fadeIn">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input
                                    type="date"
                                    value={newLog.date}
                                    onChange={(e) => setNewLog({ ...newLog, date: e.target.value })}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-navy-500 focus:ring-navy-500"
                                    required
                                />
                            </div>
                            {!hideSkillSelect && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Compétence liée (Optionnel)</label>
                                    <select
                                        value={newLog.skill_index}
                                        onChange={(e) => setNewLog({ ...newLog, skill_index: e.target.value })}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-navy-500 focus:ring-navy-500"
                                    >
                                        <option value="">-- Général --</option>
                                        {skills.map((skill, idx) => (
                                            <option key={idx} value={idx}>
                                                {skill.name ? `${idx + 1}. ${skill.name}` : `Compétence ${idx + 1}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Qu'avez-vous fait ? (Résultat, Ressenti...)</label>
                            <textarea
                                value={newLog.content}
                                onChange={(e) => setNewLog({ ...newLog, content: e.target.value })}
                                className="w-full rounded-xl border-gray-200 bg-gray-50 text-gray-700 shadow-sm focus:bg-white focus:border-navy-500 focus:ring-navy-500 transition-all resize-none p-4 leading-relaxed"
                                rows={5}
                                placeholder="Aujourd'hui, j'ai essayé de..."
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Comment ça s'est passé ?</label>
                            <div className="flex gap-4">
                                {Object.entries(MOODS).map(([key, config]) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setNewLog({ ...newLog, mood: key })}
                                        className={clsx(
                                            "flex-1 p-3 rounded-lg border flex items-center justify-center gap-2 transition-all",
                                            newLog.mood === key
                                                ? `border-navy-500 bg-navy-50 ring-1 ring-navy-500`
                                                : "border-gray-200 hover:bg-gray-50"
                                        )}
                                    >
                                        <config.icon className={clsx("w-5 h-5", config.color)} />
                                        <span className="text-sm font-medium text-gray-700">{config.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-navy-600 text-white rounded-lg hover:bg-navy-700 font-medium shadow-sm transition-colors"
                            >
                                Enregistrer
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Timeline */}
            <div className="relative border-l-2 border-gray-200 ml-3 space-y-8 pb-4">
                {logs.length === 0 ? (
                    <div className="ml-8 p-6 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-center">
                        <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Aucune entrée pour le moment. Commencez votre journal !</p>
                    </div>
                ) : (
                    logs.map((log) => {
                        const MoodIcon = MOODS[log.mood]?.icon || BookOpen;
                        const moodColor = MOODS[log.mood]?.color || 'text-gray-500';
                        const moodBg = MOODS[log.mood]?.bg || 'bg-gray-100';
                        const skillName = log.skill_index !== null && skills[log.skill_index]
                            ? skills[log.skill_index].name
                            : null;

                        return (
                            <div key={log.id} className="relative ml-8 group">
                                {/* Dot */}
                                <span className={clsx(
                                    "absolute -left-[41px] top-0 h-5 w-5 rounded-full border-2 border-white shadow-sm flex items-center justify-center",
                                    moodBg
                                )}>
                                    <div className={clsx("h-2 w-2 rounded-full", moodColor.replace('text-', 'bg-'))} />
                                </span>

                                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-gray-900">
                                                {new Date(log.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                                            </span>
                                            {skillName && !hideSkillSelect && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-navy-50 text-navy-700">
                                                    {skillName}
                                                </span>
                                            )}
                                        </div>
                                        {!readOnly && (
                                            <button
                                                onClick={() => onDeleteLog(log.id)}
                                                className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-gray-600 whitespace-pre-wrap">{log.content}</p>
                                    {log.mood && (
                                        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                                            <MoodIcon className={clsx("w-4 h-4", moodColor)} />
                                            <span>Ressenti : {MOODS[log.mood]?.label}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
