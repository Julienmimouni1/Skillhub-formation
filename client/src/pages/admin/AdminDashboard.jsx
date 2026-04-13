import { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader2, Edit, Plus, Save, X, User, Building, Euro, Briefcase, Trash2, RefreshCw, BookOpen, UserCircle } from 'lucide-react';

import clsx from 'clsx';
import AdminInternalCatalog from './AdminInternalCatalog';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('users');

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-8">Administration</h1>

            <div className="border-b border-gray-200 mb-8">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={clsx(
                            activeTab === 'users'
                                ? 'border-navy-500 text-navy-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                            "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors"
                        )}
                    >
                        <User className="h-4 w-4 mr-2" />
                        Utilisateurs
                    </button>
                    <button
                        onClick={() => setActiveTab('departments')}
                        className={clsx(
                            activeTab === 'departments'
                                ? 'border-navy-500 text-navy-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                            "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors"
                        )}
                    >
                        <Building className="h-4 w-4 mr-2" />
                        Départements & Budgets
                    </button>
                    <button
                        onClick={() => setActiveTab('providers')}
                        className={clsx(
                            activeTab === 'providers'
                                ? 'border-navy-500 text-navy-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                            "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors"
                        )}
                    >
                        <Briefcase className="h-4 w-4 mr-2" />
                        Organismes
                    </button>
                    <button
                        onClick={() => setActiveTab('internal-catalog')}
                        className={clsx(
                            activeTab === 'internal-catalog'
                                ? 'border-navy-500 text-navy-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                            "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors"
                        )}
                    >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Catalogue Interne
                    </button>
                </nav>
            </div>

            {activeTab === 'users' ? <UsersManager /> :
                activeTab === 'departments' ? <DepartmentsManager /> :
                    activeTab === 'providers' ? <ProvidersManager /> :
                        <AdminInternalCatalog />}
        </div>
    );
}

