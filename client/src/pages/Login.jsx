import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2 } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Erreur de connexion');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        SkillHub Formation
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Connectez-vous à votre espace personnel
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <input
                                type="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-10 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-navy-500 focus:border-navy-500 focus:z-10 sm:text-sm"
                                placeholder="Adresse email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <input
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-10 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-navy-500 focus:border-navy-500 focus:z-10 sm:text-sm"
                                placeholder="Mot de passe"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-navy-600 hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500 disabled:opacity-50 transition-colors duration-200"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin h-5 w-5" />
                            ) : (
                                'Se connecter'
                            )}
                        </button>
                    </div>

                    <div className="mt-8 border-t border-gray-100 pt-6">
                        <p className="text-center text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Comptes de Démo (Mdp: password123)</p>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-xs text-left">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="px-3 py-2 font-medium text-gray-500">Département</th>
                                        <th className="px-3 py-2 font-medium text-gray-500">Rôle</th>
                                        <th className="px-3 py-2 font-medium text-gray-500">Email</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {/* Tech */}
                                    <tr className="hover:bg-navy-50/50 transition-colors">
                                        <td className="px-3 py-2 font-bold text-navy-600" rowSpan="3">Tech</td>
                                        <td className="px-3 py-2 font-medium text-gray-700">RH (Sophie)</td>
                                        <td className="px-3 py-2 text-gray-500 font-mono">rh.tech@skillhub.com</td>
                                    </tr>
                                    <tr className="hover:bg-navy-50/50 transition-colors">
                                        <td className="px-3 py-2 text-gray-600">Manager (Thomas)</td>
                                        <td className="px-3 py-2 text-gray-500 font-mono">manager.tech@skillhub.com</td>
                                    </tr>
                                    <tr className="hover:bg-navy-50/50 transition-colors">
                                        <td className="px-3 py-2 text-gray-600">Collab (Lucas)</td>
                                        <td className="px-3 py-2 text-gray-500 font-mono">collab.tech@skillhub.com</td>
                                    </tr>

                                    {/* Marketing */}
                                    <tr className="hover:bg-navy-50/50 transition-colors">
                                        <td className="px-3 py-2 font-bold text-navy-600" rowSpan="3">Marketing</td>
                                        <td className="px-3 py-2 font-medium text-gray-700">RH (Emma)</td>
                                        <td className="px-3 py-2 text-gray-500 font-mono">rh.marketing@skillhub.com</td>
                                    </tr>
                                    <tr className="hover:bg-navy-50/50 transition-colors">
                                        <td className="px-3 py-2 text-gray-600">Manager (Julie)</td>
                                        <td className="px-3 py-2 text-gray-500 font-mono">manager.marketing@skillhub.com</td>
                                    </tr>
                                    <tr className="hover:bg-navy-50/50 transition-colors">
                                        <td className="px-3 py-2 text-gray-600">Collab (Antoine)</td>
                                        <td className="px-3 py-2 text-gray-500 font-mono">collab.marketing@skillhub.com</td>
                                    </tr>

                                    {/* Sales */}
                                    <tr className="hover:bg-green-50/50 transition-colors">
                                        <td className="px-3 py-2 font-bold text-green-600" rowSpan="3">Sales</td>
                                        <td className="px-3 py-2 font-medium text-gray-700">RH (Alexandre)</td>
                                        <td className="px-3 py-2 text-gray-500 font-mono">rh.sales@skillhub.com</td>
                                    </tr>
                                    <tr className="hover:bg-green-50/50 transition-colors">
                                        <td className="px-3 py-2 text-gray-600">Manager (Sarah)</td>
                                        <td className="px-3 py-2 text-gray-500 font-mono">manager.sales@skillhub.com</td>
                                    </tr>
                                    <tr className="hover:bg-green-50/50 transition-colors">
                                        <td className="px-3 py-2 text-gray-600">Collab (Maxime)</td>
                                        <td className="px-3 py-2 text-gray-500 font-mono">collab.sales@skillhub.com</td>
                                    </tr>

                                    {/* Admin */}
                                    <tr className="hover:bg-gray-50/50 transition-colors border-t border-gray-100">
                                        <td className="px-3 py-2 font-bold text-gray-800">Admin</td>
                                        <td className="px-3 py-2 font-medium text-gray-700">Admin System</td>
                                        <td className="px-3 py-2 text-gray-500 font-mono">admin@skillhub.com</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
