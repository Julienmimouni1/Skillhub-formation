import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import axios from 'axios';

export default function ActiveCampaignBanner() {
    const [activeCampaign, setActiveCampaign] = useState(null);

    useEffect(() => {
        const fetchActiveCampaign = async () => {
            try {
                const { data } = await axios.get('/campaigns/active');
                setActiveCampaign(data);
            } catch (error) {
                console.error('Error fetching active campaign:', error);
            }
        };
        fetchActiveCampaign();
    }, []);

    if (!activeCampaign) return null;

    return (
        <div className="bg-gradient-to-r from-navy-600 to-navy-600 rounded-xl shadow-lg p-6 mb-8 text-white relative overflow-hidden">
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                            Campagne en cours
                        </span>
                        <span className="text-navy-100 text-sm">
                            Jusqu'au {new Date(activeCampaign.end_date).toLocaleDateString()}
                        </span>
                    </div>
                    <h2 className="text-2xl font-bold mb-1">{activeCampaign.title}</h2>
                    <p className="text-navy-100 max-w-xl">
                        La campagne de recueil des besoins est ouverte. Soumettez les besoins de formation de votre équipe pour l'année à venir.
                    </p>
                </div>
                <Link
                    to={`/new-request?campaign_id=${activeCampaign.id}`}
                    className="whitespace-nowrap px-6 py-3 bg-white text-navy-600 rounded-lg font-bold shadow-md hover:bg-navy-50 transition-colors flex items-center gap-2"
                >
                    <Plus className="h-5 w-5" />
                    Soumettre un besoin
                </Link>
            </div>

            {/* Decorative circles */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-navy-500/20 rounded-full blur-2xl"></div>
        </div>
    );
}
