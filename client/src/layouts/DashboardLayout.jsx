import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    PlusCircle,
    LogOut,
    Lightbulb,
    Menu,
    X,
    Settings,
    Bell,
    Search,
    ChevronDown,
    BookOpen,
    Heart,
    ClipboardCheck,
    Calendar,
    PieChart,
    TrendingUp,
    User,
    Users,
    Wallet,
    BarChart2,
    Library,
    History,
    LayoutGrid
} from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

export default function DashboardLayout({ children }) {
    const { user, viewRole, switchViewRole, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navigation = [
        { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Pilotage Indicateurs RH', href: '/pilotage', icon: BarChart2, roles: ['rh', 'admin'] },
        { name: 'Historique formations', href: '/rh/training-history', icon: History, roles: ['rh', 'admin', 'manager'] },
        { name: 'Conformité & Entretiens', href: '/rh/compliance', icon: ClipboardCheck, roles: ['rh', 'admin'] },
        { name: 'Bibliothèque documentaire', href: '/rh/documents', icon: Library, roles: ['rh', 'admin'] },
        { name: 'Campagnes', href: '/campaigns', icon: Calendar, roles: ['rh'] },
        { name: 'Optimisation des sessions', href: '/rh/optimization', icon: TrendingUp, roles: ['rh'] },
        { name: 'Nouvelle demande', href: '/new-request', icon: PlusCircle, roles: ['collaborateur'] },
        { name: 'Suivi des formations', href: '/my-trainings', icon: BookOpen, roles: ['collaborateur'] },
        { name: 'Ma mise en pratique', href: '/practical-application', icon: ClipboardCheck, roles: ['collaborateur'] },
        { name: 'Skill Wallet', href: '/skill-wallet', icon: Wallet, roles: ['collaborateur'] },
        { name: 'Budget équipe', href: '/team-budget', icon: PieChart, roles: ['manager'] },
        { name: 'Mise en pratique équipe', href: '/team-practical-application', icon: ClipboardCheck, roles: ['manager'] },
        { name: 'Matrice des compétences', href: '/team-skills', icon: LayoutGrid, roles: ['manager', 'rh', 'admin'] },
        { name: 'Administration', href: '/admin', icon: Settings, roles: ['admin'] },
        { name: 'Ma Wishlist', href: '/wishlist', icon: Heart, roles: ['collaborateur'] },
        { name: 'Le Mur des Idées', href: '/proposals', icon: Lightbulb, roles: ['collaborateur'] },
        { name: 'Propositions Collab.', href: '/admin/proposals', icon: Lightbulb, roles: ['rh', 'admin'] },
    ];

    // Use viewRole for filtering instead of user.role
    const filteredNavigation = navigation.filter(item =>
        !item.roles || item.roles.includes(viewRole)
    );

    const canSwitchRole = user?.role === 'manager' || user?.role === 'rh';
    const isViewingAsCollaborator = viewRole === 'collaborateur' && canSwitchRole;

    const toggleRole = () => {
        if (isViewingAsCollaborator) {
            switchViewRole(user.role); // Switch back to original role
        } else {
            switchViewRole('collaborateur'); // Switch to collaborator view
        }
        navigate('/dashboard'); // Go to dashboard to refresh view
    };

    return (
        <div className="min-h-screen bg-navy-50 dark:bg-navy-900 font-sans transition-colors duration-200">
            {/* Mobile sidebar toggle */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white/90 dark:bg-navy-900/90 backdrop-blur-md border-b border-gold-200/30 px-4 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                     <div className="h-8 w-8 bg-navy-900 rounded-lg flex items-center justify-center text-gold-300 font-serif font-bold text-xl border border-gold-400">S</div>
                    <span className="font-serif font-bold text-xl text-navy-900 dark:text-white tracking-tight">SkillHub</span>
                </div>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-md text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800">
                    {isSidebarOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Sidebar */}
            <div className={clsx(
                "fixed inset-y-0 left-0 z-20 w-72 bg-white dark:bg-navy-800 border-r border-gold-200/30 dark:border-navy-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-xl lg:shadow-none flex flex-col",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Logo Section */}
                <div className="h-24 flex items-center px-8">
                     <div className="h-10 w-10 bg-navy-900 rounded-lg flex items-center justify-center text-gold-400 font-serif font-bold text-2xl border border-gold-500/50 shadow-lg shadow-gold-900/10 mr-3">S</div>
                    <span className="text-2xl font-serif font-bold text-navy-900 dark:text-white tracking-tight">SkillHub</span>
                </div>

                <div className="flex-1 overflow-y-auto py-4 px-4 custom-scrollbar">
                    {/* Role Switcher Banner */}
                    {isViewingAsCollaborator && (
                        <div className="mb-6 px-1">
                            <div className="bg-gradient-to-r from-navy-50 to-white dark:from-navy-900 dark:to-navy-800 border border-gold-200/50 dark:border-navy-600 rounded-xl p-3 flex items-center gap-3 shadow-sm">
                                <div className="p-2 bg-navy-100 dark:bg-navy-700 rounded-lg text-navy-600 dark:text-gold-300">
                                    <User className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gold-600 dark:text-gold-400 uppercase tracking-wide">Mode Vue</p>
                                    <p className="text-sm font-medium text-navy-900 dark:text-navy-100">Collaborateur</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mb-8">
                        <p className="px-4 text-xs font-bold text-gold-600 dark:text-gold-500 uppercase tracking-widest mb-4 font-serif">Menu Principal</p>
                        <nav className="space-y-1">
                            {filteredNavigation.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className={clsx(
                                            "group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                                            isActive
                                                ? "bg-navy-50 dark:bg-navy-700/50 text-navy-900 dark:text-white shadow-sm border-l-4 border-gold-500"
                                                : "text-navy-500 dark:text-navy-400 hover:bg-navy-50/50 dark:hover:bg-navy-700/30 hover:text-navy-800 dark:hover:text-navy-200"
                                        )}
                                    >
                                        <Icon className={clsx("mr-3 h-5 w-5 transition-colors", isActive ? "text-gold-600 dark:text-gold-400" : "text-navy-400 dark:text-navy-500 group-hover:text-navy-600 dark:group-hover:text-navy-300")} />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                <div className="p-4 border-t border-gold-200/20 dark:border-navy-700 bg-navy-50/30 dark:bg-navy-900/30 backdrop-blur-sm">
                     {/* Help Link */}
                     <Link
                        to="/help"
                        className={clsx(
                            "w-full flex items-center px-4 py-2.5 mb-3 text-sm font-medium rounded-lg transition-all duration-200",
                            location.pathname === '/help'
                                ? "bg-white dark:bg-navy-700 text-navy-900 dark:text-white shadow-sm border border-gold-100 dark:border-navy-600"
                                : "text-navy-500 dark:text-navy-400 hover:bg-white dark:hover:bg-navy-700 hover:text-navy-800 dark:hover:text-white"
                        )}
                    >
                        <BookOpen className={clsx("mr-3 h-5 w-5 transition-colors", location.pathname === '/help' ? "text-gold-600 dark:text-gold-400" : "text-navy-400 dark:text-navy-500 group-hover:text-navy-600 dark:group-hover:text-navy-300")} />
                        Centre d'Aide
                    </Link>

                    {/* Switch Role Button */}
                    {canSwitchRole && (
                        <button
                            onClick={toggleRole}
                            className={clsx(
                                "w-full flex items-center justify-center px-4 py-2.5 mb-4 text-sm font-medium rounded-lg transition-all border shadow-sm",
                                isViewingAsCollaborator
                                    ? "bg-navy-800 text-white border-transparent hover:bg-navy-900 hover:shadow-md"
                                    : "bg-white dark:bg-navy-800 text-navy-700 dark:text-navy-200 border-gold-200 dark:border-navy-600 hover:bg-gold-50 dark:hover:bg-navy-700 hover:text-navy-900 hover:border-gold-300"
                            )}
                        >
                            {isViewingAsCollaborator ? (
                                <>
                                    <Users className="mr-2 h-4 w-4" />
                                    Retour Vue {user.role === 'rh' ? 'RH' : 'Manager'}
                                </>
                            ) : (
                                <>
                                    <User className="mr-2 h-4 w-4" />
                                    Vue Collaborateur
                                </>
                            )}
                        </button>
                    )}

                    <Link to="/profile" className="flex items-center p-3 rounded-xl bg-white dark:bg-navy-800 border border-gold-100 dark:border-navy-600 hover:shadow-md transition-all group">
                        <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-navy-900 text-gold-400 flex items-center justify-center font-serif font-bold border border-gold-200 group-hover:scale-105 transition-transform">
                                {user?.first_name?.[0]}{user?.last_name?.[0]}
                            </div>
                        </div>
                        <div className="ml-3 min-w-0">
                            <p className="text-sm font-bold text-navy-900 dark:text-white truncate font-serif">{user?.first_name} {user?.last_name}</p>
                            <p className="text-xs text-navy-500 dark:text-navy-400 capitalize truncate">{viewRole || user?.role}</p>
                        </div>
                    </Link>
                     <button
                        onClick={handleLogout}
                        className="w-full mt-2 flex items-center justify-center px-4 py-2 text-xs font-medium text-navy-400 dark:text-navy-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                        <LogOut className="mr-2 h-3 w-3" />
                        Déconnexion
                    </button>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-72 flex flex-col min-h-screen transition-all duration-300">
                {/* Top Header */}
                <header className="h-20 bg-white/80 dark:bg-navy-900/80 backdrop-blur-xl border-b border-gold-200/30 dark:border-navy-700 sticky top-0 z-10 px-8 flex items-center justify-between hidden lg:flex shadow-sm">
                    <div className="flex items-center flex-1">
                         <div className="relative w-full max-w-md group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-navy-300 dark:text-navy-500 group-focus-within:text-gold-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-navy-600 rounded-lg leading-5 bg-navy-50/50 dark:bg-navy-800 text-navy-900 dark:text-white placeholder-navy-300 dark:placeholder-navy-500 focus:outline-none focus:bg-white dark:focus:bg-navy-900 focus:ring-2 focus:ring-gold-500/20 focus:border-gold-400 sm:text-sm transition-all shadow-inner"
                                placeholder="Rechercher une formation, un dossier..."
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                         <div className="flex items-center gap-2">
                             <button className="p-2 rounded-full text-navy-400 dark:text-navy-400 hover:text-gold-600 dark:hover:text-gold-400 hover:bg-gold-50 dark:hover:bg-navy-800 transition-colors relative">
                                <Bell className="h-6 w-6" />
                                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-white dark:border-navy-900"></span>
                            </button>
                         </div>
                    </div>
                </header>

                <main className="flex-1 py-8 px-4 sm:px-8 mt-14 lg:mt-0 text-navy-900 dark:text-navy-100">
                    {children}
                </main>
            </div>
        </div>
    );
}
