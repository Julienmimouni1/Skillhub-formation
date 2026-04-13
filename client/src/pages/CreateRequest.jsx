import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Loader2, Save, Send, ArrowLeft, FileText, Calendar, Euro, Clock, Building, Search, ExternalLink, Trash2, AlertCircle, CheckCircle2, BookOpen, Globe, Upload } from 'lucide-react';
import clsx from 'clsx';

export default function CreateRequest() {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const campaignId = searchParams.get('campaign_id');
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [providers, setProviders] = useState([]);
    const [files, setFiles] = useState([]);
    const [campaign, setCampaign] = useState(null);
    const [programFile, setProgramFile] = useState(null); // Dedicated program file
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        objectives: '',
        prerequisites: '',
        cost: '',
        type: 'PLAN_DEV',
        funding_type: 'COMPANY',
        co_funding_company_amount: '',
        co_funding_personal_amount: '',
        start_date: '',
        end_date: '',
        availability_period: '',
        duration_days: '',
        provider_id: '',
        priority: 'MEDIUM',
        personal_investment: '',
        campaign_id: campaignId || ''
    });

    // Catalog State
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hoveredItem, setHoveredItem] = useState(null);
    const [requestType, setRequestType] = useState(location.state?.type || 'EXTERNAL');
    const [internalCourses, setInternalCourses] = useState([]);

    // Fetch Initial Data
    useEffect(() => {
        const fetchProviders = async () => {
            try {
                const { data } = await axios.get('/providers');
                setProviders(data.providers);
            } catch (error) { console.error(error); }
        };
        fetchProviders();

        if (campaignId) {
            const fetchCampaign = async () => {
                try {
                    const { data } = await axios.get(`/campaigns/${campaignId}`);
                    setCampaign(data);
                    setFormData(prev => ({ ...prev, campaign_id: campaignId }));
                } catch (error) { console.error(error); }
            };
            fetchCampaign();
        }

        if (isEditMode) {
            const fetchRequest = async () => {
                try {
                    const { data } = await axios.get(`/requests/${id}`);
                    const req = data.request;
                    setFormData({
                        title: req.title,
                        description: req.description || '',
                        objectives: req.objectives || '',
                        prerequisites: req.prerequisites || '',
                        cost: req.cost,
                        type: req.type,
                        funding_type: req.funding_type || 'COMPANY',
                        co_funding_company_amount: req.co_funding_company_amount || '',
                        co_funding_personal_amount: req.co_funding_personal_amount || '',
                        start_date: req.start_date ? req.start_date.split('T')[0] : '',
                        end_date: req.end_date ? req.end_date.split('T')[0] : '',
                        availability_period: req.availability_period || '',
                        duration_days: req.duration_days,
                        provider_id: req.provider_id || '',
                        priority: req.priority || 'MEDIUM',
                        personal_investment: req.personal_investment || '',
                        campaign_id: req.campaign_id || ''
                    });
                    if (req.campaign_id) {
                        try {
                            const campRes = await axios.get(`/campaigns/${req.campaign_id}`);
                            setCampaign(campRes.data);
                        } catch (e) { }
                    }
                } catch (error) {
                    console.error(error);
                    navigate('/');
                }
            };
            fetchRequest();
        }
    }, [id, isEditMode, campaignId, navigate]);

    // Internal Catalog Fetch
    useEffect(() => {
        if (requestType === 'INTERNAL') {
            const fetchInternal = async () => {
                try {
                    const { data } = await axios.get('/catalog?type=internal&limit=100');
                    setInternalCourses(data.data);
                } catch (e) { console.error(e); }
            };
            fetchInternal();
        }
    }, [requestType]);

    const handleSearch = async (query) => {
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        try {
            const { data } = await axios.get(`/catalog/search?q=${encodeURIComponent(query)}`);
            setSearchResults(data.results);
        } catch (error) { console.error(error); } finally { setIsSearching(false); }
    };

    const selectCatalogItem = (item) => {
        const existingProvider = providers.find(p => p.name.toLowerCase().includes(item.provider.toLowerCase()));
        setFormData(prev => ({
            ...prev,
            title: item.title,
            description: item.description || '',
            objectives: item.objective || '',
            prerequisites: item.prerequisites || '',
            cost: item.cost,
            duration_days: item.duration_days,
            type: item.type || 'PLAN_DEV',
            provider_id: existingProvider ? existingProvider.id : ''
        }));
        setSearchResults([]);
    };

    const handleInternalCourseSelect = (courseId) => {
        const course = internalCourses.find(c => c.id === parseInt(courseId));
        if (course) selectCatalogItem(course);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            if (prev.funding_type === 'CO_FUNDED' && prev.cost) {
                const totalCost = parseFloat(prev.cost);
                if (name === 'co_funding_company_amount') {
                    newData.co_funding_personal_amount = (totalCost - (parseFloat(value) || 0)).toFixed(2);
                } else if (name === 'co_funding_personal_amount') {
                    newData.co_funding_company_amount = (totalCost - (parseFloat(value) || 0)).toFixed(2);
                } else if (name === 'cost') {
                    newData.co_funding_company_amount = value;
                    newData.co_funding_personal_amount = '0';
                }
            }
            return newData;
        });
    };

    const handleSubmit = async (e, status = 'DRAFT') => {
        e.preventDefault();

        if (status !== 'DRAFT') {
            const confirmed = window.confirm("Voulez-vous vraiment soumettre cette demande de formation ?");
            if (!confirmed) return;
        }

        if (formData.start_date && formData.end_date && new Date(formData.end_date) < new Date(formData.start_date)) {
            alert("La date de fin ne peut pas être antérieure à la date de début.");
            return;
        }

        setLoading(true);
        try {
            let requestId;
            const payload = { ...formData, status, campaign_id: formData.campaign_id ? parseInt(formData.campaign_id) : null };

            if (isEditMode) {
                const { data } = await axios.put(`/requests/${id}`, payload);
                requestId = data.request.id;
            } else {
                const { data } = await axios.post('/requests', payload);
                requestId = data.request.id;
            }

            // Upload Program File if selected
            if (programFile) {
                const fd = new FormData();
                fd.append('file', programFile);
                fd.append('document_type', 'PROGRAMME');
                await axios.post(`/requests/${requestId}/documents`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            }

            // Upload other files
            if (files.length > 0) {
                await Promise.all(files.map(async (f) => {
                    const fd = new FormData();
                    fd.append('file', f.file);
                    fd.append('document_type', f.type);
                    await axios.post(`/requests/${requestId}/documents`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                }));
            }
            navigate(isEditMode ? `/requests/${id}` : '/dashboard');
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.error?.message || 'Erreur lors de la sauvegarde');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Navigation */}
                <button onClick={() => navigate(isEditMode ? `/requests/${id}` : '/')} className="mb-6 group flex items-center text-gray-500 hover:text-navy-600 transition-colors font-medium">
                    <div className="bg-white p-2 rounded-full shadow-sm border border-gray-200 group-hover:border-navy-200 mr-3 transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                    </div>
                    {isEditMode ? 'Retour à la demande' : 'Annuler et retour'}
                </button>

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                            {isEditMode ? 'Modifier la demande' : 'Nouvelle demande'}
                        </h1>
                        <p className="mt-2 text-gray-500">
                            Complétez les informations ci-dessous pour soumettre votre projet de formation.
                        </p>
                    </div>
                    {!isEditMode && (
                        <div className="hidden sm:flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 text-sm font-medium text-gray-600">
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                            Brouillon automatique
                        </div>
                    )}
                </div>

                {campaign && (
                    <div className="mb-8 rounded-2xl bg-gradient-to-br from-navy-600 to-navy-700 p-6 text-white shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
                        <div className="relative z-10 flex items-start gap-5">
                            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
                                <Calendar className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-white/10">Campagne Active</span>
                                    <h2 className="text-2xl font-bold">{campaign.title}</h2>
                                </div>
                                <p className="text-navy-100 mb-4 max-w-2xl text-lg leading-relaxed">Cette demande sera rattachée à la campagne de recueil des besoins en cours.</p>
                                {campaign.description && (
                                    <div className="bg-black/20 rounded-xl p-4 text-sm text-navy-50 border border-white/10 backdrop-blur-sm">
                                        <p className="font-semibold mb-2 flex items-center gap-2"><AlertCircle className="h-4 w-4" /> Instructions :</p>
                                        <p className="whitespace-pre-line leading-relaxed opacity-90">{campaign.description}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <form className="space-y-8">
                    {/* Catalog Selection Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Search className="h-5 w-5 text-navy-600" />
                                Sélection de la formation
                            </h3>
                            <div className="flex bg-gray-200 p-1 rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => setRequestType('INTERNAL')}
                                    className={clsx(
                                        "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                                        requestType === 'INTERNAL' ? "bg-white text-navy-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
                                    )}
                                >
                                    Catalogue Interne
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRequestType('EXTERNAL')}
                                    className={clsx(
                                        "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                                        requestType === 'EXTERNAL' ? "bg-white text-navy-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
                                    )}
                                >
                                    Catalogue Externe
                                </button>
                            </div>
                        </div>

                        <div className="p-8 bg-navy-50/30">
                            {requestType === 'INTERNAL' ? (
                                <div className="max-w-2xl">
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">Choisir une formation interne</label>
                                    <div className="relative">
                                        <BookOpen className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                                        <select
                                            onChange={(e) => handleInternalCourseSelect(e.target.value)}
                                            className="block w-full pl-12 pr-10 py-3.5 bg-white border-gray-200 rounded-xl focus:ring-2 focus:ring-navy-500 focus:border-transparent sm:text-sm shadow-sm transition-all hover:border-navy-300"
                                            value={internalCourses.find(c => c.title === formData.title)?.id || ""}
                                        >
                                            <option value="">Sélectionner dans la liste...</option>
                                            {internalCourses.map(course => (
                                                <option key={course.id} value={course.id}>
                                                    {course.title} ({course.duration_days}j - {course.cost}€)
                                                </option>
                                            ))}
                                        </select>
                                        {formData.title && internalCourses.some(c => c.title === formData.title) && (
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, title: '', description: '', objectives: '', prerequisites: '', cost: '', duration_days: '', provider_id: '' }))}
                                                className="absolute right-2 top-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Effacer la sélection"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="relative z-20">
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">Rechercher sur le web (Catalogue Externe)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Globe className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Mots-clés : React, Management, Anglais..."
                                            className="block w-full pl-12 pr-12 py-3.5 bg-white border-gray-200 rounded-xl focus:ring-2 focus:ring-navy-500 focus:border-transparent sm:text-sm shadow-sm transition-all hover:border-navy-300"
                                            onChange={(e) => handleSearch(e.target.value)}
                                            onBlur={() => setTimeout(() => setSearchResults([]), 200)}
                                            onFocus={(e) => e.target.value.length >= 2 && handleSearch(e.target.value)}
                                        />
                                        {isSearching && (
                                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                                <Loader2 className="h-5 w-5 text-navy-500 animate-spin" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Search Results Dropdown */}
                                    {searchResults.length > 0 && (
                                        <div className="mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-80 overflow-y-auto absolute w-full left-0 top-full z-50">
                                            <ul className="divide-y divide-gray-50">
                                                {searchResults.map((result) => (
                                                    <li
                                                        key={result.id}
                                                        className="px-5 py-4 hover:bg-navy-50 cursor-pointer transition-colors group"
                                                        onClick={() => selectCatalogItem(result)}
                                                        onMouseEnter={() => setHoveredItem(result)}
                                                        onMouseLeave={() => setHoveredItem(null)}
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-900 group-hover:text-navy-700 mb-1">{result.title}</p>
                                                                <p className="text-xs text-gray-500 flex items-center gap-2">
                                                                    <Building className="h-3 w-3" /> {result.provider}
                                                                    <span className="text-gray-300">|</span>
                                                                    <Clock className="h-3 w-3" /> {result.duration_days} jours
                                                                </p>
                                                            </div>
                                                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-green-100 text-green-700">
                                                                {result.cost} €
                                                            </span>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Form Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Details */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* General Info Card */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-navy-600" />
                                    Détails de la formation
                                </h3>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Intitulé de la formation</label>
                                        <input
                                            type="text"
                                            name="title"
                                            required
                                            value={formData.title}
                                            onChange={handleChange}
                                            className="block w-full rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all py-3.5 px-4 text-gray-900 font-medium"
                                            placeholder="Ex: Formation React Avancé"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Type de demande</label>
                                            <select
                                                name="type"
                                                value={formData.type}
                                                onChange={handleChange}
                                                className="block w-full rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all py-3.5 px-4"
                                            >
                                                <option value="PLAN_DEV">Plan de développement</option>
                                                <option value="OBLIGATOIRE">Obligatoire / Réglementaire</option>
                                                <option value="CPF">CPF</option>
                                                <option value="AUTRE">Autre</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Organisme</label>
                                            <select
                                                name="provider_id"
                                                value={formData.provider_id}
                                                onChange={handleChange}
                                                className="block w-full rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all py-3.5 px-4"
                                            >
                                                <option value="">Sélectionner...</option>
                                                {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Priorité de la demande</label>
                                        <div className="flex gap-4">
                                            {['LOW', 'MEDIUM', 'HIGH'].map((p) => (
                                                <button
                                                    key={p}
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, priority: p }))}
                                                    className={clsx(
                                                        "flex-1 py-3 px-4 rounded-xl border-2 text-sm font-bold transition-all",
                                                        formData.priority === p
                                                            ? p === 'HIGH' ? "bg-red-50 border-red-500 text-red-700" :
                                                                p === 'MEDIUM' ? "bg-amber-50 border-amber-500 text-amber-700" :
                                                                    "bg-green-50 border-green-500 text-green-700"
                                                            : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
                                                    )}
                                                >
                                                    {p === 'HIGH' ? 'Haute' : p === 'MEDIUM' ? 'Moyenne' : 'Basse'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 font-bold text-navy-900">
                                            Investissement personnel
                                        </label>
                                        <p className="text-xs text-gray-500 mb-2">Combien de temps êtes-vous prêt à consacrer à la mise en pratique des nouvelles compétences acquises une fois votre retour au poste de travail ?</p>
                                        <textarea
                                            name="personal_investment"
                                            rows={2}
                                            value={formData.personal_investment}
                                            onChange={handleChange}
                                            className="block w-full rounded-xl border-gray-200 bg-navy-50/30 focus:bg-white focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all py-3.5 px-4 leading-relaxed italic"
                                            placeholder="Ex: 2 heures par semaine..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Objectifs Pédagogiques</label>
                                        <textarea
                                            name="objectives"
                                            rows={4}
                                            value={formData.objectives}
                                            onChange={handleChange}
                                            className="block w-full rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all py-3.5 px-4 leading-relaxed"
                                            placeholder="Quels sont les objectifs visés ?"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Pré-requis</label>
                                        <textarea
                                            name="prerequisites"
                                            rows={3}
                                            value={formData.prerequisites}
                                            onChange={handleChange}
                                            className="block w-full rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all py-3.5 px-4 leading-relaxed"
                                            placeholder="Connaissances nécessaires..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Programme détaillé</label>
                                        <textarea
                                            name="description"
                                            rows={6}
                                            value={formData.description}
                                            onChange={handleChange}
                                            className="block w-full rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all py-3.5 px-4 leading-relaxed"
                                            placeholder="Détail du contenu..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Programme (Document PDF)</label>
                                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:bg-gray-50 transition-colors cursor-pointer relative">
                                            <div className="space-y-1 text-center">
                                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                                <div className="flex text-sm text-gray-600">
                                                    <label htmlFor="program-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-navy-600 hover:text-navy-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-navy-500">
                                                        <span>Télécharger le programme</span>
                                                        <input id="program-upload" name="program-upload" type="file" className="sr-only" onChange={(e) => setProgramFile(e.target.files[0])} accept=".pdf,.doc,.docx" />
                                                    </label>
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
                                    </div>
                                </div>
                            </div>

                            {/* Documents Card (Other docs) */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-navy-600" />
                                    Autres documents joints
                                </h3>

                                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 border-dashed">
                                    <div className="flex flex-col sm:flex-row items-end gap-4">
                                        <div className="w-full sm:w-1/3">
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Type</label>
                                            <select id="docType" className="block w-full rounded-lg border-gray-200 text-sm py-2.5">
                                                <option value="DEVIS">Devis</option>
                                                <option value="CONVENTION">Convention</option>
                                                <option value="AUTRE">Autre</option>
                                            </select>
                                        </div>
                                        <div className="flex-1 w-full">
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Fichier</label>
                                            <input type="file" id="fileInput" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-navy-100 file:text-navy-700 hover:file:bg-navy-200 transition-colors" />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const fileInput = document.getElementById('fileInput');
                                                const docType = document.getElementById('docType');
                                                const file = fileInput.files[0];
                                                if (!file) return alert('Veuillez sélectionner un fichier');
                                                setFiles(prev => [...prev, { file, type: docType.value, id: Date.now() }]);
                                                fileInput.value = '';
                                            }}
                                            className="px-6 py-2.5 bg-navy-600 text-white rounded-lg text-sm font-medium hover:bg-navy-700 shadow-sm transition-all"
                                        >
                                            Ajouter
                                        </button>
                                    </div>
                                </div>

                                {files.length > 0 && (
                                    <ul className="mt-4 space-y-3">
                                        {files.map((f) => (
                                            <li key={f.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-navy-50 rounded-lg">
                                                        <FileText className="h-5 w-5 text-navy-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{f.file.name}</p>
                                                        <p className="text-xs text-gray-500 font-medium">{f.type} • {(f.file.size / 1024).toFixed(0)} KB</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => setFiles(prev => prev.filter(item => item.id !== f.id))} className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors">
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Key Info */}
                        <div className="space-y-8">
                            {/* Planning Card */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-navy-600" />
                                    Planification
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Périodes de disponibilités</label>
                                        <textarea
                                            name="availability_period"
                                            value={formData.availability_period}
                                            onChange={handleChange}
                                            rows={3}
                                            className="block w-full rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all py-3 px-4 text-sm"
                                            placeholder="Ex: Entre le 15/03 et le 30/04, ou idéalement en juin..."
                                        />
                                        <p className="mt-1 text-[10px] text-gray-500 italic">Indiquez vos préférences ou contraintes de période.</p>
                                    </div>
                                    <div className="pt-4 border-t border-gray-100">
                                        <label className="block text-sm font-medium text-gray-700 mb-2 font-semibold">Durée estimée (jours)</label>
                                        <div className="relative">
                                            <Clock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                                            <input
                                                type="number"
                                                name="duration_days"
                                                step="0.5"
                                                value={formData.duration_days}
                                                onChange={handleChange}
                                                className="block w-full pl-12 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all py-3 px-4"
                                                placeholder="0.5"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Financials Card */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Euro className="h-5 w-5 text-navy-600" />
                                    Budget
                                </h3>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Coût total (€)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-3.5 text-gray-500 font-bold">€</span>
                                            <input
                                                type="number"
                                                name="cost"
                                                value={formData.cost}
                                                onChange={handleChange}
                                                className="block w-full pl-10 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all py-3 px-4 font-bold text-lg text-gray-900"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Financement</label>
                                        <select
                                            name="funding_type"
                                            value={formData.funding_type}
                                            onChange={handleChange}
                                            className="block w-full rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all py-3 px-4 text-sm"
                                        >
                                            <option value="COMPANY">Entreprise (100%)</option>
                                            <option value="CO_FUNDED">Co-financement</option>
                                            <option value="PERSONAL">Personnel (100%)</option>
                                        </select>
                                    </div>

                                    {formData.funding_type === 'CO_FUNDED' && (
                                        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 space-y-3">
                                            <div>
                                                <label className="block text-xs font-bold text-orange-800 uppercase mb-1">Part Entreprise</label>
                                                <input
                                                    type="number"
                                                    name="co_funding_company_amount"
                                                    value={formData.co_funding_company_amount}
                                                    onChange={handleChange}
                                                    className="block w-full rounded-lg border-orange-200 text-sm py-2"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-orange-800 uppercase mb-1">Part Personnel</label>
                                                <input
                                                    type="number"
                                                    name="co_funding_personal_amount"
                                                    value={formData.co_funding_personal_amount}
                                                    onChange={handleChange}
                                                    className="block w-full rounded-lg border-orange-200 text-sm py-2"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-4 pt-8 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={(e) => handleSubmit(e, 'DRAFT')}
                            disabled={loading}
                            className="px-6 py-3.5 border border-gray-300 rounded-xl text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-navy-500 transition-all shadow-sm"
                        >
                            Enregistrer brouillon
                        </button>
                        <button
                            type="submit"
                            onClick={(e) => handleSubmit(e, 'PENDING_MANAGER')}
                            disabled={loading}
                            className="px-8 py-3.5 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-navy-600 hover:bg-navy-700 focus:ring-2 focus:ring-offset-2 focus:ring-navy-500 transition-all hover:-translate-y-0.5"
                        >
                            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Soumettre la demande'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
