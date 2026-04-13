import { useState, useEffect } from 'react';
import axios from 'axios';
import { ThumbsUp, MessageSquarePlus, Lightbulb, Sparkles } from 'lucide-react';

export default function TrainingProposals() {
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState({ title: '', description: '' });

    useEffect(() => {
        fetchProposals();
    }, []);

    const fetchProposals = async () => {
        try {
            const { data } = await axios.get('/proposals');
            setProposals(data);
        } catch (error) {
            console.error('Error fetching proposals:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (id) => {
        try {
            // Optimistic update
            const updatedProposals = proposals.map(p => {
                if (p.id === id) {
                    return {
                        ...p,
                        hasVoted: !p.hasVoted,
                        voteCount: p.hasVoted ? p.voteCount - 1 : p.voteCount + 1
                    };
                }
                return p;
            });
            setProposals(updatedProposals);

            await axios.post(`/proposals/${id}/vote`);
            fetchProposals(); // Refresh to ensure sync
        } catch (error) {
            console.error('Error voting:', error);
            fetchProposals(); // Revert on error
        }
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/proposals', newItem);
            setNewItem({ title: '', description: '' });
            setIsAdding(false);
            fetchProposals();
        } catch (error) {
            console.error('Error adding proposal:', error);
            alert(`Erreur: ${error.message}`);
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header with Gradient */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-navy-600 to-navy-600 p-8 mb-8 text-white shadow-xl">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <Sparkles className="h-8 w-8 text-yellow-300" />
                            Le Mur des Idées
                        </h1>
                        <p className="mt-2 text-navy-100 max-w-2xl text-lg">
                            Participez à la construction du catalogue ! Proposez vos idées et votez pour les formations qui vous intéressent.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="bg-white text-navy-600 hover:bg-navy-50 px-6 py-3 rounded-xl font-bold shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                        <MessageSquarePlus className="h-5 w-5" />
                        Proposer une idée
                    </button>
                </div>
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
            </div>

            {/* Add Form */}
            {/* Add Modal */}
            {isAdding && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all animate-scale-in border border-gray-100 dark:border-gray-700">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-navy-600 to-navy-600 dark:from-navy-400 dark:to-navy-400">
                                Nouvelle idée de formation
                            </h3>
                            <button
                                onClick={() => setIsAdding(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        <form onSubmit={handleAddItem} className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Titre de la formation <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newItem.title}
                                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 bg-gray-50 dark:bg-gray-700 dark:text-white transition-all text-lg"
                                    placeholder="Ex: Masterclass Leadership & Innovation"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Pourquoi cette formation ? (Description & Argumentaire)
                                </label>
                                <textarea
                                    rows={8}
                                    value={newItem.description}
                                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 bg-gray-50 dark:bg-gray-700 dark:text-white transition-all resize-none"
                                    placeholder="Détaillez votre idée : objectifs, public cible, bénéfices attendus..."
                                />
                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-right">
                                    Soyez convaincant pour obtenir des votes !
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setIsAdding(false)}
                                    className="px-6 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-navy-600 to-navy-600 text-white font-bold shadow-lg shadow-navy-200 dark:shadow-none hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
                                >
                                    🚀 Lancer le vote
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-navy-500 border-t-transparent"></div>
                </div>
            ) : proposals.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                    <Lightbulb className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Le mur est vide... pour l'instant !</h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Soyez le premier à proposer une idée brillante.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {proposals.map((proposal) => (
                        <div
                            key={proposal.id}
                            className={`group relative bg-white dark:bg-gray-800 rounded-2xl p-6 transition-all duration-300 border ${proposal.hasVoted
                                ? 'border-navy-200 dark:border-navy-900 shadow-md ring-1 ring-navy-500/20'
                                : 'border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-navy-50 dark:bg-navy-900/30 rounded-xl">
                                    <Lightbulb className="h-6 w-6 text-navy-600 dark:text-navy-400" />
                                </div>
                                <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700/50 px-2.5 py-1 rounded-lg">
                                    {new Date(proposal.createdAt).toLocaleDateString()}
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                                {proposal.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-3 text-sm h-14">
                                {proposal.description || "Pas de description fournie."}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    <span className="text-gray-900 dark:text-white font-bold text-lg">{proposal.voteCount}</span> votes
                                </div>
                                <button
                                    onClick={() => handleVote(proposal.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${proposal.hasVoted
                                        ? 'bg-navy-600 text-white shadow-md shadow-navy-200 dark:shadow-none'
                                        : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-navy-50 dark:hover:bg-navy-900/30 hover:text-navy-600 dark:hover:text-navy-400'
                                        }`}
                                >
                                    <ThumbsUp className={`h-4 w-4 ${proposal.hasVoted ? 'fill-current' : ''}`} />
                                    {proposal.hasVoted ? 'Voté !' : 'Voter'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
