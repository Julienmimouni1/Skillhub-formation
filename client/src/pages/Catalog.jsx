import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, Clock, Euro, ExternalLink, Filter } from 'lucide-react';

export default function Catalog() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');

    const [activeTab, setActiveTab] = useState('internal');

    useEffect(() => {
        setPage(1);
        setSearchQuery('');
        fetchCatalog();
    }, [activeTab]);

    useEffect(() => {
        fetchCatalog();
    }, [page]);

    const fetchCatalog = async () => {
        setLoading(true);
        try {
            // If search query exists, use search endpoint, otherwise use list endpoint
            const url = searchQuery
                ? `/catalog/search?q=${encodeURIComponent(searchQuery)}&type=${activeTab}`
                : `/catalog?page=${page}&limit=12&type=${activeTab}`;

            const { data } = await axios.get(url);

            if (searchQuery) {
                setCourses(data.results);
                setTotalPages(1); // Search doesn't support pagination yet in this simple implementation
            } else {
                setCourses(data.data);
                setTotalPages(data.pagination.totalPages);
            }
        } catch (error) {
            console.error('Error fetching catalog:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchCatalog();
    };

    const handleRequestTraining = (course) => {
        // Navigate to create request with state
        // We need to update CreateRequest to handle this state
        navigate('/requests/new', { state: { prefill: course, type: activeTab === 'internal' ? 'INTERNAL' : 'EXTERNAL' } });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Catalogue de Formations</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Découvrez les formations disponibles et demandez votre inscription.
                    </p>
                </div>
                <div className="mt-4 md:mt-0 flex gap-2">
                    <form onSubmit={handleSearch} className="relative">
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-navy-500 focus:border-navy-500 text-sm w-64"
                        />
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    </form>
                </div>
            </div>

            <div className="border-b border-gray-200 mb-8">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('internal')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors ${activeTab === 'internal'
                                ? 'border-navy-500 text-navy-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Catalogue Interne
                    </button>
                    <button
                        onClick={() => setActiveTab('external')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors ${activeTab === 'external'
                                ? 'border-navy-500 text-navy-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Catalogue Externe
                    </button>
                </nav>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-navy-500 border-t-transparent"></div>
                </div>
            ) : courses.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune formation trouvée</h3>
                    <p className="mt-1 text-sm text-gray-500">Essayez de modifier vos critères de recherche.</p>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {courses.map((course) => (
                        <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
                            <div className="p-6 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-navy-100 text-navy-800">
                                        {course.provider}
                                    </span>
                                    <span className="text-sm font-bold text-gray-900">{course.cost} €</span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2" title={course.title}>
                                    {course.title}
                                </h3>
                                <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                                    {course.description}
                                </p>
                                <div className="flex items-center text-xs text-gray-500 gap-4">
                                    <div className="flex items-center">
                                        <Clock className="h-4 w-4 mr-1" />
                                        {course.duration_days} jours
                                    </div>
                                    <div className="flex items-center">
                                        <BookOpen className="h-4 w-4 mr-1" />
                                        {course.type}
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 border-t border-gray-100 rounded-b-xl flex justify-between items-center">
                                {course.url && (
                                    <a
                                        href={course.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-navy-600 hover:text-navy-700 text-sm font-medium inline-flex items-center"
                                    >
                                        Détails <ExternalLink className="ml-1 h-3 w-3" />
                                    </a>
                                )}
                                <button
                                    onClick={() => handleRequestTraining(course)}
                                    className="ml-auto px-4 py-2 bg-navy-600 text-white text-sm font-medium rounded-lg hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500 transition-colors"
                                >
                                    Demander
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!searchQuery && totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                        Précédent
                    </button>
                    <span className="px-4 py-2 text-sm text-gray-700 flex items-center">
                        Page {page} sur {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                        Suivant
                    </button>
                </div>
            )}
        </div>
    );
}
