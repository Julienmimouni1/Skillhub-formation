
import React, { useState } from 'react';
import { CheckCircle, Circle, Trash2, Plus, Calendar, AlertCircle, Flag, Box, Target } from 'lucide-react';
import clsx from 'clsx';

export default function ActionPlanTracker({ plan, onAddAction, onToggleAction, onDeleteAction, readOnly = false }) {
    const [newActionTitle, setNewActionTitle] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newActionTitle.trim()) {
            onAddAction(newActionTitle);
            setNewActionTitle('');
            setIsAdding(false);
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'HIGH': return 'text-red-600 bg-red-50 border-red-100';
            case 'MEDIUM': return 'text-orange-600 bg-orange-50 border-orange-100';
            case 'LOW': return 'text-navy-600 bg-navy-50 border-navy-100';
            default: return 'text-gray-600 bg-gray-50 border-gray-100';
        }
    };

    const actions = plan?.actions || [];
    const progress = plan?.progress || 0;

    return (
        <div className="space-y-6">
            {/* Progress Bar */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Progression globale</span>
                    <span className="text-sm font-bold text-navy-600">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                        className="bg-navy-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}% ` }}
                    ></div>
                </div>
            </div>

            {/* Actions List */}
            <div className="space-y-3">
                {actions.map((action) => (
                    <div key={action.id} className="group bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
                        <div className="flex items-start gap-3">
                            <button
                                onClick={() => !readOnly && onToggleAction(action.id, action.status === 'DONE' ? 'TODO' : 'DONE')}
                                disabled={readOnly}
                                className={clsx(
                                    "mt-1 flex-shrink-0 transition-colors",
                                    readOnly ? "cursor-default" : "cursor-pointer hover:text-navy-600"
                                )}
                            >
                                {action.status === 'DONE' ? (
                                    <CheckCircle className="w-5 h-5 text-green-500 fill-green-50" />
                                ) : (
                                    <Circle className="w-5 h-5 text-gray-300" />
                                )}
                            </button>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h4 className={clsx(
                                        "text-sm font-medium text-gray-900",
                                        action.status === 'DONE' && "line-through text-gray-400"
                                    )}>
                                        {action.title}
                                    </h4>
                                    {!readOnly && (
                                        <button
                                            onClick={() => onDeleteAction(action.id)}
                                            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                {/* Metadata Badges */}
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {action.priority && (
                                        <span className={clsx("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border", getPriorityColor(action.priority))}>
                                            <Flag className="w-3 h-3 mr-1" />
                                            {action.priority === 'HIGH' ? 'Haute' : action.priority === 'MEDIUM' ? 'Moyenne' : 'Basse'}
                                        </span>
                                    )}
                                    {action.deadline && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-50 text-gray-600 border border-gray-100">
                                            <Calendar className="w-3 h-3 mr-1" />
                                            {new Date(action.deadline).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>

                                {/* Expanded Details (Resources & Outcome) */}
                                {(action.resources_needed || action.outcome) && (
                                    <div className="mt-3 pt-3 border-t border-gray-50 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                        {action.resources_needed && (
                                            <div className="text-gray-600">
                                                <span className="font-medium text-gray-900 flex items-center mb-1">
                                                    <Box className="w-3 h-3 mr-1 text-navy-500" /> Ressources
                                                </span>
                                                {action.resources_needed}
                                            </div>
                                        )}
                                        {action.outcome && (
                                            <div className="text-gray-600">
                                                <span className="font-medium text-gray-900 flex items-center mb-1">
                                                    <Target className="w-3 h-3 mr-1 text-green-500" /> Résultat attendu
                                                </span>
                                                {action.outcome}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Action Form */}
            {!readOnly && (
                <div className="pt-2">
                    {isAdding ? (
                        <form onSubmit={handleSubmit} className="flex gap-2">
                            <input
                                type="text"
                                value={newActionTitle}
                                onChange={(e) => setNewActionTitle(e.target.value)}
                                placeholder="Nouvelle action..."
                                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-navy-500 focus:ring-navy-500 sm:text-sm"
                                autoFocus
                            />
                            <button
                                type="submit"
                                className="px-4 py-2 bg-navy-600 text-white rounded-lg hover:bg-navy-700 text-sm font-medium"
                            >
                                Ajouter
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
                            >
                                Annuler
                            </button>
                        </form>
                    ) : (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:border-navy-300 hover:text-navy-600 transition-colors flex items-center justify-center font-medium text-sm"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Ajouter une action
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

