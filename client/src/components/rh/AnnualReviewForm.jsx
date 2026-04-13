import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    User,
    Calendar,
    Target,
    Award,
    Briefcase,
    MessageSquare,
    Save,
    X,
    CheckCircle2,
    Info,
    TrendingUp,
    Sparkles,
    Loader2
} from 'lucide-react';
import clsx from 'clsx';

export default function AnnualReviewForm({ userId, onClose, readOnly = false }) {
    const [dossier, setDossier] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeSection, setActiveSection] = useState('profile');

    useEffect(() => {
        if (userId) fetchDossier();
    }, [userId]);

    const fetchDossier = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`/annual-reviews/dossier/${userId}`, { withCredentials: true });
            setDossier(data);
        } catch (error) {
            console.error('Error fetching dossier:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (status = 'DRAFT') => {
        try {
            setSaving(true);
            await axios.post(`/annual-reviews`, {
                userId,
                year: dossier.review.year,
                status,
                ...dossier.review
            }, { withCredentials: true });
            alert('Révision sauvegardée !');
            if (status === 'VALIDATED') onClose();
            else fetchDossier();
        } catch (error) {
            console.error('Save error:', error);
            alert('Erreur lors de la sauvegarde.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <Loader2 className="h-10 w-10 text-navy-600 animate-spin" />
            <p className="text-gray-500 font-bold">Chargement du dossier...</p>
        </div>
    );

    const { user, review, trainingRequests, starStories } = dossier;

    return (
        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col h-[90vh] max-w-5xl mx-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-navy-700 via-navy-600 to-navy-600 p-8 text-white relative flex-shrink-0">
                <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-black border border-white/30">
                            {user.first_name[0]}{user.last_name[0]}
                        </div>
                        <div>
                            <h2 className="text-3xl font-black tracking-tight">{user.first_name} {user.last_name}</h2>
                            <p className="text-navy-100 font-medium opacity-90">{user.job_title || 'Collaborateur'} • {user.department?.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>
                {/* Abstract shape */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Navigation */}
                <div className="w-64 bg-gray-50 border-r border-gray-100 p-6 space-y-2 flex-shrink-0">
                    {[
                        { id: 'profile', label: 'Profil & Contexte', icon: User },
                        { id: 'goals', label: 'Objectifs & Bilan', icon: Target },
                        { id: 'training', label: 'Formations & STAR', icon: Award },
                        { id: 'comments', label: 'Commentaires RH', icon: MessageSquare }
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className={clsx(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                                activeSection === item.id
                                    ? "bg-navy-600 text-white shadow-lg shadow-navy-200 scale-105"
                                    : "text-gray-500 hover:bg-white hover:text-navy-600 border border-transparent hover:border-navy-100"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                    {activeSection === 'profile' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                            <SectionTitle title="Contexte de l'entretien" icon={Briefcase} />
                            <div className="grid grid-cols-2 gap-6">
                                <InfoItem label="Date d'embauche" value={user.hired_at ? new Date(user.hired_at).toLocaleDateString() : '-'} />
                                <InfoItem label="Manager Direct" value={user.manager ? `${user.manager.first_name} ${user.manager.last_name}` : '-'} />
                                <InfoItem label="Dernier EADP" value={user.last_annual_review ? new Date(user.last_annual_review).toLocaleDateString() : 'Première fois'} />
                                <InfoItem label="Année d'exercice" value={review.year} />
                            </div>
                        </div>
                    )}

                    {activeSection === 'goals' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                            <SectionTitle title="Bilan des objectifs passés" icon={Target} />
                            <textarea
                                value={review.previous_goals_summary || ''}
                                onChange={(e) => setDossier({ ...dossier, review: { ...review, previous_goals_summary: e.target.value } })}
                                placeholder="Résumer les accomplissements et les écarts de l'année passée..."
                                className="w-full p-4 bg-gray-50 border-gray-200 rounded-2xl focus:ring-2 focus:ring-navy-500 min-h-[150px] font-medium"
                                readOnly={readOnly}
                            />

                            <SectionTitle title="Nouveaux objectifs" icon={TrendingUp} />
                            <textarea
                                value={review.new_goals || ''}
                                onChange={(e) => setDossier({ ...dossier, review: { ...review, new_goals: e.target.value } })}
                                placeholder="Fixer les objectifs SMART pour l'année à venir..."
                                className="w-full p-4 bg-gray-50 border-gray-200 rounded-2xl focus:ring-2 focus:ring-navy-500 min-h-[150px] font-medium"
                                readOnly={readOnly}
                            />
                        </div>
                    )}

                    {activeSection === 'training' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                            <SectionTitle title="Formations suivies durant l'année" icon={Award} />
                            <div className="space-y-4">
                                {trainingRequests.length > 0 ? trainingRequests.map((req) => (
                                    <div key={req.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between hover:border-navy-100 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-navy-50 text-navy-600 rounded-xl">
                                                <Award className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{req.title}</div>
                                                <div className="text-xs text-gray-400 font-medium">Validée le {new Date(req.updated_at).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-wider">Réalisée</span>
                                    </div>
                                )) : <div className="p-8 text-center text-sm text-gray-400 font-medium border-2 border-dashed border-gray-100 rounded-3xl">Aucune formation enregistrée cette année.</div>}
                            </div>

                            <SectionTitle title="Mise en pratique (STAR Stories)" icon={Sparkles} />
                            <div className="space-y-6">
                                {starStories.length > 0 ? starStories.map((story, i) => (
                                    <div key={i} className="bg-navy-50/50 rounded-2xl p-6 border border-navy-100 space-y-4">
                                        <div className="flex justify-between items-center pb-2 border-b border-navy-100/50">
                                            <h4 className="font-bold text-navy-900 flex items-center gap-2">
                                                <Sparkles className="h-4 w-4" />
                                                {story.training_title}
                                            </h4>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <StarPart label="Situation" text={story.star.situation} />
                                            <StarPart label="Tâche" text={story.star.task} />
                                            <StarPart label="Action" text={story.star.action} />
                                            <StarPart label="Résultat" text={story.star.result} />
                                        </div>
                                    </div>
                                )) : <div className="p-8 text-center text-sm text-gray-400 font-medium border-2 border-dashed border-gray-100 rounded-3xl">Aucune story STAR détaillée par le collaborateur.</div>}
                            </div>
                        </div>
                    )}

                    {activeSection === 'comments' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                            <SectionTitle title="Commentaires de synthèse" icon={MessageSquare} />
                            <div className="grid grid-cols-1 gap-6">
                                <CommentBox
                                    label="Avis du Collaborateur"
                                    value={review.collaborator_comment}
                                    onChange={(v) => setDossier({ ...dossier, review: { ...review, collaborator_comment: v } })}
                                    readOnly={readOnly}
                                />
                                <CommentBox
                                    label="Avis du Manager"
                                    value={review.manager_comment}
                                    onChange={(v) => setDossier({ ...dossier, review: { ...review, manager_comment: v } })}
                                    readOnly={readOnly}
                                />
                                <CommentBox
                                    label="Observations RH"
                                    value={review.rh_comment}
                                    onChange={(v) => setDossier({ ...dossier, review: { ...review, rh_comment: v } })}
                                    readOnly={readOnly}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 flex-shrink-0">
                {!readOnly && (
                    <>
                        <button
                            onClick={() => handleSave('DRAFT')}
                            disabled={saving}
                            className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 transition-all flex items-center gap-2"
                        >
                            <Save className="h-4 w-4" />
                            Brouillon
                        </button>
                        <button
                            onClick={() => handleSave('VALIDATED')}
                            disabled={saving}
                            className="px-8 py-3 bg-navy-600 text-white rounded-2xl font-bold hover:bg-navy-700 shadow-lg shadow-navy-100 transition-all flex items-center gap-2"
                        >
                            <CheckCircle2 className="h-4 w-4" />
                            Valider l'entretien
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

function SectionTitle({ title, icon: Icon }) {
    return (
        <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-navy-50 text-navy-600 rounded-lg">
                <Icon className="h-5 w-5" />
            </div>
            {title}
        </h3>
    );
}

function InfoItem({ label, value }) {
    return (
        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-sm font-bold text-gray-800">{value}</p>
        </div>
    );
}

function StarPart({ label, text }) {
    return (
        <div>
            <span className="text-[10px] font-black text-navy-400 uppercase tracking-widest">{label}</span>
            <p className="text-xs text-gray-700 mt-1 font-medium bg-white p-3 rounded-xl border border-navy-50/50 italic line-clamp-3">
                {text || 'Non renseigné'}
            </p>
        </div>
    );
}

function CommentBox({ label, value, onChange, readOnly }) {
    return (
        <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
            <textarea
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={`Saisir l'avis...`}
                className="w-full p-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-navy-500 min-h-[100px] text-sm font-medium"
                readOnly={readOnly}
            />
        </div>
    );
}
