document.addEventListener('DOMContentLoaded', async function() {
    // Carregar receitas primeiro
    await RecipeUtils.loadRecipes();
    
    // Obter ID da receita da URL
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = parseInt(urlParams.get('id'));
    
    if (!recipeId) {
        showError();
        return;
    }
    
    // Carregar e exibir receita
    loadRecipeDetail(recipeId);
    
    // Configurar event listeners
    setupEventListeners(recipeId);
    
    // Configurar bottom navigation
    setupBottomNavigation();
    
    // Auto-hide bottom navigation on scroll
    setupScrollBehavior();
});

// Carrega e exibe os detalhes da receita
function loadRecipeDetail(recipeId) {
    const recipes = RecipeUtils.getRecipesData();
    const recipe = recipes.find(r => r.id === recipeId);
    
    if (!recipe) {
        showError();
        return;
    }
    
    // Atualizar título da página
    document.getElementById('page-title').textContent = `${recipe.name} - Flavorfy`;
    
    // Exibir conteúdo da receita
    displayRecipe(recipe);
    
    // Configurar botões de ação
    setupActionButtons(recipe);
    
    // UPDATED: Use CSS classes instead of inline styles
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('recipe-content').classList.add('show');
}

// Exibe os dados da receita na página
function displayRecipe(recipe) {
    // Atualizar título no header - NOVO
    const headerTitle = document.getElementById('recipe-header-title');
    if (headerTitle) {
        headerTitle.textContent = recipe.name;
    }
    
    // Imagem
    const imageElement = document.getElementById('recipe-image');
    const hasImage = recipe.cover && recipe.cover !== "image" && !recipe.cover.includes('placeholder.svg');
    
    if (hasImage) {
        imageElement.src = recipe.cover;
        imageElement.alt = recipe.name;
        imageElement.classList.remove('no-image');
    } else {
        imageElement.src = './images/placeholder.svg';
        imageElement.alt = 'No image available';
        imageElement.classList.add('no-image');
    }
    
    // Meta informações
    document.getElementById('cook-time').textContent = `${recipe.cookTime.time} ${recipe.cookTime.unit}`;
    document.getElementById('difficulty').textContent = recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1);
    document.getElementById('serves').textContent = recipe.serves;
    document.getElementById('source').textContent = recipe.source || 'Not specified';
    
    // Categorias
    const categoriesContainer = document.getElementById('categories');
    if (recipe.filters && recipe.filters.length > 0) {
        categoriesContainer.innerHTML = recipe.filters.map(filter => 
            `<span class="category-tag">${filter}</span>`
        ).join('');
    } else {
        categoriesContainer.innerHTML = '<span class="category-tag">Uncategorized</span>';
    }
    
    // Ingredientes
    const ingredientsList = document.getElementById('ingredients-list');
    if (recipe.ingredients && recipe.ingredients.length > 0) {
        ingredientsList.innerHTML = recipe.ingredients.map(ingredient => {
            const quantity = ingredient.quantity;
            const unit = ingredient.unit ? ` ${ingredient.unit}` : '';
            const quantityText = `${quantity}${unit}`;
            
            return `
                <li class="ingredient-item">
                    <span class="ingredient-quantity">${quantityText}</span>
                    <span class="ingredient-name">${ingredient.item}</span>
                </li>
            `;
        }).join('');
    } else {
        ingredientsList.innerHTML = '<li class="ingredient-item">No ingredients specified</li>';
    }
    
    // Instruções
    const instructionsList = document.getElementById('instructions-list');
    if (recipe.instructions && recipe.instructions.length > 0) {
        instructionsList.innerHTML = recipe.instructions.map(instruction => 
            `<li class="instruction-item">${instruction}</li>`
        ).join('');
    } else {
        instructionsList.innerHTML = '<li class="instruction-item">No instructions provided</li>';
    }
}

// Configura os botões de ação (favorito, salvar e calcular)
function setupActionButtons(recipe) {
    const favoriteBtn = document.getElementById('favorite-btn');
    const saveBtn = document.getElementById('save-btn');
    const calculateBtn = document.getElementById('calculate-btn');
    
    // Estado inicial dos botões
    updateButtonStates(recipe);
    
    // Event listeners
    favoriteBtn.addEventListener('click', function() {
        const newState = RecipeUtils.toggleFavorite(recipe.id);
        recipe.isFavorite = newState;
        updateButtonStates(recipe);
    });
    
    saveBtn.addEventListener('click', function() {
        const newState = RecipeUtils.toggleSaved(recipe.id);
        recipe.isSaved = newState;
        updateButtonStates(recipe);
    });
    
    // Botão de calcular custos
    calculateBtn.addEventListener('click', function() {
        window.location.href = `./calculator.html?recipe=${recipe.id}`;
    });
}

// Atualiza o estado visual dos botões
function updateButtonStates(recipe) {
    const favoriteBtn = document.getElementById('favorite-btn');
    const saveBtn = document.getElementById('save-btn');
    
    // Botão de favorito
    favoriteBtn.classList.toggle('active', recipe.isFavorite);
    
    // Botão de salvar
    saveBtn.classList.toggle('active', recipe.isSaved);
    const saveImg = saveBtn.querySelector('img');
    if (recipe.isSaved) {
        saveImg.src = './images/check.svg';
        saveImg.alt = 'Saved';
    } else {
        saveImg.src = './images/plus.svg';
        saveImg.alt = 'Save';
    }
}

// Configura event listeners gerais
function setupEventListeners(recipeId) {
    // Botão voltar
    document.getElementById('back-btn').addEventListener('click', function() {
        window.history.back();
    });
    
    // Listener para mudanças nos favoritos/salvos
    RecipeUtils.onFavoritesChange(() => {
        // Recarregar dados atualizados
        const recipes = RecipeUtils.getRecipesData();
        const recipe = recipes.find(r => r.id === recipeId);
        if (recipe) {
            updateButtonStates(recipe);
        }
    });
}

// Configura bottom navigation
function setupBottomNavigation() {
    // Favoritos no bottom nav
    const favoritesNavItem = document.getElementById('favorites-nav');
    if (favoritesNavItem) {
        favoritesNavItem.addEventListener('click', function(e) {
            e.preventDefault();
            // Navegar para explore com filtro de favoritos
            window.location.href = './explore.html?filter=favorites';
        });
    }
}

// Configura comportamento de scroll para o bottom nav
function setupScrollBehavior() {
    let lastScrollTop = 0;
    const bottomNav = document.querySelector('.bottom-nav');
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            bottomNav.classList.add('hidden');
        } else {
            // Scrolling up
            bottomNav.classList.remove('hidden');
        }
        
        lastScrollTop = scrollTop;
    });
}

// Mostra estado de erro
function showError() {
    // UPDATED: Use CSS classes instead of inline styles
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('error-state').classList.add('show');
    document.getElementById('page-title').textContent = 'Recipe Not Found - Flavorfy';
    
    // Update header title for error state
    const headerTitle = document.getElementById('recipe-header-title');
    if (headerTitle) {
        headerTitle.textContent = 'Recipe Not Found';
    }
}