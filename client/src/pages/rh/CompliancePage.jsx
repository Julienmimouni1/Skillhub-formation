import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShieldCheck,
    Briefcase,
    Calendar,
    History,
    ChevronRight,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import clsx from 'clsx';

export default function CompliancePage() {
    const navigate = useNavigate();

    const modules = [
        {
            title: 'Entretiens Professionnels',
            description: 'Suivi obligatoire tous les 2 ans pour accompagner l\'évolution des compétences.',
            icon: Briefcase,
            path: '/rh/compliance/professional',
            color: 'navy',
            stats: '3 Retards',
            status: 'warning'
        },
        {
            title: 'Entretiens Annuels',
            description: 'Évaluation de la performance et fixation des objectifs de l\'année.',
            icon: Calendar,
            path: '/rh/compliance/annual',
            color: 'navy',
            stats: '12 À planifier',
            status: 'info'
        },
        {
            title: 'Bilan à 6 ans',
            description: 'Contrôle légal du parcours : 3 entretiens + 1 formation non-obligatoire.',
            icon: History,
            path: '/rh/compliance/6-year-bilan',
            color: 'navy',
            stats: 'À jour',
            status: 'success'
        },
        {
            title: 'Habilitations & Sécurité',
            description: 'Gestion des permis, habilitations électriques et certifications obligatoires.',
            icon: ShieldCheck,
            path: '/rh/compliance/authorizations',
            color: 'amber',
            stats: '2 Échéances',
            status: 'danger'
        }
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-navy-600 rounded-2xl text-white shadow-lg shadow-navy-200">
                        <ShieldCheck className="h-8 w-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Conformité & Entretiens</h1>
                        <p className="text-gray-500 font-medium">Pilotage des obligations légales et du développement des collaborateurs</p>
                    </div>
                </div>
            </div>

            {/* Grid of Modules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {modules.map((module) => (
                    <button
                        key={module.path}
                        onClick={() => navigate(module.path)}
                        className="group relative bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-navy-100 transition-all duration-300 text-left"
                    >
                        <div className="flex items-start justify-between mb-6">
                            <div className={clsx(
                                "p-4 rounded-2xl shadow-sm transition-transform group-hover:scale-110 duration-300",
                                module.color === 'navy' && "bg-navy-50 text-navy-600",
                                module.color === 'navy' && "bg-navy-50 text-navy-600",
                                module.color === 'navy' && "bg-navy-50 text-navy-600",
                                module.color === 'amber' && "bg-amber-50 text-amber-600"
                            )}>
                                <module.icon className="h-8 w-8" />
                            </div>
                            <div className={clsx(
                                "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold",
                                module.status === 'warning' && "bg-amber-50 text-amber-700",
                                module.status === 'info' && "bg-navy-50 text-navy-700",
                                module.status === 'success' && "bg-green-50 text-green-700",
                                module.status === 'danger' && "bg-red-50 text-red-700"
                            )}>
                                {module.status === 'warning' && <AlertCircle className="h-3.5 w-3.5" />}
                                {module.status === 'success' && <CheckCircle2 className="h-3.5 w-3.5" />}
                                {module.stats}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 group-hover:text-navy-600 transition-colors mb-2">
                                {module.title}
                            </h3>
                            <p className="text-gray-500 leading-relaxed font-medium line-clamp-2 pr-8">
                                {module.description}
                            </p>
                        </div>

                        <div className="mt-8 flex items-center text-navy-600 font-bold text-sm tracking-wide">
                            GÉRER LE MODULE
                            <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>

                        {/* Decoration */}
                        <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity">
                            <module.icon className="h-24 w-24 -mr-12 -mt-12" />
                        </div>
                    </button>
                ))}
            </div>

            {/* Quick Actions / Summary Banner */}
            <div className="bg-navy-900 rounded-3xl p-10 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="max-w-xl">
                        <h2 className="text-2xl font-bold mb-2">Rapport de Conformité Global</h2>
                        <p className="text-navy-200 font-medium">
                            Votre score de conformité actuel est de <span className="text-white font-bold">92%</span>.
                            Vous avez 5 actions prioritaires en attente pour atteindre les 100%.
                        </p>
                    </div>
                    <button className="px-8 py-4 bg-white text-navy-900 rounded-2xl font-bold shadow-lg hover:bg-navy-50 transition-colors whitespace-nowrap">
                        Générer le rapport PDF
                    </button>
                </div>
                {/* Abstract Circles Decoration */}
                <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-navy-500 rounded-full opacity-20 blur-3xl"></div>
                <div className="absolute -left-10 -top-10 w-48 h-48 bg-navy-400 rounded-full opacity-10 blur-2xl"></div>
            </div>
        </div>
    );
}
