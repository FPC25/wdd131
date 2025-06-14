document.addEventListener('DOMContentLoaded', async function() {
    console.log('Index.js: DOM loaded, starting recipe loading...'); // Debug
    
    // Load recipes data
    await RecipeUtils.loadRecipes();
    
    console.log('Index.js: Recipes loaded:', RecipeUtils.getRecipesData()); // Debug
    
    // Get DOM elements
    const favoritesGrid = document.querySelector('.favorites .recipe-grid');
    const savedGrid = document.querySelector('.recent .recipe-grid');
    
    // Initial render
    renderFavoritesSection();
    renderSavedSection();
    
    // Register callback to update sections when data changes
    RecipeUtils.onFavoritesChange(() => {
        console.log('Index.js: Favorites changed, re-rendering...'); // Debug
        renderFavoritesSection();
        renderSavedSection(); // Update saved section too
    });
    
    function renderFavoritesSection() {
        const favoriteRecipes = RecipeUtils.filterRecipes('favorites');
        console.log('Index.js: Rendering favorites:', favoriteRecipes); // Debug
        RecipeUtils.renderRecipes(
            favoriteRecipes, 
            favoritesGrid, 
            'No favorite recipes yet. Start exploring and add some favorites!'
        );
    }
    
    function renderSavedSection() {
        const savedRecipes = RecipeUtils.filterRecipes('saved');
        console.log('Index.js: Rendering saved:', savedRecipes); // Debug
        RecipeUtils.renderRecipes(
            savedRecipes, 
            savedGrid, 
            'No saved recipes yet. <a href="./recipe.html">Add your first recipe!</a>'
        );
    }
});