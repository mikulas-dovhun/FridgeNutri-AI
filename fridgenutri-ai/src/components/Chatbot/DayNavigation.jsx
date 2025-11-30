// src/components/Chatbot/DayNavigation.jsx
"use client";

export default function DayNavigation({
                                          days,
                                          currentDayIndex,
                                          onSwitchDay,
                                          onAddDay,
                                          onDeleteDay
                                      }) {
    return (
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
            {days.map((day, index) => (
                <button
                    key={day.id}
                    onClick={() => onDeleteDay(index)}
                    className={`
                        px-4 py-2 rounded-xl whitespace-nowrap border
                        ${index === currentDayIndex
                        ? "bg-purple-600 text-white border-purple-400"
                        : "bg-white/10 text-white/70 border-white/20 hover:bg-white/20"
                    }
                    `}
                >
                    {day.weekday} {day.dayNumber}
                </button>
            ))}

            <button
                onClick={onAddDay}
                className="px-4 py-2 rounded-xl bg-green-600 text-white border border-green-400 hover:bg-green-700"
            >
                +
            </button>
        </div>
    );
}
