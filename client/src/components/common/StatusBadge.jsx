import clsx from 'clsx';

const StatusBadge = ({ status }) => {
    const styles = {
        DRAFT: 'bg-gray-50 text-gray-600 ring-gray-500/20',
        PENDING_MANAGER: 'bg-gold-50 text-gold-800 ring-gold-600/20',
        PENDING_RH: 'bg-orange-50 text-orange-800 ring-orange-600/20',
        PRIORITY_2: 'bg-gray-50 text-gray-700 ring-gray-600/20',
        APPROVED: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20',
        REJECTED: 'bg-red-50 text-red-700 ring-red-600/10',
        PLANNED: 'bg-navy-50 text-navy-700 ring-navy-600/20',
        COMPLETED: 'bg-navy-50 text-navy-800 ring-navy-600/20',
    };

    const labels = {
        DRAFT: 'Brouillon',
        PENDING_MANAGER: 'Validation Manager',
        PENDING_RH: 'Validation RH',
        PRIORITY_2: 'Priorité 2 (Attente)',
        APPROVED: 'Approuvée',
        REJECTED: 'Refusée',
        PLANNED: 'Planifiée',
        COMPLETED: 'Terminée',
    };

    return (
        <span className={clsx("inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ring-inset shadow-sm", styles[status] || styles.DRAFT)}>
            {labels[status] || status}
        </span>
    );
};

export default StatusBadge;
