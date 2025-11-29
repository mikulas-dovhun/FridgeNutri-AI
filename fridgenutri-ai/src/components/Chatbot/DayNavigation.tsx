// src/components/Chatbot/DayNavigation.tsx
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

type DayNavigationProps = {
    days: any[];
    currentDayIndex: number;
    onSwitchDay: (index: number) => void;
    onAddDay: () => void;
};

function DayNavigation({ days, currentDayIndex, onSwitchDay, onAddDay }: DayNavigationProps) {
    return (
        <div className="flex items-center gap-2 select-none">
            {days.map((day, idx) => (
                <button
                    key={day.id}
                    onClick={() => onSwitchDay(idx)}
                    className={cn(
                        'px-3 py-1 rounded-full text-xs font-medium flex flex-col items-center min-w-[52px]',
                        idx === currentDayIndex
                            ? 'bg-blue-500 text-white shadow'
                            : 'bg-white/10 text-gray-200 hover:bg-white/20',
                    )}
                >
                    <span className="text-[10px] opacity-80">{day.weekday}</span>
                    <span className="text-sm font-semibold leading-none">{day.dayNumber}</span>
                </button>
            ))}
            <button onClick={onAddDay} className="ml-1 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white">
                <Plus className="w-4 h-4" />
            </button>
        </div>
    );
}

export default DayNavigation;