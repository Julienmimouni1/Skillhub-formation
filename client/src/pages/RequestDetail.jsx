import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    Loader2,
    CheckCircle,
    XCircle,
    MessageSquare,
    FileText,
    Calendar,
    Euro,
    User,
    Building,
    ArrowLeft,
    Download,
    Trash2,
    Upload,
    ClipboardCheck,
    Target,
    Clock,
    Pencil
} from 'lucide-react';
import clsx from 'clsx';
import ManagerEvaluationForm from '../components/ManagerEvaluationForm';
import ManagerExpectationsModal from '../components/ManagerExpectationsModal';
import AddToCalendar from '../components/AddToCalendar';


const StatusBadge = ({ status }) => {
    const styles = {
        DRAFT: 'bg-gray-100 text-gray-600 ring-gray-500/10',
        PENDING_MANAGER: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
        PENDING_RH: 'bg-orange-50 text-orange-700 ring-orange-600/20',
        PRIORITY_2: 'bg-gray-100 text-gray-700 ring-gray-600/20',
        APPROVED: 'bg-green-50 text-green-700 ring-green-600/20',
        REJECTED: 'bg-red-50 text-red-700 ring-red-600/10',
        PLANNED: 'bg-navy-50 text-navy-700 ring-navy-700/10',
        COMPLETED: 'bg-navy-50 text-navy-700 ring-navy-700/10',
    };

    const labels = {
        DRAFT: 'Brouillon',
        PENDING_MANAGER: 'Validation Manager',
        PENDING_RH: 'Validation RH',
        PRIORITY_2: 'Priorité 2 (Attente)',
        APPROVED: 'Approuvée',
        REJECTED: 'Refusée',
        PLANNED: 'Planifiée',
        COMPLETED: 'Terminée',
    };

    return (
        <span className={clsx("inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset", styles[status] || styles.DRAFT)}>
            {labels[status] || status}
        </span>
    );
};

