import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    CheckCircle,
    TrendingUp,
    Shield,
    Clock,
    ArrowRight,
    Menu,
    X,
    ChevronDown,
    Star,
    Check,
    Zap,
    Layout,
    Users,
    BarChart3,
    Lock,
    Wallet,
    ClipboardCheck,
    Calendar,
    FileText,
    LayoutDashboard,
    Video,
    Mail,
    Cloud,
    Database,
    Linkedin,
    MessageSquare,
    Globe
} from 'lucide-react';

// --- Custom Icons Definitions (Moved to top for safety) ---
const BriefcaseIcon = ({ className }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
)
const BuildingIcon = ({ className }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="22.01"></line><line x1="15" y1="22" x2="15" y2="22.01"></line><line x1="9" y1="18" x2="9" y2="18.01"></line><line x1="15" y1="18" x2="15" y2="18.01"></line><line x1="9" y1="14" x2="9" y2="14.01"></line><line x1="15" y1="14" x2="15" y2="14.01"></line><line x1="9" y1="10" x2="9" y2="10.01"></line><line x1="15" y1="10" x2="15" y2="10.01"></line><line x1="9" y1="6" x2="9" y2="6.01"></line><line x1="15" y1="6" x2="15" y2="6.01"></line></svg>
)
const GlobeIcon = ({ className }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
)
const BPFCheckIcon = ({ className }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
)

