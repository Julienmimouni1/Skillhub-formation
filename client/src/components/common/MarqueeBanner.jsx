import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function MarqueeBanner({ message, type = 'warning' }) {
    const colors = {
        warning: 'bg-navy-600 text-white',
        info: 'bg-navy-600 text-white',
        error: 'bg-red-600 text-white'
    };

    return (
        <div className={`${colors[type]} py-3 px-4 rounded-lg shadow-md flex items-center justify-center gap-3`}>
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <span className="font-bold text-sm uppercase tracking-wide text-center">
                {message}
            </span>
        </div>
    );
}
