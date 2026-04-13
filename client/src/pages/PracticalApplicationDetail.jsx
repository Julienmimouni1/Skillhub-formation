import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    ArrowLeft, Upload, FileText, Sparkles, Target, BarChart3, Calendar, Save,
    CheckCircle2, HelpCircle, Smile, Meh, Frown, Trophy, Rocket, Users, Send,
    BookOpen, Dice5, Flame, CheckSquare, Square, Plus, Trash2, Clock,
    TrendingUp, Calculator, Award, Lightbulb, Zap, ArrowRight, Activity, MousePointerClick, X
} from 'lucide-react';
import ActionPlanTracker from '../components/ActionPlanTracker';
import PracticeLogTimeline from '../components/PracticeLogTimeline';
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';

// ... SkillCard remains identical ...
const SkillCard = ({ skill, index, onChange, disabled, plan, onAddLog, onDeleteLog }) => {
    const [showLogbook, setShowLogbook] = useState(false);
    const [newTaskText, setNewTaskText] = useState('');
    const [deadline, setDeadline] = useState(skill.deadline || '');
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        if (!deadline) {
            setTimeLeft('');
            return;
        }

        const updateTimer = () => {
            const now = new Date().getTime();
            const target = new Date(deadline).getTime();
            const distance = target - now;

            if (distance < 0) {
                setTimeLeft("EXPIRÉ");
            } else {
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                setTimeLeft(`${days}j ${hours}h`);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 60000);
        return () => clearInterval(interval);
    }, [deadline]);

    useEffect(() => {
        if (skill.deadline) setDeadline(skill.deadline);
    }, [skill.deadline]);

    const handleChange = (field, value) => {
        onChange(index, { ...skill, [field]: value });
    };

    const handleDeadlineChange = (e) => {
        const val = e.target.value;
        setDeadline(val);
        handleChange('deadline', val);
    };

    const toggleDifficulty = () => {
        if (disabled) return;
        const levels = ['easy', 'hard', 'legendary'];
        const currentIdx = levels.indexOf(skill.difficulty || 'easy');
        const nextDiff = levels[(currentIdx + 1) % levels.length];
        handleChange('difficulty', nextDiff);
    };

    const handleAddTask = () => {
        if (!newTaskText.trim()) return;
        handleChange('subTasks', [...(skill.subTasks || []), { text: newTaskText.trim(), done: false }]);
        setNewTaskText('');
    };

    return (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 relative">
            <div className="bg-gradient-to-r from-navy-600 via-navy-600 to-navy-800 px-6 py-5 flex justify-between items-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="flex items-center gap-4 relative z-10">
                    <div className="bg-white/20 backdrop-blur-md text-white w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shadow-inner border border-white/30 transform -rotate-3">
                        {index + 1}
                    </div>
                    <div>
                        <h4 className="font-bold text-white text-xl tracking-tight">
                            Mission #{index + 1}
                        </h4>
                        <p className="text-navy-100 text-xs font-medium uppercase tracking-wider opacity-80">Compétence Cible</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 relative z-10">
                    {timeLeft && (
                        <div className="bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-mono text-white border border-white/10 flex items-center gap-2">
                            <Clock className="w-3 h-3 animate-pulse text-red-400" />
                            {timeLeft}
                        </div>
                    )}
                    {skill.needsHelp && (
                        <span className="animate-pulse inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-orange-500 text-white shadow-lg border border-orange-400">
                            <HelpCircle className="w-3 h-3 mr-1.5" />
                            SOS ACTIVÉ
                        </span>
                    )}
                </div>
            </div>

            <div className="p-6 md:p-8 space-y-8 bg-gray-50/50">
                <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Target className="h-6 w-6 text-navy-400" />
                        </div>
                        <input
                            type="text"
                            value={skill.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            disabled={disabled}
                            placeholder="Nom de la compétence..."
                            className="block w-full pl-12 pr-4 py-4 text-lg font-bold text-gray-900 placeholder-gray-400 bg-transparent border-none focus:ring-0 rounded-xl transition-all"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <div className="flex flex-col items-end">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Confiance</span>
                                <div className="flex items-center gap-2">
                                    <span className={clsx(
                                        "text-2xl font-black",
                                        skill.confidence < 5 ? "text-red-500" : skill.confidence < 8 ? "text-yellow-500" : "text-green-500"
                                    )}>{skill.confidence}/10</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="px-4 pb-2">
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={skill.confidence}
                            onChange={(e) => handleChange('confidence', parseInt(e.target.value))}
                            disabled={disabled}
                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-navy-600 mb-2"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative group perspective-1000">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-navy-400 to-cyan-300 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                        <div className="relative bg-white rounded-xl p-6 border border-navy-100 shadow-sm h-full flex flex-col">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-navy-50 rounded-lg text-navy-600">
                                    <BookOpen className="w-5 h-5" />
                                </div>
                                <h5 className="font-bold text-gray-900">Ma mission</h5>
                            </div>
                            <textarea
                                value={skill.playground || ''}
                                onChange={(e) => handleChange('playground', e.target.value)}
                                disabled={disabled}
                                rows={4}
                                placeholder="Contexte opérationnel : Où allez-vous déployer cette compétence ?"
                                className="w-full flex-grow text-sm text-gray-700 bg-navy-50/30 rounded-lg border-navy-100 focus:border-navy-400 focus:ring-navy-400/20 p-3 resize-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="relative group perspective-1000">
                        <div className={clsx(
                            "absolute -inset-0.5 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500",
                            skill.difficulty === 'legendary' ? "bg-gradient-to-r from-navy-600 to-pink-600" :
                                skill.difficulty === 'hard' ? "bg-gradient-to-r from-orange-500 to-red-500" :
                                    "bg-gradient-to-r from-green-400 to-emerald-500"
                        )}></div>
                        <div className="relative bg-white rounded-xl p-6 border border-gray-100 shadow-sm h-full flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className={clsx("p-2 rounded-lg text-white transition-colors duration-500",
                                        skill.difficulty === 'legendary' ? "bg-navy-600" :
                                            skill.difficulty === 'hard' ? "bg-orange-500" : "bg-emerald-500"
                                    )}>
                                        <Trophy className="w-5 h-5" />
                                    </div>
                                    <h5 className="font-bold text-gray-900 text-lg">Mon Challenge</h5>
                                </div>

                                <button
                                    onClick={toggleDifficulty}
                                    disabled={disabled}
                                    className={clsx(
                                        "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer",
                                        "hover:scale-105 active:scale-95",
                                        skill.difficulty === 'legendary' ? "bg-navy-100 text-navy-700 hover:bg-navy-200" :
                                            skill.difficulty === 'hard' ? "bg-orange-100 text-orange-700 hover:bg-orange-200" :
                                                "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                    )}
                                    title="Cliquez pour changer la difficulté manuellement"
                                >
                                    {skill.difficulty === 'legendary' ? 'Légendaire' :
                                        skill.difficulty === 'hard' ? 'Avancé' : 'Novice'}
                                </button>
                            </div>

                            <div className="mb-6 relative">
                                <div className="flex justify-between items-end mb-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Objectif Principal</label>
                                    {!disabled && (
                                        <button
                                            onClick={() => {
                                                const CHALLENGES = [
                                                    { text: "Expliquer ce concept à un collègue en 5 min 🗣️", difficulty: 'easy' },
                                                    { text: "Noter 3 observations sur ce sujet demain 📝", difficulty: 'easy' },
                                                    { text: "Lire un article/doc approfondi(e) 📖", difficulty: 'easy' },
                                                    { text: "Regarder une vidéo d'expert (10 min) 📺", difficulty: 'easy' },
                                                    { text: "Faire une mindmap de synthèse 🧠", difficulty: 'easy' },
                                                    { text: "Animer un mini-atelier de 15 min 🎓", difficulty: 'hard' },
                                                    { text: "Appliquer sur un dossier critique cette semaine 💼", difficulty: 'hard' },
                                                    { text: "Identifier et corriger une erreur graçe à ça 🕵️", difficulty: 'hard' },
                                                    { text: "Créer une checklist pour l'équipe ✅", difficulty: 'hard' },
                                                    { text: "Obtenir du feedback de 3 personnes 💬", difficulty: 'hard' },
                                                    { text: "Présenter une stratégie au N+1 🏆", difficulty: 'legendary' },
                                                    { text: "Former toute l'équipe (Session 1h) 👨‍🏫", difficulty: 'legendary' },
                                                    { text: "Optimiser un process (-20% temps) ⚡", difficulty: 'legendary' },
                                                    { text: "Mentorer un junior sur ce sujet 🤝", difficulty: 'legendary' }
                                                ];

                                                const pick = CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];
                                                onChange(index, { ...skill, challenge: pick.text, difficulty: pick.difficulty });
                                            }}
                                            className="flex items-center gap-1.5 text-xs font-bold text-navy-600 hover:text-navy-800 transition-colors group/dice bg-navy-50 px-2 py-1 rounded-md hover:bg-navy-100 cursor-pointer"
                                        >
                                            <span className="hidden group-hover/dice:inline animate-fadeIn text-navy-500 font-normal mr-1">Lancer le dé !</span>
                                            <span className="group-hover/dice:hidden">Pas d'inspiration ?</span>
                                            <Dice5 className="w-5 h-5 text-navy-600 group-hover/dice:animate-spin transition-transform duration-700" />
                                        </button>
                                    )}
                                </div>
                                <textarea
                                    value={skill.challenge || ''}
                                    onChange={(e) => handleChange('challenge', e.target.value)}
                                    disabled={disabled}
                                    rows={2}
                                    className={clsx(
                                        "w-full text-base font-bold text-gray-800 border-2 border-dashed rounded-xl focus:ring-0 p-3 bg-gray-50/50 resize-none transition-all hover:bg-white",
                                        skill.difficulty === 'legendary' ? "border-navy-200 focus:border-navy-500" :
                                            skill.difficulty === 'hard' ? "border-orange-200 focus:border-orange-500" :
                                                "border-emerald-200 focus:border-emerald-500"
                                    )}
                                    placeholder="Définir la quête principale... ou lancez le dé !"
                                />

                                <div className="mt-2 flex justify-end">
                                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2 py-1 border border-gray-100 hover:border-gray-300 transition-colors">
                                        <Clock className="w-3 h-3 text-gray-400" />
                                        <input
                                            type="date"
                                            value={deadline || ''}
                                            onChange={handleDeadlineChange}
                                            className="bg-transparent border-none text-xs text-gray-600 p-0 focus:ring-0 cursor-pointer w-24"
                                            disabled={disabled}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex-grow flex flex-col">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex justify-between">
                                    Étapes clés
                                    <span className={clsx("font-mono font-bold",
                                        skill.difficulty === 'legendary' ? "text-navy-600" :
                                            skill.difficulty === 'hard' ? "text-orange-600" : "text-emerald-600"
                                    )}>
                                        {skill.subTasks?.filter(t => t.done).length || 0}/{skill.subTasks?.length || 0}
                                    </span>
                                </label>

                                <div className="h-2 w-full bg-gray-100 rounded-full mb-4 overflow-hidden">
                                    <div
                                        className={clsx("h-full transition-all duration-500 ease-out",
                                            skill.difficulty === 'legendary' ? "bg-navy-500" :
                                                skill.difficulty === 'hard' ? "bg-orange-500" : "bg-emerald-500"
                                        )}
                                        style={{ width: `${skill.subTasks?.length ? (skill.subTasks.filter(t => t.done).length / skill.subTasks.length) * 100 : 0}%` }}
                                    ></div>
                                </div>

                                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {(skill.subTasks || []).map((task, i) => (
                                        <div key={i} className="flex items-start gap-3 group bg-white p-3 rounded-xl border border-transparent hover:border-gray-100 hover:shadow-md transition-all">
                                            <button
                                                onClick={() => {
                                                    if (disabled) return;
                                                    const newTasks = [...(skill.subTasks || [])];
                                                    newTasks[i].done = !newTasks[i].done;
                                                    handleChange('subTasks', newTasks);
                                                }}
                                                className={clsx(
                                                    "mt-0.5 transition-all transform hover:scale-110 active:scale-95 flex-shrink-0 cursor-pointer",
                                                    task.done ? "text-green-500" : "text-gray-300 hover:text-gray-400"
                                                )}
                                            >
                                                {task.done ? <CheckCircle2 className="w-7 h-7 fill-current" /> : <Square className="w-7 h-7" />}
                                            </button>
                                            <input
                                                type="text"
                                                value={task.text}
                                                onChange={(e) => {
                                                    const newTasks = [...(skill.subTasks || [])];
                                                    newTasks[i].text = e.target.value;
                                                    handleChange('subTasks', newTasks);
                                                }}
                                                disabled={disabled}
                                                className={clsx(
                                                    "flex-grow text-sm bg-transparent border-none focus:ring-0 p-0 font-medium leading-relaxed",
                                                    task.done ? "line-through text-gray-400" : "text-gray-700"
                                                )}
                                            />
                                            <button
                                                onClick={() => {
                                                    const newTasks = (skill.subTasks || []).filter((_, idx) => idx !== i);
                                                    handleChange('subTasks', newTasks);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity p-1.5 bg-red-50 rounded-lg hover:bg-red-100 cursor-pointer"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {!disabled && (
                                    <div className="mt-auto">
                                        <div className="relative group/add flex items-center gap-2">
                                            <div className="relative flex-grow">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Plus className="h-5 w-5 text-navy-500" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={newTaskText}
                                                    onChange={(e) => setNewTaskText(e.target.value)}
                                                    placeholder="Ajouter une nouvelle étape..."
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleAddTask();
                                                    }}
                                                    className="block w-full pl-10 pr-3 py-3 text-sm font-semibold text-gray-700 bg-navy-50/50 border border-navy-100 rounded-xl focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 focus:bg-white placeholder-navy-300 transition-all shadow-sm hover:shadow-md"
                                                />
                                            </div>
                                            <button
                                                onClick={handleAddTask}
                                                className="p-3 bg-navy-600 hover:bg-navy-700 text-white rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer flex-shrink-0"
                                            >
                                                <Plus className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Re-added support section and footer content */} 
                    <div className="bg-gray-100 rounded-2xl p-6 border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-navy-500" />
                                    Supply Drop (Ressources)
                                </label>
                                <div className="bg-white rounded-xl border border-gray-200 p-2 focus-within:ring-2 focus-within:ring-navy-500/20 focus-within:border-navy-400 transition-all">
                                    <input type="text" value={skill.resources || ''} onChange={(e) => handleChange('resources', e.target.value)} disabled={disabled} placeholder="Ex: Mentorat, Outils, Temps..." className="w-full text-sm font-medium border-none focus:ring-0 p-2" />
                                    <div className="flex gap-2 mt-2 px-2 pb-1 overflow-x-auto">
                                        {['Mentorat', 'Formation', 'Temps'].map(tag => (
                                            <button key={tag} onClick={() => !disabled && handleChange('resources', (skill.resources ? skill.resources + ', ' : '') + tag)} className="text-xs bg-navy-50 text-navy-700 px-2 py-1 rounded-md border border-navy-100 hover:bg-navy-100 transition-colors whitespace-nowrap cursor-pointer">
                                                + {tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <div className={clsx("w-2 h-2 rounded-full animate-pulse", skill.emotion === 'excited' ? "bg-green-500" : skill.emotion === 'anxious' ? "bg-red-500" : "bg-gray-400")}></div>
                                    Énergie / Mood
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[{ val: 'anxious', icon: '😰', label: 'Stress', color: 'hover:bg-red-50 hover:border-red-200' }, { val: 'neutral', icon: '😐', label: 'Stable', color: 'hover:bg-gray-50 hover:border-gray-200' }, { val: 'excited', icon: '🤩', label: 'Hypé', color: 'hover:bg-green-50 hover:border-green-200' }].map((opt) => (
                                        <button key={opt.val} onClick={() => !disabled && handleChange('emotion', opt.val)} disabled={disabled} className={clsx("group relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer", skill.emotion === opt.val ? "bg-white border-navy-600 shadow-md scale-105 z-10" : "bg-white border-transparent shadow-sm grayscale hover:grayscale-0 " + opt.color)}>
                                            <span className="text-2xl mb-1 transform group-hover:scale-110 transition-transform">{opt.icon}</span>
                                            <span className="text-[10px] font-bold uppercase tracking-wide text-gray-500">{opt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className={clsx("w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out", skill.needsHelp ? "bg-orange-500" : "bg-gray-200 group-hover:bg-gray-300")}>
                                <div className={clsx("w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ease-in-out", skill.needsHelp ? "translate-x-6" : "translate-x-0")}></div>
                            </div>
                            <input type="checkbox" checked={skill.needsHelp} onChange={() => !disabled && handleChange('needsHelp', !skill.needsHelp)} className="hidden" disabled={disabled} />
                            <span className={clsx("text-sm font-medium transition-colors", skill.needsHelp ? "text-orange-600" : "text-gray-500")}>
                                {skill.needsHelp ? "Demande d'accompagnement envoyée" : "Demander un accompagnement"}
                            </span>
                        </label>
                        <button onClick={() => setShowLogbook(!showLogbook)} className={clsx("text-sm font-semibold flex items-center gap-2 px-4 py-2 rounded-lg transition-colors cursor-pointer", showLogbook ? "bg-navy-100 text-navy-700" : "text-gray-500 hover:bg-gray-100")}>
                            <BookOpen className="w-4 h-4" />
                            {showLogbook ? "Masquer le Journal" : "Ouvrir le Journal"}
                        </button>
                    </div>
                    {showLogbook && (
                        <div className="mt-8 pt-8 border-t-2 border-dashed border-gray-200 animate-fadeIn bg-white rounded-xl p-4 shadow-inner">
                            <PracticeLogTimeline plan={plan} skills={[skill]} onAddLog={onAddLog} onDeleteLog={onDeleteLog} readOnly={disabled} filterSkillIndex={index} hideSkillSelect={true} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function PracticalApplicationDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [request, setRequest] = useState(null);
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    const [skills, setSkills] = useState(Array(3).fill({ name: '', confidence: 5, needsHelp: false, playground: '', resources: '', challenge: '', emotion: 'neutral', difficulty: 'easy', subTasks: [] }));
    const [impactRating, setImpactRating] = useState(0);
    const [blockers, setBlockers] = useState('');
    const [scheduledReviewDate, setScheduledReviewDate] = useState('');
    const [managerReviewComment, setManagerReviewComment] = useState('');
    const [managerReviewedAt, setManagerReviewedAt] = useState(null);

    // Kirkpatrick L3 Fields (Behavior)
    // New: 'trigger' (Le déclencheur) and 'magnitude' (Ampleur du changement)
    const [beforeAfter, setBeforeAfter] = useState({ before: '', after: '', magnitude: 'moderate', trigger: '' });
    const [habitFrequency, setHabitFrequency] = useState(0);

    // Kirkpatrick L4 Fields (Results)
    const [kpis, setKpis] = useState([]);
    // Simplified ROI: type (time/money/quality), amount (preset or custom), frequency (daily/weekly)
    const [roiCalc, setRoiCalc] = useState({ type: 'time', amount: '', unit: 'minutes', frequency: 'weekly', savedWhat: 'time' });
    const [starStory, setStarStory] = useState({ situation: '', task: '', action: '', result: '' });

    // Impact Score Breakdown
    const [scoreBreakdown, setScoreBreakdown] = useState([]);
    const [impactScore, setImpactScore] = useState(0);

    useEffect(() => {
        if (user && ['rh', 'admin'].includes(user.role)) {
            navigate('/');
            return;
        }
        fetchData();
    }, [id, user?.role]);

    // Detailed Scoring Logic
    useEffect(() => {
        let score = 0;
        const newBreakdown = [];

        // L3: Transformation
        if (beforeAfter.before && beforeAfter.after) {
            score += 15;
            newBreakdown.push({ label: 'Transformation analysée', points: 15, done: true });
        } else {
            newBreakdown.push({ label: 'Transformation analysée', points: 15, done: false });
        }

        // Relaxed Check for Trigger: just check if it exists and has content
        if (beforeAfter.trigger && beforeAfter.trigger.trim().length > 0) {
            score += 10;
            newBreakdown.push({ label: 'Déclencheur identifié', points: 10, done: true });
        } else {
            newBreakdown.push({ label: 'Déclencheur identifié', points: 10, done: false });
        }

        // Magnitude Bonus
        if (beforeAfter.magnitude === 'marginal') score += 5;
        if (beforeAfter.magnitude === 'moderate') score += 10;
        if (beforeAfter.magnitude === 'radical') score += 15;

        // Habit
        if (habitFrequency > 0) {
            const points = habitFrequency * 5; // up to 20
            score += points;
            newBreakdown.push({ label: 'Fréquence de pratique', points: points, done: true });
        } else {
            newBreakdown.push({ label: 'Fréquence de pratique', points: 20, done: false });
        }

        // L4: Results
        if (roiCalc.amount) {
            score += 20;
            newBreakdown.push({ label: 'ROI Estimé', points: 20, done: true });
        } else {
            newBreakdown.push({ label: 'ROI Estimé', points: 20, done: false });
        }

        // STAR Story
        // Relaxed Check: > 2 chars
        const starFilled = Object.values(starStory).filter(v => v.length > 2).length;
        if (starFilled === 4) {
            score += 20;
            newBreakdown.push({ label: 'Story Complète', points: 20, done: true });
        } else {
            newBreakdown.push({ label: 'Story Complète', points: 20, done: false });
        }

        setImpactScore(Math.min(100, score));
        setScoreBreakdown(newBreakdown);
    }, [habitFrequency, beforeAfter, kpis, roiCalc, starStory, impactRating]);

    const [showGuide, setShowGuide] = useState(false); // Modal State

    const handleSave = async (isManagerValidation = false, silent = false) => {
        if (!silent) setSaving(true);
        try {
            const avgConfidence = Math.round(skills.reduce((acc, s) => acc + (s.confidence || 0), 0) / skills.length) || 5;

            const behaviorJSON = JSON.stringify({ beforeAfter, habitFrequency });
            const roiJSON = JSON.stringify({ roiCalc, starStory });

            // Determine validation date
            let validationDate = managerReviewedAt;
            if (isManagerValidation === true) {
                validationDate = new Date().toISOString();
                setManagerReviewedAt(validationDate);
            }

            const response = await axios.post(`/plans/request/${id}`, {
                key_takeaways: JSON.stringify(skills),
                confidence_level: avgConfidence,
                impact_rating: impactRating,
                impact_score: impactScore,
                blockers: blockers,
                scheduled_review_date: scheduledReviewDate,
                progress: 100,
                application_rate: (habitFrequency / 4) * 100,
                behavior_changes: behaviorJSON,
                kpis: JSON.stringify(kpis),
                roi_qualitative: roiJSON,
                manager_review_comment: managerReviewComment,
                manager_reviewed_at: validationDate
            }, { withCredentials: true });

            setPlan(response.data);
            if (!silent) alert(isManagerValidation === true ? 'Plan validé avec succès !' : 'Sauvegardé avec succès !');
        } catch (error) {
            console.error(error);
            if (!silent) alert('Erreur lors de la sauvegarde.');
        } finally {
            if (!silent) setSaving(false);
        }
    };

    const fetchData = async () => {
        try {
            const [reqRes, planRes] = await Promise.all([
                axios.get(`/requests/${id}`, { withCredentials: true }),
                axios.get(`/plans/request/${id}`, { withCredentials: true })
            ]);
            setRequest(reqRes.data.request);
            const planData = planRes.data;
            setPlan(planData);

            if (planData) {
                if (planData.key_takeaways) {
                    try {
                        const parsed = JSON.parse(planData.key_takeaways);
                        if (Array.isArray(parsed)) setSkills(parsed);
                    } catch (e) { } 
                }

                setImpactRating(planData.impact_rating || 0);
                setBlockers(planData.blockers || '');
                setScheduledReviewDate(planData.scheduled_review_date ? planData.scheduled_review_date.split('T')[0] : '');

                try {
                    const behav = planData.behavior_changes ? JSON.parse(planData.behavior_changes) : {};
                    setBeforeAfter(behav.beforeAfter || { before: '', after: '', magnitude: 'moderate', trigger: '' });
                    setHabitFrequency(behav.habitFrequency || 0);
                } catch {
                    setBeforeAfter({ before: '', after: planData.behavior_changes || '', magnitude: 'moderate', trigger: '' });
                }

                try {
                    const roi = planData.roi_qualitative ? JSON.parse(planData.roi_qualitative) : {};
                    setRoiCalc(roi.roiCalc || { type: 'time', amount: '', unit: 'minutes', frequency: 'weekly', savedWhat: 'time' });
                    setStarStory(roi.starStory || { situation: '', task: '', action: '', result: '' });
                } catch { } 

                setKpis(planData.kpis ? JSON.parse(planData.kpis) : []);
                setManagerReviewComment(planData.manager_review_comment || '');
                setManagerReviewedAt(planData.manager_reviewed_at || null);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };



    // Handlers
    const handleSkillChange = (index, updatedSkill) => {
        const newSkills = [...skills];
        newSkills[index] = updatedSkill;
        setSkills(newSkills);
    };
    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const formData = new FormData();
        files.forEach(file => formData.append('documents', file));

        try {
            await axios.post(`/requests/${id}/documents`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });
            fetchData(); // Refresh to show new files
        } catch (error) {
            console.error('Upload error:', error);
            alert('Erreur lors de l\'upload.');
        }
    };

    const handleAddLog = async (logData) => {
        if (!plan) return;
        try {
            const response = await axios.post(`/plans/${plan.id}/logs`, logData, { withCredentials: true });
            setPlan(prev => ({
                ...prev,
                practice_logs: [response.data, ...(prev.practice_logs || [])]
            }));
        } catch (error) {
            console.error('Error adding log:', error);
            alert('Erreur lors de l\'ajout du journal.');
        }
    };

    const handleDeleteLog = async (logId) => {
        if (!confirm('Supprimer cette entrée ?')) return;
        try {
            await axios.delete(`/plans/logs/${logId}`, { withCredentials: true });
            setPlan(prev => ({
                ...prev,
                practice_logs: (prev.practice_logs || []).filter(l => l.id !== logId)
            }));
        } catch (error) {
            console.error('Delete log error:', error);
            alert('Erreur lors de la suppression.');
        }
    };

    if (loading) return <div className="p-8 text-center">Chargement...</div>;
    if (!request) return <div className="p-8 text-center">Demande introuvable.</div>;

    const canEditContent = user?.id == request.user_id;

    const renderDocuments = () => {
        if (!request?.documents || request.documents.length === 0) return null;
        return (
            <div className="grid grid-cols-2 gap-4 mt-4">
                {request.documents.map(doc => (
                    <div key={doc.id} className="flex items-center p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <FileText className="w-5 h-5 text-navy-500 mr-3" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{doc.file_name}</p>
                            <p className="text-xs text-gray-500">{Math.round(doc.file_size_kb)} KB</p>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto pb-12 px-4 md:px-6">
            <div className="mb-8">
                <button
                    onClick={() => navigate(user.role === 'manager' && request.user_id !== user.id ? '/team-practical-application' : '/practical-application')}
                    className="flex items-center text-gray-500 hover:text-gray-900 mb-4 transition-colors cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour
                </button>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">{request.title}</h1>
                        <p className="text-gray-500 mt-1 font-medium">Mise en pratique & Impact Business</p>
                    </div>
                    {canEditContent && (
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="inline-flex items-center px-6 py-3 bg-navy-600 text-white rounded-xl hover:bg-navy-700 font-bold shadow-lg hover:shadow-navy-500/30 transition-all disabled:opacity-50 cursor-pointer hover:-translate-y-0.5"
                        >
                            {saving ? 'Sauvegarde...' : <><Save className="w-4 h-4 mr-2" /> Enregistrer</>}</button>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden mb-8">
                <div className="border-b border-gray-100 p-2 bg-gray-50/50">
                    <nav className="flex space-x-2 bg-gray-100/50 p-1.5 rounded-2xl">
                        {[{ id: 'overview', name: '🎯 Bilan à chaud' }, { id: 'journal', name: '📔 Journal de Bord' }, { id: 'impact', name: '🚀 Impact & ROI' }].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={clsx("flex-1 py-3 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer", activeTab === tab.id ? "bg-white text-navy-600 shadow-sm ring-1 ring-black/5" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50")}
                            >
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-0">
                    {activeTab === 'overview' && (
                        <div className="p-8 animate-fadeIn space-y-8">
                            <div className="bg-navy-50 rounded-xl p-6 border border-navy-100 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-navy-900 mb-2">Pourquoi c'est important ?</h3>
                                    <p className="text-sm text-navy-700">Formaliser vos acquis dans les 72h après la formation augmente de <strong>50%</strong> la rétention.</p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                {skills.map((skill, index) => <SkillCard key={index} skill={skill} index={index} onChange={handleSkillChange} disabled={!canEditContent} plan={plan} onAddLog={handleAddLog} onDeleteLog={handleDeleteLog} />)}
                            </div>
                        </div>
                    )}

                    {activeTab === 'journal' && (
                        <div className="p-8 animate-fadeIn">
                            <PracticeLogTimeline plan={plan} skills={skills} onAddLog={handleAddLog} onDeleteLog={handleDeleteLog} readOnly={!canEditContent} />
                        </div>
                    )}

                    {activeTab === 'impact' && (
                        <div className="p-8 space-y-12 animate-fadeIn bg-slate-50 min-h-screen">
                            {/* NEW: Impact Score Breakdown Card */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-gradient-to-br from-navy-500 to-navy-600 rounded-xl text-white shadow-lg shadow-navy-200">
                                            <Award className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                                Score d'Impact
                                                <button
                                                    onClick={() => setShowGuide(true)}
                                                    className="text-xs font-normal text-navy-500 underline hover:text-navy-700 ml-2"
                                                >
                                                    Comprendre mon score
                                                </button>
                                            </h2>
                                            <p className="text-sm text-gray-500 font-medium">Suivi de la valorisation de votre formation</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={clsx("text-4xl font-black tracking-tighter transition-all", impactScore === 100 ? "text-green-500" : "text-navy-600")}>{impactScore}/100</div>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden mb-4">
                                    <div className="bg-gradient-to-r from-navy-500 to-navy-500 h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${impactScore}%` }}></div>
                                </div>
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {scoreBreakdown.map((item, idx) => (
                                        <div key={idx} className={clsx("flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-colors", item.done ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-400 border-gray-100")}>
                                            {item.done ? <CheckCircle2 className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-gray-300"></div>}
                                            {item.label}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* LEVEL 3: BEHAVIOR V3 */}
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="bg-emerald-100 p-2 rounded-lg"><Users className="w-6 h-6 text-emerald-600" /></div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900">Niveau 3 : Le Transfert</h3>
                                        <p className="text-gray-500">Changements comportementaux observés</p>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="md:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-200 relative overflow-hidden">
                                        <div className="flex justify-between items-start mb-6">
                                            <h4 className="font-bold text-gray-900 text-lg flex items-center"><TrendingUp className="w-5 h-5 mr-2 text-emerald-500" /> Comparatif Avant / Après</h4>

                                            {/* Magnitude Selector IMPROVED V3 */}
                                            <div className="flex bg-gray-100 p-1 rounded-xl">
                                                {[{ id: 'marginal', label: 'Modif. Mineure', icon: '🌱' }, { id: 'moderate', label: 'Nouvelle Pratique', icon: '🚀' }, { id: 'radical', label: 'Changement Radical', icon: '🔥' }].map(m => (
                                                    <button
                                                        key={m.id}
                                                        onClick={() => setBeforeAfter({ ...beforeAfter, magnitude: m.id })}
                                                        className={clsx(
                                                            "px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2",
                                                            beforeAfter.magnitude === m.id ? "bg-white text-emerald-700 shadow-md ring-1 ring-black/5 scale-105" : "text-gray-400 hover:text-gray-600 hover:bg-gray-200/50"
                                                        )}
                                                    >
                                                        <span>{m.icon}</span> {m.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-8 relative items-stretch">
                                            <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-lg border border-gray-100">
                                                <ArrowRight className="w-6 h-6 text-gray-400" />
                                            </div>

                                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 flex flex-col shadow-sm">
                                                <div className="flex items-center gap-2 mb-4 text-gray-500 font-bold uppercase text-xs tracking-wider">
                                                    <div className="w-2 h-2 rounded-full bg-gray-400"></div> Avant
                                                </div>
                                                <textarea
                                                    value={beforeAfter.before}
                                                    onChange={(e) => setBeforeAfter({ ...beforeAfter, before: e.target.value })}
                                                    disabled={!canEditContent}
                                                    className="w-full bg-white border border-gray-200 rounded-xl p-4 text-gray-600 resize-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300 placeholder-gray-300 flex-grow min-h-[160px] shadow-sm transition-all text-sm leading-relaxed"
                                                    placeholder="Décrivez votre méthodologie ou comportement précédent..."
                                                ></textarea>
                                            </div>

                                            <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100 flex flex-col shadow-sm">
                                                <div className="flex items-center gap-2 mb-4 text-emerald-700 font-bold uppercase text-xs tracking-wider">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Après
                                                </div>
                                                <textarea
                                                    value={beforeAfter.after}
                                                    onChange={(e) => setBeforeAfter({ ...beforeAfter, after: e.target.value })}
                                                    disabled={!canEditContent}
                                                    className="w-full bg-white border border-emerald-100 rounded-xl p-4 text-gray-800 font-medium resize-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300 placeholder-emerald-200/50 min-h-[160px] mb-6 shadow-sm transition-all text-sm leading-relaxed"
                                                    placeholder="Décrivez votre nouvelle pratique..."
                                                ></textarea>

                                                <div className="mt-auto border-t border-emerald-100 pt-4">
                                                    <label className="text-emerald-800 text-xs font-bold uppercase mb-2 block flex items-center gap-2">
                                                        <Zap className="w-3 h-3" />
                                                        Déclencheur (Nouveau réflexe)
                                                    </label>
                                                    <textarea
                                                        value={beforeAfter.trigger || ''}
                                                        onChange={(e) => setBeforeAfter({ ...beforeAfter, trigger: e.target.value })}
                                                        disabled={!canEditContent}
                                                        className="w-full bg-white border border-emerald-100 rounded-xl p-3 text-sm text-gray-700 placeholder-emerald-200 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300 transition-all resize-none shadow-sm"
                                                        rows={3}
                                                        placeholder="Quel élément déclenche cette nouvelle action ? (ex: Quand je reçois un mail de...)"
                                                    ></textarea>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Habit Frequency */}
                                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200 flex flex-col justify-between">
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-lg mb-6 flex items-center">
                                                <Activity className="w-5 h-5 mr-2 text-yellow-500" />
                                                Fréquence d'application
                                            </h4>
                                            <div className="space-y-4">
                                                <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest px-2">
                                                    <span>Rare</span>
                                                    <span>Hebdo</span>
                                                    <span>Jour</span>
                                                    <span>Réflexe</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="1"
                                                    max="4"
                                                    step="1"
                                                    value={habitFrequency || 1}
                                                    onChange={(e) => setHabitFrequency(parseInt(e.target.value))}
                                                    disabled={!canEditContent}
                                                    className="w-full h-4 bg-gray-100 rounded-full appearance-none cursor-pointer accent-emerald-500"
                                                />
                                            </div>
                                        </div>
                                        <div className="mt-6 bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-xs text-yellow-700 leading-relaxed">
                                            <strong>💡 Astuce :</strong> Il faut en moyenne 66 jours pour qu'un nouveau comportement devienne automatique (Lally, 2010). Tenez bon !
                                        </div>
                                    </div>

                                    {/* NEW FEATURE: FEEDBACK CARD (Filling the empty space) */}
                                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200 flex flex-col">
                                        <h4 className="font-bold text-gray-900 text-lg mb-4 flex items-center">
                                            <Users className="w-5 h-5 mr-2 text-navy-500" />
                                            Preuve Sociale (Feedback)
                                        </h4>
                                        <div className="space-y-4 flex-grow flex flex-col">
                                            <p className="text-sm text-gray-600">Quelqu'un a-t-il remarqué votre changement ?</p>
                                            <textarea
                                                className="w-full bg-navy-50/30 border border-navy-100 rounded-xl text-sm p-4 focus:bg-white focus:border-navy-300 focus:ring-2 focus:ring-navy-100 transition-all resize-none flex-grow"
                                                rows={4}
                                                placeholder='"Mon manager m a félicité pour..." / "Un client a apprécié..."'
                                                value={beforeAfter.feedback || ''}
                                                onChange={(e) => setBeforeAfter({ ...beforeAfter, feedback: e.target.value })}
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* LEVEL 4: RESULTS V3 */}
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="bg-navy-100 p-2 rounded-lg"><BarChart3 className="w-6 h-6 text-navy-600" /></div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900">Niveau 4 : Impact Business</h3>
                                        <p className="text-gray-500">Gains tangibles pour l'entreprise</p>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-8">
                                    {/* Simplified ROI "Card" V3 */}
                                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200">
                                        <h4 className="font-bold text-gray-900 text-lg mb-6 flex items-center">
                                            <Calculator className="w-5 h-5 mr-2 text-navy-500" />
                                            Gains Estimés
                                        </h4>

                                        <div className="space-y-8">
                                            <div className="flex gap-2">
                                                {[{ id: 'time', label: 'Du Temps ⏳' }, { id: 'quality', label: 'De la Qualité 💎' }, { id: 'money', label: 'De l\'Argent 💶' }].map(t => (
                                                    <button
                                                        key={t.id}
                                                        onClick={() => setRoiCalc({ ...roiCalc, savedWhat: t.id, unit: t.id === 'money' ? 'euros' : t.id === 'time' ? 'minutes' : 'points', frequency: t.id === 'money' ? 'month' : t.id === 'time' ? 'weekly' : 'month' })}
                                                        className={clsx("flex-1 py-3 rounded-xl border-2 font-bold text-xs transition-all", roiCalc.savedWhat === t.id ? "border-navy-500 bg-navy-50 text-navy-700 shadow-sm transform scale-105" : "border-gray-100 text-gray-400 hover:border-gray-200 bg-gray-50")}
                                                    >
                                                        {t.label}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Mad Libs Style Input V4 */}
                                            <div className="bg-navy-50/50 p-8 rounded-3xl border-2 border-dashed border-navy-100 relative group transition-all hover:bg-white hover:border-navy-200">
                                                <div className="text-lg md:text-xl font-medium text-gray-700 leading-relaxed flex flex-wrap items-center gap-x-2 gap-y-4">
                                                    <span>Grâce à cette formation, j'estime</span>
                                                    
                                                    {roiCalc.savedWhat === 'money' ? (
                                                        <span className="font-bold text-emerald-600">générer ou économiser</span>
                                                    ) : roiCalc.savedWhat === 'time' ? (
                                                        <span className="font-bold text-navy-600">gagner un temps de</span>
                                                    ) : (
                                                        <span className="font-bold text-purple-600">améliorer la qualité de</span>
                                                    )}

                                                    <div className="relative inline-block">
                                                        <input 
                                                            type="number" 
                                                            value={roiCalc.amount} 
                                                            onChange={(e) => setRoiCalc({ ...roiCalc, amount: e.target.value })} 
                                                            className={clsx(
                                                                "w-24 text-center font-black bg-white border-b-4 rounded-t-lg focus:ring-0 px-2 py-1 transition-all",
                                                                roiCalc.savedWhat === 'money' ? "border-emerald-400 text-emerald-700" : 
                                                                roiCalc.savedWhat === 'time' ? "border-navy-400 text-navy-700" : 
                                                                "border-purple-400 text-purple-700"
                                                            )}
                                                            placeholder="0" 
                                                        />
                                                    </div>

                                                    {roiCalc.savedWhat === 'time' && (
                                                        <select 
                                                            value={roiCalc.unit} 
                                                            onChange={(e) => setRoiCalc({ ...roiCalc, unit: e.target.value })} 
                                                            className="bg-white border-b-4 border-navy-200 font-bold text-navy-700 focus:ring-0 cursor-pointer rounded-t-lg px-2 py-1"
                                                        >
                                                            <option value="minutes">Minutes</option>
                                                            <option value="hours">Heures</option>
                                                        </select>
                                                    )}

                                                    {roiCalc.savedWhat === 'money' && <span className="font-black text-emerald-700">€</span>}
                                                    
                                                    {roiCalc.savedWhat === 'quality' && <span className="font-black text-purple-700">%</span>}

                                                    <span>par</span>

                                                    <select 
                                                        value={roiCalc.frequency} 
                                                        onChange={(e) => setRoiCalc({ ...roiCalc, frequency: e.target.value })} 
                                                        className={clsx(
                                                            "bg-white border-b-4 font-bold focus:ring-0 cursor-pointer rounded-t-lg px-2 py-1 transition-all",
                                                            roiCalc.savedWhat === 'money' ? "border-emerald-200 text-emerald-700" : 
                                                            roiCalc.savedWhat === 'time' ? "border-navy-200 text-navy-700" : 
                                                            "border-purple-200 text-purple-700"
                                                        )}
                                                    >
                                                        {roiCalc.savedWhat === 'time' && (
                                                            <>
                                                                <option value="day">Jour</option>
                                                                <option value="week">Semaine</option>
                                                                <option value="month">Mois</option>
                                                            </>
                                                        )}
                                                        {roiCalc.savedWhat === 'money' && (
                                                            <>
                                                                <option value="month">Mois</option>
                                                                <option value="year">An</option>
                                                                <option value="one-off">Opération ponctuelle</option>
                                                            </>
                                                        )}
                                                        {roiCalc.savedWhat === 'quality' && (
                                                            <>
                                                                <option value="month">Mois</option>
                                                                <option value="year">An</option>
                                                            </>
                                                        )}
                                                    </select>
                                                </div>
                                            </div>

                                            {roiCalc.amount && (
                                                <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-2xl text-center animate-bounce-short flex flex-col items-center justify-center border-4 border-slate-800">
                                                    <p className="opacity-60 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Impact Annuel Estimé</p>
                                                    <p className="text-4xl font-black flex items-center gap-3">
                                                        <span className="text-5xl">
                                                            {roiCalc.savedWhat === 'money' ? '💰' : roiCalc.savedWhat === 'time' ? '⏳' : '⭐'}
                                                        </span>
                                                        {(() => {
                                                            const val = parseFloat(roiCalc.amount) || 0;
                                                            let annual = 0;
                                                            if (roiCalc.frequency === 'day') annual = val * 220;
                                                            else if (roiCalc.frequency === 'week' || roiCalc.frequency === 'weekly') annual = val * 48;
                                                            else if (roiCalc.frequency === 'month') annual = val * 12;
                                                            else annual = val; // case 'year' or 'one-off'
                                                            return Math.round(annual).toLocaleString();
                                                        })()}
                                                        <span className="text-xl font-bold text-slate-400 uppercase">
                                                            {roiCalc.savedWhat === 'money' ? '€' : roiCalc.unit}
                                                        </span>
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* KPI Dashboard V3 - REDESIGNED FOR VISIBILITY */}
                                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200 flex flex-col">
                                        <h4 className="font-bold text-gray-900 text-lg mb-6 flex items-center justify-between">
                                            <div className="flex items-center">
                                                <Target className="w-6 h-6 mr-2 text-red-500" />
                                                <span>Indicateurs Clés (KPI)</span>
                                            </div>
                                            <button
                                                onClick={() => setKpis([...kpis, { label: 'Nouvel KPI', start: '', current: '', target: '' }])}
                                                className="bg-navy-50 text-navy-600 p-2 rounded-full hover:bg-navy-100 transition-colors"
                                                title="Ajouter un indicateur"
                                            >
                                                <Plus className="w-5 h-5" />
                                            </button>
                                        </h4>

                                        <div className="space-y-6 flex-grow">
                                            {kpis.length === 0 && (
                                                <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl">
                                                    <p className="text-sm">Aucun indicateur défini.</p>
                                                    <button onClick={() => setKpis([...kpis, { label: '', start: '', current: '', target: '' }])} className="mt-2 text-navy-500 font-bold text-sm hover:underline">Ajouter mon premier KPI</button>
                                                </div>
                                            )}

                                            {kpis.map((kpi, idx) => (
                                                <div key={idx} className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md hover:border-navy-100 group">
                                                    {/* KPI Header */}
                                                    <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center relative">
                                                        <input
                                                            value={kpi.label}
                                                            onChange={(e) => { const n = [...kpis]; n[idx].label = e.target.value; setKpis(n); }}
                                                            className="w-[90%] bg-transparent border-none p-0 text-base font-bold text-gray-800 focus:ring-0 placeholder-gray-400"
                                                            placeholder="Nom de l'indicateur (ex: Taux de conversion)"
                                                        />
                                                        <button onClick={() => setKpis(kpis.filter((_, i) => i !== idx))} className="text-gray-300 hover:text-red-500 transition-colors bg-white rounded-full p-1 shadow-sm"><Trash2 className="w-4 h-4" /></button>
                                                    </div>

                                                    {/* KPI Body - Large Visual Flow */}
                                                    <div className="p-4 grid grid-cols-3 gap-0 divide-x divide-gray-100">
                                                        <div className="px-2 flex flex-col items-center justify-center">
                                                            <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Départ</span>
                                                            <input
                                                                value={kpi.start}
                                                                onChange={(e) => { const n = [...kpis]; n[idx].start = e.target.value; setKpis(n); }}
                                                                className="w-full text-center text-xl font-bold text-gray-500 bg-transparent border-none p-0 focus:ring-0 placeholder-gray-200"
                                                                placeholder="0"
                                                            />
                                                        </div>
                                                        <div className="px-2 flex flex-col items-center justify-center bg-navy-50/30">
                                                            <span className="text-[10px] uppercase tracking-widest font-bold text-navy-500 mb-2">Actuel</span>
                                                            <input
                                                                value={kpi.current}
                                                                onChange={(e) => { const n = [...kpis]; n[idx].current = e.target.value; setKpis(n); }}
                                                                className="w-full text-center text-2xl font-black text-navy-600 bg-transparent border-none p-0 focus:ring-0 placeholder-navy-200"
                                                                placeholder="-"
                                                            />
                                                        </div>
                                                        <div className="px-2 flex flex-col items-center justify-center">
                                                            <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-500 mb-2">Cible</span>
                                                            <input
                                                                value={kpi.target}
                                                                onChange={(e) => { const n = [...kpis]; n[idx].target = e.target.value; setKpis(n); }}
                                                                className="w-full text-center text-xl font-bold text-emerald-600 bg-transparent border-none p-0 focus:ring-0 placeholder-emerald-200"
                                                                placeholder="100"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 bg-gradient-to-br from-navy-900 to-slate-900 rounded-3xl p-8 shadow-xl text-white">
                                        <h4 className="font-bold text-white text-xl mb-2 flex items-center"><Sparkles className="w-6 h-6 mr-3 text-yellow-400" /> Votre "Success Story" (Méthode STAR)</h4>
                                        <p className="text-navy-200 mb-8 text-sm">Format idéal pour présenter vos résultats lors de l'entretien annuel.</p>
                                        <div className="grid md:grid-cols-2 gap-8">
                                            {/* SITUATION */}
                                            <div className="space-y-3">
                                                <label className="text-xs font-bold text-navy-300 uppercase tracking-widest flex items-center gap-2">
                                                    <span className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-[10px] font-black border border-white/20">S</span>
                                                    Situation (Contexte)
                                                </label>
                                                <p className="text-xs text-navy-400/80 italic">Quel était le contexte, le problème ou l'opportunité de départ ?</p>
                                                <textarea
                                                    rows={8}
                                                    value={starStory.situation}
                                                    onChange={(e) => setStarStory({ ...starStory, situation: e.target.value })}
                                                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 text-white placeholder-slate-500 transition-all focus:bg-slate-800 p-4 resize-none leading-relaxed"
                                                    placeholder="Ex: Lors du projet X, nous avons rencontré un blocage sur..."
                                                ></textarea>
                                            </div>

                                            {/* TASK */}
                                            <div className="space-y-3">
                                                <label className="text-xs font-bold text-navy-300 uppercase tracking-widest flex items-center gap-2">
                                                    <span className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-[10px] font-black border border-white/20">T</span>
                                                    Tâche (Objectif)
                                                </label>
                                                <p className="text-xs text-navy-400/80 italic">Quel était votre objectif précis ou le défi à relever ?</p>
                                                <textarea
                                                    rows={8}
                                                    value={starStory.task}
                                                    onChange={(e) => setStarStory({ ...starStory, task: e.target.value })}
                                                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 text-white placeholder-slate-500 transition-all focus:bg-slate-800 p-4 resize-none leading-relaxed"
                                                    placeholder="Ex: Mon objectif était de réduire le temps de traitement de 20%..."
                                                ></textarea>
                                            </div>

                                            {/* ACTION */}
                                            <div className="space-y-3">
                                                <label className="text-xs font-bold text-navy-300 uppercase tracking-widest flex items-center gap-2">
                                                    <span className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-[10px] font-black border border-white/20">A</span>
                                                    Action (Ce que j'ai fait)
                                                </label>
                                                <p className="text-xs text-navy-400/80 italic">Quelles actions spécifiques avez-vous entreprises grâce à la formation ?</p>
                                                <textarea
                                                    rows={8}
                                                    value={starStory.action}
                                                    onChange={(e) => setStarStory({ ...starStory, action: e.target.value })}
                                                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 text-white placeholder-slate-500 transition-all focus:bg-slate-800 p-4 resize-none leading-relaxed"
                                                    placeholder="Ex: J'ai appliqué la méthode Z apprise en formation pour restructurer..."
                                                ></textarea>
                                            </div>

                                            {/* RESULT */}
                                            <div className="space-y-3">
                                                <label className="text-xs font-bold text-navy-300 uppercase tracking-widest flex items-center gap-2">
                                                    <span className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-[10px] font-black border border-white/20">R</span>
                                                    Résultat (Impact)
                                                </label>
                                                <p className="text-xs text-navy-400/80 italic">Quels ont été les résultats tangibles ? (Chiffres, feedback, gains)</p>
                                                <textarea
                                                    rows={8}
                                                    value={starStory.result}
                                                    onChange={(e) => setStarStory({ ...starStory, result: e.target.value })}
                                                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 text-white placeholder-slate-500 transition-all focus:bg-slate-800 p-4 resize-none leading-relaxed"
                                                    placeholder="Ex: Cela a permis d'économiser 2h par semaine à toute l'équipe."
                                                ></textarea>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Manager Review Section */}
                            {(user.role === 'manager' || managerReviewedAt) && (
                                <div className="mt-8 bg-navy-50/50 rounded-2xl p-6 border border-navy-100">
                                    <h4 className="font-bold text-navy-900 text-lg mb-4 flex items-center">
                                        <CheckCircle2 className="w-5 h-5 mr-2 text-navy-600" />
                                        Validation Manager
                                    </h4>

                                    {user.role === 'manager' ? (
                                        <div className="space-y-4">
                                            <p className="text-sm text-navy-700">
                                                En tant que manager, validez que ce plan d'action est cohérent et que les résultats sont alignés avec vos attentes.
                                                Cette action validera le suivi dans votre tableau de bord.
                                            </p>
                                            <textarea
                                                className="w-full bg-white border-navy-200 rounded-xl text-sm focus:ring-navy-500 focus:border-navy-500"
                                                rows={3}
                                                placeholder="Un commentaire sur la mise en pratique ou les résultats..."
                                                value={managerReviewComment}
                                                onChange={(e) => setManagerReviewComment(e.target.value)}
                                            ></textarea>
                                        </div>
                                    ) : (
                                        <div className="bg-white p-4 rounded-xl border border-navy-100">
                                            <p className="text-sm text-gray-600 italic">
                                                "{managerReviewComment || "Validé sans commentaire."}"
                                            </p>
                                            <p className="text-xs text-navy-500 font-bold mt-2 text-right">
                                                Validé le {new Date(managerReviewedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex justify-end pt-8">
                                {/* Only show button if: 
                                    - User is the owner (canEditContent)
                                    - OR User is manager AND it's not validated yet (to allow validation)
                                    - OR User is manager AND wants to update their comment 
                                */}
                                {(canEditContent || user.role === 'manager') && (
                                    <button
                                        onClick={() => {
                                            if (user.role === 'manager') {
                                                // Manager Validation Logic
                                                if (!managerReviewedAt) {
                                                    setManagerReviewedAt(new Date().toISOString());
                                                }
                                                // We need to wait for state update in handleSave, but handleSave uses current state variable.
                                                // So we'll modify handleSave to handle this immediate update.
                                                handleSave(true); // pass true for "isManagerValidation"
                                            } else {
                                                handleSave();
                                            }
                                        }}
                                        className={clsx(
                                            "px-8 py-4 text-white rounded-2xl font-bold shadow-xl hover:scale-105 transition-all text-lg cursor-pointer flex items-center gap-3",
                                            user.role === 'manager' ? "bg-emerald-600 hover:bg-emerald-700" : "bg-navy-600 hover:bg-navy-700"
                                        )}
                                    >
                                        {user.role === 'manager' ? (
                                            <>
                                                <CheckCircle2 className="w-6 h-6" />
                                                {managerReviewedAt ? "Mettre à jour la validation" : "Valider le suivi & l'impact"}
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-6 h-6" />
                                                Sauvegarder mon Bilan
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-8 border-t border-gray-100 bg-gray-50/30">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-6">
                        <Upload className="w-5 h-5 mr-2 text-navy-600" />
                        Documents & Preuves de pratique
                    </h2>
                    {renderDocuments()}
                    <label className="block w-full cursor-pointer mt-4">
                        <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-8 text-center hover:border-navy-400 hover:bg-navy-50/20 transition-all">
                            <div className="w-12 h-12 bg-navy-50 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                                <Upload className="w-6 h-6 text-navy-600" />
                            </div>
                            <p className="text-sm font-medium text-gray-900">Ajouter une preuve de pratique</p>
                            <p className="text-xs text-gray-500 mt-1">Capture d'écran, Email de félicitations, Rapport...</p>
                            <input
                                type="file"
                                className="hidden"
                                onChange={handleFileUpload}
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                disabled={!canEditContent}
                            />
                        </div>
                    </label>
                </div>
            </div>
            {showGuide && <ScoreGuideModal onClose={() => setShowGuide(false)} />}
        </div >
    );
}

function ScoreGuideModal({ onClose }) {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-scaleIn">
                <div className="bg-navy-600 p-6 flex items-center justify-between text-white">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Award className="w-6 h-6" />
                        Comprendre son Score d'Impact
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-8">
                    <div className="text-center mb-8">
                        <p className="text-gray-500 text-sm mb-2">Votre objectif</p>
                        <div className="text-5xl font-black text-navy-600 mb-2">100 / 100</div>
                        <p className="text-sm text-gray-400">Plus votre score est élevé, plus votre formation vous a été utile.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h4 className="font-bold text-gray-900 border-b pb-2">Niveau 3 : Transfert (60 pts)</h4>
                            <ul className="space-y-3 text-sm text-gray-600">
                                <li className="flex justify-between">
                                    <span>Transformation (Avant/Après)</span>
                                    <span className="font-bold text-navy-600">+15 pts</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Déclencheur identifié</span>
                                    <span className="font-bold text-navy-600">+10 pts</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Magnitude du changement</span>
                                    <span className="font-bold text-navy-600">+5 à 15 pts</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Fréquence de pratique</span>
                                    <span className="font-bold text-navy-600">+5 à 20 pts</span>
                                </li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-bold text-gray-900 border-b pb-2">Niveau 4 : Résultats (40 pts)</h4>
                            <ul className="space-y-3 text-sm text-gray-600">
                                <li className="flex justify-between">
                                    <span>ROI Estimé (Chiffré)</span>
                                    <span className="font-bold text-navy-600">+20 pts</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Story Complète (STAR)</span>
                                    <span className="font-bold text-navy-600">+20 pts</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-8 bg-gray-50 p-4 rounded-xl text-xs text-gray-500 text-center">
                        Ce score est visible par votre manager et vos RH pour valoriser votre montée en compétence.
                    </div>
                </div>
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-center">
                    <button onClick={onClose} className="px-6 py-2 bg-navy-600 text-white rounded-lg font-bold hover:bg-navy-700 transition-colors cursor-pointer">
                        J'ai compris
                    </button>
                </div>
            </div>
        </div>
    );
}
