import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Book, User, Users, FileText, ChevronRight, Zap, Mail, Clock, CheckCircle, XCircle, TrendingDown, ShieldCheck } from 'lucide-react';

export default function Help() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('collaborateur');

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Centre d'Aide</h1>
                <p className="mt-2 text-gray-500">Guides et documentation pour bien utiliser SkillHub.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <nav className="space-y-1">
                        <button
                            onClick={() => setActiveTab('collaborateur')}
                            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${activeTab === 'collaborateur'
                                ? 'bg-navy-50 text-navy-700 shadow-sm'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <User className={`mr-3 h-5 w-5 ${activeTab === 'collaborateur' ? 'text-navy-600' : 'text-gray-400'}`} />
                            Guide Collaborateur
                        </button>
                        <button
                            onClick={() => setActiveTab('manager')}
                            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${activeTab === 'manager'
                                ? 'bg-navy-50 text-navy-700 shadow-sm'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <Users className={`mr-3 h-5 w-5 ${activeTab === 'manager' ? 'text-navy-600' : 'text-gray-400'}`} />
                            Guide Manager
                        </button>
                        <button
                            onClick={() => setActiveTab('automatisations')}
                            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${activeTab === 'automatisations'
                                ? 'bg-navy-50 text-navy-700 shadow-sm'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <Zap className={`mr-3 h-5 w-5 ${activeTab === 'automatisations' ? 'text-navy-600' : 'text-gray-400'}`} />
                            Automatisations
                        </button>
                        {user?.role === 'rh' && (
                            <button
                                onClick={() => setActiveTab('rh')}
                                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${activeTab === 'rh'
                                    ? 'bg-navy-50 text-navy-700 shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <ShieldCheck className={`mr-3 h-5 w-5 ${activeTab === 'rh' ? 'text-navy-600' : 'text-gray-400'}`} />
                                Guide RH (Avancé)
                            </button>
                        )}
                    </nav>
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-white shadow-sm border border-gray-100 rounded-2xl p-8">
                    {activeTab === 'collaborateur' && (
                        <div className="prose prose-navy max-w-none">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                                <User className="h-8 w-8 mr-3 text-navy-600" />
                                Guide Utilisateur : Gestion des Formations (Collaborateur)
                            </h2>

                            <p className="text-gray-600 mb-6">
                                Ce guide a pour but de vous aider à comprendre comment effectuer vos demandes de formation sur SkillHub, que ce soit pendant une campagne annuelle ou au fil de l'eau.
                            </p>

                            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Comprendre les deux types de demandes</h3>
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg mb-8">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Type de Demande</th>
                                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">C'est quoi ?</th>
                                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Quand l'utiliser ?</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        <tr>
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">Demande "Campagne"</td>
                                            <td className="px-3 py-4 text-sm text-gray-500">Demande prévisionnelle pour l'année à venir (Plan de Formation).</td>
                                            <td className="px-3 py-4 text-sm text-gray-500">Uniquement lorsque la <strong>Campagne de Recueil</strong> est ouverte.</td>
                                        </tr>
                                        <tr>
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">Demande "Au fil de l'eau"</td>
                                            <td className="px-3 py-4 text-sm text-gray-500">Besoin immédiat, imprévu ou urgent.</td>
                                            <td className="px-3 py-4 text-sm text-gray-500">Tout au long de l'année.</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Comment faire une demande pendant une Campagne ?</h3>
                            <p className="mb-4">Lorsque les RH ouvrent une campagne, une <strong>bannière colorée</strong> apparaît sur votre tableau de bord.</p>
                            <ol className="list-decimal list-inside space-y-2 mb-6 text-gray-700">
                                <li>Connectez-vous à votre tableau de bord.</li>
                                <li>Repérez la bannière <strong>"Campagne en cours"</strong>.</li>
                                <li>Cliquez sur le bouton <strong>"Soumettre un besoin"</strong> situé DANS cette bannière.</li>
                                <li>Remplissez le formulaire (le bandeau en haut confirme le mode campagne).</li>
                                <li>Validez.</li>
                            </ol>

                            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Comment faire une demande ponctuelle (Hors Campagne) ?</h3>
                            <p className="mb-4">Si vous avez un besoin urgent hors campagne :</p>
                            <ol className="list-decimal list-inside space-y-2 mb-6 text-gray-700">
                                <li>Connectez-vous à votre tableau de bord.</li>
                                <li>Cliquez sur le bouton standard <strong>"Nouvelle demande"</strong> (en haut à droite).</li>
                                <li>Remplissez le formulaire (aucun bandeau de campagne ne doit apparaître).</li>
                                <li>Validez.</li>
                            </ol>

                            <div className="bg-navy-50 border-l-4 border-navy-500 p-4 mt-8">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <FileText className="h-5 w-5 text-navy-400" aria-hidden="true" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-navy-700">
                                            <strong>FAQ Rapide :</strong> Si vous ne voyez pas la bannière de campagne, c'est qu'aucune campagne n'est ouverte actuellement.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'manager' && (
                        <div className="prose prose-navy max-w-none">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                                <Users className="h-8 w-8 mr-3 text-navy-600" />
                                Guide Utilisateur : Gestion des Formations (Manager)
                            </h2>

                            <p className="text-gray-600 mb-6">
                                En tant que Manager, vous jouez un rôle clé dans le développement des compétences de votre équipe. Ce guide vous explique comment gérer les demandes, en particulier lors des campagnes.
                            </p>

                            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Votre Rôle</h3>
                            <ul className="list-disc list-inside space-y-2 mb-6 text-gray-700">
                                <li><strong>Qualifier le besoin</strong> : Pertinence pour le poste ?</li>
                                <li><strong>Arbitrer</strong> : Prioriser selon le budget.</li>
                                <li><strong>Planifier</strong> : Gérer l'organisation de l'équipe.</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Gérer une Campagne de Recueil des Besoins</h3>
                            <p className="mb-4">Lorsqu'une campagne est ouverte (statut <code>OPEN</code>), une bannière apparaît sur votre tableau de bord.</p>

                            <div className="space-y-4 mb-8">
                                <div className="bg-white border border-gray-200 rounded-lg p-4">
                                    <h4 className="font-bold text-gray-900 mb-2">Étape 1 : Encourager vos collaborateurs</h4>
                                    <p className="text-sm text-gray-600">Invitez votre équipe à saisir leurs vœux via le bouton "Soumettre un besoin" de la bannière.</p>
                                </div>
                                <div className="bg-white border border-gray-200 rounded-lg p-4">
                                    <h4 className="font-bold text-gray-900 mb-2">Étape 2 : Valider et Arbitrer</h4>
                                    <p className="text-sm text-gray-600 mb-2">Les demandes apparaissent avec le statut <strong>"Validation Manager"</strong>.</p>
                                    <ul className="list-disc list-inside text-sm text-gray-600 ml-4">
                                        <li>Cliquez sur une demande pour voir le détail.</li>
                                        <li><strong>Approuver</strong> : La demande part aux RH.</li>
                                        <li><strong>Refuser</strong> : La demande est stoppée (motif obligatoire).</li>
                                    </ul>
                                </div>
                            </div>

                            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Le Circuit de Validation</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-8 overflow-x-auto pb-4">
                                <div className="flex-shrink-0 flex items-center bg-gray-100 rounded-full px-4 py-2">
                                    <span className="font-bold mr-2">1.</span> Collaborateur
                                </div>
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                                <div className="flex-shrink-0 flex items-center bg-navy-100 text-navy-800 rounded-full px-4 py-2 border border-navy-200">
                                    <span className="font-bold mr-2">2.</span> Manager (VOUS)
                                </div>
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                                <div className="flex-shrink-0 flex items-center bg-gray-100 rounded-full px-4 py-2">
                                    <span className="font-bold mr-2">3.</span> RH
                                </div>
                            </div>

                            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-8">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <FileText className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-yellow-700">
                                            <strong>Conseil :</strong> En période de campagne, essayez d'avoir une vision d'ensemble du budget demandé par votre équipe avant de tout valider.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'automatisations' && (
                        <div className="prose prose-navy max-w-none">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                                <Zap className="h-8 w-8 mr-3 text-navy-600" />
                                Guide des Automatisations
                            </h2>

                            <p className="text-gray-600 mb-8">
                                SkillHub travaille pour vous en arrière-plan. Notre système d'automatisation s'assure que la bonne personne est informée au bon moment, sans effort de votre part.
                            </p>

                            {/* Section 1: Circuit de Validation */}
                            <div className="mb-12">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                    <span className="bg-navy-100 text-navy-800 text-sm font-bold px-3 py-1 rounded-full mr-3">1</span>
                                    Le Circuit de Validation Complet
                                </h3>
                                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                    <div className="flex flex-col md:flex-row items-start justify-between gap-4 relative">
                                        {/* Step 1: Soumission */}
                                        <div className="flex flex-col items-center text-center flex-1 z-10">
                                            <div className="h-12 w-12 bg-white border-2 border-navy-500 rounded-full flex items-center justify-center mb-3 shadow-sm">
                                                <User className="h-6 w-6 text-navy-500" />
                                            </div>
                                            <h4 className="font-bold text-gray-900 text-sm">1. Soumission</h4>
                                            <p className="text-xs text-gray-500 mt-1">Collaborateur</p>
                                        </div>

                                        {/* Arrow 1 */}
                                        <div className="hidden md:block absolute top-6 left-[12%] right-[88%] h-0.5 bg-gray-300 -z-0 w-[20%]"></div>

                                        {/* Step 2: Manager */}
                                        <div className="flex flex-col items-center text-center flex-1 z-10">
                                            <div className="h-12 w-12 bg-white border-2 border-navy-500 rounded-full flex items-center justify-center mb-3 shadow-sm">
                                                <Mail className="h-6 w-6 text-navy-500" />
                                            </div>
                                            <h4 className="font-bold text-gray-900 text-sm">2. Validation Manager</h4>
                                            <p className="text-xs text-gray-500 mt-1">Email de validation</p>
                                        </div>

                                        {/* Arrow 2 */}
                                        <div className="hidden md:block absolute top-6 left-[37%] right-[63%] h-0.5 bg-gray-300 -z-0 w-[20%]"></div>

                                        {/* Step 3: RH */}
                                        <div className="flex flex-col items-center text-center flex-1 z-10">
                                            <div className="h-12 w-12 bg-white border-2 border-navy-500 rounded-full flex items-center justify-center mb-3 shadow-sm">
                                                <Users className="h-6 w-6 text-navy-500" />
                                            </div>
                                            <h4 className="font-bold text-gray-900 text-sm">3. Validation RH</h4>
                                            <p className="text-xs text-gray-500 mt-1">Contrôle final & Budget</p>
                                        </div>

                                        {/* Arrow 3 */}
                                        <div className="hidden md:block absolute top-6 left-[62%] right-[38%] h-0.5 bg-gray-300 -z-0 w-[20%]"></div>

                                        {/* Step 4: Finale */}
                                        <div className="flex flex-col items-center text-center flex-1 z-10">
                                            <div className="h-12 w-12 bg-white border-2 border-green-500 rounded-full flex items-center justify-center mb-3 shadow-sm">
                                                <CheckCircle className="h-6 w-6 text-green-500" />
                                            </div>
                                            <h4 className="font-bold text-gray-900 text-sm">4. Confirmation</h4>
                                            <p className="text-xs text-gray-500 mt-1">Notification finale</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Manager */}
                            <div className="mb-12">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                    <span className="bg-navy-100 text-navy-800 text-sm font-bold px-3 py-1 rounded-full mr-3">2</span>
                                    Le "Filet de Sécurité" (Rappels Manager)
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Pour éviter que les demandes ne se perdent, SkillHub relance automatiquement les managers.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0">
                                                <Clock className="h-6 w-6 text-orange-500" />
                                            </div>
                                            <div className="ml-4">
                                                <h4 className="text-lg font-medium text-gray-900">Rappel J+3</h4>
                                                <p className="mt-1 text-sm text-gray-500">
                                                    Si une demande reste sans réponse pendant <strong>3 jours ouvrés</strong>, le manager reçoit un email de rappel automatique chaque matin à 10h00.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0">
                                                <XCircle className="h-6 w-6 text-red-500" />
                                            </div>
                                            <div className="ml-4">
                                                <h4 className="text-lg font-medium text-gray-900">Refus Motivé</h4>
                                                <p className="mt-1 text-sm text-gray-500">
                                                    En cas de refus (Manager ou RH), le collaborateur reçoit un email contenant <strong>le motif exact</strong> pour une transparence totale.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Summary Table */}
                            <div className="mb-12">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">Résumé des Notifications</h3>
                                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-300">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Événement</th>
                                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Destinataire</th>
                                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            <tr>
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">Nouvelle Demande</td>
                                                <td className="px-3 py-4 text-sm text-gray-500">Manager</td>
                                                <td className="px-3 py-4 text-sm text-gray-500">Email immédiat avec lien de validation</td>
                                            </tr>
                                            <tr>
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">Validation Manager</td>
                                                <td className="px-3 py-4 text-sm text-gray-500">RH</td>
                                                <td className="px-3 py-4 text-sm text-gray-500">Notification de demande à traiter</td>
                                            </tr>
                                            <tr>
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">Validation Finale / Refus</td>
                                                <td className="px-3 py-4 text-sm text-gray-500">Collaborateur</td>
                                                <td className="px-3 py-4 text-sm text-gray-500">Email de confirmation ou refus</td>
                                            </tr>
                                            <tr>
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">Retard &gt; 3 jours</td>
                                                <td className="px-3 py-4 text-sm text-gray-500">Manager</td>
                                                <td className="px-3 py-4 text-sm text-gray-500">Email de rappel quotidien (10h00)</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Future Automations */}
                            <div className="bg-navy-50 rounded-xl p-6 border border-navy-100 flex items-start">
                                <Zap className="h-6 w-6 text-navy-600 mt-1 flex-shrink-0" />
                                <div className="ml-4">
                                    <h4 className="text-lg font-bold text-navy-900">En constante évolution</h4>
                                    <p className="mt-2 text-navy-700">
                                        SkillHub évolue chaque jour. De nouvelles automatisations (rappels de formation, enquêtes de satisfaction, alertes budget) seront ajoutées progressivement pour simplifier encore plus votre quotidien.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'rh' && (
                        <div className="prose prose-navy max-w-none">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                                <ShieldCheck className="h-8 w-8 mr-3 text-navy-600" />
                                Guide RH : Outils Avancés
                            </h2>

                            <p className="text-gray-600 mb-8">
                                Découvrez les outils exclusifs conçus pour optimiser le budget et garantir la conformité.
                            </p>

                            {/* Optimization */}
                            <div className="mb-12">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                    <TrendingDown className="h-6 w-6 mr-2 text-green-600" />
                                    Optimisation des Sessions (Cost Saving)
                                </h3>
                                <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                                    <p className="text-green-800 mb-4">
                                        SkillHub analyse en permanence les demandes individuelles pour détecter des opportunités de regroupement.
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 text-green-700">
                                        <li><strong>Détection</strong> : Dès que 5 collaborateurs demandent la même formation.</li>
                                        <li><strong>Action</strong> : Une carte apparaît dans votre dashboard "Optimisation".</li>
                                        <li><strong>Gain</strong> : Convertir ces demandes en une session intra-entreprise permet d'économiser environ 30 à 40%.</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Compliance */}
                            <div className="mb-12">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                    <CheckCircle className="h-6 w-6 mr-2 text-navy-600" />
                                    Conformité & Recyclages
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    (Bientôt disponible) Un suivi automatisé des certifications obligatoires (SST, Habilitations).
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-gray-700">
                                    <li>Alertes automatiques à J-90 avant expiration.</li>
                                    <li>Tableau de bord de conformité par département.</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