export default function RequestDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [actualDates, setActualDates] = useState({ start: '', end: '' });
    const [comment, setComment] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showEvaluationForm, setShowEvaluationForm] = useState(false);
    const [showExpectationsModal, setShowExpectationsModal] = useState(false);
    const [evaluationData, setEvaluationData] = useState(null);
    const [budgetStats, setBudgetStats] = useState(null);
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [plannedDates, setPlannedDates] = useState({ start: '', end: '' });
    const [showCostModal, setShowCostModal] = useState(false);
    const [newCost, setNewCost] = useState('');


    useEffect(() => {
        if (user.role === 'manager') {
            fetchBudgetStats();
        }
    }, [user.role]);

    const fetchBudgetStats = async (deptId = null) => {
        try {
            const url = deptId ? `/budget/team-stats?departmentId=${deptId}` : '/budget/team-stats';
            const { data } = await axios.get(url);
            setBudgetStats(data);
        } catch (error) {
            console.error('Error fetching budget stats:', error);
        }
    };

    useEffect(() => {
        fetchRequest();
    }, [id]);

    const fetchRequest = async () => {
        try {
            const { data } = await axios.get(`/requests/${id}`);
            setRequest(data.request);
            // Fetch budget stats for RH/Admin now that we have the department_id
            if (['rh', 'admin'].includes(user.role)) {
                fetchBudgetStats(data.request.department_id);
            }
        } catch (error) {
            console.error('Error fetching request:', error);
            alert('Erreur lors du chargement de la demande');
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action, actionComment = null, extraData = {}) => {
        // Skip confirmation ONLY for manager approval if they just filled the evaluation form
        const shouldConfirm = !extraData.evaluation || (['rh', 'admin'].includes(user.role) && action === 'APPROVED');
        const message = action === 'APPROVED' ? 'Voulez-vous vraiment approuver cette demande de formation ?' : 'Êtes-vous sûr de vouloir effectuer cette action ?';
        if (shouldConfirm && !confirm(message)) return;

        setActionLoading(true);
        try {
            await axios.post(`/requests/${id}/validate`, {
                action,
                comment: actionComment,
                ...extraData
            });
            await fetchRequest(); // Refresh data
            setShowRejectModal(false);
            setShowCompleteModal(false);
            setComment('');
        } catch (error) {
            console.error('Error performing action:', error);
            alert(error.response?.data?.error?.message || 'Erreur lors de l\'action');
        } finally {
            setActionLoading(false);
        }
    };

    const handleComplete = () => {
        handleAction('COMPLETED', null, {
            actual_start_date: actualDates.start,
            actual_end_date: actualDates.end
        });
    };

    const handlePlan = () => {
        handleAction('PLANNED', null, {
            start_date: plannedDates.start,
            end_date: plannedDates.end
        });
        setShowPlanModal(false);
    };

    const handleUpdateCost = () => {
        handleAction('UPDATE_COST', null, {
            newCost: parseFloat(newCost)
        });
        setShowCostModal(false);
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin h-10 w-10 text-navy-600" /></div>;
    if (!request) return <div>Demande introuvable</div>;

    const canValidate = (
        (user.role === 'manager' && (request.status === 'PENDING_MANAGER' || request.status === 'PRIORITY_2') && user.id === request.manager_id) ||
        ((user.role === 'rh' || user.role === 'admin') && request.status === 'PENDING_RH')
    );

    const canPlan = (user.role === 'rh' || user.role === 'admin') && ['APPROVED', 'PLANNED'].includes(request.status);
    const canComplete = (user.role === 'rh' || user.role === 'admin') && request.status === 'PLANNED';

    return (
        <div className="max-w-5xl mx-auto">
            <button onClick={() => navigate('/dashboard')} className="mb-6 flex items-center text-gray-500 hover:text-navy-600 transition-colors font-medium">
                <ArrowLeft className="h-4 w-4 mr-2" /> Retour au tableau de bord
            </button>

            <div className="bg-white shadow-sm border border-gray-100 rounded-2xl mb-8">
                <div className="px-8 py-6 border-b border-gray-100 rounded-t-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{request.title}</h1>
                        <p className="mt-1 text-sm text-gray-500">Demande #{request.id} • Créée le {new Date(request.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {user.id === request.user_id && ['DRAFT', 'PENDING_MANAGER', 'PENDING_RH'].includes(request.status) && (
                            <button
                                onClick={() => navigate(`/requests/edit/${request.id}`)}
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500 transition-all"
                            >
                                Modifier
                            </button>
                        )}
                        {request.priority && (
                            <span className={clsx(
                                "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-sm border",
                                request.priority === 'HIGH' ? "bg-red-50 text-red-700 border-red-200" :
                                    request.priority === 'MEDIUM' ? "bg-amber-50 text-amber-700 border-amber-200" :
                                        "bg-green-50 text-green-700 border-green-200"
                            )}>
                                Priorité {request.priority === 'HIGH' ? 'Haute' : request.priority === 'MEDIUM' ? 'Moyenne' : 'Basse'}
                            </span>
                        )}
                        <StatusBadge status={request.status} />
                    </div>
                </div>
            </div>

            {/* Main Content */}            <div className="bg-white shadow-sm border border-gray-100 rounded-2xl mb-8">
                <div className="px-8 py-6 border-b border-gray-100 rounded-t-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50 hidden">
                </div>
                <div className="p-8">
                    {/* Budget Impact for Manager - Full Width */}                    {user.role === 'manager' && request.status === 'PENDING_MANAGER' && (
                        <BudgetImpactCard request={request} budgetStats={budgetStats} />
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Main Info */}                        <div className="md:col-span-2 space-y-8">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <FileText className="h-5 w-5 mr-2 text-navy-500" />
                                    Description
                                </h3>
                                <div className="bg-gray-50 rounded-xl p-6 text-gray-700 leading-relaxed whitespace-pre-wrap border border-gray-100">
                                    {request.description}
                                </div>
                            </div>

                            {request.personal_investment && (
                                <div className="bg-navy-50/50 rounded-xl p-6 border border-navy-100">
                                    <h4 className="text-sm font-bold text-navy-900 mb-2 flex items-center">
                                        <Target className="h-4 w-4 mr-2" />
                                        Engagement d'investissement personnel
                                    </h4>
                                    <p className="text-sm text-navy-700 italic leading-relaxed">
                                        "{request.personal_investment}"
                                    </p>
                                </div>
                            )}

                            {request.objectives && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <Target className="h-5 w-5 mr-2 text-navy-500" />
                                        Objectifs Pédagogiques
                                    </h3>
                                    <div className="bg-gray-50 rounded-xl p-6 text-gray-700 leading-relaxed whitespace-pre-wrap border border-gray-100">
                                        {request.objectives}
                                    </div>
                                </div>
                            )}

                            {request.prerequisites && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <Clock className="h-5 w-5 mr-2 text-navy-500" />
                                        Pré-requis
                                    </h3>
                                    <div className="bg-gray-50 rounded-xl p-6 text-gray-700 leading-relaxed whitespace-pre-wrap border border-gray-100">
                                        {request.prerequisites}
                                    </div>
                                </div>
                            )}

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <Upload className="h-5 w-5 mr-2 text-navy-500" />
                                    Documents joints
                                </h3>

                                {/* Upload Form */}                                {(request.status === 'DRAFT' || user.role === 'rh' || user.role === 'admin') && (
                                    <div className="mb-6 bg-navy-50/50 p-5 rounded-xl border border-dashed border-navy-200 hover:border-navy-300 transition-colors">
                                        <div className="flex flex-col sm:flex-row items-center gap-4">
                                            <select
                                                id="docType"
                                                className="block w-full sm:w-48 pl-3 pr-10 py-2.5 text-base border-gray-200 focus:outline-none focus:ring-navy-500 focus:border-navy-500 sm:text-sm rounded-lg"
                                                defaultValue="DEVIS"
                                            >
                                                <option value="DEVIS">Devis</option>
                                                <option value="PROGRAMME">Programme</option>
                                                <option value="CONVENTION">Convention</option>
                                                <option value="ATTESTATION">Attestation</option>
                                                <option value="FACTURE">Facture</option>
                                                <option value="AUTRE">Autre</option>
                                            </select>
                                            <input
                                                type="file"
                                                id="fileInput"
                                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-navy-100 file:text-navy-700 hover:file:bg-navy-200 transition-colors cursor-pointer"
                                            />
                                            <button
                                                onClick={async () => {
                                                    const fileInput = document.getElementById('fileInput');
                                                    const docType = document.getElementById('docType').value;
                                                    const file = fileInput.files[0];
                                                    if (!file) return alert('Veuillez sélectionner un fichier');

                                                    const formData = new FormData();
                                                    formData.append('file', file);
                                                    formData.append('document_type', docType);

                                                    try {
                                                        await axios.post(`/requests/${id}/documents`, formData, {
                                                            headers: { 'Content-Type': 'multipart/form-data' }
                                                        });
                                                        fileInput.value = ''; // Reset
                                                        fetchRequest(); // Refresh list
                                                    } catch (err) {
                                                        alert('Erreur upload');
                                                    }
                                                }}
                                                className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-navy-600 hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500 shadow-sm transition-all"
                                            >
                                                <Upload className="h-4 w-4 mr-2" />
                                                Uploader
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Documents List */}                                {request.documents && request.documents.length > 0 ? (
                                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {request.documents.map((doc) => (
                                            <li key={doc.id} className="relative flex items-center p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow group">
                                                <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-navy-50 flex items-center justify-center text-navy-600">
                                                    <FileText className="h-5 w-5" />
                                                </div>
                                                <div className="ml-4 flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">{doc.file_name}</p>
                                                    <p className="text-xs text-gray-500">{doc.document_type}</p>
                                                </div>
                                                <div className="ml-4 flex-shrink-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <a
                                                        href={`http://localhost:3001/${doc.file_path}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 text-gray-400 hover:text-navy-600 rounded-full hover:bg-gray-100"
                                                        title="Télécharger"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </a>
                                                    {(request.status === 'DRAFT' || user.role === 'rh' || user.role === 'admin') && (
                                                        <button
                                                            onClick={async () => {
                                                                if (!confirm('Supprimer ce document ?')) return;
                                                                try {
                                                                    await axios.delete(`/documents/${doc.id}`);
                                                                    fetchRequest();
                                                                } catch (e) { alert('Erreur suppression'); }
                                                            }}
                                                            className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100"
                                                            title="Supprimer"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        <FileText className="mx-auto h-8 w-8 text-gray-300" />
                                        <p className="mt-2 text-sm text-gray-500">Aucun document joint pour le moment.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar Info */}                        <div className="space-y-6">
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Détails clés</h4>
                                <dl className="space-y-4">
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500 flex items-center mb-1"><User className="h-3 w-3 mr-1" /> Demandeur</dt>
                                        <dd className="text-sm font-medium text-gray-900">{request.user.first_name} {request.user.last_name}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500 flex items-center mb-1"><Building className="h-3 w-3 mr-1" /> Département</dt>
                                        <dd className="text-sm font-medium text-gray-900">{request.department.name}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500 flex items-center mb-1">
                                            <Euro className="h-3 w-3 mr-1" /> Coût & Financement
                                            {['rh', 'admin'].includes(user.role) && (
                                                <button
                                                    onClick={() => {
                                                        setNewCost(request.cost);
                                                        setShowCostModal(true);
                                                    }}
                                                    className="ml-2 p-1 text-gray-400 hover:text-navy-600 transition-colors"
                                                    title="Modifier le coût"
                                                >
                                                    <Pencil className="h-3 w-3" />
                                                </button>
                                            )}
                                        </dt>
                                        <dd className="text-sm font-medium text-gray-900">{request.cost} € <span className="text-gray-400 font-normal">({request.cost_type})</span></dd>
                                        {request.funding_type === 'CO_FUNDED' && (
                                            <div className="mt-2 text-xs space-y-1 border-l-2 border-navy-100 pl-2">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Entreprise:</span>
                                                    <span className="font-medium text-navy-600">{request.co_funding_company_amount} €</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Personnel:</span>
                                                    <span className="font-medium text-gray-900">{request.co_funding_personal_amount} €</span>
                                                </div>
                                            </div>
                                        )}
                                        {request.funding_type === 'PERSONAL' && (
                                            <div className="mt-1 text-xs text-gray-500 italic">Financement personnel (100%)</div>
                                        )}
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500 flex items-center mb-1"><Calendar className="h-3 w-3 mr-1" /> Disponibilités (Coll.)</dt>
                                        <dd className="text-sm font-medium text-gray-900 bg-navy-50/50 p-2 rounded-lg mt-1 border border-navy-100 italic">
                                            {request.availability_period || 'Non spécifié'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500 flex items-center mb-1">
                                            <Calendar className="h-3 w-3 mr-1" /> Période Planifiée
                                            {['rh', 'admin'].includes(user.role) && request.start_date && (
                                                <button
                                                    onClick={() => {
                                                        setPlannedDates({
                                                            start: request.start_date ? request.start_date.split('T')[0] : '',
                                                            end: request.end_date ? request.end_date.split('T')[0] : ''
                                                        });
                                                        setShowPlanModal(true);
                                                    }}
                                                    className="ml-2 p-1 text-gray-400 hover:text-navy-600 transition-colors"
                                                    title="Modifier la planification"
                                                >
                                                    <Pencil className="h-3 w-3" />
                                                </button>
                                            )}
                                        </dt>
                                        <dd className="text-sm font-medium text-gray-900 mt-1">
                                            {request.start_date ? new Date(request.start_date).toLocaleDateString() : (
                                                <span className="text-gray-400 italic">À définir par les RH</span>
                                            )}
                                            {request.start_date && request.end_date && (
                                                <>
                                                    <span className="text-gray-400 mx-1">→</span>
                                                    {new Date(request.end_date).toLocaleDateString()}
                                                </>
                                            )}
                                        </dd>
                                        <dd className="text-xs text-gray-500 mt-1">{request.duration_days} jours</dd>
                                    </div>
                                    {request.actual_start_date && (
                                        <div className="pt-4 border-t border-gray-200">
                                            <dt className="text-xs font-medium text-green-600 flex items-center mb-1"><Calendar className="h-3 w-3 mr-1" /> Période Réelle</dt>
                                            <dd className="text-sm font-medium text-gray-900">
                                                {new Date(request.actual_start_date).toLocaleDateString()}
                                                <span className="text-gray-400 mx-1">→</span>
                                                {new Date(request.actual_end_date).toLocaleDateString()}
                                            </dd>
                                        </div>
                                    )}
                                </dl>
                            </div>

                            {/* Practical Application Link */}                            {['APPROVED', 'PLANNED', 'COMPLETED'].includes(request.status) && (
                                <div className="bg-white rounded-xl shadow-sm border border-navy-100 p-6">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                                        <ClipboardCheck className="h-4 w-4 mr-2 text-navy-600" />
                                        Mise en pratique
                                    </h4>
                                    <p className="text-xs text-gray-500 mb-4">
                                        {['rh', 'admin'].includes(user.role)
                                            ? 'Consultez le suivi de mise en pratique et l\'évaluation Kirkpatrick.'
                                            : 'Suivez l\'avancement du plan d\'action de cette formation.'}
                                    </p>
                                    <button
                                        onClick={() => navigate(`/practical-application/${request.id}`)}
                                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-navy-200 rounded-lg shadow-sm text-sm font-medium text-navy-700 bg-navy-50 hover:bg-navy-100 transition-all"
                                    >
                                        Voir le plan d'action
                                    </button>
                                </div>
                            )}

                            {/* Add to Calendar */}                            {(request.status === 'APPROVED' || request.status === 'PLANNED') && request.start_date && request.end_date && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Ne manquez pas cette formation !</h4>
                                    <p className="text-xs text-gray-500 mb-4">Ajoutez les dates à votre agenda personnel.</p>
                                    <AddToCalendar
                                        event={{
                                            title: `Formation: ${request.title}`,
                                            description: request.description,
                                            start: request.start_date,
                                            end: request.end_date,
                                            location: request.provider ? request.provider.name : 'À définir'
                                        }}
                                    />
                                </div>
                            )}

                            {/* Validation Actions */}                            {(canValidate || canPlan || canComplete) && (
                                <div className="bg-white rounded-xl shadow-lg border border-navy-100 p-6">
                                    {/* Budget Impact moved to top */}                                    <h4 className="text-sm font-semibold text-gray-900 mb-4">Action requise</h4>
                                    <div className="flex flex-col gap-3">
                                        {canValidate && (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        if (user.role === 'manager') {
                                                            setShowEvaluationForm(true);
                                                        } else {
                                                            handleAction('APPROVED');
                                                        }
                                                    }}
                                                    disabled={actionLoading}
                                                    className="w-full inline-flex justify-center items-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all"
                                                >
                                                    {actionLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                                                    Approuver la demande
                                                </button>

                                                {user.role === 'manager' && request.status === 'PENDING_MANAGER' && (
                                                    <button
                                                        onClick={() => handleAction('PRIORITY_2')}
                                                        disabled={actionLoading}
                                                        className="w-full inline-flex justify-center items-center px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
                                                    >
                                                        <Clock className="h-4 w-4 mr-2" />
                                                        Mettre en attente (Prio 2)
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => setShowRejectModal(true)}
                                                    disabled={actionLoading}
                                                    className="w-full inline-flex justify-center items-center px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all"
                                                >
                                                    <XCircle className="h-4 w-4 mr-2" />
                                                    Refuser
                                                </button>
                                            </>
                                        )}
                                        {canPlan && (
                                            <button
                                                onClick={() => {
                                                    setPlannedDates({
                                                        start: request.start_date ? request.start_date.split('T')[0] : '',
                                                        end: request.end_date ? request.end_date.split('T')[0] : ''
                                                    });
                                                    setShowPlanModal(true);
                                                }}
                                                disabled={actionLoading}
                                                className="w-full inline-flex justify-center items-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-navy-600 hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500 transition-all"
                                            >
                                                {actionLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Calendar className="h-4 w-4 mr-2" />}
                                                {request.status === 'PLANNED' ? 'Modifier la planification' : 'Marquer comme Planifiée'}
                                            </button>
                                        )}
                                        {canComplete && (
                                            <button
                                                onClick={() => {
                                                    setActualDates({
                                                        start: request.start_date ? request.start_date.split('T')[0] : '',
                                                        end: request.end_date ? request.end_date.split('T')[0] : ''
                                                    });
                                                    setShowCompleteModal(true);
                                                }}
                                                disabled={actionLoading}
                                                className="w-full inline-flex justify-center items-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-navy-600 hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500 transition-all"
                                            >
                                                {actionLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                                                Clôturer / Réalisé
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Budget Impact for RH/Admin - Full Width above evaluation */}            {['rh', 'admin'].includes(user.role) && (
                <BudgetImpactCard request={request} budgetStats={budgetStats} />
            )}

            {request.evaluation && (
                <div className="bg-gradient-to-br from-navy-50 to-navy-50 border border-navy-200 rounded-2xl p-8 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">Évaluation Manager</h3>
                            <p className="text-sm text-gray-600">Arbitrage et attentes définies lors de l\'approbation</p>
                        </div>
                        <div className="bg-white rounded-xl px-6 py-4 shadow-sm border border-navy-100">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Score de Pertinence</p>
                            <p className="text-3xl font-bold text-navy-600">{request.evaluation.score}<span className="text-lg text-gray-400 font-normal"> / 55</span></p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Evaluation Criteria */}                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <h4 className="text-sm font-semibold text-gray-900 mb-4">Critères d\'évaluation</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                                    <span className="text-sm text-gray-600">Alignement Stratégique</span>
                                    <span className="font-bold text-gray-900">{request.evaluation.alignment_strategy}/5 <span className="text-xs text-gray-400">(x3)</span></span>
                                </div>
                                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                                    <span className="text-sm text-gray-600">Écart de Compétences</span>
                                    <span className="font-bold text-gray-900">{request.evaluation.competence_gap}/5 <span className="text-xs text-gray-400">(x3)</span></span>
                                </div>
                                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                                    <span className="text-sm text-gray-600">Impact Opérationnel</span>
                                    <span className="font-bold text-gray-900">{request.evaluation.operational_impact}/5 <span className="text-xs text-gray-400">(x2)</span></span>
                                </div>
                                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                                    <span className="text-sm text-gray-600">Retour sur Attentes (ROE)</span>
                                    <span className="font-bold text-gray-900">{request.evaluation.roe_expectation}/5 <span className="text-xs text-gray-400">(x2)</span></span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Pertinence Contenu</span>
                                    <span className="font-bold text-gray-900">{request.evaluation.content_relevance}/5 <span className="text-xs text-gray-400">(x1)</span></span>
                                </div>
                            </div>
                            {request.evaluation.comment && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Commentaire</p>
                                    <p className="text-sm text-gray-700 italic">"{request.evaluation.comment}"</p>
                                </div>
                            )}
                        </div>

                        {/* Manager Expectations */}                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                                <Target className="w-4 h-4 mr-2 text-amber-600" />
                                Attentes & Objectifs
                            </h4>
                            {request.manager_expectations ? (
                                <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{request.manager_expectations}</p>
                                </div>
                            ) : (
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-center">
                                    <p className="text-sm text-gray-500 italic">Aucune attente spécifique définie</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}


            {/* History */}            <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden mb-12">
                <div className="px-8 py-6 border-b border-gray-100">
                    <h3 className="text-lg leading-6 font-semibold text-gray-900">Historique de validation</h3>
                </div>
                <div className="flow-root px-8 py-6">
                    <ul className="-mb-8">
                        {request.history.map((item, itemIdx) => (
                            <li key={item.id}>
                                <div className="relative pb-8">
                                    {itemIdx !== request.history.length - 1 ? (
                                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                                    ) : null}
                                    <div className="relative flex space-x-3">
                                        <div>
                                            <span className={clsx(
                                                "h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white",
                                                item.action === 'APPROVED' ? "bg-green-500" :
                                                    item.action === 'REJECTED' ? "bg-red-500" :
                                                        item.action === 'SUBMITTED' ? "bg-navy-500" :
                                                            item.action === 'PLANNED' ? "bg-navy-600" :
                                                                item.action === 'COMPLETED' ? "bg-navy-600" : "bg-gray-400"
                                            )}>
                                                {item.action === 'APPROVED' && <CheckCircle className="h-5 w-5 text-white" />}
                                                {item.action === 'REJECTED' && <XCircle className="h-5 w-5 text-white" />}
                                                {item.action === 'SUBMITTED' && <FileText className="h-5 w-5 text-white" />}
                                                {item.action === 'PLANNED' && <Calendar className="h-5 w-5 text-white" />}
                                                {item.action === 'COMPLETED' && <CheckCircle className="h-5 w-5 text-white" />}
                                                {!['APPROVED', 'REJECTED', 'SUBMITTED', 'PLANNED', 'COMPLETED'].includes(item.action) && <MessageSquare className="h-5 w-5 text-white" />}
                                            </span>
                                        </div>
                                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                            <div>
                                                <p className="text-sm text-gray-500">
                                                    <span className="font-medium text-gray-900">{item.actor.first_name} {item.actor.last_name}</span>
                                                    {' '}a{' '}
                                                    <span className="font-medium text-gray-900 lowercase">
                                                        {item.action === 'SUBMITTED' ? 'soumis la demande' :
                                                            item.action === 'APPROVED' ? 'approuvé la demande' :
                                                                item.action === 'REJECTED' ? 'refusé la demande' :
                                                                    item.action === 'PLANNED' ? 'planifié la formation' :
                                                                        item.action === 'COMPLETED' ? 'clôturé la formation' : item.action}
                                                    </span>
                                                </p>
                                                {item.comment && (
                                                    <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200 italic">
                                                        "{item.comment}"
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                                <time dateTime={item.created_at}>{new Date(item.created_at).toLocaleString()}</time>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>




            {/* Reject Modal */}            {
                showRejectModal && (
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity">
                        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 transform transition-all scale-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Motif du refus</h3>
                            <p className="text-sm text-gray-500 mb-4">Veuillez indiquer la raison pour laquelle vous refusez cette demande. Ce commentaire sera visible par le demandeur.</p>
                            <textarea
                                className="w-full border border-gray-300 rounded-xl p-3 mb-6 focus:ring-2 focus:ring-navy-500 focus:border-navy-500 transition-shadow"
                                rows={4}
                                placeholder="Ex: Budget insuffisant pour cette période..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowRejectModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={() => handleAction('REJECTED', comment)}
                                    disabled={!comment.trim() || actionLoading}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm disabled:opacity-50 transition-all"
                                >
                                    Confirmer le refus
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Plan Modal */}            {
                showPlanModal && (
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity">
                        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 transform transition-all scale-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Planifier la formation</h3>
                            <p className="text-sm text-gray-500 mb-6">Indiquez les dates prévues pour cette formation. Le collaborateur en sera informé.</p>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date de début prévue</label>
                                    <input
                                        type="date"
                                        value={plannedDates.start}
                                        onChange={(e) => setPlannedDates({ ...plannedDates, start: e.target.value })}
                                        className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-navy-500 focus:border-navy-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin prévue</label>
                                    <input
                                        type="date"
                                        value={plannedDates.end}
                                        onChange={(e) => setPlannedDates({ ...plannedDates, end: e.target.value })}
                                        className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-navy-500 focus:border-navy-500 sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowPlanModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handlePlan}
                                    disabled={!plannedDates.start || !plannedDates.end || actionLoading}
                                    className="px-4 py-2 text-sm font-medium text-white bg-navy-600 hover:bg-navy-700 rounded-lg shadow-sm disabled:opacity-50 transition-all"
                                >
                                    Confirmer la planification
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Complete Modal */}            {
                showCompleteModal && (
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity">
                        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 transform transition-all scale-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Clôturer la formation</h3>
                            <p className="text-sm text-gray-500 mb-6">Veuillez confirmer les dates réelles de la formation pour finaliser le dossier et le budget.</p>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date de début réelle</label>
                                    <input
                                        type="date"
                                        value={actualDates.start}
                                        onChange={(e) => setActualDates({ ...actualDates, start: e.target.value })}
                                        className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-navy-500 focus:border-navy-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin réelle</label>
                                    <input
                                        type="date"
                                        value={actualDates.end}
                                        onChange={(e) => setActualDates({ ...actualDates, end: e.target.value })}
                                        className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-navy-500 focus:border-navy-500 sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowCompleteModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleComplete}
                                    disabled={!actualDates.start || !actualDates.end || actionLoading}
                                    className="px-4 py-2 text-sm font-medium text-white bg-navy-600 hover:bg-navy-700 rounded-lg shadow-sm disabled:opacity-50 transition-all"
                                >
                                    Confirmer et Clôturer
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Evaluation Display - For Manager only (RH sees it before History) */}            {
                request.evaluation && user.role === 'manager' && (
                    <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden mb-12">
                        <div className="px-8 py-6 border-b border-gray-100 bg-navy-50/30">
                            <h3 className="text-lg leading-6 font-semibold text-gray-900">Évaluation Manager</h3>
                        </div>
                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                        <span className="text-sm text-gray-600">Alignement Stratégique</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-900">{request.evaluation.alignment_strategy}/5</span>
                                            <span className="text-xs text-gray-400">(x3)</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                        <span className="text-sm text-gray-600">Écart de Compétences</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-900">{request.evaluation.competence_gap}/5</span>
                                            <span className="text-xs text-gray-400">(x3)</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                        <span className="text-sm text-gray-600">Impact Opérationnel</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-900">{request.evaluation.operational_impact}/5</span>
                                            <span className="text-xs text-gray-400">(x2)</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                        <span className="text-sm text-gray-600">Retour sur Attentes (ROE)</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-900">{request.evaluation.roe_expectation}/5</span>
                                            <span className="text-xs text-gray-400">(x2)</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                        <span className="text-sm text-gray-600">Pertinence Contenu</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-900">{request.evaluation.content_relevance}/5</span>
                                            <span className="text-xs text-gray-400">(x1)</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col justify-center items-center bg-gray-50 rounded-xl p-6 border border-gray-100">
                                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Score Global</span>
                                    <span className="text-4xl font-bold text-navy-600">{request.evaluation.score} <span className="text-xl text-gray-400 font-normal">/ 55</span></span>
                                    {request.evaluation.comment && (
                                        <div className="mt-6 w-full bg-white p-4 rounded-lg border border-gray-200 text-sm text-gray-600 italic">
                                            "{request.evaluation.comment}"
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Manager Expectations for RH */}                            {request.manager_expectations && (
                                <div className="mt-8 pt-8 border-t border-gray-100">
                                    <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                                        <Target className="w-5 h-5 mr-2 text-amber-600" />
                                        Attentes & Objectifs du Manager
                                    </h4>
                                    <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{request.manager_expectations}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }

            {/* Manager Review (Post-Formation) for RH */}            {request.application_plan?.manager_review_comment && (user.role === 'rh' || user.role === 'admin' || user.role === 'manager') && (
                <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden mb-12">
                    <div className="px-8 py-6 border-b border-gray-100 bg-navy-50/30">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg leading-6 font-semibold text-gray-900">Bilan Manager Post-Formation</h3>
                            {request.application_plan.manager_reviewed_at && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Validé le {new Date(request.application_plan.manager_reviewed_at).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="p-8">
                        <div className="bg-navy-50 rounded-lg p-6 border border-navy-100">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3">Évaluation de l\'impact réel</h4>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{request.application_plan.manager_review_comment}</p>
                        </div>

                        {/* Kirkpatrick Metrics Summary */}                        {(request.application_plan.application_rate > 0 || request.application_plan.kpis) && (
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                {request.application_plan.application_rate > 0 && (
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                        <h5 className="text-xs font-semibold text-gray-600 uppercase mb-2">Taux d\'Application</h5>
                                        <p className="text-2xl font-bold text-navy-600">{request.application_plan.application_rate}%</p>
                                    </div>
                                )}
                                {request.application_plan.kpis && JSON.parse(request.application_plan.kpis).length > 0 && (
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                        <h5 className="text-xs font-semibold text-gray-600 uppercase mb-2">KPIs Suivis</h5>
                                        <p className="text-2xl font-bold text-green-600">{JSON.parse(request.application_plan.kpis).length}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Evaluation Form Modal */}            {
                showEvaluationForm && (
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
                            <ManagerEvaluationForm
                                onSubmit={(evalData) => {
                                    setEvaluationData(evalData);
                                    setShowEvaluationForm(false);
                                    setShowExpectationsModal(true);
                                }}
                                onCancel={() => setShowEvaluationForm(false)}
                            />
                        </div>
                    </div>
                )
            }

            {/* Expectations Modal */}            {
                showExpectationsModal && (
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
                            <ManagerExpectationsModal
                                evaluationData={evaluationData}
                                onSubmit={(data) => {
                                    const { manager_expectations, ...evaluationFields } = data;
                                    handleAction('APPROVED', null, {
                                        manager_expectations,
                                        evaluation: evaluationFields
                                    });
                                    setShowExpectationsModal(false);
                                }}
                                onCancel={() => {
                                    setShowExpectationsModal(false);
                                    setShowEvaluationForm(true); // Go back to evaluation
                                }}
                            />
                        </div>
                    </div>
                )
            }

            {/* Cost Update Modal */}            {showCostModal && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 w-full max-w-md transform transition-all">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-navy-50 rounded-xl text-navy-600">
                                <Euro className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Modifier le coût</h3>
                                <p className="text-sm text-gray-500">Mise à jour du coût de la formation</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Nouveau coût (€)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={newCost}
                                        onChange={(e) => setNewCost(e.target.value)}
                                        className="block w-full pl-4 pr-12 py-3 border-gray-200 focus:ring-navy-500 focus:border-navy-500 rounded-xl bg-gray-50 font-medium"
                                        placeholder="0.00"
                                        step="0.01"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                        <span className="text-gray-400 font-bold">€</span>
                                    </div>
                                </div>
                                <p className="mt-2 text-xs text-gray-400 italic">
                                    Note: Cela ajustera automatiquement le budget engagé ou consommé du département.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowCostModal(false)}
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 transition-all"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleUpdateCost}
                                    disabled={actionLoading || !newCost || isNaN(newCost)}
                                    className="flex-2 px-6 py-3 border border-transparent rounded-xl text-sm font-bold text-white bg-navy-600 hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500 shadow-md transition-all disabled:opacity-50"
                                >
                                    {actionLoading ? <Loader2 className="animate-spin h-4 w-4 mx-auto" /> : 'Enregistrer'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function BudgetImpactCard({ request, budgetStats }) {
    if (!budgetStats) return null;

    const { initial, engaged, consumed, remaining } = budgetStats;
    const requestCost = parseFloat(request.cost || 0);

    // Calculate new projected state
    // remaining is what is available currently. 
    // If we approve this request, remaining decreases by requestCost.
    const projectedRemaining = remaining - requestCost;

    // Totals for visualization
    const totalBudget = initial > 0 ? initial : 1;

    // Current usage (Engaged + Consumed)
    const currentUsage = engaged + consumed;
    const currentUsagePct = Math.min((currentUsage / totalBudget) * 100, 100);

    // New usage if approved
    const newUsage = currentUsage + requestCost;
    const newUsagePct = Math.min((newUsage / totalBudget) * 100, 100);

    // Percentage difference (Impact)
    const impactPct = newUsagePct - currentUsagePct;

    const isOverBudget = projectedRemaining < 0;

    return (
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
                <h4 className="text-base font-bold text-gray-900 flex items-center">
                    <div className="p-2 bg-navy-50 rounded-lg mr-3 text-navy-600">
                        <Euro className="h-5 w-5" />
                    </div>
                    Impact Budgétaire
                    <span className="ml-2 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Département</span>
                </h4>
                {isOverBudget && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 animate-pulse">
                        ⚠️ Dépassement Budget
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {/* Current Budget State */}                <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Budget Alloué</p>
                    <p className="text-xl font-bold text-gray-900">{totalBudget.toLocaleString('fr-FR')} €</p>
                </div>

                {/* Impact of Request */}                <div className="p-4 bg-navy-50 rounded-xl border border-navy-100 shadow-sm relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-xs font-bold text-navy-400 uppercase tracking-wider mb-1">Coût Demande</p>
                        <p className="text-xl font-bold text-navy-700">-{requestCost.toLocaleString('fr-FR')} €</p>
                    </div>
                    <Euro className="absolute -right-4 -bottom-4 h-16 w-16 text-navy-100 rotate-12" />
                </div>

                {/* Projected Result */}                <div className={clsx("p-4 rounded-xl border shadow-sm transition-colors", isOverBudget ? "bg-red-50 border-red-100" : "bg-green-50 border-green-100")}>
                    <p className={clsx("text-xs font-bold uppercase tracking-wider mb-1", isOverBudget ? "text-red-400" : "text-green-500")}>
                        Restant Projeté
                    </p>
                    <p className={clsx("text-xl font-bold", isOverBudget ? "text-red-700" : "text-green-700")}>
                        {projectedRemaining.toLocaleString('fr-FR')} €
                    </p>
                </div>
            </div>

            {/* Visual Bar */}            <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1">
                    <span>Progression du budget</span>
                    <span>{newUsagePct.toFixed(1)}% utilisé</span>
                </div>
                <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden flex">
                    {/* Already Used */}                    <div
                        style={{ width: `${currentUsagePct}%` }}
                        className="h-full bg-gray-400"
                        title={`Utilisé: ${currentUsage.toLocaleString()}€`}
                    />
                    {/* Impact of this request */}                    <div
                        style={{ width: `${impactPct}%` }}
                        className={clsx("h-full relative", isOverBudget ? "bg-red-500" : "bg-navy-500")}
                        title={`Cette demande: ${requestCost.toLocaleString()}€`}
                    >
                        {/* Striped pattern overlay for effect */}                        <div className="absolute inset-0 opacity-20 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzj//v37zaDIfwYIYwAjGwDTbRWEV7sW/wAAAABJRU5ErkJggg==')]"></div>
                    </div>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-400 mt-2">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-gray-400"></div> Déjà engagé/consommé</span>
                        <span className="flex items-center gap-1.5"><div className={clsx("w-2 h-2 rounded-full", isOverBudget ? "bg-red-500" : "bg-navy-500")}></div> Impact demande</span>
                    </div>
                    <span>Total: {totalBudget.toLocaleString('fr-FR')} €</span>
                </div>
            </div>
        </div>
    );
}