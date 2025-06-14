// Utility functions for recipe management

let recipesData = [];
let updateCallbacks = [];

// Carrega receitas do localStorage ou JSON inicial
async function loadRecipes() {
    try {
        const localStorageRecipes = localStorage.getItem('recipesData');
        
        if (localStorageRecipes) {
            recipesData = JSON.parse(localStorageRecipes);
        } else {
            const response = await fetch('./scripts/recipes.json');
            if (!response.ok) throw new Error('Failed to load recipes');
            recipesData = await response.json();
            localStorage.setItem('recipesData', JSON.stringify(recipesData));
        }
        
        initializeUserDataFromServer();
        applyLocalStorageChanges();
        localStorage.setItem('recipesData', JSON.stringify(recipesData));
        
    } catch (error) {
        console.error('Error loading recipes:', error);
        recipesData = [];
    }
}

// Inicializa dados do usuário na primeira execução
function initializeUserDataFromServer() {
    const hasUserData = localStorage.getItem('flavorfy_favorites') || localStorage.getItem('flavorfy_saved');
    
    if (!hasUserData) {
        const serverFavorites = recipesData.filter(recipe => recipe.isFavorite).map(recipe => recipe.id);
        const serverSaved = recipesData.filter(recipe => recipe.isSaved).map(recipe => recipe.id);
        
        saveFavoritesToStorage(serverFavorites);
        saveSavedToStorage(serverSaved);
    }
}

// Aplica mudanças do localStorage aos dados das receitas
function applyLocalStorageChanges() {
    const favorites = getFavoritesFromStorage();
    const saved = getSavedFromStorage();
    
    recipesData.forEach(recipe => {
        const isFavorite = favorites.includes(recipe.id);
        const isSaved = saved.includes(recipe.id);
        
        recipe.isFavorite = isFavorite;
        recipe.isSaved = isSaved || isFavorite;
    });
}

// Obtém favoritos do localStorage
function getFavoritesFromStorage() {
    const favorites = localStorage.getItem('flavorfy_favorites');
    return favorites ? JSON.parse(favorites) : [];
}

// Obtém receitas salvas do localStorage
function getSavedFromStorage() {
    const saved = localStorage.getItem('flavorfy_saved');
    return saved ? JSON.parse(saved) : [];
}

// Salva favoritos no localStorage
function saveFavoritesToStorage(favorites) {
    localStorage.setItem('flavorfy_favorites', JSON.stringify(favorites));
}

// Salva receitas no localStorage
function saveSavedToStorage(saved) {
    localStorage.setItem('flavorfy_saved', JSON.stringify(saved));
}

// Cria HTML do card da receita
function createRecipeCard(recipe) {
    const favoriteClass = recipe.isFavorite ? 'active' : '';
    const savedClass = recipe.isSaved ? 'active' : '';
    const cookTime = `${recipe.cookTime.time} ${recipe.cookTime.unit}`;
    const difficulty = recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1);
    const saveIcon = recipe.isSaved ? 'check.svg' : 'plus.svg';
    const saveAlt = recipe.isSaved ? 'Saved' : 'Save';
    
    const hasImage = recipe.cover && recipe.cover !== "image" && !recipe.cover.includes('placeholder.svg');
    const imageSrc = hasImage ? recipe.cover : './images/placeholder.svg';
    const imageClass = hasImage ? 'has-photo' : 'no-photo';
    
    return `
        <div class="recipe-card" data-recipe-id="${recipe.id}">
            <div class="recipe-image ${imageClass}">
                <img src="${imageSrc}" alt="${recipe.name}">
                <div class="recipe-actions">
                    <button class="action-btn save-btn ${savedClass}" 
                            data-recipe-id="${recipe.id}" 
                            data-action="save" 
                            aria-label="Toggle save">
                        <img src="./images/${saveIcon}" alt="${saveAlt}">
                    </button>
                    <button class="action-btn favorite-btn ${favoriteClass}" 
                            data-recipe-id="${recipe.id}" 
                            data-action="favorite" 
                            aria-label="Toggle favorite">
                        <img src="./images/star.svg" alt="Favorite">
                    </button>
                </div>
            </div>
            <div class="recipe-info">
                <h3 class="recipe-name">${recipe.name}</h3>
                <div class="recipe-meta">
                    <span class="cook-time">${cookTime}</span>
                    <span class="difficulty">${difficulty}</span>
                    <span class="serves">Serves ${recipe.serves}</span>
                </div>
            </div>
        </div>
    `;
}

