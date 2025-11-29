'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import {
    Upload,
    Plus,
    Loader2,
    ArrowRight,
    ArrowDown,
    ArrowLeft,
    Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// дневные нормы (как на бэкенде)
const DAILY_NUTRIENTS = {
    protein: 56, // g
    vitamin_C_mg: 90,
    iron_mg: 8,
    calcium_mg: 1000,
}

// простые источники нутриентов
const NUTRIENT_SOURCES = {
    protein: ['chicken breast', 'eggs', 'greek yogurt', 'tofu'],
    vitamin_C_mg: ['bell peppers', 'broccoli', 'orange', 'kiwi'],
    iron_mg: ['spinach', 'lentils', 'red meat'],
    calcium_mg: ['milk', 'yogurt', 'cheese'],
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
]

// создаём день по конкретной дате
const createDayFromDate = (date) => ({
    id: date.toISOString().slice(0, 10),
    date,
    dayNumber: date.getDate(),
    weekday: WEEKDAYS[date.getDay()],
    monthShort: MONTHS[date.getMonth()],
    photoUrl: null,
    analysis: null,
    chosenRecipes: [],
    showRightBranch: false,
    showBottomBranch: false,
})

// стартовые дни: сегодня + 6 следующих
const generateInitialDays = (count = 7) => {
    const today = new Date()
    const days = []
    for (let i = 0; i < count; i++) {
        const d = new Date(today)
        d.setDate(today.getDate() + i)
        days.push(createDayFromDate(d))
    }
    return days
}

const computeTotals = (recipes) => {
    const macros = { calories: 0, protein: 0, carbs: 0, fat: 0 }
    const micros = {}

    for (const r of recipes) {
        if (r.macros) {
            macros.calories += r.macros.calories || 0
            macros.protein += r.macros.protein || 0
            macros.carbs += r.macros.carbs || 0
            macros.fat += r.macros.fat || 0
        }
        if (r.micronutrients) {
            for (const [k, v] of Object.entries(r.micronutrients)) {
                const num = typeof v === 'number' ? v : parseFloat(String(v))
                micros[k] = (micros[k] || 0) + (isNaN(num) ? 0 : num)
            }
        }
    }

    return { macros, micros }
}

// картинка блюда с Unsplash по названию
const getRecipeImageUrl = (recipe) => {
    if (recipe.imageUrl) return recipe.imageUrl
    const query = encodeURIComponent(`${recipe.name} food dish`)
    return `https://source.unsplash.com/featured/800x600/?${query}`
}

