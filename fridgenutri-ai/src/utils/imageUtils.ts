export const getRecipeImageUrl = (recipe: Recipe) => {
    if (recipe.imageUrl) return recipe.imageUrl;
    const query = encodeURIComponent(`${recipe.name} food dish`);
    return `https://source.unsplash.com/featured/800x600/?${query}`;
};