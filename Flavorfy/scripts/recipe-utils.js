// Utility functions for recipe management

let recipesData = [];
let updateCallbacks = [];

// Load recipes data and apply localStorage changes
async function loadRecipes() {
    try {
        const response = await fetch('./scripts/recipes.json');
        recipesData = await response.json();
        
        // Apply localStorage changes
        applyLocalStorageChanges();
        
        return recipesData;
    } catch (error) {
        console.error('Error loading recipes:', error);
        return [];
    }
}

// Apply changes from localStorage to recipes data
function applyLocalStorageChanges() {
    const favorites = getFavoritesFromStorage();
    const saved = getSavedFromStorage();
    
    recipesData.forEach(recipe => {
        recipe.favorite = favorites.includes(recipe.id);
        recipe.saved = saved.includes(recipe.id);
    });
}

// Get favorites from localStorage
function getFavoritesFromStorage() {
    const favorites = localStorage.getItem('flavorfy_favorites');
    return favorites ? JSON.parse(favorites) : [];
}

// Get saved recipes from localStorage
function getSavedFromStorage() {
    const saved = localStorage.getItem('flavorfy_saved');
    return saved ? JSON.parse(saved) : [];
}

// Save favorites to localStorage
function saveFavoritesToStorage(favorites) {
    localStorage.setItem('flavorfy_favorites', JSON.stringify(favorites));
}

// Save saved recipes to localStorage
function saveSavedToStorage(saved) {
    localStorage.setItem('flavorfy_saved', JSON.stringify(saved));
}

// Register callback for when favorites change
function onFavoritesChange(callback) {
    updateCallbacks.push(callback);
}

// Notify all callbacks when favorites change
function notifyFavoritesChange() {
    updateCallbacks.forEach(callback => callback());
}

// Create recipe card HTML
function createRecipeCard(recipe) {
    const favoriteClass = recipe.favorite ? 'active' : '';
    const cookTime = `${recipe.cookTime.time} ${recipe.cookTime.unit}`;
    const difficulty = recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1);
    
    return `
        <div class="recipe-card" data-recipe-id="${recipe.id}">
            <div class="recipe-image">
                <img src="./images/placeholder.svg" alt="${recipe.name}">
            </div>
            <div class="recipe-info">
                <div class="recipe-header">
                    <h3>${recipe.name}</h3>
                    <button class="favorite-btn ${favoriteClass}" aria-label="Add to favorites" data-recipe="${recipe.id}"></button> 
                </div>
                <p>${difficulty} • ${cookTime} • Serves ${recipe.serves}</p>
            </div>
        </div>
    `;
}

// Filter recipes by criteria
function filterRecipes(criteria, searchTerm = '') {
    let filtered = [];
    
    switch (criteria) {
        case 'favorites':
            filtered = recipesData.filter(recipe => recipe.favorite === true);
            break;
        case 'saved':
            filtered = recipesData.filter(recipe => recipe.saved === true);
            break;
        case 'all':
        default:
            filtered = recipesData;
    }
    
    // Apply search filter if provided
    if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(recipe => 
            recipe.name.toLowerCase().includes(searchLower) ||
            recipe.ingredients.some(ingredient => 
                ingredient.item.toLowerCase().includes(searchLower)
            ) ||
            recipe.Filters.some(filter => 
                filter.toLowerCase().includes(searchLower)
            )
        );
    }
    
    return filtered;
}

// Filter recipes by category
function filterRecipesByCategory(category, searchTerm = '') {
    let filtered = category === 'all' ? recipesData : 
        recipesData.filter(recipe => 
            recipe.Filters.some(filter => 
                filter.toLowerCase() === category.toLowerCase()
            )
        );
    
    // Apply search filter if provided
    if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(recipe => 
            recipe.name.toLowerCase().includes(searchLower) ||
            recipe.ingredients.some(ingredient => 
                ingredient.item.toLowerCase().includes(searchLower)
            ) ||
            recipe.Filters.some(filter => 
                filter.toLowerCase().includes(searchLower)
            )
        );
    }
    
    return filtered;
}

// Toggle favorite status
function toggleFavorite(recipeId) {
    recipeId = parseInt(recipeId); // Ensure it's a number
    const recipe = recipesData.find(r => r.id === recipeId);
    
    if (recipe) {
        recipe.favorite = !recipe.favorite;
        
        // Update localStorage
        const favorites = getFavoritesFromStorage();
        if (recipe.favorite) {
            if (!favorites.includes(recipeId)) {
                favorites.push(recipeId);
            }
        } else {
            const index = favorites.indexOf(recipeId);
            if (index > -1) {
                favorites.splice(index, 1);
            }
        }
        saveFavoritesToStorage(favorites);
        
        // Update all favorite buttons for this recipe across all pages
        updateAllFavoriteButtons(recipeId, recipe.favorite);
        
        // Notify all callbacks that favorites have changed
        notifyFavoritesChange();
        
        console.log(`Recipe ${recipe.name} favorite status: ${recipe.favorite}`);
        return recipe.favorite;
    }
    return false;
}

// Toggle saved status
function toggleSaved(recipeId) {
    recipeId = parseInt(recipeId);
    const recipe = recipesData.find(r => r.id === recipeId);
    
    if (recipe) {
        recipe.saved = !recipe.saved;
        
        // Update localStorage
        const saved = getSavedFromStorage();
        if (recipe.saved) {
            if (!saved.includes(recipeId)) {
                saved.push(recipeId);
            }
        } else {
            const index = saved.indexOf(recipeId);
            if (index > -1) {
                saved.splice(index, 1);
            }
        }
        saveSavedToStorage(saved);
        
        console.log(`Recipe ${recipe.name} saved status: ${recipe.saved}`);
        return recipe.saved;
    }
    return false;
}

// Update all favorite buttons for a specific recipe across all containers
function updateAllFavoriteButtons(recipeId, isFavorite) {
    const allFavoriteButtons = document.querySelectorAll(`[data-recipe="${recipeId}"]`);
    allFavoriteButtons.forEach(button => {
        if (isFavorite) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

// Universal render function for all pages
function renderRecipes(recipes, container, emptyMessage = 'No recipes found.') {
    if (!container) return;
    
    if (recipes.length === 0) {
        container.innerHTML = `<p>${emptyMessage}</p>`;
        return;
    }
    
    container.innerHTML = recipes.map(recipe => createRecipeCard(recipe)).join('');
    addFavoriteButtonListeners(container);
}

// Universal favorite button listener
function addFavoriteButtonListeners(container) {
    const favoriteButtons = container.querySelectorAll('.favorite-btn');
    favoriteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const recipeId = parseInt(this.dataset.recipe);
            const isNowFavorite = toggleFavorite(recipeId);
            
            // If we're in favorites section and recipe was unfavorited, remove it
            const favoritesSection = container.closest('.favorites');
            if (!isNowFavorite && favoritesSection) {
                this.closest('.recipe-card').remove();
                if (container.children.length === 0) {
                    container.innerHTML = '<p>No favorite recipes yet. Start exploring and add some favorites!</p>';
                }
            }
        });
    });
}

// Export functions for use in other files
window.RecipeUtils = {
    loadRecipes,
    createRecipeCard,
    filterRecipes,
    filterRecipesByCategory,
    toggleFavorite,
    toggleSaved,
    renderRecipes,
    addFavoriteButtonListeners,
    onFavoritesChange,
    getRecipesData: () => recipesData,
    getFavoritesFromStorage,
    getSavedFromStorage
};