const LandingPage = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [collaboratorCount, setCollaboratorCount] = useState(50);
    const [isAnnual, setIsAnnual] = useState(false);

    // Pricing Logic
    const getPricePerUser = (count) => {
        if (count >= 200) return 3.00;
        if (count >= 50) return 4.00;
        return 5.00;
    };

    const basePrice = getPricePerUser(collaboratorCount);
    const finalPrice = isAnnual ? (basePrice * 0.8) : basePrice;
    const isCustom = collaboratorCount > 500;

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 overflow-x-hidden selection:bg-navy-200 selection:text-navy-900">

            {/* Animated Background Blobs (Fixed z-index) */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-navy-200/20 rounded-full blur-3xl animate-float"></div>
                <div className="absolute top-[40%] -right-[10%] w-[60vw] h-[60vw] bg-navy-200/20 rounded-full blur-3xl animate-pulse-slow"></div>
                <div className="absolute bottom-[0%] left-[20%] w-[50vw] h-[50vw] bg-teal-200/20 rounded-full blur-3xl" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Header / Nav */}
            <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'glassmorphism py-2' : 'bg-transparent py-4'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer group" onClick={() => window.scrollTo(0, 0)}>
                            <div className="bg-gradient-to-r from-navy-800 to-gold-600 p-2 rounded-xl shadow-lg transform group-hover:scale-105 transition-transform duration-200">
                                <TrendingUp className="h-6 w-6 text-white" />
                            </div>
                            <span className="font-bold text-2xl tracking-tight text-gray-900 group-hover:text-navy-600 transition-colors">SkillHub</span>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center space-x-8">
                            {['Fonctionnalités', 'Conformité', 'Tarifs'].map((item) => (
                                <a
                                    key={item}
                                    href={`#${item.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`}
                                    className="text-sm font-semibold text-gray-600 hover:text-navy-600 transition-colors relative group"
                                >
                                    {item}
                                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-navy-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                                </a>
                            ))}
                        </div>

                        {/* CTA Buttons */}
                        <div className="hidden md:flex items-center space-x-4">
                            <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-navy-600 transition-colors">
                                Se connecter
                            </Link>
                            <Link to="/login" className="bg-black hover:bg-gray-800 text-white px-5 py-2.5 rounded-full font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 hover:scale-105 active:scale-95 flex items-center gap-2">
                                Essai Gratuit <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex items-center">
                            <button onClick={toggleMobileMenu} className="text-gray-600 hover:text-gray-900 focus:outline-none p-2 rounded-lg hover:bg-gray-100 transition-colors">
                                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                <div className={`md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-2xl transition-all duration-300 ease-in-out origin-top ${isMobileMenuOpen ? 'opacity-100 scale-y-100 py-6' : 'opacity-0 scale-y-0 h-0 overflow-hidden'}`}>
                    <div className="flex flex-col space-y-4 px-6 text-center">
                        {['Fonctionnalités', 'Conformité', 'Tarifs'].map((item) => (
                            <a key={item} href={`#${item.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`} onClick={closeMobileMenu} className="text-lg font-medium text-gray-800 hover:text-navy-600 py-2">{item}</a>
                        ))}
                        <hr className="border-gray-100 my-2" />
                        <Link to="/login" onClick={closeMobileMenu} className="text-lg font-medium text-gray-600 hover:text-navy-600 py-2">Se connecter</Link>
                        <Link to="/login" onClick={closeMobileMenu} className="bg-navy-600 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-md mx-4">Commencer l'essai</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section (V3: Modern SaaS) */}
            <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden perspective-1000">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-4xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-navy-100 text-navy-700 text-xs font-bold mb-8 animate-fade-in-up shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-navy-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-navy-500"></span>
                            </span>
                            Nouvelles fonctionnalités disponibles
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-gray-900 mb-8 leading-[1.1] animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                            Pilotez vos formations <br />
                            <span className="text-gradient">comme une Tech Company.</span>
                        </h1>
                        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                            L'outil tout-en-un pour gérer les formations, suivre les compétences acquises et s'assurer de la conformité en temps réel.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                            <Link to="/login" className="group w-full sm:w-auto px-8 py-4 bg-gray-900 hover:bg-black text-white text-lg font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 ring-4 ring-gray-900/10">
                                Démarrer Gratuitement
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <a href="#features" className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 text-lg font-bold rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex items-center justify-center">
                                Voir la Démo (à venir )
                            </a>
                        </div>
                    </div>

                    {/* 3D Dashboard Mockup (V3: Abstract & Techy) */}
                    <div className="relative mt-12 mx-auto max-w-5xl animate-fade-in-up preserve-3d rotate-y-12 hover:rotate-0 transition-transform duration-1000 ease-out" style={{ animationDelay: '0.5s' }}>
                        <div className="absolute inset-0 bg-gradient-to-r from-navy-900 to-gold-600 rounded-3xl blur-2xl opacity-20 transform translate-y-8 scale-95"></div>
                        <div className="relative rounded-3xl bg-gray-900 p-2 shadow-2xl ring-1 ring-gray-800">
                            <div className="rounded-2xl overflow-hidden bg-gray-800 relative aspect-video border border-gray-700">
                                {/* Abstract UI Header */}
                                <div className="h-12 border-b border-gray-700 flex items-center px-4 space-x-2 bg-gray-800/50">
                                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                                    <div className="ml-4 text-xs font-mono text-gray-500">skillhub.app</div>
                                    <div className="flex-1"></div>
                                    <div className="h-2 w-20 bg-gray-600 rounded-full opacity-50"></div>
                                </div>
                                {/* Abstract UI Body */}
                                <div className="p-6 flex gap-6 h-full">
                                    {/* Sidebar */}
                                    <div className="w-48 hidden md:block space-y-4 pt-2">
                                        <div className="h-2 w-20 bg-gray-700 rounded mb-6"></div>
                                        <div className="flex items-center gap-3 text-navy-400 bg-navy-500/10 p-2 rounded-lg"><LayoutDashboard size={16} /><div className="h-2 w-24 bg-navy-400/50 rounded"></div></div>
                                        <div className="flex items-center gap-3 text-gray-500 p-2"><Calendar size={16} /><div className="h-2 w-20 bg-gray-700 rounded"></div></div>
                                        <div className="flex items-center gap-3 text-gray-500 p-2"><Wallet size={16} /><div className="h-2 w-16 bg-gray-700 rounded"></div></div>
                                    </div>
                                    {/* Content */}
                                    <div className="flex-1 space-y-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="h-4 w-48 bg-gray-600 rounded"></div>
                                            <div className="h-8 w-24 bg-navy-600 rounded-lg"></div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="flex-1 h-32 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl p-4 border border-gray-600/50 relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 p-4 bg-green-500/10 rounded-bl-2xl text-green-400 font-mono text-xs">+127%</div>
                                                <div className="text-gray-400 text-xs mb-2">ENGAGEMENT</div>
                                                <div className="text-white text-2xl font-bold">High</div>
                                                <div className="h-1 w-full bg-gray-700 mt-4 rounded-full overflow-hidden"><div className="h-full w-2/3 bg-green-500"></div></div>
                                            </div>
                                            <div className="flex-1 h-32 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl p-4 border border-gray-600/50">
                                                <div className="text-gray-400 text-xs mb-2">BUDGET</div>
                                                <div className="text-white text-2xl font-bold">Optimisé</div>
                                                <div className="flex -space-x-2 mt-4">
                                                    {[1, 2, 3].map(i => <div key={i} className="h-6 w-6 rounded-full bg-gray-500 border border-gray-800"></div>)}
                                                </div>
                                            </div>
                                            <div className="flex-1 h-32 bg-gray-800/50 rounded-xl p-4 border border-gray-700 border-dashed flex items-center justify-center text-gray-600 gap-2">
                                                <BPFCheckIcon className="w-4 h-4" /> Ready
                                            </div>
                                        </div>
                                        <div className="h-64 bg-gray-700/30 rounded-xl border border-gray-600/30 flex items-end p-4 gap-2">
                                            {/* Fake Chart */}
                                            {[40, 60, 45, 80, 55, 70, 90, 65, 85, 95].map((h, i) => (
                                                <div key={i} className="flex-1 bg-navy-500/80 rounded-t-sm hover:bg-navy-400 transition-colors cursor-pointer relative group" style={{ height: `${h}%` }}></div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Infinite Marquee Section - Ecosystem */}
            <div className="py-16 bg-white border-y border-gray-100 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
                    <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 uppercase tracking-tight mb-2">
                        Intégré à votre Écosystème
                    </h3>
                    <p className="text-gray-500 text-lg">Connectez SkillHub à vos outils du quotidien.</p>
                </div>
                <div className="relative">
                    <div className="flex space-x-16 animate-marquee whitespace-nowrap items-center">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="flex space-x-20 opacity-70 grayscale hover:grayscale-0 transition-all duration-500 items-center">
                                {/* Google */}
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-navy-50 rounded-lg text-navy-600"><Globe className="w-8 h-8" /></div>
                                    <span className="text-2xl font-bold text-gray-800">Google Workspace</span>
                                </div>
                                {/* Teams */}
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-navy-50 rounded-lg text-navy-600"><Users className="w-8 h-8" /></div>
                                    <span className="text-2xl font-bold text-gray-800">Microsoft Teams</span>
                                </div>
                                {/* Slack */}
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-navy-50 rounded-lg text-navy-600"><MessageSquare className="w-8 h-8" /></div>
                                    <span className="text-2xl font-bold text-gray-800">Slack</span>
                                </div>
                                {/* Workday */}
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-50 rounded-lg text-orange-600"><Wallet className="w-8 h-8" /></div>
                                    <span className="text-2xl font-bold text-gray-800">Workday</span>
                                </div>
                                {/* Zoom */}
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-navy-50 rounded-lg text-navy-500"><Video className="w-8 h-8" /></div>
                                    <span className="text-2xl font-bold text-gray-800">Zoom</span>
                                </div>
                                {/* Outlook */}
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-sky-50 rounded-lg text-sky-600"><Mail className="w-8 h-8" /></div>
                                    <span className="text-2xl font-bold text-gray-800">Outlook</span>
                                </div>
                                {/* Salesforce */}
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-navy-50 rounded-lg text-navy-400"><Cloud className="w-8 h-8" /></div>
                                    <span className="text-2xl font-bold text-gray-800">Salesforce</span>
                                </div>
                                {/* SAP */}
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-cyan-50 rounded-lg text-cyan-700"><Database className="w-8 h-8" /></div>
                                    <span className="text-2xl font-bold text-gray-800">SAP</span>
                                </div>
                                {/* LinkedIn */}
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-navy-50 rounded-lg text-navy-700"><Linkedin className="w-8 h-8" /></div>
                                    <span className="text-2xl font-bold text-gray-800">LinkedIn</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Feature Bento Grid (V3: Modern Features) */}
            <section id="fonctionnalites" className="py-32 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
                            Tout ce dont vous avez besoin. <br />
                            <span className="text-navy-600">Au même endroit.</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-8 h-auto md:h-[800px]">

                        {/* Big Card: Campaigns */}
                        <div className="md:col-span-2 bg-white rounded-3xl p-10 shadow-lg border border-gray-100 relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                            <div className="absolute top-10 right-[-50px] md:right-[-20px] w-[90%] md:w-[60%] shadow-2xl rounded-xl overflow-hidden border border-gray-200 group-hover:scale-105 transition-transform duration-500 hidden md:block rotate-[-2deg] group-hover:rotate-0">
                                <img src="/campaign-modal.png" alt="Interface de création de campagne" className="w-full h-auto object-cover opacity-90 group-hover:opacity-100" />
                            </div>
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-navy-100 rounded-xl flex items-center justify-center text-navy-600 mb-6">
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Campagnes Intelligentes</h3>
                                <p className="text-base text-gray-500 max-w-sm mb-8 leading-relaxed">
                                    Automatisez le recueil des besoins.<br />
                                    Simplifiez la vie de vos collaborateurs et
                                    <p>managers avec des workflows fluides.
                                    </p>
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 max-w-lg relative z-20">
                                    <div className="flex-1 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                        <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                            <Zap className="w-4 h-4 text-amber-500" /> Workflows
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">100% Automatisés</div>
                                    </div>
                                    <div className="flex-1 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                        <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                            <Users className="w-4 h-4 text-navy-500" /> Collaboratif
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">Informations en temps réel</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tall Card: Skill Wallet */}
                        <div className="md:row-span-2 bg-gradient-to-b from-gray-900 to-black rounded-3xl p-10 shadow-lg border border-gray-800 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
                            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-navy-600 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                            <div className="relative z-10 h-full flex flex-col">
                                <div className="w-12 h-12 bg-navy-500/20 rounded-xl flex items-center justify-center text-navy-400 mb-6">
                                    <Wallet className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">Le Wallet Compétences</h3>
                                <p className="text-lg text-gray-400 mb-8">
                                    Donnez à vos talents les moyens de grandir. Un passeport digital qui trace chaque acquis.
                                </p>
                                {/* Mini Wallet UI */}
                                <div className="mt-auto bg-gray-800/80 rounded-2xl p-4 border border-gray-700/50 backdrop-blur-sm">
                                    <div className="flex items-center gap-3 mb-4 border-b border-gray-700 pb-4">
                                        <div className="h-8 w-8 rounded-full bg-navy-500 flex items-center justify-center text-xs text-white font-bold">JD</div>
                                        <div className="text-white text-sm font-bold">Julie Dupont</div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs text-gray-300">
                                            <span>Leadership</span>
                                            <span className="text-green-400">Mastered</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-300">
                                            <span>Communication</span>
                                            <span className="text-green-400">Advanced</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Small Card 1: Analytics */}
                        {/* Small Card 1: Impact & ROI */}
                        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 group hover:border-teal-200 transition-all duration-300 hover:shadow-xl relative overflow-hidden flex flex-col justify-between">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>

                            <div className="relative z-10 mb-6">
                                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600 mb-6 group-hover:rotate-6 transition-transform">
                                    <BarChart3 className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Impact et ROI</h3>
                                <p className="text-gray-500 text-sm">
                                    Passez de la théorie à la pratique.
                                    Mesurez le transfert des acquis en situation réelle.
                                </p>
                            </div>

                            {/* Visual Element (Mini Mockup) */}
                            <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4 shadow-sm relative z-10">
                                <div className="flex justify-between items-end mb-2">
                                    <div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Score d'Impact</div>
                                        <div className="text-3xl font-black text-gray-900 leading-none">87<span className="text-lg text-gray-400 font-medium">/100</span></div>
                                    </div>
                                    <div className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3" /> +12%
                                    </div>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                                    <div className="bg-gradient-to-r from-teal-400 to-teal-600 h-2 rounded-full" style={{ width: '87%' }}></div>
                                </div>
                                <div className="flex justify-between text-[10px] text-gray-500 font-medium">
                                    <span>Bilan à chaud</span>
                                    <span>Bilan à froid</span>
                                    <span className="text-teal-600 font-bold">ROI Business</span>
                                </div>
                            </div>
                        </div>

                        {/* Small Card 2: Legal */}
                        {/* Small Card 2: Legal & Compliance */}
                        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 group hover:border-rose-200 transition-all duration-300 hover:shadow-xl relative overflow-hidden flex flex-col justify-between">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>

                            <div className="relative z-10 mb-6">
                                <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600 mb-6 group-hover:rotate-6 transition-transform">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">100% Conforme</h3>
                                <p className="text-gray-500 text-sm">
                                    Pilotage réglementaire automatisé. <br />
                                    Tracez vos actions et suivez vos obligations légales en temps réel.
                                </p>
                            </div>

                            {/* Visual Element (Mini Mockup) */}
                            <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4 shadow-sm relative z-10 space-y-3">
                                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Obligations Légales</span>
                                    <div className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <Check className="w-3 h-3" /> A jour
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center text-white"><Check size={10} strokeWidth={4} /></div>
                                            <span className="text-xs font-medium text-gray-600">Entretiens Pro.</span>
                                        </div>
                                        <span className="text-[10px] text-gray-400">100%</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center text-white"><Check size={10} strokeWidth={4} /></div>
                                            <span className="text-xs font-medium text-gray-600">Budget</span>
                                        </div>
                                        <span className="text-[10px] text-gray-400">Validé</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center text-white"><Check size={10} strokeWidth={4} /></div>
                                            <span className="text-xs font-medium text-gray-600">Habilitations à renouveler</span>
                                        </div>
                                        <span className="text-[10px] text-gray-400">OK</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* NEW: Key Features Grid (Requested) */}
            <section className="py-24 bg-white border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <div className="text-navy-600 font-bold tracking-wide uppercase text-sm mb-2">Fonctionnalités</div>
                        <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Fonctionnalités clés</h2>
                        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                            SkillHub combine intelligence artificielle, design éprouvé et suivi rigoureux pour vous aider à exceller.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-300 group">
                            <div className="w-12 h-12 bg-navy-50 rounded-xl flex items-center justify-center text-navy-600 mb-6 group-hover:scale-110 transition-transform">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Pilotage IA et Expert</h3>
                            <p className="text-gray-500 leading-relaxed">
                                Tableaux de bord RH dynamiques, suivi budgétaire en temps réel et alertes prédictives pour anticiper les écarts.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-300 group">
                            <div className="w-12 h-12 bg-navy-50 rounded-xl flex items-center justify-center text-navy-600 mb-6 group-hover:scale-110 transition-transform">
                                <Layout className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Catalogue Unifié</h3>
                            <p className="text-gray-500 leading-relaxed">
                                Centralisez vos formations internes et externes. Synchronisation automatique avec les organismes de formation.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-300 group">
                            <div className="w-12 h-12 bg-navy-50 rounded-xl flex items-center justify-center text-navy-600 mb-6 group-hover:scale-110 transition-transform">
                                <FileText className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Import Intelligent</h3>
                            <p className="text-gray-500 leading-relaxed">
                                Téleversez vos données collaborateurs facilement. Détection automatique des champs sans effort.
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-300 group">
                            <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 mb-6 group-hover:scale-110 transition-transform">
                                <Zap className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Super-Workflow</h3>
                            <p className="text-gray-500 leading-relaxed">
                                Validez les demandes en un éclair. Notifications par mail et rappels automatiques pour les managers.
                            </p>
                        </div>

                        {/* Feature 5 */}
                        <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-300 group">
                            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 mb-6 group-hover:scale-110 transition-transform">
                                <Wallet className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Skill Wallet</h3>
                            <p className="text-gray-500 leading-relaxed">
                                Passeport de compétences digital pour chaque collaborateur. Valorisez les acquis et boostez l'engagement.
                            </p>
                        </div>

                        {/* Feature 6 */}
                        <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-300 group">
                            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 mb-6 group-hover:scale-110 transition-transform">
                                <Shield className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Sécurité et Conformité</h3>
                            <p className="text-gray-500 leading-relaxed">
                                Vos données sont chiffrées et vos obligations légales respectées à la lettre.
                            </p>
                        </div>
                    </div>
                </div>
            </section>



            {/* Testimonials Section */}
            <section className="py-24 bg-gray-50 border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <div className="text-navy-600 font-bold tracking-wide uppercase text-sm mb-2">Témoignages</div>
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
                            Approuvé par des équipes performantes
                        </h2>
                        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                            Découvrez comment SkillHub transforme le quotidien de chaque acteur de la formation.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* RH Quote */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow">
                            <div className="flex-1">
                                <p className="text-gray-600 italic leading-relaxed mb-6">
                                    "Je ne perds plus de temps à courir après les infos. Tout est centralisé : demandes, budget, relances... Je peux enfin me concentrer sur la stratégie RH plutôt que sur l'administratif."
                                </p>
                            </div>
                            <div className="flex items-center gap-4 mt-auto border-t border-gray-50 pt-4">
                                <div className="h-10 w-10 rounded-full bg-navy-100 flex items-center justify-center text-navy-600 font-bold text-sm">SD</div>
                                <div>
                                    <div className="font-bold text-gray-900 text-sm">Sophie Dubois</div>
                                    <div className="text-xs text-gray-500">DRH, TechCorp</div>
                                </div>
                            </div>
                        </div>

                        {/* Manager Quote */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow">
                            <div className="flex-1">
                                <p className="text-gray-600 italic leading-relaxed mb-6">
                                    "J'ai une visibilité complète sur le budget de mon équipe et leur évolution. Je sais exactement qui développe quelle compétence et comment cela impacte nos projets. C'est du pilotage 2.0."
                                </p>
                            </div>
                            <div className="flex items-center gap-4 mt-auto border-t border-gray-50 pt-4">
                                <div className="h-10 w-10 rounded-full bg-navy-100 flex items-center justify-center text-navy-600 font-bold text-sm">TM</div>
                                <div>
                                    <div className="font-bold text-gray-900 text-sm">Thomas Martin</div>
                                    <div className="text-xs text-gray-500">Manager IT</div>
                                </div>
                            </div>
                        </div>

                        {/* Collaborator Quote */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow">
                            <div className="flex-1">
                                <p className="text-gray-600 italic leading-relaxed mb-6">
                                    "Faire une demande est super simple. Mais ce que je préfère, c'est le Skill Wallet : voir mes compétences validées et mon évolution noir sur blanc, c'est hyper motivant !"
                                </p>
                            </div>
                            <div className="flex items-center gap-4 mt-auto border-t border-gray-50 pt-4">
                                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-sm">LR</div>
                                <div>
                                    <div className="font-bold text-gray-900 text-sm">Léa Roux</div>
                                    <div className="text-xs text-gray-500">Product Designer</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section (V3: Growth) */}
            <section id="tarifs" className="py-32 bg-white relative">
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-gray-50 to-white skew-y-3 origin-top-left -z-10"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-extrabold text-gray-900">
                            Simple et Transparent.
                        </h2>
                        <p className="mt-4 text-xl text-gray-600">
                            Commencez gratuitement, scalez quand vous voulez.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Starter */}
                        <div className="bg-white p-8 rounded-3xl border-2 border-gray-100 hover:border-navy-100 transition-all duration-300 flex flex-col items-start cursor-default">
                            <div className="inline-block px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-600 mb-6 font-mono uppercase">Starter</div>
                            <h3 className="text-3xl font-extrabold text-gray-900 mb-2">Gratuit</h3>
                            <div className="text-5xl font-black text-gray-900 mb-6">0€/mois</div>
                            <p className="text-gray-500 mb-8 border-b border-gray-100 pb-8 w-full">Offrez à votre équipe une expérience formation moderne.</p>
                            <ul className="space-y-4 mb-8 w-full">
                                {['Jusqu\'à 20 collaborateurs', 'Accès complet au workflow', 'Historique centralisé', 'Support par email (SLA 72h)',].map(f => (
                                    <li key={f} className="flex items-center text-gray-600 font-medium">
                                        <Check className="w-5 h-5 text-gray-400 mr-3" /> {f}
                                    </li>
                                ))}
                                {['Pilotage budgétaire', 'Support Chat'].map(f => (
                                    <li key={f} className="flex items-center text-gray-400 font-medium">
                                        <X className="w-5 h-5 text-gray-300 mr-3" /> {f}
                                    </li>
                                ))}
                            </ul>
                            <Link to="/login" className="mt-auto w-full py-4 rounded-xl font-bold text-center border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-colors">
                                Commencer gratuitement
                            </Link>
                        </div>

                        {/* Growth (Featured) */}
                        <div className="bg-gray-900 p-8 rounded-3xl shadow-2xl scale-105 relative flex flex-col items-start overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-navy-500 to-gold-500"></div>
                            <div className="inline-block px-3 py-1 bg-gold-500 rounded-full text-xs font-bold text-white mb-6 font-mono uppercase">Populaire</div>
                            <h3 className="text-3xl font-extrabold text-white mb-2">Growth</h3>

                            {/* Interactive Pricing Controls */}
                            <div className="w-full mb-6 pt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-300">Collaborateurs</span>
                                    <span className="text-sm font-bold text-white bg-navy-600 px-2 py-0.5 rounded">{collaboratorCount}</span>
                                </div>
                                <input
                                    type="range"
                                    min="20"
                                    max="500"
                                    step="5"
                                    value={collaboratorCount}
                                    onChange={(e) => setCollaboratorCount(parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-navy-500 hover:accent-navy-400"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1 font-mono">
                                    <span>20</span>
                                    <span>500</span>
                                </div>

                                <div className="flex items-center justify-center mt-6 gap-3">
                                    <span className={`text-sm ${!isAnnual ? 'text-white font-bold' : 'text-gray-400'}`}>Mensuel</span>
                                    <button
                                        onClick={() => setIsAnnual(!isAnnual)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isAnnual ? 'bg-green-500' : 'bg-gray-600'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAnnual ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                    <span className={`text-sm ${isAnnual ? 'text-white font-bold' : 'text-gray-400'}`}>Annuel <span className="text-green-400 text-xs font-bold">(-20%)</span></span>
                                </div>
                            </div>

                            <div className="flex items-baseline mb-6">
                                <span className="text-5xl font-black text-white">{finalPrice.toFixed(2).replace('.', ',')}€</span>
                                <span className="text-gray-400 ml-2 font-medium">/mois/collab</span>
                            </div>
                            <p className="text-gray-400 mb-8 border-b border-gray-800 pb-8 w-full">Profitez de toutes les fonctionnalités ✨​</p>
                            <ul className="space-y-4 mb-8 w-full">
                                {['Tout de l\'offre "Starter"', 'Automatisations avancées', 'Pilotage budgétaire', 'Ajout de fonctionnalités à la demande', 'Support Chat prioritaire (<4h)'].map(f => (
                                    <li key={f} className="flex items-center text-gray-300 font-medium">
                                        <Check className="w-5 h-5 text-navy-500 mr-3" /> {f}
                                    </li>
                                ))}
                            </ul>
                            <Link to="/login" className="mt-auto w-full py-4 rounded-xl font-bold text-center bg-navy-600 hover:bg-navy-500 text-white shadow-lg shadow-navy-900/50 transition-colors">
                                Essai 14 Jours Offert
                            </Link>
                        </div>

                        {/* Enterprise */}
                        <div className="bg-white p-8 rounded-3xl border-2 border-gray-100 hover:border-navy-100 transition-all duration-300 flex flex-col items-start cursor-default">
                            <div className="inline-block px-3 py-1 bg-navy-100 rounded-full text-xs font-bold text-navy-600 mb-6 font-mono uppercase">Enterprise</div>
                            <h3 className="text-3xl font-extrabold text-gray-900 mb-2">Custom</h3>
                            <div className="text-5xl font-black text-gray-900 mb-6">Sur mesure</div>
                            <p className="text-gray-500 mb-8 border-b border-gray-100 pb-8 w-full">Une infrastructure et un accompagnement dédiés.</p>
                            <ul className="space-y-4 mb-8 w-full">
                                {['SSO & sécurité avancée', 'Audit de conformité', 'Gestion multi-entités', 'API & intégrations SIRH', 'SLA "Business hours" (Disponible sur demande)"'].map(f => (
                                    <li key={f} className="flex items-center text-gray-600 font-medium">
                                        <Check className="w-5 h-5 text-gray-400 mr-3" /> {f}
                                    </li>
                                ))}
                            </ul>
                            <button className="mt-auto w-full py-4 rounded-xl font-bold text-center border-2 border-gray-200 text-gray-600 hover:border-gray-900 hover:text-gray-900 transition-colors">
                                Contacter l'équipe
                            </button>
                        </div>
                    </div>
                </div>
            </section>


            {/* CTA Section */}
            <section className="py-32 bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-5xl font-extrabold text-gray-900 mb-8 tracking-tight">
                        Prêt à moderniser la gestion de vos formations ?
                    </h2>
                    <p className="text-xl text-gray-500 mb-12 max-w-2xl mx-auto">
                        Rejoignez les entreprises qui ont repris le contrôle de leurs formations.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link to="/login" className="px-12 py-5 bg-navy-600 hover:bg-navy-700 text-white text-xl font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
                            Commencer Maintenant
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-gray-500 text-sm">
                            &copy; 2025 SkillHub. Tous droits réservés.
                        </div>
                        <div className="flex gap-6 text-sm text-gray-500">
                            <a href="#" className="hover:text-navy-600 transition-colors">Contact</a>
                            <a href="#" className="hover:text-navy-600 transition-colors">Mentions légales</a>
                            <a href="#" className="hover:text-navy-600 transition-colors">Confidentialité & Cookies</a>
                            <a href="#" className="hover:text-navy-600 transition-colors">Conditions d'utilisation</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
