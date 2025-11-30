export default function RecipeDetails({ dish }) {
    return (
        <div className="bg-white/5 border border-white/15 rounded-3xl p-8 backdrop-blur">
            <h3 className="text-xl font-bold mb-4">Serves: {dish.serves}</h3>

            <div className="text-sm text-gray-300 space-y-2">
                <p><strong>Preparation time:</strong> ~{dish.prep_time_min} min</p>

                <p className="pt-4 whitespace-pre-line">
                    {dish.instructions}
                </p>
            </div>
        </div>
    );
}
