import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Search, Save, X, BookOpen, DollarSign, Calendar, Globe, Building, FileText, Upload, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

export default function AdminInternalCatalog() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [providers, setProviders] = useState([]);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [programFile, setProgramFile] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        objective: '',
        prerequisites: '',
        provider_id: '',
        cost: '',
        duration_days: '',
        url: ''
    });

    useEffect(() => {
        fetchCourses();
        fetchProviders();
    }, []);

    const fetchCourses = async () => {
        try {
            const { data } = await axios.get('/catalog?type=internal&limit=100');
            setCourses(data.data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProviders = async () => {
        try {
            const { data } = await axios.get('/providers');
            setProviders(data.providers);
        } catch (error) {
            console.error('Error fetching providers:', error);
        }
    };

    const handleOpenPanel = (course = null) => {
        setProgramFile(null);
        if (course) {
            setEditingCourse(course);
            setFormData({
                title: course.title,
                description: course.description || '',
                objective: course.objective || '',
                prerequisites: course.prerequisites || '',
                provider_id: providers.find(p => p.name === course.provider)?.id || '',
                cost: course.cost,
                duration_days: course.duration_days,
                url: course.url || ''
            });
        } else {
            setEditingCourse(null);
            setFormData({
                title: '',
                description: '',
                objective: '',
                prerequisites: '',
                provider_id: '',
                cost: '',
                duration_days: '',
                url: ''
            });
        }
        setIsPanelOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let savedCourse;
            let courseId;
            if (editingCourse) {
                const { data } = await axios.put(`/catalog/internal/${editingCourse.id}`, formData);
                savedCourse = data.course;
                courseId = editingCourse.id;
            } else {
                const { data } = await axios.post('/catalog/internal', formData);
                savedCourse = data.course;
                courseId = data.course.id;
            }

            // Optimistic update of the list
            const providerName = providers.find(p => p.id === parseInt(formData.provider_id))?.name || 'Inconnu';
            const completeCourse = { ...savedCourse, provider: providerName };

            setCourses(prev => {
                if (editingCourse) {
                    return prev.map(c => c.id === courseId ? { ...c, ...completeCourse } : c);
                } else {
                    return [completeCourse, ...prev];
                }
            });

            if (programFile) {
                const fd = new FormData();
                fd.append('file', programFile);
                fd.append('document_type', 'PROGRAMME');
                await axios.post(`/catalog/internal/${courseId}/documents`, fd, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            await fetchCourses(); // Refresh in background to be sure
            setIsPanelOpen(false);
        } catch (error) {
            console.error('Error saving course:', error);
            alert('Erreur lors de la sauvegarde');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) return;
        try {
            await axios.delete(`/catalog/internal/${id}`);
            fetchCourses();
        } catch (error) {
            console.error('Error deleting course:', error);
            alert('Erreur lors de la suppression');
        }
    };

    return (
        <div className="relative min-h-[600px]">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <BookOpen className="h-6 w-6 text-navy-600" />
                        Catalogue Interne
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Gérez les formations exclusives proposées par votre entreprise.
                    </p>
                </div>
                <button
                    onClick={() => handleOpenPanel()}
                    className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-navy-600 hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500 transition-all hover:shadow-md"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Ajouter une formation
                </button>
            </div>

            {/* Course List Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                    <div key={course.id} className="group bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden">
                        <div className="p-6 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-navy-50 text-navy-700 border border-navy-100">
                                    {course.provider}
                                </span>
                                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleOpenPanel(course)}
                                        className="p-1.5 text-gray-400 hover:text-navy-600 hover:bg-navy-50 rounded-lg transition-colors"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(course.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">
                                {course.title}
                            </h3>
                            <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-1">
                                {course.description || "Aucune description disponible."}
                            </p>

                            {course.documents && course.documents.length > 0 && (
                                <div className="mb-4">
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-md">
                                        <FileText className="h-3 w-3" /> Programme joint
                                    </span>
                                </div>
                            )}

                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-auto pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <span className="font-medium">{course.duration_days}j</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <DollarSign className="h-4 w-4 text-gray-400" />
                                    <span className="font-medium">{course.cost} €</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Slide-over Panel */}
            {isPanelOpen && (
                <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={() => setIsPanelOpen(false)}></div>

                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                            <div className="pointer-events-auto w-screen max-w-2xl transform transition-transform duration-500 ease-in-out sm:duration-700">
                                <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-2xl">
                                    <div className="px-4 py-6 sm:px-6 bg-navy-600">
                                        <div className="flex items-start justify-between">
                                            <h2 className="text-lg font-semibold text-white" id="slide-over-title">
                                                {editingCourse ? 'Modifier la formation' : 'Nouvelle formation'}
                                            </h2>
                                            <div className="ml-3 flex h-7 items-center">
                                                <button
                                                    type="button"
                                                    className="rounded-md bg-navy-600 text-navy-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                                                    onClick={() => setIsPanelOpen(false)}
                                                >
                                                    <span className="sr-only">Fermer</span>
                                                    <X className="h-6 w-6" aria-hidden="true" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="relative flex-1 px-4 py-6 sm:px-6">
                                        <form onSubmit={handleSubmit} className="space-y-8">
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Informations Générales</h3>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-900 mb-2">Titre de la formation</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={formData.title}
                                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                                        className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-navy-500 focus:ring-navy-500 sm:text-sm py-3 px-4 bg-gray-50 focus:bg-white transition-colors"
                                                        placeholder="Ex: Leadership & Management"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-5">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-900 mb-2">Coût (€)</label>
                                                        <div className="relative rounded-xl shadow-sm">
                                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                <span className="text-gray-500 sm:text-sm">€</span>
                                                            </div>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                value={formData.cost}
                                                                onChange={e => setFormData({ ...formData, cost: e.target.value })}
                                                                className="block w-full pl-8 rounded-xl border-gray-300 focus:border-navy-500 focus:ring-navy-500 sm:text-sm py-3 bg-gray-50 focus:bg-white transition-colors"
                                                                placeholder="0.00"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-900 mb-2">Durée (jours)</label>
                                                        <div className="relative rounded-xl shadow-sm">
                                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                            </div>
                                                            <input
                                                                type="number"
                                                                step="0.5"
                                                                value={formData.duration_days}
                                                                onChange={e => setFormData({ ...formData, duration_days: e.target.value })}
                                                                className="block w-full pl-10 rounded-xl border-gray-300 focus:border-navy-500 focus:ring-navy-500 sm:text-sm py-3 bg-gray-50 focus:bg-white transition-colors"
                                                                placeholder="1.0"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-900 mb-2">Organisme</label>
                                                    <div className="relative rounded-xl shadow-sm">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <Building className="h-4 w-4 text-gray-400" />
                                                        </div>
                                                        <select
                                                            required
                                                            value={formData.provider_id}
                                                            onChange={e => setFormData({ ...formData, provider_id: e.target.value })}
                                                            className="block w-full pl-10 rounded-xl border-gray-300 focus:border-navy-500 focus:ring-navy-500 sm:text-sm py-3 bg-gray-50 focus:bg-white transition-colors"
                                                        >
                                                            <option value="">Sélectionner un organisme...</option>
                                                            {providers.map(p => (
                                                                <option key={p.id} value={p.id}>{p.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Contenu Pédagogique</h3>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-900 mb-2">Objectifs Pédagogiques</label>
                                                    <textarea
                                                        rows={4}
                                                        value={formData.objective}
                                                        onChange={e => setFormData({ ...formData, objective: e.target.value })}
                                                        className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-navy-500 focus:ring-navy-500 sm:text-sm py-3 px-4 bg-gray-50 focus:bg-white transition-colors"
                                                        placeholder="À la fin de la formation, le stagiaire sera capable de..."
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-900 mb-2">Pré-requis</label>
                                                    <textarea
                                                        rows={3}
                                                        value={formData.prerequisites}
                                                        onChange={e => setFormData({ ...formData, prerequisites: e.target.value })}
                                                        className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-navy-500 focus:ring-navy-500 sm:text-sm py-3 px-4 bg-gray-50 focus:bg-white transition-colors"
                                                        placeholder="Connaissances ou compétences nécessaires..."
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-900 mb-2">Description / Programme détaillé</label>
                                                    <textarea
                                                        rows={6}
                                                        value={formData.description}
                                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                        className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-navy-500 focus:ring-navy-500 sm:text-sm py-3 px-4 bg-gray-50 focus:bg-white transition-colors"
                                                        placeholder="Détails du programme..."
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-900 mb-2">Programme (Document PDF)</label>
                                                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:bg-gray-50 transition-colors cursor-pointer relative">
                                                        <div className="space-y-1 text-center">
                                                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                                            <div className="flex text-sm text-gray-600">
                                                                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-navy-600 hover:text-navy-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-navy-500">
                                                                    <span>Télécharger un fichier</span>
                                                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={(e) => setProgramFile(e.target.files[0])} accept=".pdf,.doc,.docx" />
                                                                </label>
                                                                <p className="pl-1">ou glisser-déposer</p>
                                                            </div>
                                                            <p className="text-xs text-gray-500">PDF, DOCX jusqu'à 5MB</p>
                                                        </div>
                                                        {programFile && (
                                                            <div className="absolute inset-0 bg-navy-50/90 flex items-center justify-center rounded-xl">
                                                                <div className="flex items-center text-navy-700 font-medium">
                                                                    <CheckCircle2 className="h-5 w-5 mr-2" />
                                                                    {programFile.name}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {editingCourse && editingCourse.documents && editingCourse.documents.length > 0 && (
                                                        <div className="mt-2 text-sm text-gray-500">
                                                            Document actuel : {editingCourse.documents[0].file_name}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsPanelOpen(false)}
                                                    className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500 transition-colors"
                                                >
                                                    Annuler
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="px-6 py-2.5 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-navy-600 hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500 transition-all hover:shadow-lg"
                                                >
                                                    {editingCourse ? 'Mettre à jour' : 'Créer la formation'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
