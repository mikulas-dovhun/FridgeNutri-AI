// src/components/Chatbot/IngredientsGrid.jsx
export default function IngredientsGrid({ ingredients }) {
    if (!ingredients || ingredients.length === 0) {
        return <div className="text-gray-400 text-center py-10">No ingredients found</div>;
    }

    return (
        <div className="bg-white/5 border border-white/15 rounded-3xl p-8 backdrop-blur">
            <h2 className="text-white text-2xl font-bold mb-6">
                Available ingredients ({ingredients.length}):
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {ingredients.map((ing, i) => (
                    <div
                        key={i}
                        className="bg-gradient-to-br from-purple-600/40 to-blue-600/40 border border-white/20 rounded-xl p-5 text-center hover:scale-105 transition-all"
                    >
                        <div className="text-white font-medium capitalize">{ing.name}</div>
                        <div className="text-gray-300 text-sm mt-1">{ing.amount}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}