// Filtra receitas por critério e busca
function filterRecipes(criteria, searchTerm = '') {
    let filtered = [];
    
    switch (criteria) {
        case 'favorites':
            filtered = recipesData.filter(recipe => recipe.isFavorite === true);
            break;
        case 'saved':
            filtered = recipesData.filter(recipe => recipe.isSaved === true);
            break;
        case 'all':
        default:
            filtered = recipesData;
    }
    
    if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(recipe => {
            const nameMatch = recipe.name.toLowerCase().includes(searchLower);
            const ingredientMatch = recipe.ingredients && recipe.ingredients.some(ingredient => 
                ingredient.item && ingredient.item.toLowerCase().includes(searchLower)
            );
            const filterMatch = recipe.filters && recipe.filters.some(filter =>
                filter.toLowerCase().includes(searchLower)
            );
            
            return nameMatch || ingredientMatch || filterMatch;
        });
    }
    
    return filtered;
}

// Filtra receitas por categoria específica
function filterRecipesByCategory(category, searchTerm = '') {
    if (category === 'all') {
        return filterRecipes('all', searchTerm);
    }
    
    let filtered = recipesData.filter(recipe => 
        recipe.filters && recipe.filters.includes(category)
    );
    
    if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(recipe => {
            const nameMatch = recipe.name.toLowerCase().includes(searchLower);
            const ingredientMatch = recipe.ingredients && recipe.ingredients.some(ingredient => 
                ingredient.item && ingredient.item.toLowerCase().includes(searchLower)
            );
            
            return nameMatch || ingredientMatch;
        });
    }
    
    return filtered;
}

// Renderiza receitas no container especificado
function renderRecipes(recipes, container, emptyMessage = 'No recipes found.') {
    if (!container) return;
    
    if (recipes.length === 0) {
        container.innerHTML = `<p class="empty-message">${emptyMessage}</p>`;
        return;
    }
    
    container.innerHTML = recipes.map(recipe => createRecipeCard(recipe)).join('');
    addButtonListeners(container);
}

// Adiciona event listeners aos botões de ação
function addButtonListeners(container) {
    const actionButtons = container.querySelectorAll('.action-btn');
    const recipeCards = container.querySelectorAll('.recipe-card');
    
    // Event listeners para botões de ação
    actionButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const recipeId = parseInt(this.dataset.recipeId);
            const action = this.dataset.action;
            
            if (action === 'favorite') {
                toggleFavorite(recipeId);
            } else if (action === 'save') {
                toggleSaved(recipeId);
            }
        });
    });
    
    // Event listeners para clique no card (navegar para detalhes)
    recipeCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Verificar se o clique não foi em um botão de ação
            if (!e.target.closest('.action-btn')) {
                const recipeId = this.dataset.recipeId;
                window.location.href = `./recipe-detail.html?id=${recipeId}`;
            }
        });
        
        // Adicionar cursor pointer para indicar que é clicável
        card.style.cursor = 'pointer';
    });
}

// Alterna status de favorito
function toggleFavorite(recipeId) {
    recipeId = parseInt(recipeId);
    const recipe = recipesData.find(r => r.id === recipeId);
    
    if (recipe) {
        recipe.isFavorite = !recipe.isFavorite;
        
        const favorites = getFavoritesFromStorage();
        const saved = getSavedFromStorage();
        
        if (recipe.isFavorite) {
            if (!favorites.includes(recipeId)) {
                favorites.push(recipeId);
            }
            if (!saved.includes(recipeId)) {
                saved.push(recipeId);
            }
            recipe.isSaved = true;
        } else {
            const favIndex = favorites.indexOf(recipeId);
            if (favIndex > -1) {
                favorites.splice(favIndex, 1);
            }
        }
        
        saveFavoritesToStorage(favorites);
        saveSavedToStorage(saved);
        localStorage.setItem('recipesData', JSON.stringify(recipesData));
        
        updateAllButtons(recipeId, recipe.isFavorite, recipe.isSaved);
        notifyFavoritesChange();
        
        return recipe.isFavorite;
    }
    return false;
}

