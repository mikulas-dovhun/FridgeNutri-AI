// src/utils/dayUtils.ts

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
export const MONTHS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

export const createDayFromDate = (date: Date) => ({
    id: date.toISOString().slice(0, 10),
    date,
    dayNumber: date.getDate(),
    weekday: WEEKDAYS[date.getDay()],
    monthShort: MONTHS[date.getMonth()],
    photoUrl: null,
    analysis: null,
    chosenRecipes: [],
    addedIngredients: [],
    showRightBranch: false,
    showBottomBranch: false,
});

export const generateInitialDays = (count = 7) => {
    const today = new Date();
    const days = [];
    for (let i = 0; i < count; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        days.push(createDayFromDate(d));
    }
    return days;
};