function UsersManager() {
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState(null);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [usersRes, deptsRes] = await Promise.all([
                axios.get('/admin/users'),
                axios.get('/admin/departments')
            ]);
            setUsers(usersRes.data.users);
            setDepartments(deptsRes.data.departments);
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            if (isCreating) {
                await axios.post('/admin/users', data);
            } else {
                await axios.put(`/admin/users/${editingUser.id}`, data);
            }
            setEditingUser(null);
            setIsCreating(false);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.error?.message || 'Erreur sauvegarde');
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-navy-600" /></div>;

    return (
        <div>
            <div className="flex justify-end mb-6 gap-3">
                <button
                    onClick={() => document.getElementById('import-csv').click()}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500 transition-all hover:shadow-md"
                >
                    <input
                        type="file"
                        id="import-csv"
                        className="hidden"
                        accept=".csv"
                        onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;

                            const formData = new FormData();
                            formData.append('file', file);

                            try {
                                setLoading(true);
                                const res = await axios.post('/admin/users/import', formData, {
                                    headers: { 'Content-Type': 'multipart/form-data' }
                                });
                                alert(res.data.message + (res.data.errors ? '\nErreurs:\n' + res.data.errors.join('\n') : ''));
                                fetchData();
                            } catch (error) {
                                alert(error.response?.data?.error?.message || 'Erreur import');
                            } finally {
                                setLoading(false);
                                e.target.value = null;
                            }
                        }}
                    />
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Importer CSV
                </button>
                <button
                    onClick={async () => {
                        try {
                            const response = await axios.get('/admin/users/import/template', { responseType: 'blob' });
                            const url = window.URL.createObjectURL(new Blob([response.data]));
                            const link = document.createElement('a');
                            link.href = url;
                            link.setAttribute('download', 'modele_import_utilisateurs.csv');
                            document.body.appendChild(link);
                            link.click();
                            link.remove();
                        } catch (error) {
                            alert('Erreur lors du téléchargement du modèle');
                        }
                    }}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500 transition-all hover:shadow-md"
                >
                    <Save className="h-4 w-4 mr-2" />
                    Modèle CSV
                </button>
                <button
                    onClick={() => { setEditingUser({}); setIsCreating(true); }}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-navy-600 hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500 transition-all hover:shadow-md"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un utilisateur
                </button>
            </div>

            {(editingUser || isCreating) && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity">
                    <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col transform transition-all scale-100">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900">{isCreating ? 'Nouvel utilisateur' : 'Modifier utilisateur'}</h3>
                        </div>

                        {/* Scrollable Form Body */}
                        <div className="p-6 overflow-y-auto">
                            <form id="user-form" onSubmit={handleSave} className="space-y-6">
                                {/* Identity */}
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Prénom</label>
                                        <input name="first_name" defaultValue={editingUser?.first_name} required className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-navy-500 focus:border-navy-500 sm:text-sm" placeholder="ex: Jean" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nom</label>
                                        <input name="last_name" defaultValue={editingUser?.last_name} required className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-navy-500 focus:border-navy-500 sm:text-sm" placeholder="ex: Dupont" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div className="col-span-1">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email professionnel</label>
                                        <input type="email" name="email" defaultValue={editingUser?.email} required className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-navy-500 focus:border-navy-500 sm:text-sm" placeholder="jean.dupont@entreprise.com" />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Genre</label>
                                        <select name="gender" defaultValue={editingUser?.gender || ''} className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-navy-500 focus:border-navy-500 sm:text-sm">
                                            <option value="">Non défini</option>
                                            <option value="M">Homme</option>
                                            <option value="F">Femme</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Password Section */}
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                    {isCreating ? (
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mot de passe initial</label>
                                            <input type="password" name="password" required className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-navy-500 focus:border-navy-500 sm:text-sm" placeholder="••••••••" />
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nouveau mot de passe (optionnel)</label>
                                            <input type="password" name="password" className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-navy-500 focus:border-navy-500 sm:text-sm" placeholder="Laisser vide pour conserver l'actuel" />
                                        </div>
                                    )}
                                </div>

                                {/* Role & Dept */}
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Rôle</label>
                                        <select name="role" defaultValue={editingUser?.role || 'collaborateur'} className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-navy-500 focus:border-navy-500 sm:text-sm">
                                            <option value="collaborateur">Collaborateur</option>
                                            <option value="manager">Manager</option>
                                            <option value="rh">RH</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Département</label>
                                        <select name="department_id" defaultValue={editingUser?.department?.id} className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-navy-500 focus:border-navy-500 sm:text-sm">
                                            <option value="">Aucun</option>
                                            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Extended Info */}
                                <div className="border-t border-gray-100 pt-5">
                                    <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <UserCircle className="h-4 w-4 text-navy-500" />
                                        Informations Administratives
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">ID Employé</label>
                                            <input name="employee_id" defaultValue={editingUser?.employee_id} className="block w-full border border-gray-300 rounded-lg shadow-sm p-2 focus:ring-navy-500 focus:border-navy-500 sm:text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Entité Juridique</label>
                                            <input name="legal_entity" defaultValue={editingUser?.legal_entity} className="block w-full border border-gray-300 rounded-lg shadow-sm p-2 focus:ring-navy-500 focus:border-navy-500 sm:text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Division</label>
                                            <input name="division" defaultValue={editingUser?.division} className="block w-full border border-gray-300 rounded-lg shadow-sm p-2 focus:ring-navy-500 focus:border-navy-500 sm:text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Titre de poste</label>
                                            <input name="job_title" defaultValue={editingUser?.job_title} className="block w-full border border-gray-300 rounded-lg shadow-sm p-2 focus:ring-navy-500 focus:border-navy-500 sm:text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Date de naissance</label>
                                            <input type="date" name="birth_date" defaultValue={editingUser?.birth_date ? new Date(editingUser.birth_date).toISOString().split('T')[0] : ''} className="block w-full border border-gray-300 rounded-lg shadow-sm p-2 focus:ring-navy-500 focus:border-navy-500 sm:text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Manager Direct (Email)</label>
                                            <input type="email" name="manager_email" placeholder="manager@email.com" defaultValue={editingUser?.manager?.email} className="block w-full border border-gray-300 rounded-lg shadow-sm p-2 focus:ring-navy-500 focus:border-navy-500 sm:text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">RH Rattaché (Email)</label>
                                            <input type="email" name="rh_email" placeholder="rh@email.com" defaultValue={editingUser?.assigned_rh?.email} className="block w-full border border-gray-300 rounded-lg shadow-sm p-2 focus:ring-navy-500 focus:border-navy-500 sm:text-sm" />
                                        </div>
                                    </div>
                                </div>

                                {/* Pilotage RH */}
                                <div className="border-t border-gray-100 pt-5">
                                    <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Briefcase className="h-4 w-4 text-orange-500" />
                                        Données Pilotage RH
                                    </h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Contrat</label>
                                            <select name="contract_type" defaultValue={editingUser?.contract_type || ''} className="block w-full border border-gray-300 rounded-lg shadow-sm p-2 focus:ring-navy-500 focus:border-navy-500 sm:text-sm">
                                                <option value="">Non défini</option>
                                                <option value="CDI">CDI</option>
                                                <option value="CDD">CDD</option>
                                                <option value="ALTERNANCE">Alternance</option>
                                                <option value="STAGE">Stage</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">CSP</label>
                                            <select name="job_category" defaultValue={editingUser?.job_category || ''} className="block w-full border border-gray-300 rounded-lg shadow-sm p-2 focus:ring-navy-500 focus:border-navy-500 sm:text-sm">
                                                <option value="">Non défini</option>
                                                <option value="CADRE">Cadre</option>
                                                <option value="ETAM">ETAM</option>
                                                <option value="OUVRIER">Ouvrier</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Embauche</label>
                                            <input type="date" name="hired_at" defaultValue={editingUser?.hired_at ? new Date(editingUser.hired_at).toISOString().split('T')[0] : ''} className="block w-full border border-gray-300 rounded-lg shadow-sm p-2 focus:ring-navy-500 focus:border-navy-500 sm:text-sm" />
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
                            <button
                                type="button"
                                onClick={() => { setEditingUser(null); setIsCreating(false); }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white hover:text-gray-900 border border-transparent hover:border-gray-300 rounded-lg transition-all"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                form="user-form"
                                className="px-4 py-2 text-sm font-bold text-white bg-navy-600 hover:bg-navy-700 rounded-lg shadow-sm hover:shadow transition-all"
                            >
                                Enregistrer
                            </button>
                        </div>
                    </div>
                </div >
            )}


            <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">ID Employé</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Utilisateur</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Email</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Rôle</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Poste</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Département</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Entité Juridique</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Division</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Manager</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">RH Rattaché</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Date Naissance</th>
                                <th scope="col" className="sticky right-0 bg-gray-50 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap shadow-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                        {user.employee_id || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 rounded-full bg-navy-100 flex items-center justify-center text-navy-600 font-bold mr-3 text-xs">
                                                {user.first_name[0]}{user.last_name[0]}
                                            </div>
                                            <div className="text-sm font-medium text-gray-900">{user.first_name} {user.last_name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={clsx(
                                            "px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full capitalize",
                                            user.role === 'admin' ? "bg-navy-100 text-navy-800" :
                                                user.role === 'rh' ? "bg-orange-100 text-orange-800" :
                                                    user.role === 'manager' ? "bg-navy-100 text-navy-800" :
                                                        "bg-green-100 text-green-800"
                                        )}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {user.job_title || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center gap-1.5">
                                            <Building className="h-3.5 w-3.5 text-gray-400" />
                                            {user.department?.name || '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.legal_entity || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.division || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.manager ? `${user.manager.first_name} ${user.manager.last_name}` : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.assigned_rh ? (
                                            <div className="flex items-center gap-1.5">
                                                <User className="h-3.5 w-3.5 text-gray-400" />
                                                {user.assigned_rh.first_name} {user.assigned_rh.last_name}
                                            </div>
                                        ) : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.birth_date ? new Date(user.birth_date).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="sticky right-0 bg-white px-6 py-4 whitespace-nowrap text-right text-sm font-medium shadow-sm">
                                        <button
                                            onClick={() => setEditingUser(user)}
                                            className="text-navy-600 hover:text-navy-900 bg-navy-50 hover:bg-navy-100 p-2 rounded-lg transition-colors"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div >
    );
}

