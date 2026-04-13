import { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, Award, BarChart3, Filter } from 'lucide-react';

export default function CollaboratorProposals() {
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProposals = async () => {
            try {
                const { data } = await axios.get('/proposals');
                // Sort by vote count descending
                setProposals(data.sort((a, b) => b.voteCount - a.voteCount));
            } catch (error) {
                console.error('Error fetching proposals:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProposals();
    }, []);

    const totalVotes = proposals.reduce((acc, curr) => acc + curr.voteCount, 0);

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Propositions Collaborateurs</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Analysez les demandes de formation les plus populaires remontées par les équipes.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-navy-50 dark:bg-navy-900/30 rounded-xl text-navy-600 dark:text-navy-400">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Propositions</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{proposals.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-navy-50 dark:bg-navy-900/30 rounded-xl text-navy-600 dark:text-navy-400">
                            <BarChart3 className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Votes</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalVotes}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-xl text-amber-600 dark:text-amber-400">
                            <Award className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Top Demande</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">
                                {proposals[0]?.title || "-"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Classement par popularité</h2>
                    <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                        <Filter className="h-4 w-4" />
                        Filtrer
                    </button>
                </div>

                {loading ? (
                    <div className="p-12 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-navy-500 border-t-transparent"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Rang</th>
                                    <th className="px-6 py-4 font-medium w-1/3">Titre Formation</th>
                                    <th className="px-6 py-4 font-medium">Votes</th>
                                    <th className="px-6 py-4 font-medium">Popularité</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {proposals.map((proposal, index) => {
                                    const percentage = totalVotes > 0 ? (proposal.voteCount / totalVotes) * 100 : 0;
                                    return (
                                        <tr key={proposal.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className={`
                                                    w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                                                    ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                        index === 1 ? 'bg-gray-100 text-gray-700' :
                                                            index === 2 ? 'bg-orange-100 text-orange-700' :
                                                                'text-gray-500'}
                                                `}>
                                                    {index + 1}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-gray-900 dark:text-white">{proposal.title}</div>
                                                <div className="text-xs text-gray-500 line-clamp-1">{proposal.description}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-navy-600 dark:text-navy-400">{proposal.voteCount}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="w-full max-w-xs bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                                                    <div
                                                        className="bg-navy-600 h-2 rounded-full transition-all duration-500"
                                                        style={{ width: `${percentage}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs text-gray-400 mt-1 block">{percentage.toFixed(1)}%</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-navy-600 hover:text-navy-800 dark:hover:text-navy-300 font-medium text-xs">
                                                    Voir détails
                                                </button>
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