// Alterna status de salvo
function toggleSaved(recipeId) {
    recipeId = parseInt(recipeId);
    const recipe = recipesData.find(r => r.id === recipeId);
    
    if (recipe) {
        const wasOriginallyFavorite = recipe.isFavorite;
        recipe.isSaved = !recipe.isSaved;
        
        if (!recipe.isSaved && wasOriginallyFavorite) {
            recipe.isFavorite = false;
        }
        
        const favorites = getFavoritesFromStorage();
        const saved = getSavedFromStorage();
        
        if (recipe.isSaved) {
            if (!saved.includes(recipeId)) {
                saved.push(recipeId);
            }
        } else {
            const savedIndex = saved.indexOf(recipeId);
            if (savedIndex > -1) {
                saved.splice(savedIndex, 1);
            }
            
            if (wasOriginallyFavorite) {
                const favIndex = favorites.indexOf(recipeId);
                if (favIndex > -1) {
                    favorites.splice(favIndex, 1);
                }
            }
        }
        
        saveFavoritesToStorage(favorites);
        saveSavedToStorage(saved);
        localStorage.setItem('recipesData', JSON.stringify(recipesData));
        
        updateAllButtons(recipeId, recipe.isFavorite, recipe.isSaved);
        notifyFavoritesChange();
        
        return recipe.isSaved;
    }
    return false;
}

// Atualiza todos os botões de uma receita específica
function updateAllButtons(recipeId, isFavorite, isSaved) {
    const favoriteButtons = document.querySelectorAll(`[data-recipe-id="${recipeId}"][data-action="favorite"]`);
    const saveButtons = document.querySelectorAll(`[data-recipe-id="${recipeId}"][data-action="save"]`);
    
    favoriteButtons.forEach(btn => {
        btn.classList.toggle('active', isFavorite);
    });
    
    saveButtons.forEach(btn => {
        btn.classList.toggle('active', isSaved);
        const img = btn.querySelector('img');
        if (img) {
            img.src = isSaved ? './images/check.svg' : './images/plus.svg';
            img.alt = isSaved ? 'Saved' : 'Save';
        }
    });
}

// Registra callback para mudanças nos favoritos
function onFavoritesChange(callback) {
    updateCallbacks.push(callback);
}

// Notifica todos os callbacks registrados
function notifyFavoritesChange() {
    updateCallbacks.forEach(callback => callback());
}

// Obtém dados atualizados das receitas
function getRecipesData() {
    const localStorageRecipes = localStorage.getItem('recipesData');
    if (localStorageRecipes) {
        recipesData = JSON.parse(localStorageRecipes);
        applyLocalStorageChanges();
    }
    return recipesData;
}

// Sincroniza dados do usuário com servidor (implementação futura)
function syncUserDataToServer() {
    console.log('Syncing user data to server...');
}

// Reseta dados do usuário
function resetUserData() {
    localStorage.removeItem('flavorfy_favorites');
    localStorage.removeItem('flavorfy_saved');
    localStorage.removeItem('recipesData');
    
    recipesData.forEach(recipe => {
        recipe.isFavorite = false;
        recipe.isSaved = false;
    });
    
    notifyFavoritesChange();
}

// Obtém estatísticas do usuário
function getUserStats() {
    const favorites = getFavoritesFromStorage();
    const saved = getSavedFromStorage();
    
    return {
        totalRecipes: recipesData.length,
        favoriteCount: favorites.length,
        savedCount: saved.length,
        deviceId: getDeviceId()
    };
}

// Gera ID único do dispositivo
function getDeviceId() {
    let deviceId = localStorage.getItem('flavorfy_device_id');
    if (!deviceId) {
        deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('flavorfy_device_id', deviceId);
    }
    return deviceId;
}

// Exporta funções para uso em outros arquivos
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
    syncUserDataToServer,
    resetUserData,
    getUserStats
};