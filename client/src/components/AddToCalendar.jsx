import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

export default function AddToCalendar({ event }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const { title, description, start, end, location } = event;

    // Helper to format dates for different calendars
    const formatDate = (date) => date ? new Date(date).toISOString().replace(/-|:|\.\d\d\d/g, "") : "";

    const googleUrl = () => {
        const startTime = formatDate(start);
        const endTime = formatDate(end);
        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startTime}/${endTime}&details=${encodeURIComponent(description || '')}&location=${encodeURIComponent(location || '')}`;
    };

    const outlookUrl = () => {
        const startTime = new Date(start).toISOString();
        const endTime = new Date(end).toISOString();
        return `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&startdt=${startTime}&enddt=${endTime}&subject=${encodeURIComponent(title)}&body=${encodeURIComponent(description || '')}&location=${encodeURIComponent(location || '')}`;
    };

    const yahooUrl = () => {
        const startTime = formatDate(start);
        const endTime = formatDate(end);
        return `https://calendar.yahoo.com/?v=60&view=d&type=20&title=${encodeURIComponent(title)}&st=${startTime}&et=${endTime}&desc=${encodeURIComponent(description || '')}&in_loc=${encodeURIComponent(location || '')}`;
    };

    const downloadIcs = () => {
        const startTime = formatDate(start);
        const endTime = formatDate(end);
        const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
URL:${document.location.href}
DTSTART:${startTime}
DTEND:${endTime}
SUMMARY:${title}
DESCRIPTION:${description || ''}
LOCATION:${location || ''}
END:VEVENT
END:VCALENDAR`;

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute('download', `${title.replace(/\s+/g, '_')}.ics`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex justify-center items-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500 transition-all"
            >
                <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                Ajouter au planning
                <ChevronDown className="ml-2 -mr-1 h-4 w-4" aria-hidden="true" />
            </button>

            {isOpen && (
                <div className="origin-top absolute left-1/2 transform -translate-x-1/2 mt-2 w-64 rounded-xl shadow-2xl bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-in fade-in zoom-in-95 duration-100 border border-gray-100">
                    <div className="py-2" role="menu" aria-orientation="vertical">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Choisir un calendrier
                        </div>
                        <a
                            href={googleUrl()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-navy-50 hover:text-navy-700 transition-colors"
                            role="menuitem"
                            onClick={() => setIsOpen(false)}
                        >
                            <ExternalLink className="mr-3 h-4 w-4 text-gray-400 group-hover:text-navy-500" />
                            Google Calendar
                        </a>
                        <a
                            href={outlookUrl()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-navy-50 hover:text-navy-700 transition-colors"
                            role="menuitem"
                            onClick={() => setIsOpen(false)}
                        >
                            <ExternalLink className="mr-3 h-4 w-4 text-gray-400 group-hover:text-navy-500" />
                            Outlook.com
                        </a>
                        <a
                            href={yahooUrl()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-navy-50 hover:text-navy-700 transition-colors"
                            role="menuitem"
                            onClick={() => setIsOpen(false)}
                        >
                            <ExternalLink className="mr-3 h-4 w-4 text-gray-400 group-hover:text-navy-500" />
                            Yahoo Calendar
                        </a>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button
                            onClick={() => {
                                downloadIcs();
                                setIsOpen(false);
                            }}
                            className="group flex w-full items-center px-4 py-3 text-sm text-gray-700 hover:bg-navy-50 hover:text-navy-700 text-left transition-colors"
                            role="menuitem"
                        >
                            <Calendar className="mr-3 h-4 w-4 text-gray-400 group-hover:text-navy-500" />
                            iCal / Outlook (.ics)
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
