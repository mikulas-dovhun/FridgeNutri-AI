# services/shopping_list.py
def generate_shopping_list(ingredients: list, prices: dict):
    total = 0
    items = []

    for ing in ingredients:
        name = ing["name"]
        amount = ing["amount"]
        price_info = prices.get(name, {"price": 0, "store": "?"})
        price = price_info.get("price", 0)
        if isinstance(price, float):
            total += price

        items.append({
            "item": name,
            "amount": amount,
            "price": price if price != "?" else "—",
            "store": price_info.get("store", "?"),
            "total_for_this": price if price != "?" else None
        })

    return {
        "items": items,
        "estimated_total_czk": round(total, 2),
        "currency": "Kč",
        "note": "Prices from today – Rohlik/Tesco/Kaufland/Lidl"
    }