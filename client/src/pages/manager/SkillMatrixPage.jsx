import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
    LayoutGrid,
    Search,
    Filter,
    ArrowLeft,
    TrendingUp,
    Users,
    Award,
    ChevronRight,
    Loader2,
    Info,
    PieChart,
    Layers,
    Save,
    X,
    MoreHorizontal,
    Plus,
    Edit2,
    Trash2,
    Columns,
    AlertCircle,
    Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
    Tooltip as RechartsTooltip, Legend
} from 'recharts';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';

export default function SkillMatrixPage() {
    const navigate = useNavigate();
    const { user, viewRole } = useAuth();
    const [teamData, setTeamData] = useState([]);
    
    // Skill Management States
    const [displayedSkills, setDisplayedSkills] = useState([]); // Columns shown
    const [availableSkills, setAvailableSkills] = useState([]); // All skills for selection
    
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [editSkill, setEditSkill] = useState(null);

    // Modals
    const [isAddSkillModalOpen, setIsAddSkillModalOpen] = useState(false); 
    const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false); 
    
    const [newSkillName, setNewSkillName] = useState('');
    const [newSkillCategory, setNewSkillCategory] = useState('Hard Skills');
    const [editingSkillNameId, setEditingSkillNameId] = useState(null);
    const [editedSkillName, setEditedSkillName] = useState('');

    // Comparison State
    const [comparisonMode, setComparisonMode] = useState('team'); 
    const [comparisonUserId, setComparisonUserId] = useState(null);

    useEffect(() => {
        fetchMatrix();
    }, []);

    const fetchMatrix = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/skills/matrix');
            setTeamData(data.team);
            setDisplayedSkills(data.teamSkills);
            setAvailableSkills(data.allSystemSkills);
            
            // Auto-select first user if available
            if (data.team.length > 0 && !selectedUser) {
                setSelectedUser(data.team[0]);
            }
        } catch (error) {
            console.error('Error fetching matrix:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSkill = async (level) => {
        try {
            await axios.post('/skills/update', {
                userId: selectedUser.id,
                skillId: editSkill.id,
                level: level
            });

            // Local update for immediate feedback
            const updatedTeam = teamData.map(u => {
                if (u.id === selectedUser.id) {
                    const existingSkillIdx = u.skills.findIndex(s => s.skill_id === editSkill.id);
                    const newSkills = [...u.skills];
                    const updatedSkill = { 
                        skill_id: editSkill.id, 
                        level, 
                        skill: editSkill, 
                        freshness: 100,
                        updated_at: new Date().toISOString()
                    };
                    
                    if (existingSkillIdx >= 0) {
                        newSkills[existingSkillIdx] = { ...newSkills[existingSkillIdx], ...updatedSkill };
                    } else {
                        newSkills.push(updatedSkill);
                    }
                    return { ...u, skills: newSkills };
                }
                return u;
            });

            setTeamData(updatedTeam);
            // Sync selected user
            setSelectedUser(updatedTeam.find(u => u.id === selectedUser.id));
            setEditSkill(null);
        } catch (error) {
            console.error('Update error:', error);
            alert('Erreur lors de la mise à jour.');
        }
    };

    const handleCreateSkill = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post('/skills/create', {
                name: newSkillName,
                category: newSkillCategory
            });

            setAvailableSkills(prev => [...prev, data]);
            setDisplayedSkills(prev => [...prev, data]);
            setNewSkillName('');
            setIsAddSkillModalOpen(false);
        } catch (error) {
            console.error('Create skill error:', error);
            alert('Erreur lors de la création de la compétence.');
        }
    };
    
    const handleAddColumn = (skillId) => {
        const skill = availableSkills.find(s => s.id === parseInt(skillId));
        if (skill && !displayedSkills.find(s => s.id === skill.id)) {
            setDisplayedSkills([...displayedSkills, skill]);
        }
        setIsAddColumnModalOpen(false);
    };

    const handleUpdateSkillName = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.put(`/skills/${editingSkillNameId}`, {
                name: editedSkillName
            });

            const updateList = (list) => list.map(s => s.id === editingSkillNameId ? { ...s, name: data.name } : s);
            setDisplayedSkills(prev => updateList(prev));
            setAvailableSkills(prev => updateList(prev));
            setEditingSkillNameId(null);
        } catch (error) {
            console.error('Update skill name error:', error);
            alert('Erreur lors de la modification.');
        }
    };

    const filteredTeam = teamData.filter(u =>
        `${u.first_name} ${u.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const comparisonUser = useMemo(() => {
        if (comparisonMode === 'user' && comparisonUserId) {
            return teamData.find(u => u.id === comparisonUserId);
        }
        return null;
    }, [comparisonMode, comparisonUserId, teamData]);

    // Prepare radar data - Fixed Logic
    const radarData = useMemo(() => {
        if (!selectedUser || displayedSkills.length === 0) return [];

        const mappedSkills = displayedSkills.map(s => {
            const userSkill = selectedUser.skills.find(us => us.skill_id === s.id);
            const userLevel = userSkill ? userSkill.level : 0;

            let comparisonValue = 0;
            if (comparisonMode === 'team') {
                const totalLevel = teamData.reduce((acc, curr) => {
                    const us = curr.skills.find(sk => sk.skill_id === s.id);
                    return acc + (us ? us.level : 0);
                }, 0);
                comparisonValue = totalLevel / (teamData.length || 1);
            } else if (comparisonUser) {
                const compSkill = comparisonUser.skills.find(sk => sk.skill_id === s.id);
                comparisonValue = compSkill ? compSkill.level : 0;
            }

            return {
                subject: s.name,
                A: userLevel,
                B: Number(comparisonValue.toFixed(1)),
                fullMark: 5
            };
        });

        // Take skills that are relevant to at least one (either user has it or team has it)
        let finalSkills = mappedSkills.filter(s => s.A > 0 || s.B > 0);
        
        // If too many, take top 7
        if (finalSkills.length > 7) {
            finalSkills = finalSkills.sort((a, b) => (b.A + b.B) - (a.A + a.B)).slice(0, 7);
        }

        // Radar needs at least 3 points
        if (finalSkills.length < 3) {
            const remaining = mappedSkills.filter(s => !finalSkills.includes(s)).slice(0, 3 - finalSkills.length);
            finalSkills = [...finalSkills, ...remaining];
        }

        return finalSkills;
    }, [selectedUser, teamData, displayedSkills, comparisonMode, comparisonUser]);

    // Calculate Insights
    const insights = useMemo(() => {
        if (displayedSkills.length === 0 || teamData.length === 0) return { topSkill: null, gapSkill: null };

        const skillScores = displayedSkills.map(skill => {
            const totalScore = teamData.reduce((acc, user) => {
                const s = user.skills.find(sk => sk.skill_id === skill.id);
                return acc + (s ? s.level : 0);
            }, 0);
            return { skill, score: totalScore, avg: totalScore / teamData.length };
        });

        const topSkill = [...skillScores].sort((a, b) => b.score - a.score)[0];
        const gapSkill = [...skillScores].sort((a, b) => a.score - b.score).find(s => s.score > 0) || skillScores[skillScores.length - 1];

        return { topSkill, gapSkill };
    }, [displayedSkills, teamData]);


    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <Loader2 className="h-10 w-10 text-navy-600 animate-spin" />
            <p className="text-gray-500 font-bold">Génération de la matrice...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 px-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-navy-600 hover:border-navy-100 shadow-sm transition-all"
                    >
                        <ArrowLeft className="h-6 w-6" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Layers className="h-6 w-6 text-navy-500" />
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Matrice des Compétences</h1>
                        </div>
                        <p className="text-base text-gray-500 font-medium tracking-tight italic">Pilotage dynamique et détection d'obsolescence (Skill Rust).</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setIsAddColumnModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3.5 bg-white border-2 border-gray-100 hover:border-navy-200 text-gray-700 hover:text-navy-700 rounded-2xl font-black transition-all shadow-sm"
                    >
                        <Columns className="h-5 w-5" />
                        Ajouter Colonne
                    </button>
                    <button
                        onClick={() => setIsAddSkillModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3.5 bg-navy-600 hover:bg-navy-700 text-white rounded-2xl font-black transition-all shadow-lg shadow-navy-100"
                    >
                        <Plus className="h-5 w-5" />
                        Créer Compétence
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Matrix Heatmap */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                        <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <h3 className="text-base font-black text-navy-900 uppercase tracking-widest flex items-center gap-3">
                                <LayoutGrid className="w-5 h-5 text-navy-500" />
                                Heatmap de l'Équipe
                            </h3>
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Chercher un collaborateur..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-navy-500/10 focus:border-navy-500 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr>
                                        <th className="p-8 text-xs font-black text-gray-400 uppercase tracking-widest bg-gray-50/50 sticky left-0 z-10 backdrop-blur-md border-r border-gray-100">
                                            Collaborateurs
                                        </th>
                                        {displayedSkills.map(skill => (
                                            <th key={skill.id} className="p-6 min-w-[140px] text-xs font-black text-gray-600 uppercase tracking-widest text-center border-b border-gray-100 group relative">
                                                <div className="rotate-[-25deg] origin-center -mb-2 cursor-pointer hover:text-navy-600 transition-all hover:scale-110"
                                                    onClick={() => {
                                                        setEditingSkillNameId(skill.id);
                                                        setEditedSkillName(skill.name);
                                                    }}
                                                >
                                                    {skill.name}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTeam.map(collab => (
                                        <tr key={collab.id} className="group hover:bg-navy-50/30 transition-colors">
                                            <td
                                                className={clsx(
                                                    "p-6 px-8 sticky left-0 z-10 bg-white group-hover:bg-navy-50/30 border-r border-gray-100 flex items-center gap-4 cursor-pointer transition-all",
                                                    selectedUser?.id === collab.id && "bg-navy-50 ring-4 ring-inset ring-navy-500/20"
                                                )}
                                                onClick={() => setSelectedUser(collab)}
                                            >
                                                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-navy-500 to-navy-700 flex items-center justify-center text-white text-sm font-black border-4 border-white shadow-lg flex-shrink-0">
                                                    {collab.first_name[0]}{collab.last_name[0]}
                                                </div>
                                                <div className="truncate">
                                                    <div className="text-sm font-black text-gray-900">{collab.first_name} {collab.last_name}</div>
                                                    <div className="text-[11px] font-black text-navy-400 uppercase tracking-wider">{collab.department?.name}</div>
                                                </div>
                                            </td>
                                            {displayedSkills.map(skill => {
                                                const us = collab.skills.find(s => s.skill_id === skill.id);
                                                const level = us ? us.level : 0;
                                                const freshness = us?.freshness ?? 100;
                                                const isStale = freshness < 50 && level > 0;
                                                const isFresh = freshness >= 90 && level > 0;

                                                return (
                                                    <td
                                                        key={skill.id}
                                                        className="p-2 border-b border-gray-50 bg-white/50"
                                                        onClick={() => {
                                                            setSelectedUser(collab);
                                                            setEditSkill(skill);
                                                        }}
                                                    >
                                                        <div className={clsx(
                                                            "h-12 w-full rounded-2xl flex flex-col items-center justify-center text-sm font-black cursor-pointer transition-all hover:scale-105 hover:shadow-xl relative overflow-hidden group/cell",
                                                            level === 0 ? "bg-gray-50 text-gray-300 border-2 border-dashed border-gray-100" :
                                                                level === 1 ? "bg-red-50 text-red-600 border-2 border-red-100" :
                                                                    level === 2 ? "bg-orange-50 text-orange-600 border-2 border-orange-100" :
                                                                        level === 3 ? "bg-amber-50 text-amber-600 border-2 border-amber-100" :
                                                                            level === 4 ? "bg-emerald-50 text-emerald-600 border-2 border-emerald-100" :
                                                                                "bg-navy-600 text-white shadow-lg shadow-navy-100 border-2 border-navy-500"
                                                        )}
                                                        style={{
                                                            opacity: isStale ? 0.7 : 1,
                                                            borderColor: isStale ? '#fb923c' : (isFresh ? '#86efac' : undefined),
                                                            borderStyle: isStale ? 'dashed' : 'solid'
                                                        }}
                                                        >
                                                            {level || '-'}
                                                            
                                                            {/* Enhanced Freshness Badges */}
                                                            {isStale && (
                                                                <div className="absolute inset-0 bg-orange-500/5 flex items-center justify-center">
                                                                    <AlertCircle className="absolute top-1 right-1 w-3 h-3 text-orange-500 animate-pulse" />
                                                                </div>
                                                            )}
                                                            {isFresh && (
                                                                <div className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.8)]"></div>
                                                            )}
                                                            
                                                            {/* Tooltip on Hover */}
                                                            <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-[10px] text-white py-1 opacity-0 group-hover/cell:opacity-100 transition-opacity pointer-events-none text-center">
                                                                {isStale ? `ROUILLÉ : ${freshness}%` : (level > 0 ? `FRAIS : ${freshness}%` : 'Non acquis')}
                                                            </div>
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Legend - Professionalized */}
                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl flex flex-wrap items-center gap-x-10 gap-y-4">
                        <div className="flex flex-col gap-2">
                            <span className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Niveaux de Maîtrise</span>
                            <div className="flex items-center gap-4">
                                {[
                                    { l: 1, text: 'Init.', color: 'bg-red-50' },
                                    { l: 2, text: 'Inter.', color: 'bg-orange-50' },
                                    { l: 3, text: 'Mait.', color: 'bg-amber-50' },
                                    { l: 4, text: 'Avancé', color: 'bg-emerald-50' },
                                    { l: 5, text: 'Expert', color: 'bg-navy-600' }
                                ].map(item => (
                                    <div key={item.l} className="flex items-center gap-2">
                                        <div className={clsx("w-3.5 h-3.5 rounded-lg", item.color, "border border-gray-200")}></div>
                                        <span className="text-xs font-black text-gray-600">{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="h-10 w-px bg-gray-100"></div>
                        <div className="flex flex-col gap-2">
                            <span className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">État de la Compétence</span>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-md border-2 border-dashed border-orange-400 bg-orange-50"></div>
                                    <span className="text-xs font-black text-orange-600">Rouillée (&lt; 50% fraîcheur)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-md border-2 border-green-400 bg-green-50 shadow-[0_0_5px_rgba(74,222,128,0.5)]"></div>
                                    <span className="text-xs font-black text-green-600">Fraîche (&gt; 90%)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Insights & Visualization */}
                <div className="space-y-8">
                    {/* Insights Card */}
                    <div className="bg-navy-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-8">
                                <h3 className="text-xl font-black flex items-center gap-3">
                                    <Award className="w-6 h-6 text-navy-400" />
                                    Performance IA
                                </h3>
                                <div className="bg-white/10 p-2 rounded-xl">
                                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                                </div>
                            </div>

                            {insights.topSkill && (
                                <div className="space-y-8">
                                    <div className="bg-white/5 backdrop-blur-xl rounded-[1.5rem] p-6 border border-white/10 hover:bg-white/10 transition-colors">
                                        <p className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-2">Pilier de l'Équipe</p>
                                        <p className="text-xl font-bold mb-4">{insights.topSkill.skill.name}</p>
                                        <div className="flex justify-between text-xs font-black text-navy-300 mb-2">
                                            <span>Maitrise Globale</span>
                                            <span>{(insights.topSkill.avg / 5 * 100).toFixed(0)}%</span>
                                        </div>
                                        <div className="h-2.5 w-full bg-navy-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000" style={{ width: `${insights.topSkill.avg / 5 * 100}%` }}></div>
                                        </div>
                                    </div>

                                    {insights.gapSkill && (
                                        <div className="bg-white/5 backdrop-blur-xl rounded-[1.5rem] p-6 border border-white/10 hover:bg-white/10 transition-colors">
                                            <p className="text-[11px] font-black text-orange-400 uppercase tracking-[0.2em] mb-2">Risque d'Obsolescence</p>
                                            <p className="text-xl font-bold mb-4">{insights.gapSkill.skill.name}</p>
                                            <p className="text-xs text-navy-200 leading-relaxed font-medium">
                                                Moyenne de <span className="font-bold text-white">{insights.gapSkill.avg.toFixed(1)}/5</span>. 
                                                Action recommandée : Planifier un atelier de partage.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {/* Decorative background circles */}
                        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-navy-500/10 rounded-full blur-3xl group-hover:bg-navy-500/20 transition-all"></div>
                    </div>

                    {/* Radar Chart Card - ENHANCED & FIXED */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-2xl flex flex-col min-h-[500px]">
                        <div className="mb-8 flex flex-col gap-6">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
                                    <PieChart className="w-6 h-6 text-navy-600" />
                                    Analyse Comparative
                                </h3>
                                <div className="mt-3 flex items-center gap-2 p-3 bg-navy-50 rounded-2xl border border-navy-100">
                                    <Users className="w-4 h-4 text-navy-500" />
                                    <p className="text-sm font-black text-navy-800">
                                        {selectedUser ? `${selectedUser.first_name}` : 'Sélectionnez un profil'}
                                        <span className="text-navy-400 font-bold mx-2">vs</span>
                                        {comparisonMode === 'team' ? 'Moyenne Équipe' : comparisonUser?.first_name}
                                    </p>
                                </div>
                            </div>

                            {selectedUser && (
                                <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-2xl">
                                    <button 
                                        onClick={() => setComparisonMode('team')}
                                        className={clsx(
                                            "py-2.5 rounded-xl text-xs font-black transition-all",
                                            comparisonMode === 'team' ? "bg-white text-navy-900 shadow-md" : "text-gray-500 hover:text-gray-700"
                                        )}
                                    >
                                        Moyenne Équipe
                                    </button>
                                    <select
                                        className={clsx(
                                            "py-2.5 rounded-xl text-xs font-black outline-none cursor-pointer transition-all bg-transparent",
                                            comparisonMode === 'user' ? "bg-white text-navy-900 shadow-md" : "text-gray-500"
                                        )}
                                        value={comparisonUserId || ''}
                                        onChange={(e) => {
                                            setComparisonMode('user');
                                            setComparisonUserId(parseInt(e.target.value));
                                        }}
                                    >
                                        <option value="" disabled>Collaborateur...</option>
                                        {teamData
                                            .filter(u => u.id !== selectedUser.id)
                                            .map(u => (
                                                <option key={u.id} value={u.id}>{u.first_name}</option>
                                            ))
                                        }
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 w-full flex items-center justify-center">
                            {selectedUser && radarData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                        <PolarGrid stroke="#e2e8f0" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 900 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
                                        <Radar
                                            name={selectedUser.first_name}
                                            dataKey="A"
                                            stroke="#1e3a8a"
                                            strokeWidth={4}
                                            fill="#1e3a8a"
                                            fillOpacity={0.3}
                                        />
                                        <Radar
                                            name={comparisonMode === 'team' ? 'Moyenne Équipe' : (comparisonUser?.first_name || 'Autre')}
                                            dataKey="B"
                                            stroke="#10b981"
                                            strokeWidth={3}
                                            fill="#10b981"
                                            fillOpacity={0.15}
                                            strokeDasharray="5 5"
                                        />
                                        <RechartsTooltip 
                                            contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px' }}
                                            itemStyle={{ fontWeight: 900, fontSize: '12px' }}
                                        />
                                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '30px', fontSize: '12px', fontWeight: 900, letterSpacing: '0.05em' }} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center p-10 bg-gray-50 rounded-[2rem] border-4 border-dashed border-gray-100">
                                    <Users className="w-16 h-16 text-gray-200 mb-6" />
                                    <p className="text-base font-black text-gray-400 uppercase tracking-widest">Initialisation de l'analyse...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals - Same logic but with improved UI */}
            
            {/* Edit Level Modal */}
            {editSkill && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h4 className="text-2xl font-black text-navy-900">{editSkill.name}</h4>
                                <div className="flex items-center gap-2 mt-2 text-navy-500 font-bold">
                                    <Users className="w-4 h-4" />
                                    <span>{selectedUser.first_name} {selectedUser.last_name}</span>
                                </div>
                            </div>
                            <button onClick={() => setEditSkill(null)} className="p-3 hover:bg-gray-100 rounded-2xl transition-colors">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map(level => (
                                <button
                                    key={level}
                                    onClick={() => handleUpdateSkill(level)}
                                    className={clsx(
                                        "w-full flex items-center justify-between p-5 rounded-[1.5rem] border-2 transition-all group",
                                        "hover:border-navy-500 hover:bg-navy-50 active:scale-95 shadow-sm"
                                    )}
                                >
                                    <div className="flex items-center gap-5">
                                        <span className={clsx(
                                            "w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black shadow-md",
                                            level === 1 ? "bg-red-500 text-white" :
                                                level === 2 ? "bg-orange-500 text-white" :
                                                    level === 3 ? "bg-amber-500 text-white" :
                                                        level === 4 ? "bg-emerald-500 text-white" :
                                                            "bg-navy-900 text-white"
                                        )}>{level}</span>
                                        <span className="text-base font-black text-gray-700">
                                            {level === 1 ? 'Phase Initiale' : level === 2 ? 'En Progression' : level === 3 ? 'Autonome' : level === 4 ? 'Référent' : 'Expert Visionnaire'}
                                        </span>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-navy-500 group-hover:translate-x-1 transition-all" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Add Column Modal */}
            {isAddColumnModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-start mb-8">
                            <h4 className="text-2xl font-black text-navy-900">Ajouter Colonne</h4>
                            <button onClick={() => setIsAddColumnModalOpen(false)} className="p-3 hover:bg-gray-100 rounded-2xl transition-colors">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Sélectionner une compétence existante</label>
                                <select
                                    className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-black focus:ring-4 focus:ring-navy-500/10 focus:border-navy-500 outline-none transition-all text-sm"
                                    onChange={(e) => handleAddColumn(e.target.value)}
                                    defaultValue=""
                                >
                                    <option value="" disabled>Rechercher dans la base...</option>
                                    {availableSkills
                                        .filter(s => !displayedSkills.find(d => d.id === s.id))
                                        .map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))
                                    }
                                </select>
                            </div>
                            <div className="p-4 bg-amber-50 rounded-2xl flex gap-3 border border-amber-100">
                                <Info className="w-5 h-5 text-amber-500 flex-shrink-0" />
                                <p className="text-xs font-bold text-amber-800 leading-relaxed">
                                    L'ajout d'une colonne permet de visualiser une compétence spécifique pour toute l'équipe, même si elle n'est pas encore maîtrisée.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Skill Modal (Create New) */}
            {isAddSkillModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-start mb-8">
                            <h4 className="text-2xl font-black text-navy-900">Nouvelle Compétence</h4>
                            <button onClick={() => setIsAddSkillModalOpen(false)} className="p-3 hover:bg-gray-100 rounded-2xl transition-colors">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateSkill} className="space-y-6">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Nom de la compétence</label>
                                <input
                                    type="text"
                                    required
                                    value={newSkillName}
                                    onChange={e => setNewSkillName(e.target.value)}
                                    className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-black focus:ring-4 focus:ring-navy-500/10 focus:border-navy-500 outline-none transition-all text-sm"
                                    placeholder="Ex: Next.js, Architecture Clean..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Catégorie</label>
                                <select
                                    value={newSkillCategory}
                                    onChange={e => setNewSkillCategory(e.target.value)}
                                    className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-black focus:ring-4 focus:ring-navy-500/10 focus:border-navy-500 outline-none transition-all text-sm"
                                >
                                    <option value="Hard Skills">Hard Skills</option>
                                    <option value="Soft Skills">Soft Skills</option>
                                    <option value="Langues">Langues</option>
                                    <option value="Outils">Outils</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full py-5 bg-navy-900 hover:bg-black text-white font-black rounded-2xl shadow-xl shadow-navy-100 transition-all transform active:scale-95">
                                Créer et Ajouter à la matrice
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
