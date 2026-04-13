import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Loader2, FileText, Calendar, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import clsx from 'clsx';

const StatusBadge = ({ status }) => {
    const styles = {
        APPROVED: 'bg-green-50 text-green-700 ring-green-600/20',
        PLANNED: 'bg-navy-50 text-navy-700 ring-navy-700/10',
        COMPLETED: 'bg-navy-50 text-navy-700 ring-navy-700/10',
    };

    const labels = {
        APPROVED: 'Validée',
        PLANNED: 'Planifiée',
        COMPLETED: 'Terminée',
    };

    return (
        <span className={clsx("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset", styles[status] || 'bg-gray-100 text-gray-600')}>
            {labels[status] || status}
        </span>
    );
};

export default function TrainingFollowUp() {
    const [trainings, setTrainings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTrainings();
    }, []);

    const fetchTrainings = async () => {
        try {
            const { data } = await axios.get('/requests');
            // Filter for validated trainings
            const validated = data.requests.filter(r =>
                ['APPROVED', 'PLANNED', 'COMPLETED'].includes(r.status)
            );
            setTrainings(validated);
        } catch (error) {
            console.error('Error fetching trainings:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-10 w-10 animate-spin text-navy-600" />
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Suivi des formations</h1>
                <p className="mt-2 text-gray-500">
                    Retrouvez ici toutes vos formations validées et accédez aux documents associés.
                </p>
            </div>

            {trainings.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="mx-auto h-12 w-12 text-gray-300 mb-4">
                        <FileText className="h-full w-full" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Aucune formation validée</h3>
                    <p className="mt-1 text-gray-500">Vos demandes validées apparaîtront ici.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {trainings.map((training) => (
                        <Link
                            key={training.id}
                            to={`/requests/${training.id}`}
                            className="block group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="h-10 w-10 rounded-xl bg-navy-50 flex items-center justify-center text-navy-600 group-hover:bg-navy-600 group-hover:text-white transition-colors">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <StatusBadge status={training.status} />
                                </div>

                                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-navy-600 transition-colors">
                                    {training.title}
                                </h3>

                                <div className="space-y-3 text-sm text-gray-500">
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                        {training.start_date ? (
                                            <span>
                                                {new Date(training.start_date).toLocaleDateString()}
                                                {training.end_date && ` - ${new Date(training.end_date).toLocaleDateString()}`}
                                            </span>
                                        ) : (
                                            <span>Dates à définir</span>
                                        )}
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                                        {training.duration_days ? `${training.duration_days} jours` : 'Durée non définie'}
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center group-hover:bg-navy-50/50 transition-colors">
                                <span className="text-sm font-medium text-gray-900">Voir le détail</span>
                                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-navy-600 transition-colors" />
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
