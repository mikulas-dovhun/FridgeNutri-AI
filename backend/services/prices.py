# backend/services/prices.py
import aiohttp
import asyncio
import re
from typing import List, Dict

_price_cache = {}
CACHE_TTL = 300

async def get_cheapest_prices(ingredients: List[Dict]) -> Dict:
    if not ingredients:
        return {"items": [], "estimated_total": 0, "currency": "€", "note": "No ingredients"}

    async def fetch_from_api(english_name: str) -> Dict:
        key = english_name.lower()
        if key in _price_cache:
            cached = _price_cache[key]
            if asyncio.get_event_loop().time() - cached["ts"] < CACHE_TTL:
                return cached["data"]

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "sk-SK,sk;q=0.9,en;q=0.8"
        }

        async with aiohttp.ClientSession(headers=headers, timeout=aiohttp.ClientTimeout(total=8)) as session:
            # Tesco SK – Public search page (parse HTML for price)
            try:
                url = "https://nakup.tesco.sk/groceries/sk-SK/search"
                params = {"query": english_name}
                async with session.get(url, params=params) as r:
                    if r.status == 200:
                        text = await r.text()
                        # Parse price from script/JSON in page
                        price_match = re.search(r'"priceValue":\s*(\d+\.?\d*)', text)
                        if price_match:
                            price = float(price_match.group(1))
                            result = {"price": f"{price:.2f} €", "store": "Tesco"}
                            _price_cache[key] = {"data": result, "ts": asyncio.get_event_loop().time()}
                            return result
            except Exception as e:
                print(f"Tesco error for {english_name}: {e}")
                pass

            # Billa SK – Correct API endpoint (full URL, simplified params)
            try:
                url = "https://shop.billa.sk/api/v1/search"
                params = {"text": english_name, "pageSize": 1}
                async with session.get(url, params=params) as r:
                    if r.status == 200:
                        data = await r.json()
                        item = data.get("results", [{}])[0]
                        price = item.get("price", {}).get("finalPrice") or item.get("price")
                        if price:
                            result = {"price": f"{float(price):.2f} €", "store": "Billa"}
                            _price_cache[key] = {"data": result, "ts": asyncio.get_event_loop().time()}
                            return result
            except Exception as e:
                print(f"Billa error for {english_name}: {e}")
                pass

            # Lidl SK – Simplified search (no limit param to avoid header error)
            try:
                url = "https://www.lidl.sk/search"
                params = {"q": english_name}  # Removed limit to fix header length
                async with session.get(url, params=params) as r:
                    if r.status == 200:
                        text = await r.text()
                        price_match = re.search(r'"price":\s*(\d+\.?\d*)', text)
                        if price_match:
                            price = float(price_match.group(1))
                            result = {"price": f"{price:.2f} €", "store": "Lidl"}
                            _price_cache[key] = {"data": result, "ts": asyncio.get_event_loop().time()}
                            return result
            except Exception as e:
                print(f"Lidl error for {english_name}: {e}")
                pass

            # Kaufland SK – Public search
            try:
                url = "https://www.kaufland.sk/search"
                params = {"q": english_name}
                async with session.get(url, params=params) as r:
                    if r.status == 200:
                        text = await r.text()
                        price_match = re.search(r'"price":\s*(\d+\.?\d*)', text)
                        if price_match:
                            price = float(price_match.group(1))
                            result = {"price": f"{price:.2f} €", "store": "Kaufland"}
                            _price_cache[key] = {"data": result, "ts": asyncio.get_event_loop().time()}
                            return result
            except Exception as e:
                print(f"Kaufland error for {english_name}: {e}")
                pass

        # No data – honest dash
        result = {"price": "—", "store": "—"}
        _price_cache[key] = {"data": result, "ts": asyncio.get_event_loop().time()}
        return result

    price_results = await asyncio.gather(*[fetch_from_api(ing["name"]) for ing in ingredients])

    total = 0.0
    items = []
    for ing, price_info in zip(ingredients, price_results):
        price_str = price_info.get("price", "—")
        store = price_info.get("store", "—")
        if price_str != "—":
            total += float(price_str.replace(" €", ""))
        items.append({
            "item": ing["name"],  # English
            "amount": ing["amount"],
            "price": price_str,
            "store": store
        })

    return {
        "items": items,
        "estimated_total": round(total, 2),
        "currency": "€",
        "note": "Real-time prices from Tesco, Billa, Lidl, Kaufland (Slovakia)"
    }