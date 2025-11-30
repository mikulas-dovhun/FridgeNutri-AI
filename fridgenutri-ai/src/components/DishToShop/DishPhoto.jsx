export default function DishPhoto({ url, dishName }) {
  return (
    <div className="bg-white/5 border border-white/15 rounded-3xl p-6 backdrop-blur">
      <h2 className="text-white text-2xl font-bold mb-4">
        Recognised dish: <span className="text-emerald-400">{dishName}</span>
      </h2>
      <div className="rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl">
        <img src={url} alt="Dish" className="w-full object-cover max-h-96" />
      </div>
    </div>
  );
}