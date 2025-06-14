// Utility functions for recipe management

let recipesData = [];
let updateCallbacks = [];

// Load recipes data and apply localStorage changes
async function loadRecipes() {
    try {
        // 1. Primeiro, tentar carregar receitas do localStorage
        const localStorageRecipes = localStorage.getItem('recipesData');
        
        if (localStorageRecipes) {
            console.log('Loading recipes from localStorage...');
            recipesData = JSON.parse(localStorageRecipes);
        } else {
            // 2. Se não há no localStorage, carregar do JSON
            console.log('Loading recipes from JSON file...');
            const response = await fetch('./scripts/recipes.json');
            if (!response.ok) throw new Error('Failed to load recipes');
            recipesData = await response.json();
            
            // 3. Salvar no localStorage pela primeira vez
            localStorage.setItem('recipesData', JSON.stringify(recipesData));
        }
        
        console.log('Recipes loaded:', recipesData.length);
        
        // 4. Aplicar dados do usuário (favoritos/salvos)
        initializeUserDataFromServer();
        applyLocalStorageChanges();
        
    } catch (error) {
        console.error('Error loading recipes:', error);
        recipesData = [];
    }
}

// Initialize user data from "server" (JSON) on first device access
function initializeUserDataFromServer() {
    const userDataLoaded = localStorage.getItem('flavorfy_user_data_loaded');
    
    if (!userDataLoaded) {
        console.log('First time on this device - loading user data from server...');
        
        // Simulate loading user's saved data from server (JSON file)
        const userFavorites = recipesData
            .filter(recipe => recipe.favorite === true)
            .map(recipe => recipe.id);
            
        const userSaved = recipesData
            .filter(recipe => recipe.saved === true)
            .map(recipe => recipe.id);
        
        // Ensure that all favorites are also in saved (business rule)
        const allUserSaved = [...new Set([...userSaved, ...userFavorites])];
        
        // Save user data to localStorage (sync with device)
        saveFavoritesToStorage(userFavorites);
        saveSavedToStorage(allUserSaved);
        
        // Mark that user data has been loaded to this device
        localStorage.setItem('flavorfy_user_data_loaded', 'true');
        localStorage.setItem('flavorfy_sync_date', new Date().toISOString());
        
        console.log('User data synced to device:', { 
            favorites: userFavorites, 
            saved: allUserSaved,
            syncDate: new Date().toISOString()
        });
    } else {
        const syncDate = localStorage.getItem('flavorfy_sync_date');
        console.log('User data already synced to this device on:', syncDate);
        console.log('Using local data...');
    }
}

