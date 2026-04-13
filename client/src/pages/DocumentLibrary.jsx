import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Search,
    Filter,
    Download,
    FileText,
    User,
    Building,
    Calendar,
    ExternalLink,
    Loader2,
    CheckCircle2,
    Clock,
    ArrowUpDown,
    Library
} from 'lucide-react';
import clsx from 'clsx';

const DOC_TYPE_LABELS = {
    'DEVIS': 'Devis',
    'PROGRAMME': 'Programme',
    'CONVENTION': 'Convention',
    'ATTESTATION': 'Attestation',
    'FACTURE': 'Facture',
    'AUTRE': 'Autre'
};

const STATUS_LABELS = {
    'DRAFT': 'Brouillon',
    'PENDING_MANAGER': 'Attente Manager',
    'PRIORITY_2': 'Priorité 2',
    'PENDING_RH': 'Attente RH',
    'APPROVED': 'Approuvé',
    'PLANNED': 'Planifié',
    'COMPLETED': 'Terminé',
    'REJECTED': 'Refusé'
};

export default function DocumentLibrary() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('ALL');
    const [filterDept, setFilterDept] = useState('ALL');
    const [departments, setDepartments] = useState([]);
    const [downloading, setDownloading] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [docsRes, deptsRes] = await Promise.all([
                axios.get('/admin/documents'),
                axios.get('/admin/departments')
            ]);
            setDocuments(docsRes.data.documents);
            setDepartments(deptsRes.data.departments);
        } catch (error) {
            console.error('Error fetching library data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (doc) => {
        setDownloading(doc.id);
        try {
            const response = await axios.get(`/documents/download/${doc.id}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', doc.file_name);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Download error:', error);
            alert('Erreur lors du téléchargement');
        } finally {
            setDownloading(null);
        }
    };

    const handleMassDownload = async () => {
        if (!confirm(`Voulez-vous télécharger les ${filteredDocs.length} documents sélectionnés ?`)) return;

        // Sequential download (simplest for now without complex zip logic)
        for (const doc of filteredDocs) {
            await handleDownload(doc);
            // Small delay to avoid browser blocking multiple downloads
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    };

    const filteredDocs = documents.filter(doc => {
        const matchesSearch =
            doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.request?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            `${doc.request?.user.first_name} ${doc.request?.user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = filterType === 'ALL' || doc.document_type === filterType;
        const matchesDept = filterDept === 'ALL' || doc.request?.user.department.name === filterDept;

        return matchesSearch && matchesType && matchesDept;
    });

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin h-10 w-10 text-navy-600" /></div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-navy-600 rounded-2xl text-white shadow-lg shadow-navy-200">
                        <Library className="h-8 w-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Bibliothèque Documentaire</h1>
                        <p className="text-gray-500 font-medium">Centralisation et gestion de tous les documents de formation</p>
                    </div>
                </div>
                <button
                    onClick={handleMassDownload}
                    disabled={filteredDocs.length === 0}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-bold rounded-xl shadow-md text-white bg-navy-600 hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500 transition-all disabled:opacity-50 disabled:shadow-none"
                >
                    <Download className="h-5 w-5 mr-2" />
                    Tout télécharger ({filteredDocs.length})
                </button>
            </div>

            {/* Filters Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher par fichier, formation ou collaborateur..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-gray-100 rounded-xl focus:ring-2 focus:ring-navy-500 focus:bg-white transition-all text-sm font-medium"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border-gray-100 rounded-xl focus:ring-2 focus:ring-navy-500 focus:bg-white transition-all text-sm font-medium appearance-none"
                        >
                            <option value="ALL">Tous les types</option>
                            {Object.entries(DOC_TYPE_LABELS).map(([val, label]) => (
                                <option key={val} value={val}>{label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="relative">
                        <Building className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <select
                            value={filterDept}
                            onChange={(e) => setFilterDept(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border-gray-100 rounded-xl focus:ring-2 focus:ring-navy-500 focus:bg-white transition-all text-sm font-medium appearance-none"
                        >
                            <option value="ALL">Tous les départements</option>
                            {departments.map(d => (
                                <option key={d.id} value={d.name}>{d.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Documents List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Document</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Formation</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Collaborateur</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                                <th className="px-8 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredDocs.map((doc) => (
                                <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 bg-navy-50 rounded-lg flex items-center justify-center text-navy-600 mr-4 shadow-sm">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-900 truncate max-w-xs">{doc.file_name}</div>
                                                <div className="text-xs font-medium text-gray-400">{DOC_TYPE_LABELS[doc.document_type] || doc.document_type}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                            {doc.request?.title}
                                            <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded leading-none font-bold">
                                                {STATUS_LABELS[doc.request?.status] || doc.request?.status}
                                            </span>
                                        </div>
                                        <div className="text-xs font-medium text-gray-400">ID #{doc.request?.id}</div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-bold mr-3 border border-white shadow-sm">
                                                {doc.request?.user.first_name[0]}{doc.request?.user.last_name[0]}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-900">{doc.request?.user.first_name} {doc.request?.user.last_name}</div>
                                                <div className="text-xs font-medium text-gray-400">{doc.request?.user.department.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-500 font-medium">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-300" />
                                            {new Date(doc.uploaded_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap text-right">
                                        <button
                                            onClick={() => handleDownload(doc)}
                                            disabled={downloading === doc.id}
                                            className="inline-flex items-center p-2 rounded-xl text-navy-600 hover:bg-navy-50 transition-all font-bold"
                                            title="Télécharger"
                                        >
                                            {downloading === doc.id ? (
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            ) : (
                                                <Download className="h-5 w-5" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => window.open(`/api/v1/requests/${doc.request_id}`, '_blank')}
                                            className="inline-flex items-center p-2 rounded-xl text-gray-400 hover:text-navy-600 hover:bg-navy-50 transition-all ml-1"
                                            title="Voir la demande"
                                        >
                                            <ExternalLink className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredDocs.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-8 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="p-4 bg-gray-50 rounded-full mb-4">
                                                <Search className="h-10 w-10 text-gray-300" />
                                            </div>
                                            <p className="text-xl font-bold text-gray-900">Aucun document trouvé</p>
                                            <p className="text-gray-500">Essayez de modifier vos filtres ou termes de recherche</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
