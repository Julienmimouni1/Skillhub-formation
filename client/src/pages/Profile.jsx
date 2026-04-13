import { useAuth } from '../context/AuthContext';
import { User, Building, Briefcase, Calendar, Mail, Hash, MapPin, Award } from 'lucide-react';

export default function Profile() {
    const { user } = useAuth();

    if (!user) return <div>Chargement...</div>;

    const InfoItem = ({ icon: Icon, label, value }) => (
        <div className="flex items-start p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex-shrink-0 p-2 bg-white rounded-lg shadow-sm text-navy-600">
                <Icon className="h-5 w-5" />
            </div>
            <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <p className="mt-1 text-base font-semibold text-gray-900">{value || '-'}</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-8">Mon Profil</h1>

            <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden mb-8">
                <div className="bg-gradient-to-r from-navy-600 to-navy-600 px-8 py-8 text-white">
                    <div className="flex items-center gap-6">
                        <div className="h-24 w-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-3xl font-bold border-4 border-white/30">
                            {user.first_name[0]}{user.last_name[0]}
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold">{user.first_name} {user.last_name}</h2>
                            <p className="text-navy-100 text-lg flex items-center gap-2 mt-1">
                                <Mail className="h-4 w-4" /> {user.email}
                            </p>
                            <div className="flex gap-3 mt-4">
                                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-sm font-medium border border-white/20">
                                    {user.role === 'collaborateur' ? 'Collaborateur' :
                                        user.role === 'manager' ? 'Manager' :
                                            user.role === 'rh' ? 'RH' : 'Administrateur'}
                                </span>
                                {user.department && (
                                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-sm font-medium border border-white/20 flex items-center gap-1">
                                        <Building className="h-3 w-3" /> {user.department.name}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <User className="h-5 w-5 text-navy-600" />
                        Informations Professionnelles
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InfoItem icon={Hash} label="ID Employé" value={user.employee_id} />
                        <InfoItem icon={Briefcase} label="Titre de poste" value={user.job_title} />
                        <InfoItem icon={Building} label="Entité Juridique" value={user.legal_entity} />
                        <InfoItem icon={MapPin} label="Division" value={user.division} />
                        <InfoItem icon={Calendar} label="Date de naissance" value={user.birth_date ? new Date(user.birth_date).toLocaleDateString() : null} />
                        <InfoItem icon={Award} label="RH Rattaché" value={user.assigned_rh ? `${user.assigned_rh.first_name} ${user.assigned_rh.last_name} (${user.assigned_rh.email})` : null} />
                    </div>
                </div>
            </div>
        </div>
    );
}