export default function Chatbot() {
    const [days, setDays] = useState(generateInitialDays())
    const [currentDayIndex, setCurrentDayIndex] = useState(0)

    const [selectedFile, setSelectedFile] = useState(null)
    const [previewUrl, setPreviewUrl] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [fileInputKey, setFileInputKey] = useState(0)

    const [swipeStartX, setSwipeStartX] = useState(null)
    const [openRecipe, setOpenRecipe] = useState(null)
    const [selectedAltNutrient, setSelectedAltNutrient] = useState(null)

    const analyzeRequestIdRef = useRef(0)

    const currentDay = days[currentDayIndex]
    const hasAnalysis = !!currentDay.analysis

    // смена текущего дня (сохраняет состояние дня)
    const switchDay = (index) => {
        setCurrentDayIndex(index)
        setSelectedFile(null)
        setPreviewUrl(null)
        setSelectedAltNutrient(null)
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (!file) return
        setSelectedFile(file)
        setPreviewUrl(URL.createObjectURL(file))
    }

    const handleAnalyze = async () => {
        if (!selectedFile) return
        setIsLoading(true)

        const formData = new FormData()
        formData.append('file', selectedFile)

        const requestId = Date.now()
        analyzeRequestIdRef.current = requestId

        try {
            const response = await fetch('http://localhost:8000/analyze', {
                method: 'POST',
                body: formData,
            })
            const data = await response.json()

            if (analyzeRequestIdRef.current !== requestId) {
                // был нажат reset — игнорируем ответ
                return
            }

            setDays((prev) => {
                const copy = [...prev]
                const day = copy[currentDayIndex]
                copy[currentDayIndex] = {
                    ...day,
                    photoUrl: previewUrl,
                    analysis: data,
                    chosenRecipes: [],
                    showRightBranch: false,
                    showBottomBranch: false,
                }
                return copy
            })
        } catch (err) {
            console.error('Failed to analyze photo', err)
        } finally {
            setIsLoading(false)
            setSelectedFile(null)
            setPreviewUrl(null)
            setSelectedAltNutrient(null)
        }
    }

    const handleAddRecipeToDay = (recipe) => {
        setDays((prev) => {
            const copy = [...prev]
            const day = copy[currentDayIndex]
            if (day.chosenRecipes.find((r) => r.name === recipe.name)) return copy
            copy[currentDayIndex] = {
                ...day,
                chosenRecipes: [...day.chosenRecipes, recipe],
            }
            return copy
        })
    }

    const handleAddDay = () => {
        setDays((prev) => {
            const last = prev[prev.length - 1]
            const nextDate = new Date(last.date)
            nextDate.setDate(last.date.getDate() + 1)
            return [...prev, createDayFromDate(nextDate)]
        })
    }

    // очистка дня: удаляем фото, анализ, выборы
    const handleResetDay = () => {
        analyzeRequestIdRef.current = 0
        setIsLoading(false)
        setDays((prev) => {
            const copy = [...prev]
            const old = copy[currentDayIndex]
            copy[currentDayIndex] = createDayFromDate(old.date)
            return copy
        })
        setSelectedFile(null)
        setPreviewUrl(null)
        setFileInputKey((k) => k + 1)
        setOpenRecipe(null)
        setSelectedAltNutrient(null)
    }

    // свайп по дням (мышь + touch)
    const handleDaySwipeStart = (clientX) => {
        setSwipeStartX(clientX)
    }

    const handleDaySwipeEnd = (clientX) => {
        if (swipeStartX === null) return
        const dx = clientX - swipeStartX
        const threshold = 50

        // свайп влево => день назад
        // свайп вправо => день вперед
        if (dx < -threshold && currentDayIndex > 0) {
            switchDay(currentDayIndex - 1)
        } else if (dx > threshold && currentDayIndex < days.length - 1) {
            switchDay(currentDayIndex + 1)
        }
        setSwipeStartX(null)
    }

    const handleMouseDown = (e) => handleDaySwipeStart(e.clientX)
    const handleMouseUp = (e) => handleDaySwipeEnd(e.clientX)

    const handleTouchStart = (e) => {
        if (e.touches[0]) handleDaySwipeStart(e.touches[0].clientX)
    }
    const handleTouchEnd = (e) => {
        if (e.changedTouches[0]) handleDaySwipeEnd(e.changedTouches[0].clientX)
    }

    // показать/скрыть ветки — сохраняем в конкретный день
    const toggleRightBranch = () => {
        setDays((prev) => {
            const copy = [...prev]
            const day = copy[currentDayIndex]
            copy[currentDayIndex] = {
                ...day,
                showRightBranch: !day.showRightBranch,
            }
            return copy
        })
    }

    const toggleBottomBranch = () => {
        setDays((prev) => {
            const copy = [...prev]
            const day = copy[currentDayIndex]
            copy[currentDayIndex] = {
                ...day,
                showBottomBranch: !day.showBottomBranch,
            }
            return copy
        })
    }

    const totals = computeTotals(currentDay.chosenRecipes)
    const macroTotal =
        totals.macros.protein + totals.macros.carbs + totals.macros.fat || 1

    const macroDistribution = [
        {
            label: 'Protein',
            key: 'protein',
            value: totals.macros.protein,
            percent: (totals.macros.protein / macroTotal) * 100,
        },
        {
            label: 'Carbs',
            key: 'carbs',
            value: totals.macros.carbs,
            percent: (totals.macros.carbs / macroTotal) * 100,
        },
        {
            label: 'Fat',
            key: 'fat',
            value: totals.macros.fat,
            percent: (totals.macros.fat / macroTotal) * 100,
        },
    ]

    const microProgress = Object.entries(DAILY_NUTRIENTS).map(([key, target]) => {
        const current = totals.micros[key] || 0
        const percent = Math.min(100, (current / target) * 100 || 0)
        const label = key
            .replace('_mg', '')
            .replace('_', ' ')
            .replace('vitamin', 'Vitamin')

        let status = 'Low'
        if (percent >= 120) status = 'High'
        else if (percent >= 80) status = 'OK'

        return {
            key,
            label,
            current,
            target,
            percent,
            status,
            sources: NUTRIENT_SOURCES[key] || [],
        }
    })

    // ингредиенты, которые ещё не использованы в выбранных рецептах
    const usedIngredientNames = new Set()
    currentDay.chosenRecipes.forEach((recipe) => {
        ;(recipe.ingredients_used || []).forEach((raw) => {
            const lower = String(raw).toLowerCase()
            // берем первое слово как название
            const name = lower.split(/[0-9]/)[0].trim() // "peaches 2" -> "peaches"
            if (name) usedIngredientNames.add(name)
        })
    })

    const remainingIngredients =
        currentDay.analysis?.ingredients?.filter((ing) => {
            const name = String(ing.name || '').toLowerCase()
            if (!name) return false
            // если ингредиент фигурирует в usedIngredientNames, считаем его использованным
            for (const used of usedIngredientNames) {
                if (name.startsWith(used) || used.startsWith(name)) {
                    return false
                }
            }
            return true
        }) || []

    // рецепты, которые ещё не выбраны (чтобы исчезали после добавления)
    const baseRecipes = currentDay.analysis?.recipes || []
    let availableRecipes = baseRecipes.filter(
        (recipe) => !currentDay.chosenRecipes.some((r) => r.name === recipe.name),
    )

    // если выбрана альтернатива по нутриенту — сортируем рецепты по этому нутриенту
    if (selectedAltNutrient) {
        availableRecipes = [...availableRecipes].sort((a, b) => {
            const aVal = a.micronutrients?.[selectedAltNutrient] || 0
            const bVal = b.micronutrients?.[selectedAltNutrient] || 0
            return bVal - aVal
        })
    }

    // умные альтернативы: дефициты нутриентов -> продукты
    const deficits = microProgress.filter((n) => n.status === 'Low')
    const alternativeFoods = deficits
        .flatMap((n) => {
            const missing = n.target - n.current
            const sources = NUTRIENT_SOURCES[n.key] || []
            return sources.map((food) => ({
                id: `${n.key}-${food}`,
                food,
                nutrientKey: n.key,
                nutrientLabel: n.label,
                missing,
                importance: Math.min(1, missing / n.target), // 0..1
            }))
        })
        .sort((a, b) => b.missing - a.missing)

    // нутриенты для детальной карточки одного рецепта
    const getRecipeNutrients = (recipe) => {
        const macros = recipe.macros || {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
        }
        const micros = recipe.micronutrients || {}
        const microList = Object.entries(DAILY_NUTRIENTS).map(
            ([key, target]) => {
                const current = micros[key] || 0
                const percent = Math.min(100, (current / target) * 100 || 0)
                const label = key
                    .replace('_mg', '')
                    .replace('_', ' ')
                    .replace('vitamin', 'Vitamin')

                let status = 'Low'
                if (percent >= 120) status = 'High'
                else if (percent >= 80) status = 'OK'

                return { key, label, current, target, percent, status }
            },
        )
        return { macros, microList }
    }

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-indigo-950 via-purple-950 to-blue-950 flex flex-col">
            {/* HEADER */}
            <header className="px-10 py-5 border-b border-white/15 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">FridgeNutri Board</h1>
                    <p className="text-sm text-gray-300">
                        Фото → ингредиенты → ветка с рецептами / альтернативами → дневные нутриенты.
                    </p>
                </div>

                {/* Навигация по дням с календарём + свайп */}
                <div
                    className="flex items-center gap-2 select-none"
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={() => setSwipeStartX(null)}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    {days.map((day, idx) => (
                        <button
                            key={day.id}
                            onClick={() => switchDay(idx)}
                            className={cn(
                                'px-3 py-1 rounded-full text-xs font-medium flex flex-col items-center min-w-[52px]',
                                idx === currentDayIndex
                                    ? 'bg-blue-500 text-white shadow'
                                    : 'bg-white/10 text-gray-200 hover:bg-white/20',
                            )}
                        >
                            <span className="text-[10px] opacity-80">{day.weekday}</span>
                            <span className="text-sm font-semibold leading-none">
                {day.dayNumber}
              </span>
                        </button>
                    ))}
                    <button
                        onClick={handleAddDay}
                        className="ml-1 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* MAIN AREA */}
            <main className="relative flex-1 overflow-hidden">
                {/* Если анализа нет — один большой центрированный блок */}
                {!hasAnalysis && (
                    <div className="w-full h-full flex items-center justify-center py-10">
                        <div className="w-[460px] bg-white/5 border border-white/15 rounded-3xl p-6 backdrop-blur">
                            <h2 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">
                                Fridge photo for this day
                            </h2>

                            <div className="w-full h-72 bg-black/30 rounded-2xl flex items-center justify-center overflow-hidden mb-4">
                                {currentDay.photoUrl || previewUrl ? (
                                    <img
                                        src={previewUrl || currentDay.photoUrl}
                                        alt="Fridge"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-xs text-gray-300 text-center px-4">
                    Загрузите фото холодильника и нажмите Analyze, чтобы построить
                    ветку.
                  </span>
                                )}
                            </div>

                            <div className="space-y-3">
                                <label className="flex items-center justify-center bg-white/10 hover:bg-white/20 transition rounded-xl px-3 py-3 cursor-pointer text-sm text-gray-100">
                                    <Upload className="w-4 h-4 mr-2" />
                                    {selectedFile ? selectedFile.name : 'Upload fridge photo'}
                                    <input
                                        key={fileInputKey}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </label>

                                <div className="flex gap-2">
                                    <button
                                        onClick={handleAnalyze}
                                        disabled={!selectedFile || isLoading}
                                        className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-semibold px-3 py-3 rounded-xl flex items-center justify-center gap-2"
                                    >
                                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                        Analyze
                                    </button>

                                    {(currentDay.photoUrl ||
                                        currentDay.analysis ||
                                        selectedFile ||
                                        previewUrl) && (
                                        <button
                                            type="button"
                                            onClick={handleResetDay}
                                            className="px-3 py-3 rounded-xl text-xs bg-white/10 hover:bg-white/20 text-red-200 flex items-center gap-1"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Reset
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Если анализ есть — паутинка + drag */}
                {hasAnalysis && (
                    <motion.div
                        className="absolute"
                        drag
                        dragMomentum={false}
                        dragConstraints={{ left: -900, right: 900, top: -600, bottom: 600 }}
                    >
                        <div className="relative w-[2000px] h-[1200px]">
                            {/* 1. ФОТО — слева */}
                            <div className="absolute left-0 top-0 w-96 bg-white/5 border border-white/15 rounded-2xl p-5 backdrop-blur">
                                <div className="flex items-center justify-between mb-2">
                                    <h2 className="text-white font-semibold text-sm uppercase tracking-wide">
                                        Fridge photo
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={handleResetDay}
                                        className="text-[10px] text-red-200 hover:text-red-100 flex items-center gap-1"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                        Reset
                                    </button>
                                </div>

                                <div className="w-full h-56 bg-black/30 rounded-xl flex items-center justify-center overflow-hidden mb-3">
                                    <img
                                        src={currentDay.photoUrl}
                                        alt="Fridge"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>

                            {/* линия фото → ингредиенты */}
                            <div className="absolute left-96 top-44 w-24 h-[2px] bg-gradient-to-r from-white/40 to-transparent" />

                            {/* 2. ИНГРЕДИЕНТЫ */}
                            <div className="absolute left-[420px] top-0 w-[520px] bg-white/5 border border-white/15 rounded-2xl p-5 backdrop-blur">
                                <h2 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">
                                    Ingredients detected
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {remainingIngredients.map((ing, i) => (
                                        <span
                                            key={i}
                                            className="px-3 py-1 rounded-full bg-purple-700/60 text-xs text-white"
                                        >
                      {ing.name} ({ing.amount})
                    </span>
                                    ))}
                                    {remainingIngredients.length === 0 && (
                                        <span className="text-xs text-gray-300">
                      Все ингредиенты уже задействованы в выбранных рецептах.
                    </span>
                                    )}
                                </div>

                                <div className="flex items-center justify-between mt-4">
                                    <button
                                        onClick={toggleBottomBranch}
                                        className="flex items-center gap-1 text-[11px] text-emerald-200 hover:text-emerald-100"
                                    >
                                        <ArrowDown className="w-4 h-4" />
                                        Alternatives / add-ons
                                    </button>
                                    <button
                                        onClick={toggleRightBranch}
                                        className="flex items-center gap-1 text-[11px] text-blue-200 hover:text-blue-100"
                                    >
                                        Recipes branch
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* 3. НИЖНЯЯ ВЕТКА: умные альтернативы */}
                                {currentDay.showBottomBranch && (
                                    <div className="mt-4 bg-emerald-900/40 border border-emerald-400/40 rounded-2xl p-4 backdrop-blur">
                                        <h2 className="text-emerald-100 font-semibold mb-1 text-xs uppercase tracking-wide">
                                            Add-ons to cover nutrient gaps
                                        </h2>
                                        <p className="text-[11px] text-emerald-100/80 mb-2">
                                            Эти продукты подобраны по недостающим нутриентам. Нажмите на продукт,
                                            чтобы рецепты справа отсортировались по тому, насколько они помогают
                                            закрыть выбранный нутриент.
                                        </p>

                                        {alternativeFoods.length === 0 && (
                                            <p className="text-[11px] text-emerald-100">
                                                Все ваши дневные нутриенты уже покрыты 🎉
                                            </p>
                                        )}

                                        <div className="flex flex-wrap gap-2">
                                            {alternativeFoods.map((alt) => (
                                                <button
                                                    key={alt.id}
                                                    onClick={() =>
                                                        setSelectedAltNutrient((prev) =>
                                                            prev === alt.nutrientKey ? null : alt.nutrientKey,
                                                        )
                                                    }
                                                    className={cn(
                                                        'px-3 py-2 rounded-xl text-[11px] border transition-colors text-left',
                                                        selectedAltNutrient === alt.nutrientKey
                                                            ? 'bg-emerald-500/30 border-emerald-300 text-white'
                                                            : 'bg-emerald-600/40 border-emerald-300/40 text-emerald-50 hover:bg-emerald-500/40',
                                                    )}
                                                >
                                                    <div className="font-semibold">{alt.food}</div>
                                                    <div className="text-[10px] opacity-80">
                                                        Helps with:{' '}
                                                        <span className="font-medium">{alt.nutrientLabel}</span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-black/30 rounded-full overflow-hidden mt-1">
                                                        <div
                                                            className="h-full bg-emerald-300"
                                                            style={{ width: `${alt.importance * 100}%` }}
                                                        />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* линия ингредиенты → рецепты */}
                            {currentDay.showRightBranch && (
                                <div className="absolute left-[940px] top-44 w-24 h-[2px] bg-gradient-to-r from-white/40 to-transparent" />
                            )}

                            {/* 4. РЕЦЕПТЫ */}
                            {currentDay.showRightBranch && (
                                <div className="absolute left-[1030px] top-0 w-[520px] bg-white/5 border border-white/15 rounded-2xl p-5 backdrop-blur max-h-[520px] overflow-y-auto">
                                    <h2 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">
                                        Ready recipes from your ingredients
                                    </h2>

                                    {availableRecipes.length > 0 ? (
                                        <div className="space-y-3">
                                            {availableRecipes.map((recipe, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="bg-white/10 rounded-xl p-3 border border-white/10 cursor-pointer hover:bg-white/15"
                                                    onClick={() => setOpenRecipe(recipe)}
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div>
                                                            <h3 className="text-white font-semibold text-sm">
                                                                {recipe.name}
                                                            </h3>
                                                            <p className="text-[11px] text-gray-200 mt-1 line-clamp-2">
                                                                {recipe.instructions}
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleAddRecipeToDay(recipe)
                                                            }}
                                                            className="text-[11px] bg-blue-500 hover:bg-blue-400 text-white px-2 py-1 rounded-full"
                                                        >
                                                            Add to daily needs
                                                        </button>
                                                    </div>

                                                    <div className="mt-2 text-[11px] text-gray-200 space-y-1">
                                                        <div>
                              <span className="font-semibold text-gray-100">
                                Macros:{' '}
                              </span>
                                                            {Object.entries(recipe.macros || {}).map(
                                                                ([k, v]) => (
                                                                    <span key={k} className="mr-2">
                                    {k}: {v}
                                  </span>
                                                                ),
                                                            )}
                                                        </div>
                                                        <div>
                              <span className="font-semibold text-gray-100">
                                Micronutrients:{' '}
                              </span>
                                                            {Object.entries(recipe.micronutrients || {}).map(
                                                                ([k, v]) => (
                                                                    <span key={k} className="mr-2">
                                    {k}: {v}
                                  </span>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-300">
                                            Все рецепты на сегодня уже использованы 🎉
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* линия рецепты → daily needs */}
                            {currentDay.showRightBranch &&
                                currentDay.chosenRecipes.length > 0 && (
                                    <div className="absolute left-[1550px] top-44 w-24 h-[2px] bg-gradient-to-r from-white/40 to-transparent" />
                                )}

                            {/* 5. DAILY NEEDS */}
                            {currentDay.showRightBranch &&
                                currentDay.chosenRecipes.length > 0 && (
                                    <div className="absolute left-[1630px] top-0 w-[520px] bg-white/5 border border-white/15 rounded-2xl p-5 backdrop-blur max-h-[900px] overflow-y-auto">
                                        <h2 className="text-white font-semibold mb-2 text-sm uppercase tracking-wide">
                                            Daily needs & analytics
                                        </h2>

                                        <div className="mb-3">
                                            <h3 className="text-[11px] font-semibold text-gray-200 uppercase tracking-wide mb-1">
                                                Recipes chosen
                                            </h3>
                                            <ul className="text-[11px] text-gray-100 list-disc pl-4">
                                                {currentDay.chosenRecipes.map((r, i) => (
                                                    <li
                                                        key={i}
                                                        className="cursor-pointer hover:text-white"
                                                        onClick={() => setOpenRecipe(r)}
                                                    >
                                                        {r.name}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* макросы */}
                                        <div className="grid grid-cols-3 gap-2 mb-4">
                                            <div className="bg-blue-900/40 rounded-xl p-2 text-[11px] text-gray-100 border border-blue-400/40">
                                                <div className="text-[10px] uppercase text-blue-200/80">
                                                    Calories
                                                </div>
                                                <div className="text-sm font-semibold">
                                                    {totals.macros.calories.toFixed(0)}
                                                </div>
                                            </div>
                                            <div className="bg-emerald-900/40 rounded-xl p-2 text-[11px] text-gray-100 border border-emerald-400/40">
                                                <div className="text-[10px] uppercase text-emerald-200/80">
                                                    Protein (g)
                                                </div>
                                                <div className="text-sm font-semibold">
                                                    {totals.macros.protein.toFixed(1)}
                                                </div>
                                            </div>
                                            <div className="bg-purple-900/40 rounded-xl p-2 text-[11px] text-gray-100 border border-purple-400/40">
                                                <div className="text-[10px] uppercase text-purple-200/80">
                                                    Carbs / Fat (g)
                                                </div>
                                                <div className="text-sm font-semibold">
                                                    {totals.macros.carbs.toFixed(1)} /{' '}
                                                    {totals.macros.fat.toFixed(1)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* распределение макросов */}
                                        <div className="mb-4">
                                            <h3 className="text-[11px] font-semibold text-gray-200 uppercase tracking-wide mb-1">
                                                Macro distribution
                                            </h3>
                                            <div className="w-full h-3 rounded-full bg-black/50 overflow-hidden flex">
                                                {macroDistribution.map((m) => (
                                                    <div
                                                        key={m.key}
                                                        className={cn(
                                                            'h-full',
                                                            m.key === 'protein'
                                                                ? 'bg-emerald-400'
                                                                : m.key === 'carbs'
                                                                    ? 'bg-blue-400'
                                                                    : 'bg-yellow-400',
                                                        )}
                                                        style={{ width: `${m.percent}%` }}
                                                    />
                                                ))}
                                            </div>
                                            <div className="flex justify-between text-[10px] text-gray-300 mt-1">
                                                {macroDistribution.map((m) => (
                                                    <span key={m.key}>
                            {m.label}: {m.value.toFixed(1)} g
                          </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* микронутриенты */}
                                        <div>
                                            <h3 className="text-[11px] font-semibold text-gray-200 uppercase tracking-wide mb-2">
                                                Micronutrients vs target
                                            </h3>
                                            <div className="space-y-2">
                                                {microProgress.map((n) => (
                                                    <div
                                                        key={n.key}
                                                        className="bg-black/30 rounded-xl p-2 border border-white/5"
                                                    >
                                                        <div className="flex items-center justify-between mb-1">
                                                            <div className="text-[11px] text-gray-100">
                                                                {n.label}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-gray-300">
                                  {n.current.toFixed(1)} / {n.target}{' '}
                                    {n.key === 'protein' ? 'g' : 'mg'}
                                </span>
                                                                <span
                                                                    className={cn(
                                                                        'px-2 py-[2px] rounded-full text-[10px]',
                                                                        n.status === 'OK'
                                                                            ? 'bg-emerald-500/30 text-emerald-100 border border-emerald-400/60'
                                                                            : n.status === 'High'
                                                                                ? 'bg-yellow-500/30 text-yellow-100 border border-yellow-400/60'
                                                                                : 'bg-red-500/30 text-red-100 border border-red-400/60',
                                                                    )}
                                                                >
                                  {n.status}
                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-1">
                                                            <div
                                                                className={cn(
                                                                    'h-full',
                                                                    n.status === 'OK'
                                                                        ? 'bg-emerald-400'
                                                                        : n.status === 'High'
                                                                            ? 'bg-yellow-400'
                                                                            : 'bg-red-400',
                                                                )}
                                                                style={{ width: `${n.percent}%` }}
                                                            />
                                                        </div>
                                                        {n.status === 'Low' && n.sources.length > 0 && (
                                                            <div className="text-[10px] text-gray-300">
                                                                Try adding:{' '}
                                                                <span className="text-gray-100">
                                  {n.sources.join(', ')}
                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                        </div>
                    </motion.div>
                )}

                {/* ДЕТАЛЬНЫЙ ЭКРАН РЕЦЕПТА */}
                {openRecipe && (
                    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                        <div className="w-full max-w-2xl max-h-[90vh] bg-gradient-to-br from-indigo-950 via-purple-950 to-blue-950 border border-white/20 rounded-3xl p-6 overflow-y-auto">
                            <button
                                className="flex items-center gap-2 text-sm text-gray-200 mb-4 hover:text-white"
                                onClick={() => setOpenRecipe(null)}
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to board
                            </button>

                            <div className="grid grid-cols-1 md:grid-cols-[1.2fr,1fr] gap-6">
                                {/* левая часть: фото + описание */}
                                <div>
                                    <div className="w-full h-56 rounded-2xl overflow-hidden bg-black/40 flex items-center justify-center mb-4">
                                        <img
                                            src={getRecipeImageUrl(openRecipe)}
                                            alt={openRecipe.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    <h2 className="text-xl font-semibold text-white mb-2">
                                        {openRecipe.name}
                                    </h2>
                                    <h3 className="text-xs uppercase tracking-wide text-gray-300 mb-1">
                                        Instructions
                                    </h3>
                                    <p className="text-sm text-gray-100 whitespace-pre-line">
                                        {openRecipe.instructions}
                                    </p>

                                    {openRecipe.ingredients_used && (
                                        <>
                                            <h3 className="text-xs uppercase tracking-wide text-gray-300 mt-4 mb-1">
                                                Ingredients used
                                            </h3>
                                            <ul className="text-sm text-gray-100 list-disc pl-4">
                                                {openRecipe.ingredients_used.map((ing, idx) => (
                                                    <li key={idx}>{ing}</li>
                                                ))}
                                            </ul>
                                        </>
                                    )}
                                </div>

                                {/* правая часть: нутриенты */}
                                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                                    <h3 className="text-sm font-semibold text-white mb-3">
                                        Nutritional breakdown
                                    </h3>
                                    {(() => {
                                        const { macros, microList } = getRecipeNutrients(openRecipe)
                                        const macroSum =
                                            macros.protein + macros.carbs + macros.fat || 1
                                        const localMacroDistribution = [
                                            {
                                                label: 'Protein',
                                                key: 'protein',
                                                value: macros.protein,
                                                percent: (macros.protein / macroSum) * 100,
                                            },
                                            {
                                                label: 'Carbs',
                                                key: 'carbs',
                                                value: macros.carbs,
                                                percent: (macros.carbs / macroSum) * 100,
                                            },
                                            {
                                                label: 'Fat',
                                                key: 'fat',
                                                value: macros.fat,
                                                percent: (macros.fat / macroSum) * 100,
                                            },
                                        ]

                                        return (
                                            <>
                                                <div className="grid grid-cols-3 gap-2 mb-3 text-[11px]">
                                                    <div className="bg-blue-900/40 rounded-xl p-2 border border-blue-400/40 text-gray-100">
                                                        <div className="text-[10px] uppercase text-blue-200/80">
                                                            Calories
                                                        </div>
                                                        <div className="text-sm font-semibold">
                                                            {macros.calories.toFixed(0)}
                                                        </div>
                                                    </div>
                                                    <div className="bg-emerald-900/40 rounded-xl p-2 border border-emerald-400/40 text-gray-100">
                                                        <div className="text-[10px] uppercase text-emerald-200/80">
                                                            Protein (g)
                                                        </div>
                                                        <div className="text-sm font-semibold">
                                                            {macros.protein.toFixed(1)}
                                                        </div>
                                                    </div>
                                                    <div className="bg-purple-900/40 rounded-xl p-2 border border-purple-400/40 text-gray-100">
                                                        <div className="text-[10px] uppercase text-purple-200/80">
                                                            Carbs / Fat (g)
                                                        </div>
                                                        <div className="text-sm font-semibold">
                                                            {macros.carbs.toFixed(1)} /{' '}
                                                            {macros.fat.toFixed(1)}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mb-3">
                                                    <h4 className="text-[11px] font-semibold text-gray-200 uppercase tracking-wide mb-1">
                                                        Macro distribution
                                                    </h4>
                                                    <div className="w-full h-3 rounded-full bg-black/50 overflow-hidden flex">
                                                        {localMacroDistribution.map((m) => (
                                                            <div
                                                                key={m.key}
                                                                className={cn(
                                                                    'h-full',
                                                                    m.key === 'protein'
                                                                        ? 'bg-emerald-400'
                                                                        : m.key === 'carbs'
                                                                            ? 'bg-blue-400'
                                                                            : 'bg-yellow-400',
                                                                )}
                                                                style={{ width: `${m.percent}%` }}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="text-[11px] font-semibold text-gray-200 uppercase tracking-wide mb-2">
                                                        Micronutrients vs daily target
                                                    </h4>
                                                    <div className="space-y-2">
                                                        {microList.map((n) => (
                                                            <div
                                                                key={n.key}
                                                                className="bg-black/30 rounded-xl p-2 border border-white/5"
                                                            >
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <div className="text-[11px] text-gray-100">
                                                                        {n.label}
                                                                    </div>
                                                                    <span className="text-[10px] text-gray-300">
                                    {n.current.toFixed(1)} / {n.target}{' '}
                                                                        {n.key === 'protein' ? 'g' : 'mg'}
                                  </span>
                                                                </div>
                                                                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                                                    <div
                                                                        className={cn(
                                                                            'h-full',
                                                                            n.status === 'OK'
                                                                                ? 'bg-emerald-400'
                                                                                : n.status === 'High'
                                                                                    ? 'bg-yellow-400'
                                                                                    : 'bg-red-400',
                                                                        )}
                                                                        style={{ width: `${n.percent}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </>
                                        )
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
