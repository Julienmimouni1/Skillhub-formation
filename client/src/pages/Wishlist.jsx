import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, ExternalLink, Lightbulb, BookOpen } from 'lucide-react';

export default function Wishlist() {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newItem, setNewItem] = useState({ title: '', url: '', notes: '' });
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            const { data } = await axios.get('/wishlist');
            setWishlist(data);
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        console.log('Submitting item:', newItem);
        try {
            await axios.post('/wishlist', newItem);
            alert('Élément ajouté avec succès !');
            setNewItem({ title: '', url: '', notes: '' });
            setIsAdding(false);
            fetchWishlist();
        } catch (error) {
            console.error('Error adding item:', error);
            alert(`Erreur lors de l'ajout : ${error.message}`);
        }
    };

    const handleDeleteItem = async (id) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return;
        try {
            await axios.delete(`/wishlist/${id}`);
            fetchWishlist();
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Ma Wishlist Formation</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Notez vos idées de formation afin de vous en souvenir pour plus tard.
                    </p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-navy-600 hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Ajouter une idée
                </button>
            </div>

            {isAdding && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Nouvelle idée</h3>
                    <form onSubmit={handleAddItem} className="space-y-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                Sujet / Titre de la formation *
                            </label>
                            <input
                                type="text"
                                id="title"
                                required
                                value={newItem.title}
                                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-navy-500 focus:ring-navy-500 sm:text-sm"
                                placeholder="Ex: Apprendre React Avancé"
                            />
                        </div>
                        <div>
                            <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                                Lien (Optionnel)
                            </label>
                            <input
                                type="url"
                                id="url"
                                value={newItem.url}
                                onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-navy-500 focus:ring-navy-500 sm:text-sm"
                                placeholder="https://..."
                            />
                        </div>
                        <div>
                            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                                Notes / Pourquoi cette formation ? (Optionnel)
                            </label>
                            <textarea
                                id="notes"
                                rows={3}
                                value={newItem.notes}
                                onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-navy-500 focus:ring-navy-500 sm:text-sm"
                                placeholder="Pour le projet X, pour monter en compétence sur..."
                            />
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-navy-600 hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500"
                            >
                                Enregistrer
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-navy-500 border-t-transparent"></div>
                    <p className="mt-2 text-gray-500">Chargement...</p>
                </div>
            ) : wishlist.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                    <Lightbulb className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune idée pour le moment</h3>
                    <p className="mt-1 text-sm text-gray-500">Commencez par ajouter des sujets qui vous intéressent.</p>
                    <div className="mt-6">
                        <button
                            onClick={() => setIsAdding(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-navy-600 hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500"
                        >
                            <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                            Ajouter ma première idée
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {wishlist.map((item) => (
                        <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative group">
                            <div className="flex justify-between items-start">
                                <div className="p-2 bg-navy-50 rounded-lg">
                                    <BookOpen className="h-6 w-6 text-navy-600" />
                                </div>
                                <button
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50 opacity-0 group-hover:opacity-100"
                                    title="Supprimer"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                            <h3 className="mt-4 text-lg font-medium text-gray-900 line-clamp-2" title={item.title}>
                                {item.title}
                            </h3>
                            {item.notes && (
                                <p className="mt-2 text-sm text-gray-500 line-clamp-3">
                                    {item.notes}
                                </p>
                            )}
                            <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                                <span className="text-xs text-gray-400">
                                    Ajouté le {new Date(item.created_at).toLocaleDateString()}
                                </span>
                                {item.url && (
                                    <a
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-navy-600 hover:text-navy-700 text-sm font-medium inline-flex items-center"
                                    >
                                        Voir le lien <ExternalLink className="ml-1 h-3 w-3" />
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
