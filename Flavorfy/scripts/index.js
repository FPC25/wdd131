document.addEventListener('DOMContentLoaded', async function() {
    console.log('Index.js: DOM loaded, starting recipe loading...'); // Debug
    
    // Load recipes data
    await RecipeUtils.loadRecipes();
    
    console.log('Index.js: Recipes loaded:', RecipeUtils.getRecipesData()); // Debug
    
    // Get DOM elements
    const favoritesGrid = document.querySelector('.favorites .recipe-grid');
    const savedGrid = document.querySelector('.recent .recipe-grid');
    const searchInput = document.querySelector('.search-input');
    const searchButton = document.querySelector('.search-button');
    
    // State management for search
    let currentSearch = '';
    
    // Initial render
    renderFavoritesSection();
    renderSavedSection();
    
    // Register callback to update sections when data changes
    RecipeUtils.onFavoritesChange(() => {
        console.log('Index.js: Favorites changed, re-rendering...'); // Debug
        renderFavoritesSection();
        renderSavedSection(); // Update saved section too
    });
    
    // ✅ ADICIONAR: Listen for storage changes from other pages
    window.addEventListener('storage', function(e) {
        if (e.key === 'flavorfy_favorites' || e.key === 'flavorfy_saved' || e.key === 'recipesData') {
            console.log('Index.js: Storage changed from another page, refreshing data...'); // Debug
            // Reload data and re-render
            RecipeUtils.loadRecipes().then(() => {
                renderFavoritesSection();
                renderSavedSection();
            });
        }
    });
    
    // ✅ ADICIONAR: Listen for when page becomes visible again (user returns from another page)
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            console.log('Index.js: Page became visible, refreshing data...'); // Debug
            // Reload data and re-render when page becomes visible
            RecipeUtils.loadRecipes().then(() => {
                renderFavoritesSection();
                renderSavedSection();
            });
        }
    });
    
    // Search functionality
    function performSearch() {
        currentSearch = searchInput ? searchInput.value.toLowerCase().trim() : '';
        
        if (currentSearch) {
            // Redirect to explore page with search term
            window.location.href = `./explore.html?search=${encodeURIComponent(currentSearch)}`;
        } else {
            // If no search term, just go to explore
            window.location.href = './explore.html';
        }
    }
    
    // Add search event listeners
    if (searchButton) {
        searchButton.addEventListener('click', performSearch);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        // Add visual feedback when typing
        searchInput.addEventListener('input', function() {
            if (this.value.trim()) {
                this.style.backgroundColor = '#e8f5e8';
            } else {
                this.style.backgroundColor = '';
            }
        });
    }
    
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