function DepartmentsManager() {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingDept, setEditingDept] = useState(null);
    const [budgetLines, setBudgetLines] = useState([]);
    const [newLine, setNewLine] = useState({ legal_entity: '', division: '', amount: '', year: 2025 });
    const [orgStructure, setOrgStructure] = useState({ legal_entities: [], divisions: [] });

    useEffect(() => {
        fetchData();
        fetchOrgStructure();
    }, []);

    const fetchData = async () => {
        try {
            const { data } = await axios.get('/admin/departments');
            setDepartments(data.departments);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrgStructure = async () => {
        try {
            const { data } = await axios.get('/admin/organization/structure');
            setOrgStructure(data);
        } catch (error) {
            console.error('Error fetching org structure:', error);
        }
    };

    const fetchBudgetLines = async (deptId) => {
        try {
            const { data } = await axios.get(`/admin/departments/${deptId}/budget-lines`);
            setBudgetLines(data.lines);
        } catch (error) {
            console.error(error);
        }
    };

    const handleEditClick = (dept) => {
        setEditingDept(dept);
        fetchBudgetLines(dept.id);
    };

    const handleAddLine = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`/admin/departments/${editingDept.id}/budget-lines`, newLine);
            fetchBudgetLines(editingDept.id);
            fetchData();
            setNewLine({ ...newLine, amount: '' }); // Keep entity/division selections for easier multiple entry
        } catch (error) {
            alert('Erreur ajout ligne');
        }
    };

    const handleRemoveLine = async (lineId) => {
        if (!confirm('Supprimer cette ligne ?')) return;
        try {
            await axios.delete(`/admin/departments/${editingDept.id}/budget-lines/${lineId}`);
            fetchBudgetLines(editingDept.id);
            fetchData();
        } catch (error) {
            alert('Erreur suppression');
        }
    };

    // KPI Calculations
    const totalAllocated = departments.reduce((acc, d) => acc + parseFloat(d.budget_allocated || 0), 0);
    const totalEngaged = departments.reduce((acc, d) => acc + parseFloat(d.budget_engaged || 0), 0);
    const totalConsumed = departments.reduce((acc, d) => acc + parseFloat(d.budget_consumed || 0), 0);
    const totalRemaining = totalAllocated - (totalEngaged + totalConsumed); // Fix: Subtract both engaged and consumed

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-navy-600" /></div>;

    return (
        <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500 mb-1">Budget Total Alloué</p>
                    <p className="text-2xl font-bold text-gray-900">{totalAllocated.toLocaleString('fr-FR')} €</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500 mb-1">Budget Engagé</p>
                    <p className="text-2xl font-bold text-orange-600">{totalEngaged.toLocaleString('fr-FR')} €</p>
                    <p className="text-xs text-gray-400 mt-1">{((totalEngaged / totalAllocated) * 100 || 0).toFixed(1)}% du total</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500 mb-1">Budget Consommé</p>
                    <p className="text-2xl font-bold text-navy-600">{totalConsumed.toLocaleString('fr-FR')} €</p>
                    <p className="text-xs text-gray-400 mt-1">{((totalConsumed / totalAllocated) * 100 || 0).toFixed(1)}% du total</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500 mb-1">Reste à Engager</p>
                    <p className={clsx("text-2xl font-bold", totalRemaining < 0 ? "text-red-600" : "text-green-600")}>
                        {totalRemaining.toLocaleString('fr-FR')} €
                    </p>
                </div>
            </div>

            {/* Main Table */}
            <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Département</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Alloué</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Engagé</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Consommé</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Reste à Engager</th>
                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Utilisation</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {departments.map((dept) => {
                            const allocated = parseFloat(dept.budget_allocated || 0);
                            const engaged = parseFloat(dept.budget_engaged || 0);
                            const consumed = parseFloat(dept.budget_consumed || 0);
                            const remaining = allocated - (engaged + consumed); // Fix: Subtract both
                            const totalUsed = engaged + consumed;
                            const percent = allocated > 0 ? (totalUsed / allocated) * 100 : 0;

                            return (
                                <tr key={dept.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dept.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{allocated.toLocaleString('fr-FR')} €</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 font-medium text-right">{engaged.toLocaleString('fr-FR')} €</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-navy-600 font-medium text-right">{consumed.toLocaleString('fr-FR')} €</td>
                                    <td className={clsx("px-6 py-4 whitespace-nowrap text-sm font-bold text-right", remaining < 0 ? "text-red-600" : "text-green-600")}>
                                        {remaining.toLocaleString('fr-FR')} €
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap align-middle">
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div
                                                className={clsx("h-2.5 rounded-full", percent > 100 ? "bg-red-600" : percent > 80 ? "bg-orange-500" : "bg-green-500")}
                                                style={{ width: `${Math.min(percent, 100)}%` }}
                                            ></div>
                                        </div>
                                        <div className="text-xs text-gray-500 text-center mt-1">{percent.toFixed(0)}%</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleEditClick(dept)}
                                            className="inline-flex items-center px-3 py-1.5 border border-navy-200 text-navy-700 bg-navy-50 hover:bg-navy-100 rounded-lg text-xs font-medium transition-colors"
                                        >
                                            <Edit className="h-3.5 w-3.5 mr-1.5" />
                                            Gérer Allocation
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Allocation Modal */}
            {editingDept && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity">
                    <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full p-8 transform transition-all scale-100 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">Allocation Budgétaire</h3>
                                <p className="text-gray-500 mt-1">Département : <span className="font-semibold text-navy-600">{editingDept.name}</span></p>
                            </div>
                            <button onClick={() => setEditingDept(null)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column: Add Form */}
                            <div className="lg:col-span-1 bg-gray-50 p-6 rounded-2xl border border-gray-200 h-fit">
                                <h4 className="text-base font-bold text-gray-900 mb-4 flex items-center">
                                    <Plus className="h-4 w-4 mr-2 text-navy-600" />
                                    Nouvelle Ligne
                                </h4>
                                <form onSubmit={handleAddLine} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Entité Juridique</label>
                                        <select
                                            value={newLine.legal_entity}
                                            onChange={e => setNewLine({ ...newLine, legal_entity: e.target.value })}
                                            className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-navy-500 focus:border-navy-500 sm:text-sm"
                                            required
                                        >
                                            <option value="">Sélectionner...</option>
                                            {orgStructure.legal_entities.map(e => <option key={e} value={e}>{e}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Division</label>
                                        <select
                                            value={newLine.division}
                                            onChange={e => setNewLine({ ...newLine, division: e.target.value })}
                                            className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-navy-500 focus:border-navy-500 sm:text-sm"
                                            required
                                        >
                                            <option value="">Sélectionner...</option>
                                            {orgStructure.divisions.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Montant (€)</label>
                                        <div className="relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="text-gray-500 sm:text-sm">€</span>
                                            </div>
                                            <input
                                                type="number"
                                                placeholder="0.00"
                                                value={newLine.amount}
                                                onChange={e => setNewLine({ ...newLine, amount: e.target.value })}
                                                className="focus:ring-navy-500 focus:border-navy-500 block w-full pl-7 sm:text-sm border-gray-300 rounded-lg"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <button type="submit" className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-navy-600 hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500 transition-all">
                                        Ajouter l'allocation
                                    </button>
                                </form>
                            </div>

                            {/* Right Column: List */}
                            <div className="lg:col-span-2">
                                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entité / Division</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {budgetLines.length === 0 ? (
                                                <tr>
                                                    <td colSpan="3" className="px-6 py-12 text-center text-sm text-gray-500 italic">
                                                        Aucune ligne budgétaire définie pour ce département.
                                                    </td>
                                                </tr>
                                            ) : (
                                                budgetLines.map(line => (
                                                    <tr key={line.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900">{line.legal_entity}</div>
                                                            <div className="text-xs text-gray-500">{line.division}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                                                            {parseFloat(line.amount).toLocaleString('fr-FR')} €
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <button onClick={() => handleRemoveLine(line.id)} className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-full transition-colors">
                                                                <Trash2 className="h-5 w-5" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                        <tfoot className="bg-gray-50 font-semibold border-t border-gray-200">
                                            <tr>
                                                <td className="px-6 py-4 text-right text-sm text-gray-900">Total Alloué :</td>
                                                <td className="px-6 py-4 text-right text-sm text-navy-600 text-lg">
                                                    {budgetLines.reduce((acc, curr) => acc + parseFloat(curr.amount), 0).toLocaleString('fr-FR')} €
                                                </td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ProvidersManager() {
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingProvider, setEditingProvider] = useState(null);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const { data } = await axios.get('/providers');
            setProviders(data.providers);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            if (isCreating) {
                await axios.post('/providers', data);
            } else {
                await axios.put(`/providers/${editingProvider.id}`, data);
            }
            setEditingProvider(null);
            setIsCreating(false);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.error?.message || 'Erreur sauvegarde');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet organisme ?')) return;
        try {
            await axios.delete(`/providers/${id}`);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.error?.message || 'Erreur suppression');
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-navy-600" /></div>;

    return (
        <div>
            <div className="flex justify-end mb-6 gap-3">
                <button
                    onClick={async () => {
                        try {
                            setLoading(true);
                            await axios.post('/catalog/sync');
                            alert('Synchronisation terminée avec succès !');
                            fetchData();
                        } catch (error) {
                            alert('Erreur lors de la synchronisation');
                        } finally {
                            setLoading(false);
                        }
                    }}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500 transition-all hover:shadow-md"
                >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Synchroniser organisme externe
                </button>
                <button
                    onClick={() => { setEditingProvider({}); setIsCreating(true); }}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-navy-600 hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500 transition-all hover:shadow-md"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un organisme
                </button>
            </div>

            {(editingProvider || isCreating) && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 transform transition-all scale-100">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">{isCreating ? 'Nouvel Organisme' : 'Modifier Organisme'}</h3>
                        <form onSubmit={handleSave} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                                <input name="name" defaultValue={editingProvider?.name} required className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-navy-500 focus:border-navy-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Contact</label>
                                <input type="email" name="contact_email" defaultValue={editingProvider?.contact_email} className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-navy-500 focus:border-navy-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                                <input name="phone" defaultValue={editingProvider?.phone} className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-navy-500 focus:border-navy-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Site Web (URL)</label>
                                <input name="url" defaultValue={editingProvider?.url} placeholder="https://..." className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-navy-500 focus:border-navy-500 sm:text-sm" />
                            </div>
                            <div className="flex justify-end gap-3 mt-8">
                                <button type="button" onClick={() => { setEditingProvider(null); setIsCreating(false); }} className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors">Annuler</button>
                                <button type="submit" className="px-4 py-2 bg-navy-600 text-white rounded-lg hover:bg-navy-700 font-medium shadow-sm transition-colors">Enregistrer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nom</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Site Web</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {providers.map((provider) => (
                            <tr key={provider.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{provider.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div>{provider.contact_email}</div>
                                    <div className="text-xs">{provider.phone}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-navy-600 hover:text-navy-900">
                                    {provider.url && <a href={provider.url} target="_blank" rel="noopener noreferrer">Lien</a>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => setEditingProvider(provider)} className="text-navy-600 hover:text-navy-900 p-2 hover:bg-navy-50 rounded-full transition-colors mr-2">
                                        <Edit className="h-5 w-5" />
                                    </button>
                                    <button onClick={() => handleDelete(provider.id)} className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-full transition-colors">
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
