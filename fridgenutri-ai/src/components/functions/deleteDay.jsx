export default function deleteDay(index) {
    if (!confirm("Delete this day?")) return;

    setDays(prev => {
        if (prev.length === 1) {
            alert("You cannot delete the last remaining day.");
            return prev;
        }

        const updated = prev.filter((_, i) => i !== index);

        if (currentDayIndex >= updated.length) {
            setCurrentDayIndex(updated.length - 1);
        } else if (index < currentDayIndex) {
            setCurrentDayIndex(i => i - 1);
        }

        return updated;
    });
};