// Apply changes from localStorage to recipes data
function applyLocalStorageChanges() {
    const favorites = getFavoritesFromStorage();
    const saved = getSavedFromStorage();
    
    console.log('Applying user data to recipes:', { favorites, saved });
    
    recipesData.forEach(recipe => {
        const isFavorite = favorites.includes(recipe.id);
        const isSaved = saved.includes(recipe.id);
        
        // Update recipe state with user data
        recipe.favorite = isFavorite;
        recipe.saved = isSaved || isFavorite; // Business rule: favorite implies saved
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
    // Update sync date when user makes changes
    localStorage.setItem('flavorfy_last_change', new Date().toISOString());
}

// Save saved recipes to localStorage
function saveSavedToStorage(saved) {
    localStorage.setItem('flavorfy_saved', JSON.stringify(saved));
    // Update sync date when user makes changes
    localStorage.setItem('flavorfy_last_change', new Date().toISOString());
}

// Simulate syncing user data back to server (for future implementation)
function syncUserDataToServer() {
    const userData = {
        favorites: getFavoritesFromStorage(),
        saved: getSavedFromStorage(),
        lastChange: localStorage.getItem('flavorfy_last_change'),
        deviceId: getDeviceId()
    };
    
    console.log('Syncing user data to server:', userData);
    // In a real app, this would be an API call
    // await fetch('/api/user/sync', { method: 'POST', body: JSON.stringify(userData) });
}

// Generate simple device ID for tracking
function getDeviceId() {
    let deviceId = localStorage.getItem('flavorfy_device_id');
    if (!deviceId) {
        deviceId = 'device_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('flavorfy_device_id', deviceId);
    }
    return deviceId;
}

// Reset user data (simulate logout or new user)
function resetUserData() {
    const confirmReset = confirm('This will reset all your saved recipes and favorites. Continue?');
    if (confirmReset) {
        localStorage.removeItem('flavorfy_user_data_loaded');
        localStorage.removeItem('flavorfy_favorites');
        localStorage.removeItem('flavorfy_saved');
        localStorage.removeItem('flavorfy_sync_date');
        localStorage.removeItem('flavorfy_last_change');
        console.log('User data reset - will reload from server on next refresh');
        alert('User data reset! Refresh the page to reload from server.');
    }
}

// Get user stats
function getUserStats() {
    const stats = {
        totalFavorites: getFavoritesFromStorage().length,
        totalSaved: getSavedFromStorage().length,
        deviceId: getDeviceId(),
        syncDate: localStorage.getItem('flavorfy_sync_date'),
        lastChange: localStorage.getItem('flavorfy_last_change'),
        isFirstTime: !localStorage.getItem('flavorfy_user_data_loaded')
    };
    
    console.log('User stats:', stats);
    return stats;
}

// Register callback for when favorites/saved change
function onFavoritesChange(callback) {
    updateCallbacks.push(callback);
}

// Notify all callbacks when favorites/saved change
function notifyFavoritesChange() {
    updateCallbacks.forEach(callback => callback());
}

// Create recipe card HTML
function createRecipeCard(recipe) {
    const favoriteClass = recipe.favorite ? 'active' : '';
    const savedClass = recipe.saved ? 'active' : '';
    const cookTime = `${recipe.cookTime.time} ${recipe.cookTime.unit}`;
    const difficulty = recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1);
    
    // Choose the correct icon based on saved status
    const saveIcon = recipe.saved ? 'check.svg' : 'plus.svg';
    const saveAlt = recipe.saved ? 'Saved' : 'Save';
    
    // CORREÇÃO: Verificar se tem imagem real e aplicar classes diferentes
    const hasImage = recipe.cover && recipe.cover !== "image" && !recipe.cover.includes('placeholder.svg');
    const imageSrc = hasImage ? recipe.cover : './images/placeholder.svg';
    const imageClass = hasImage ? 'has-photo' : 'no-photo';
    
    return `
        <div class="recipe-card" data-recipe-id="${recipe.id}">
            <div class="recipe-image ${imageClass}">
                <img src="${imageSrc}" alt="${recipe.name}">
            </div>
            <div class="recipe-info">
                <div class="recipe-header">
                    <h3>${recipe.name}</h3>
                    <div class="recipe-actions">
                        <button class="save-btn ${savedClass}" aria-label="${saveAlt} recipe" data-recipe="${recipe.id}">
                            <img src="./images/${saveIcon}" alt="Save">
                        </button>
                        <button class="favorite-btn ${favoriteClass}" aria-label="Add to favorites" data-recipe="${recipe.id}"></button>
                    </div>
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
        filtered = filtered.filter(recipe => {
            // Search in recipe name
            const nameMatch = recipe.name.toLowerCase().includes(searchLower);
            
            // Search in ingredients
            const ingredientMatch = recipe.ingredients && recipe.ingredients.some(ingredient => 
                ingredient.item && ingredient.item.toLowerCase().includes(searchLower)
            );
            
            // Search in filters/categories - usar tanto 'filters' quanto 'Filters' para compatibilidade
            const filterMatch = (recipe.filters || recipe.Filters || []).some(filter => 
                filter && filter.toLowerCase().includes(searchLower)
            );
            
            // Search in source
            const sourceMatch = recipe.source && recipe.source.toLowerCase().includes(searchLower);
            
            // Search in difficulty
            const difficultyMatch = recipe.difficulty && recipe.difficulty.toLowerCase().includes(searchLower);
            
            return nameMatch || ingredientMatch || filterMatch || sourceMatch || difficultyMatch;
        });
    }
    
    return filtered;
}

// Filter recipes by category
function filterRecipesByCategory(category, searchTerm = '') {
    let filtered = category === 'all' ? recipesData : 
        recipesData.filter(recipe => {
            const recipeFilters = recipe.filters || recipe.Filters || [];
            return recipeFilters.some(filter => 
                filter && filter.toLowerCase() === category.toLowerCase()
            );
        });
    
    // Apply search filter if provided
    if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(recipe => {
            // Search in recipe name
            const nameMatch = recipe.name.toLowerCase().includes(searchLower);
            
            // Search in ingredients
            const ingredientMatch = recipe.ingredients && recipe.ingredients.some(ingredient => 
                ingredient.item && ingredient.item.toLowerCase().includes(searchLower)
            );
            
            // Search in filters/categories
            const filterMatch = (recipe.filters || recipe.Filters || []).some(filter => 
                filter && filter.toLowerCase().includes(searchLower)
            );
            
            // Search in source
            const sourceMatch = recipe.source && recipe.source.toLowerCase().includes(searchLower);
            
            // Search in difficulty
            const difficultyMatch = recipe.difficulty && recipe.difficulty.toLowerCase().includes(searchLower);
            
            return nameMatch || ingredientMatch || filterMatch || sourceMatch || difficultyMatch;
        });
    }
    
    return filtered;
}

// Toggle favorite status
function toggleFavorite(recipeId) {
    recipeId = parseInt(recipeId);
    const recipe = recipesData.find(r => r.id === recipeId);
    
    if (recipe) {
        recipe.favorite = !recipe.favorite;
        
        // Update localStorage
        const favorites = getFavoritesFromStorage();
        const saved = getSavedFromStorage();
        
        if (recipe.favorite) {
            // Add to favorites
            if (!favorites.includes(recipeId)) {
                favorites.push(recipeId);
            }
            // Business rule: favorite implies saved
            if (!saved.includes(recipeId)) {
                saved.push(recipeId);
            }
            recipe.saved = true;
        } else {
            // Remove from favorites
            const favIndex = favorites.indexOf(recipeId);
            if (favIndex > -1) {
                favorites.splice(favIndex, 1);
            }
            // Don't automatically remove from saved
        }
        
        saveFavoritesToStorage(favorites);
        saveSavedToStorage(saved);
        
        // Update all buttons for this recipe across all pages
        updateAllButtons(recipeId, recipe.favorite, recipe.saved);
        
        // Notify all callbacks that data changed
        notifyFavoritesChange();
        
        console.log(`Recipe ${recipe.name} favorite: ${recipe.favorite}, saved: ${recipe.saved}`);
        return recipe.favorite;
    }
    return false;
}

// Toggle saved status
function toggleSaved(recipeId) {
    recipeId = parseInt(recipeId);
    const recipe = recipesData.find(r => r.id === recipeId);
    
    if (recipe) {
        const wasOriginallyFavorite = recipe.favorite;
        
        // Toggle saved status
        recipe.saved = !recipe.saved;
        
        // If removing from saved and it was favorited, also remove from favorites
        if (!recipe.saved && wasOriginallyFavorite) {
            recipe.favorite = false;
            console.log(`Recipe ${recipe.name} removed from both favorites and saved`);
        }
        
        // Update localStorage
        const favorites = getFavoritesFromStorage();
        const saved = getSavedFromStorage();
        
        if (recipe.saved) {
            // Adding to saved
            if (!saved.includes(recipeId)) {
                saved.push(recipeId);
            }
        } else {
            // Removing from saved
            const savedIndex = saved.indexOf(recipeId);
            if (savedIndex > -1) {
                saved.splice(savedIndex, 1);
            }
            
            // If it was favorited, also remove from favorites
            if (wasOriginallyFavorite) {
                const favIndex = favorites.indexOf(recipeId);
                if (favIndex > -1) {
                    favorites.splice(favIndex, 1);
                }
            }
        }
        
        saveFavoritesToStorage(favorites);
        saveSavedToStorage(saved);
        
        // Update all buttons for this recipe across all pages
        updateAllButtons(recipeId, recipe.favorite, recipe.saved);
        
        // Notify all callbacks that data changed
        notifyFavoritesChange();
        
        console.log(`Recipe ${recipe.name} favorite: ${recipe.favorite}, saved: ${recipe.saved}`);
        return recipe.saved;
    }
    return false;
}

// Update all buttons for a specific recipe across all containers
function updateAllButtons(recipeId, isFavorite, isSaved) {
    const allFavoriteButtons = document.querySelectorAll(`[data-recipe="${recipeId}"].favorite-btn`);
    const allSaveButtons = document.querySelectorAll(`[data-recipe="${recipeId}"].save-btn`);
    
    // Update favorite buttons
    allFavoriteButtons.forEach(button => {
        button.classList.toggle('active', isFavorite);
    });
    
    // Update save buttons
    allSaveButtons.forEach(button => {
        // Add animation class
        button.classList.add('changing');
        
        setTimeout(() => {
            // Update the button state
            button.classList.toggle('active', isSaved);
            
            // Update the icon with smooth transition
            const img = button.querySelector('img');
            if (img) {
                const newIcon = isSaved ? 'check.svg' : 'plus.svg';
                const newAlt = isSaved ? 'Saved' : 'Save';
                
                img.src = `./images/${newIcon}`;
                img.alt = newAlt;
                button.setAttribute('aria-label', `${newAlt} recipe`);
            }
            
            // Remove disabled state since we can now unsave favorited recipes
            button.classList.remove('disabled');
            button.removeAttribute('title');
            
            // Remove animation class
            button.classList.remove('changing');
        }, 200);
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
    addButtonListeners(container);
}

// Universal button listeners
function addButtonListeners(container) {
    // Favorite button listeners
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
    
    // Save button listeners
    const saveButtons = container.querySelectorAll('.save-btn');
    saveButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const recipeId = parseInt(this.dataset.recipe);
            
            // Add immediate visual feedback
            this.classList.add('changing');
            
            // Toggle saved state (now works for favorited recipes too)
            const isNowSaved = toggleSaved(recipeId);
            
            // If we're in favorites section and recipe was unsaved (which removes favorite too)
            const favoritesSection = container.closest('.favorites');
            if (!isNowSaved && favoritesSection) {
                this.closest('.recipe-card').remove();
                if (container.children.length === 0) {
                    container.innerHTML = '<p>No favorite recipes yet. Start exploring and add some favorites!</p>';
                }
            }
        });
    });
}

// Adicionar função para obter dados atualizados
function getRecipesData() {
    // Sempre carregar dados mais recentes do localStorage
    const localStorageRecipes = localStorage.getItem('recipesData');
    if (localStorageRecipes) {
        recipesData = JSON.parse(localStorageRecipes);
    }
    return recipesData;
}

// ADICIONAR a função refreshAllData que estava faltando
function refreshAllData() {
    // Aplicar mudanças e salvar
    applyLocalStorageChanges();
    localStorage.setItem('recipesData', JSON.stringify(recipesData));
    
    // Notificar callbacks
    notifyFavoritesChange();
    
    console.log('Data refreshed:', {
        totalRecipes: recipesData.length,
        favorites: recipesData.filter(r => r.favorite).length,
        saved: recipesData.filter(r => r.saved).length
    });
}

// Export functions for use in other files - ADICIONAR refreshAllData
window.RecipeUtils = {
    loadRecipes,
    createRecipeCard,
    filterRecipes,
    filterRecipesByCategory,
    toggleFavorite,
    toggleSaved,
    renderRecipes,
    addButtonListeners,
    onFavoritesChange,
    getRecipesData,
    getFavoritesFromStorage,
    getSavedFromStorage,
    saveFavoritesToStorage,
    saveSavedToStorage,
    refreshAllData,  // ✅ ADICIONAR esta linha
    syncUserDataToServer,
    resetUserData,
    getUserStats
};