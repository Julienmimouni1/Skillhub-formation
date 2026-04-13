import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
    Loader2, ArrowLeft, ArrowRight, Save, Send, Search, 
    BookOpen, Globe, FileText, Calendar, Euro, Clock, 
    Upload, Trash2, CheckCircle2, AlertCircle, Building, TrendingUp
} from 'lucide-react';
import clsx from 'clsx';
import StatusBadge from '../components/common/StatusBadge';

const STEPS = [
    { id: 1, title: 'La Formation', icon: Search },
    { id: 2, title: 'Objectifs', icon: FileText },
    { id: 3, title: 'Logistique', icon: Calendar },
    { id: 4, title: 'Finalisation', icon: CheckCircle2 },
];

export default function WizardRequestForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const campaignId = searchParams.get('campaign_id');
    const isEditMode = !!id;

    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [providers, setProviders] = useState([]);
    const [files, setFiles] = useState([]);
    const [campaign, setCampaign] = useState(null);
    const [programFile, setProgramFile] = useState(null);
    
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

    const [requestType, setRequestType] = useState(location.state?.type || 'EXTERNAL');
    const [internalCourses, setInternalCourses] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Initial Data Fetching
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [providersRes, internalRes] = await Promise.all([
                    axios.get('/providers'),
                    axios.get('/catalog?type=internal&limit=100')
                ]);
                setProviders(providersRes.data.providers);
                setInternalCourses(internalRes.data.data);
            } catch (error) { console.error(error); }
        };
        fetchData();

        if (campaignId) {
            axios.get(`/campaigns/${campaignId}`).then(res => setCampaign(res.data)).catch(console.error);
        }

        if (isEditMode) {
            axios.get(`/requests/${id}`).then(res => {
                const req = res.data.request;
                setFormData({
                    ...req,
                    start_date: req.start_date?.split('T')[0] || '',
                    end_date: req.end_date?.split('T')[0] || '',
                });
            }).catch(console.error);
        }
    }, [id, isEditMode, campaignId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSearch = async (query) => {
        if (query.length < 2) { setSearchResults([]); return; }
        setIsSearching(true);
        try {
            const { data } = await axios.get(`/catalog/search?q=${encodeURIComponent(query)}`);
            setSearchResults(data.results);
        } catch (error) { console.error(error); } finally { setIsSearching(false); }
    };

    const selectCatalogItem = (item) => {
        const provider = providers.find(p => p.name.toLowerCase().includes(item.provider?.toLowerCase()));
        setFormData(prev => ({
            ...prev,
            title: item.title,
            description: item.description || '',
            objectives: item.objective || '',
            prerequisites: item.prerequisites || '',
            cost: item.cost,
            duration_days: item.duration_days,
            provider_id: provider ? provider.id : ''
        }));
        setSearchResults([]);
    };

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = async (status = 'PENDING_MANAGER') => {
        setLoading(true);
        try {
            const payload = { ...formData, status };
            let requestId = id;
            
            if (isEditMode) {
                await axios.put(`/requests/${id}`, payload);
            } else {
                const { data } = await axios.post('/requests', payload);
                requestId = data.request.id;
            }

            // Handle Files (omitted for brevity in initial draft, same as original)
            
            navigate('/dashboard');
        } catch (error) {
            alert('Erreur lors de la soumission');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-10 text-center">
                <h1 className="text-3xl font-serif font-bold text-navy-900">
                    {isEditMode ? 'Modifier ma demande' : 'Ma Demande de Formation'}
                </h1>
                <p className="text-navy-500 mt-2">Suivez les étapes pour construire votre projet.</p>
            </div>

            {/* Step Indicator */}
            <div className="mb-12 relative">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2 z-0"></div>
                <div className="flex justify-between relative z-10">
                    {STEPS.map((step) => {
                        const Icon = step.icon;
                        const isCompleted = currentStep > step.id;
                        const isActive = currentStep === step.id;
                        return (
                            <div key={step.id} className="flex flex-col items-center">
                                <div className={clsx(
                                    "w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300",
                                    isCompleted ? "bg-gold-500 border-gold-200 text-white" :
                                    isActive ? "bg-white border-gold-500 text-gold-600 scale-110 shadow-lg" :
                                    "bg-white border-gray-200 text-gray-400"
                                )}>
                                    {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                                </div>
                                <span className={clsx(
                                    "mt-2 text-xs font-bold uppercase tracking-wider",
                                    isActive ? "text-navy-900" : "text-gray-400"
                                )}>
                                    {step.title}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Form Content */}
            <div className="bg-white rounded-2xl shadow-xl shadow-navy-900/5 border border-gold-100 overflow-hidden min-h-[500px] flex flex-col">
                <div className="p-8 flex-1">
                    
                    {/* STEP 1: CHOICE */}
                    {currentStep === 1 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex justify-center gap-4">
                                <button type="button" onClick={() => setRequestType('INTERNAL')} className={clsx("flex-1 py-4 px-6 rounded-xl border-2 flex items-center justify-center gap-3 transition-all", requestType === 'INTERNAL' ? "bg-navy-50 border-navy-900 text-navy-900" : "bg-white border-gray-100 text-gray-400 hover:border-gray-200")}>
                                    <BookOpen className="h-6 w-6" /> <span className="font-bold">Catalogue Interne</span>
                                </button>
                                <button type="button" onClick={() => setRequestType('EXTERNAL')} className={clsx("flex-1 py-4 px-6 rounded-xl border-2 flex items-center justify-center gap-3 transition-all", requestType === 'EXTERNAL' ? "bg-navy-50 border-navy-900 text-navy-900" : "bg-white border-gray-100 text-gray-400 hover:border-gray-200")}>
                                    <Globe className="h-6 w-6" /> <span className="font-bold">Catalogue Externe</span>
                                </button>
                            </div>

                            <div className="space-y-6">
                                {requestType === 'INTERNAL' ? (
                                    <div>
                                        <label className="block text-sm font-bold text-navy-900 mb-2">Choisir une formation</label>
                                        <select onChange={(e) => {
                                            const course = internalCourses.find(c => c.id === parseInt(e.target.value));
                                            if (course) selectCatalogItem(course);
                                        }} className="w-full p-4 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-gold-500 font-medium">
                                            <option value="">Sélectionner...</option>
                                            {internalCourses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                        </select>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <label className="block text-sm font-bold text-navy-900 mb-2">Rechercher une formation externe</label>
                                        <div className="relative">
                                            <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                                            <input type="text" onChange={(e) => handleSearch(e.target.value)} placeholder="React, Management, Anglais..." className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold-500 shadow-sm" />
                                        </div>
                                        {searchResults.length > 0 && (
                                            <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-60 overflow-y-auto">
                                                {searchResults.map(res => (
                                                    <div key={res.id} onClick={() => selectCatalogItem(res)} className="p-4 hover:bg-gold-50 cursor-pointer border-b border-gray-50 flex justify-between items-center">
                                                        <span className="font-medium text-navy-900">{res.title}</span>
                                                        <span className="text-xs font-bold text-gold-600 bg-gold-50 px-2 py-1 rounded">{res.cost} €</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-bold text-navy-900 mb-2">Intitulé final</label>
                                    <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full p-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold-500 font-bold text-navy-900 shadow-sm" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: OBJECTIVES */}
                    {currentStep === 2 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div>
                                <label className="block text-sm font-bold text-navy-900 mb-2">Quels sont vos objectifs ?</label>
                                <textarea name="objectives" rows={4} value={formData.objectives} onChange={handleChange} className="w-full p-4 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold-500 shadow-sm" placeholder="Décrivez ce que vous souhaitez apprendre..." />
                            </div>
                            <div className="p-6 bg-gold-50/50 rounded-2xl border border-gold-100">
                                <label className="block text-sm font-bold text-gold-800 mb-2 flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    Investissement Personnel
                                </label>
                                <p className="text-xs text-gold-600 mb-4">Combien de temps allez-vous consacrer à la mise en pratique réelle ? (Indispensable pour le ROI).</p>
                                <textarea name="personal_investment" rows={3} value={formData.personal_investment} onChange={handleChange} className="w-full p-4 bg-white border-gold-200 rounded-xl focus:ring-2 focus:ring-gold-500 italic" placeholder="Ex: 2 heures par semaine pour appliquer les méthodes de management..." />
                            </div>
                        </div>
                    )}

                    {/* STEP 3: LOGISTICS */}
                    {currentStep === 3 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-navy-900 mb-2 flex items-center gap-2">
                                        <Clock className="h-4 w-4" /> Durée estimée (jours)
                                    </label>
                                    <input type="number" name="duration_days" value={formData.duration_days} onChange={handleChange} className="w-full p-4 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold-500 shadow-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-navy-900 mb-2 flex items-center gap-2">
                                        <Euro className="h-4 w-4" /> Coût estimé (€)
                                    </label>
                                    <input type="number" name="cost" value={formData.cost} onChange={handleChange} className="w-full p-4 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold-500 font-bold shadow-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-navy-900 mb-2 flex items-center gap-2">
                                    <Calendar className="h-4 w-4" /> Période de disponibilité souhaitée
                                </label>
                                <textarea name="availability_period" rows={3} value={formData.availability_period} onChange={handleChange} className="w-full p-4 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold-500 shadow-sm" placeholder="Ex: Idéalement en juin, ou entre septembre et octobre..." />
                            </div>
                        </div>
                    )}

                    {/* STEP 4: REVIEW */}
                    {currentStep === 4 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="p-6 bg-navy-50 rounded-2xl border border-navy-100">
                                <h3 className="font-serif font-bold text-navy-900 mb-4 flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                    Récapitulatif de votre projet
                                </h3>
                                <div className="space-y-4 text-sm">
                                    <div className="flex justify-between border-b border-navy-100 pb-2">
                                        <span className="text-navy-500">Formation</span>
                                        <span className="font-bold text-navy-900">{formData.title}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-navy-100 pb-2">
                                        <span className="text-navy-500">Coût</span>
                                        <span className="font-bold text-navy-900">{formData.cost} €</span>
                                    </div>
                                    <div className="flex justify-between border-b border-navy-100 pb-2">
                                        <span className="text-navy-500">Durée</span>
                                        <span className="font-bold text-navy-900">{formData.duration_days} jours</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-white border-2 border-dashed border-gray-200 rounded-2xl text-center hover:bg-gray-50 transition-colors cursor-pointer group">
                                <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                                <p className="text-sm font-bold text-navy-900">Ajouter des pièces jointes (Devis, Programme...)</p>
                                <p className="text-xs text-gray-500 mt-1">Cliquez ou glissez vos fichiers ici.</p>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer Actions */}
                <div className="p-8 bg-gray-50 border-t border-gold-100 flex justify-between items-center">
                    <button type="button" onClick={prevStep} disabled={currentStep === 1} className={clsx("flex items-center gap-2 px-6 py-3 font-bold transition-all", currentStep === 1 ? "opacity-0 pointer-events-none" : "text-navy-600 hover:text-navy-900")}>
                        <ArrowLeft className="h-5 w-5" /> Précédent
                    </button>

                    <div className="flex gap-4">
                        <button type="button" onClick={() => handleSubmit('DRAFT')} className="px-6 py-3 text-sm font-bold text-navy-400 hover:text-navy-600">
                            Enregistrer brouillon
                        </button>
                        {currentStep < STEPS.length ? (
                            <button type="button" onClick={nextStep} className="bg-navy-900 text-white px-10 py-4 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-navy-900/20 hover:bg-black transition-all hover:-translate-y-0.5">
                                Suivant <ArrowRight className="h-5 w-5 text-gold-400" />
                            </button>
                        ) : (
                            <button type="button" onClick={() => handleSubmit('PENDING_MANAGER')} className="bg-gold-500 text-white px-10 py-4 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-gold-500/20 hover:bg-gold-600 transition-all hover:-translate-y-0.5">
                                Soumettre <Send className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
