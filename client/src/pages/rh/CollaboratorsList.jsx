import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, Loader2, ArrowLeft, Mail, Building, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CollaboratorsList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [departmentMap, setDepartmentMap] = useState({});

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('/auth/users');
            setUsers(response.data.users);

            // Build dept map for filter if needed
            const depts = {};
            response.data.users.forEach(u => {
                if (u.department?.name) depts[u.department.name] = true;
            });
            setDepartmentMap(depts);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user => {
        const term = search.toLowerCase();
        return (
            user.first_name?.toLowerCase().includes(term) ||
            user.last_name?.toLowerCase().includes(term) ||
            user.email.toLowerCase().includes(term)
        );
    });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <Link to="/dashboard" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Retour au tableau de bord
                </Link>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Effectif</h1>
                        <p className="mt-1 text-gray-500">Vue globale des collaborateurs et suivi.</p>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden mb-6">
                <div className="p-4 border-b border-gray-100 flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Rechercher par nom, email..."
                            className="block w-full pl-10 border-gray-300 rounded-lg focus:ring-navy-500 focus:border-navy-500 sm:text-sm p-2.5"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-navy-600" /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Collaborateur</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Département</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Poste</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Dernier Entretien</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {filteredUsers.map((user) => {
                                    const lastDate = user.last_professional_interview ? new Date(user.last_professional_interview) : null;
                                    let status = 'danger'; // Never or Late
                                    if (lastDate) {
                                        const now = new Date();
                                        const diffMonth = (now.getFullYear() - lastDate.getFullYear()) * 12 + (now.getMonth() - lastDate.getMonth());
                                        if (diffMonth < 18) status = 'success';
                                        else if (diffMonth < 24) status = 'warning';
                                    }

                                    return (
                                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-navy-100 flex items-center justify-center text-navy-600 font-bold text-sm">
                                                        {user.first_name[0]}{user.last_name[0]}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-bold text-gray-900">{user.first_name} {user.last_name}</div>
                                                        <div className="text-xs text-gray-500 flex items-center gap-1">
                                                            <Mail className="h-3 w-3" /> {user.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Building className="h-4 w-4 text-gray-400" />
                                                    {user.department?.name || '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Briefcase className="h-4 w-4 text-gray-400" />
                                                    {user.job_title || '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                                {lastDate ? lastDate.toLocaleDateString() : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                    ${status === 'success' ? 'bg-green-100 text-green-800' :
                                                        status === 'warning' ? 'bg-orange-100 text-orange-800' :
                                                            'bg-red-100 text-red-800'}`}>
                                                    {status === 'success' ? 'A jour' : status === 'warning' ? 'A planifier' : 'En retard'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
