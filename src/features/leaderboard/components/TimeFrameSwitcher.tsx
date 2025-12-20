import { Calendar, Trophy } from 'lucide-react';
import type { TimeFrame } from '../types';

interface TimeFrameSwitcherProps {
    timeFrame: TimeFrame;
    onChange: (timeFrame: TimeFrame) => void;
}

export default function TimeFrameSwitcher({ timeFrame, onChange }: TimeFrameSwitcherProps) {
    return (
        <div className="flex items-center gap-2 bg-white/70 backdrop-blur-md rounded-xl p-1.5 border border-gray-200/60 shadow-lg">
            <button
                onClick={() => onChange('weekly')}
                className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all duration-300
                    ${timeFrame === 'weekly'
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100/50'
                    }
                `}
            >
                <Calendar className="h-4 w-4" />
                Weekly
            </button>
            <button
                onClick={() => onChange('allTime')}
                className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all duration-300
                    ${timeFrame === 'allTime'
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100/50'
                    }
                `}
            >
                <Trophy className="h-4 w-4" />
                All Time
            </button>
        </div>
    );
}

