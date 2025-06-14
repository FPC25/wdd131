document.addEventListener('DOMContentLoaded', async function() {
    // Load recipes data
    await RecipeUtils.loadRecipes();
    
    // Get DOM elements
    const favoritesGrid = document.querySelector('.favorites .recipe-grid');
    const savedGrid = document.querySelector('.recent .recipe-grid');
    
    // Initial render
    renderFavoritesSection();
    renderSavedSection();
    
    // Register callback to update favorites section when favorites change
    RecipeUtils.onFavoritesChange(() => {
        renderFavoritesSection();
    });
    
    function renderFavoritesSection() {
        const favoriteRecipes = RecipeUtils.filterRecipes('favorites');
        RecipeUtils.renderRecipes(
            favoriteRecipes, 
            favoritesGrid, 
            'No favorite recipes yet. Start exploring and add some favorites!'
        );
    }
    
    function renderSavedSection() {
        const savedRecipes = RecipeUtils.filterRecipes('saved');
        RecipeUtils.renderRecipes(
            savedRecipes, 
            savedGrid, 
            'No saved recipes yet. <a href="./recipe.html">Add your first recipe!</a>'
        );
    }
});