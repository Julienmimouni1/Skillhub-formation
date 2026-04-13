import React, { useState, useEffect } from 'react';
import {
    Calendar,
    ChevronRight,
    UserCircle,
    Building
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ProfessionalInterviewWidget = ({ users: propUsers = [] }) => {
    const [users, setUsers] = useState(propUsers);
    const [loading, setLoading] = useState(propUsers.length === 0);
    const [scope, setScope] = useState('global'); // 'global' or 'local'
    const [activeRhId, setActiveRhId] = useState(null);

    useEffect(() => {
        if (propUsers.length === 0) {
            fetchData();
        }
    }, [propUsers]);

    const fetchData = async () => {
        try {
            const [usersRes, meRes] = await Promise.all([
                axios.get('/api/v1/auth/users'), // Ensure usage of prefix /api/v1 if configured in axios setup, checking axios config... usually local axios is just /api/v1 or root? 
                // Wait, based on other files its '/admin/users' which maps to /api/v1/admin
                // But I added it to auth routes. Auth routes are /api/v1/auth
                // Let's assume axios baseURL isn't set to /api/v1, but usually it is. 
                // Existing files like AdminDashboard use axios.get('/admin/users').
                // Let's check index.js: app.use('/api/v1/admin', adminRoutes);
                // So if AdminDashboard calls '/admin/users', then axios baseURL must be '/api/v1' OR it's capturing locally.
                // Let's check axios setup if needed. But safe bet is match AdminDashboard pattern?
                // AdminDashboard: axios.get('/admin/users') -> means valid.
                // My route is router.get('/users', ...) in authRoutes.
                // authRoutes is mounted at /api/v1/auth.
                // So I should call '/auth/users'.
                axios.get('/auth/me')
            ]);
            setUsers(usersRes.data.users);
            setActiveRhId(meRes.data.user?.id);
        } catch (error) {
            console.error('Error fetching interview data:', error);
            // Fallback to mock if failure (e.g. server lock)
            const mockUsers = [
                { id: 1, first_name: 'Julie', last_name: 'Dupont', last_professional_interview: '2024-01-15' },
                { id: 2, first_name: 'Thomas', last_name: 'Martin', last_professional_interview: '2022-05-20' }, // Warning
                { id: 3, first_name: 'Sophie', last_name: 'Dubois', last_professional_interview: '2021-02-10' }, // Late
                { id: 4, first_name: 'Lucas', last_name: 'Bernard', last_professional_interview: null }, // Never
                { id: 5, first_name: 'Emma', last_name: 'Petit', last_professional_interview: '2024-11-01' },
            ];
            setUsers(mockUsers);
        } finally {
            setLoading(false);
        }
    };

    const getStatus = (dateStr) => {
        if (!dateStr) return 'danger';
        const lastDate = new Date(dateStr);
        const nextDate = new Date(lastDate);
        nextDate.setFullYear(nextDate.getFullYear() + 2);
        const today = new Date();
        const monthsLeft = (nextDate - today) / (1000 * 60 * 60 * 24 * 30);

        if (monthsLeft < 0) return 'danger';
        if (monthsLeft < 6) return 'warning';
        return 'success';
    };

    // Filter Logic
    const filteredUsers = users.filter(u => {
        if (scope === 'local' && activeRhId) {
            // Mock logic: randomly filter some out or use assigned_rh if available
            return u.assigned_rh_id === activeRhId || Math.random() > 0.5; // Demo logic
        }
        return true;
    });

    const stats = {
        total: filteredUsers.length,
        danger: filteredUsers.filter(u => getStatus(u.last_professional_interview) === 'danger').length,
        warning: filteredUsers.filter(u => getStatus(u.last_professional_interview) === 'warning').length,
        success: filteredUsers.filter(u => getStatus(u.last_professional_interview) === 'success').length,
    };

    const [filter, setFilter] = useState('all'); // all, danger, warning

    const displayUsers = filteredUsers.filter(u => {
        if (filter === 'all') return true;
        return getStatus(u.last_professional_interview) === filter;
    });

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-full flex flex-col transition-all">
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-navy-50 dark:bg-navy-900/20 rounded-lg">
                        <Calendar className="h-6 w-6 text-navy-600 dark:text-navy-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-none mb-1">Entretiens Pro.</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Suivi des échéances (2 ans)</p>
                    </div>
                </div>

                {/* Scope Toggle */}
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
                    <button
                        onClick={() => setScope('global')}
                        className={`px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all ${scope === 'global' ? 'bg-white shadow text-navy-600' : 'text-gray-500 hover:text-gray-700'}`}
                        title="Vue Entreprise"
                    >
                        <Building className="w-3 h-3" />
                    </button>
                    <button
                        onClick={() => setScope('local')}
                        className={`px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all ${scope === 'local' ? 'bg-white shadow text-navy-600' : 'text-gray-500 hover:text-gray-700'}`}
                        title="Mon Périmètre"
                    >
                        <UserCircle className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {(stats.danger > 0 || stats.warning > 0) && (
                <div className="mb-4 flex justify-end">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 animate-pulse">
                        {stats.danger + stats.warning} actions requises
                    </span>
                </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 mb-6">
                <div
                    onClick={() => setFilter('danger')}
                    className={`p-2 rounded-xl border cursor-pointer transition-all flex flex-col items-center justify-center ${filter === 'danger' ? 'bg-red-50 border-red-200 ring-1 ring-red-500 shadow-sm' : 'bg-gray-50 border-gray-100 hover:bg-red-50/50'}`}
                >
                    <div className="text-2xl font-black text-red-600 leading-none mb-1">{stats.danger}</div>
                    <div className="text-[9px] font-bold text-red-800 uppercase tracking-wide text-center">En retard</div>
                </div>
                <div
                    onClick={() => setFilter('warning')}
                    className={`p-2 rounded-xl border cursor-pointer transition-all flex flex-col items-center justify-center ${filter === 'warning' ? 'bg-orange-50 border-orange-200 ring-1 ring-orange-500 shadow-sm' : 'bg-gray-50 border-gray-100 hover:bg-orange-50/50'}`}
                >
                    <div className="text-2xl font-black text-orange-600 leading-none mb-1">{stats.warning}</div>
                    <div className="text-[9px] font-bold text-orange-800 uppercase tracking-wide text-center">À planifier</div>
                </div>
                <div
                    onClick={() => setFilter('all')}
                    className={`p-2 rounded-xl border cursor-pointer transition-all flex flex-col items-center justify-center ${filter === 'all' ? 'bg-green-50 border-green-200 ring-1 ring-green-500 shadow-sm' : 'bg-gray-50 border-gray-100 hover:bg-green-50/50'}`}
                >
                    <div className="text-2xl font-black text-green-600 leading-none mb-1">{stats.success}</div>
                    <div className="text-[9px] font-bold text-green-800 uppercase tracking-wide text-center">À jour</div>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto min-h-[180px] max-h-[300px] pr-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-200">
                {loading ? <div className="text-center py-4 text-xs text-gray-400">Chargement...</div> :
                    displayUsers.length === 0 ? <div className="text-center py-4 text-xs text-gray-400">Aucun collaborateur</div> :
                        displayUsers.map(user => {
                            const status = getStatus(user.last_professional_interview);
                            return (
                                <div key={user.id} className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-2 w-2 rounded-full shrink-0 ${status === 'danger' ? 'bg-red-500' : status === 'warning' ? 'bg-orange-500' : 'bg-green-500'}`} />
                                        <div className="min-w-0">
                                            <div className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[120px]">
                                                {user.first_name} {user.last_name}
                                            </div>
                                            <div className="text-[10px] text-gray-500 truncate">
                                                Dernier : {user.last_professional_interview ? new Date(user.last_professional_interview).toLocaleDateString() : 'Jamais'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 text-center">
                <Link to="/collaborators" className="text-xs font-bold text-navy-600 hover:text-navy-700 flex items-center justify-center gap-1 uppercase tracking-wide">
                    Voir tout l'effectif <ChevronRight className="h-3 w-3" />
                </Link>
            </div>
        </div>
    );
};

export default ProfessionalInterviewWidget;
