import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const CertificationWidget = () => {
    const [certifications, setCertifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCertifications = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('/certifications/expiring', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCertifications(response.data);
            } catch (error) {
                console.error('Error fetching certifications:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCertifications();
    }, []);

    const getDaysRemaining = (expiryDate) => {
        const today = new Date();
        const expiry = new Date(expiryDate);
        const timeDiff = expiry.getTime() - today.getTime();
        return Math.ceil(timeDiff / (1000 * 3600 * 24));
    };

    if (loading) return <div className="p-4 bg-white rounded-2xl shadow-sm animate-pulse h-64"></div>;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                        <AlertTriangle size={20} />
                    </div>
                    <h3 className="font-bold text-gray-800">Alertes Habilitations</h3>
                </div>
                <span className="text-xs font-semibold px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                    {certifications.length} à renouveler
                </span>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {certifications.length === 0 ? (
                    <div className="text-center text-gray-400 py-8 flex flex-col items-center">
                        <CheckCircle size={32} className="mb-2 text-green-500/50" />
                        <p className="text-sm">Tout est en conformité !</p>
                    </div>
                ) : (
                    certifications.map((cert) => {
                        const days = getDaysRemaining(cert.expires_at);
                        const isCritical = days <= 15;

                        return (
                            <div key={cert.id} className={`p-3 rounded-xl border ${isCritical ? 'border-red-100 bg-red-50/50' : 'border-orange-100 bg-orange-50/50'} flex items-center justify-between group hover:shadow-md transition-all`}>
                                <div>
                                    <div className="font-bold text-gray-800 text-sm">{cert.name}</div>
                                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                        <span className="font-medium text-gray-700">{cert.user.first_name} {cert.user.last_name}</span>
                                        <span className="text-gray-300">•</span>
                                        <span>{cert.user.department?.name || 'N/A'}</span>
                                    </div>
                                </div>
                                <div className={`flex flex-col items-end ${isCritical ? 'text-red-600' : 'text-orange-600'}`}>
                                    <div className="text-xs font-bold flex items-center gap-1">
                                        <Clock size={12} />
                                        {days}j
                                    </div>
                                    <div className="text-[10px] opacity-75">expire le {new Date(cert.expires_at).toLocaleDateString()}</div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <button className="w-full mt-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                Voir tout le registre
            </button>
        </div>
    );
};

export default CertificationWidget;
