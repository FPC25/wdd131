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
    
    // Esconder loading e mostrar conteúdo
    const loadingState = document.getElementById('loading-state');
    const errorState = document.getElementById('error-state');
    const recipeContent = document.getElementById('recipe-content');
    
    if (loadingState) {
        loadingState.style.display = 'none';
    }
    if (errorState) {
        errorState.classList.remove('show');
        errorState.style.display = 'none';
    }
    if (recipeContent) {
        recipeContent.style.display = 'block';
        recipeContent.classList.add('show');
    }
}

// Exibe os dados da receita na página - COM IMAGEM CONDICIONAL
function displayRecipe(recipe) {
    // Atualizar título no header
    const headerTitle = document.getElementById('recipe-header-title');
    if (headerTitle) {
        headerTitle.textContent = recipe.name;
    }
    
    // Verificar e exibir imagem se não for placeholder
    displayRecipeImage(recipe);
    
    // Meta informações básicas
    const cookTimeElement = document.getElementById('cook-time');
    const difficultyElement = document.getElementById('difficulty');
    const servesElement = document.getElementById('serves');
    const sourceElement = document.getElementById('source');
    
    if (cookTimeElement) {
        cookTimeElement.textContent = `${recipe.cookTime.time} ${recipe.cookTime.unit}`;
    }
    if (difficultyElement) {
        difficultyElement.textContent = recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1);
    }
    if (servesElement) {
        servesElement.textContent = recipe.serves;
    }
    if (sourceElement) {
        sourceElement.textContent = recipe.source || 'Not specified';
    }
    
    // Categorias
    displayCategories(recipe);
    
    // Ingredientes
    displayIngredients(recipe);
    
    // Instruções
    displayInstructions(recipe);
}

// Exibe a imagem da receita se não for placeholder
function displayRecipeImage(recipe) {
    const imageSection = document.getElementById('recipe-image-section');
    const mainImg = document.getElementById('recipe-main-img');
    
    if (!imageSection || !mainImg) return;
    
    // Verificar se a receita tem imagem e não é placeholder
    const hasValidImage = recipe.cover && 
                         recipe.cover !== "image" && 
                         !recipe.cover.includes('placeholder.svg') &&
                         recipe.cover.trim() !== '';
    
    if (hasValidImage) {
        mainImg.src = recipe.cover;
        mainImg.alt = recipe.name;
        imageSection.style.display = 'block';
    } else {
        imageSection.style.display = 'none';
    }
}

// Exibe as categorias da receita
function displayCategories(recipe) {
    const categoriesContainer = document.getElementById('categories');
    if (!categoriesContainer) return;
    
    if (recipe.filters && recipe.filters.length > 0) {
        categoriesContainer.innerHTML = recipe.filters.map(filter => 
            `<span class="category-tag">${filter}</span>`
        ).join('');
    } else {
        categoriesContainer.innerHTML = '<span class="category-tag">Uncategorized</span>';
    }
}

// Exibe a lista de ingredientes
function displayIngredients(recipe) {
    const ingredientsList = document.getElementById('ingredients-list');
    if (!ingredientsList) return;
    
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
}

// Exibe as instruções da receita
function displayInstructions(recipe) {
    const instructionsList = document.getElementById('instructions-list');
    if (!instructionsList) return;
    
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
    
    // DEBUG: Verificar se os botões foram encontrados
    console.log('Action buttons found:', {
        favorite: !!favoriteBtn,
        save: !!saveBtn,
        calculate: !!calculateBtn
    });
    
    if (!favoriteBtn || !saveBtn || !calculateBtn) {
        console.error('Action buttons not found in DOM');
        console.log('Available elements:', {
            favoriteBtn: favoriteBtn,
            saveBtn: saveBtn,
            calculateBtn: calculateBtn
        });
        return;
    }
    
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
    
    // Botão de calcular custos - redireciona para calculadora
    calculateBtn.addEventListener('click', function() {
        if (recipe.isSaved) {
            window.location.href = `./calculator.html?recipe=${recipe.id}`;
        } else {
            // Se a receita não está salva, salvar primeiro
            RecipeUtils.toggleSaved(recipe.id);
            recipe.isSaved = true;
            updateButtonStates(recipe);
            
            setTimeout(() => {
                window.location.href = `./calculator.html?recipe=${recipe.id}`;
            }, 300);
        }
    });
}

// Atualiza o estado visual dos botões
function updateButtonStates(recipe) {
    const favoriteBtn = document.getElementById('favorite-btn');
    const saveBtn = document.getElementById('save-btn');
    
    if (!favoriteBtn || !saveBtn) return;
    
    // Botão de favorito
    favoriteBtn.classList.toggle('active', recipe.isFavorite);
    
    // Botão de salvar
    saveBtn.classList.toggle('active', recipe.isSaved);
    const saveImg = saveBtn.querySelector('img');
    if (saveImg) {
        if (recipe.isSaved) {
            saveImg.src = './images/check.svg';
            saveImg.alt = 'Saved';
        } else {
            saveImg.src = './images/plus.svg';
            saveImg.alt = 'Save';
        }
    }
}

// Configura event listeners gerais
function setupEventListeners(recipeId) {
    // Botão voltar
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            window.history.back();
        });
    }
    
    // Listener para mudanças nos favoritos/salvos de outras páginas
    RecipeUtils.onFavoritesChange(() => {
        // Recarregar dados atualizados
        const recipes = RecipeUtils.getRecipesData();
        const recipe = recipes.find(r => r.id === recipeId);
        if (recipe) {
            updateButtonStates(recipe);
        }
    });
    
    // Listener para mudanças no localStorage de outras páginas
    window.addEventListener('storage', function(e) {
        if (e.key === 'flavorfy_favorites' || e.key === 'flavorfy_saved' || e.key === 'recipesData') {
            RecipeUtils.loadRecipes().then(() => {
                const recipes = RecipeUtils.getRecipesData();
                const recipe = recipes.find(r => r.id === recipeId);
                if (recipe) {
                    updateButtonStates(recipe);
                }
            });
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
    
    // Marcar item ativo se necessário
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    navItems.forEach(item => {
        // Nenhum item específico ativo na página de detalhes
        item.classList.remove('active');
    });
}

// Configura comportamento de scroll para o bottom nav
function setupScrollBehavior() {
    let lastScrollTop = 0;
    const bottomNav = document.querySelector('.bottom-nav');
    
    if (!bottomNav) return;
    
    // Throttle function para melhor performance
    let isScrolling = false;
    
    window.addEventListener('scroll', function() {
        if (!isScrolling) {
            requestAnimationFrame(function() {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                
                if (scrollTop > lastScrollTop && scrollTop > 100) {
                    // Scrolling down - esconder navigation
                    bottomNav.classList.add('hidden');
                } else {
                    // Scrolling up - mostrar navigation
                    bottomNav.classList.remove('hidden');
                }
                
                lastScrollTop = scrollTop;
                isScrolling = false;
            });
            isScrolling = true;
        }
    });
}

// Mostra estado de erro - FIX: melhor gerenciamento de estados
function showError() {
    // Esconder loading e mostrar erro
    const loadingState = document.getElementById('loading-state');
    const errorState = document.getElementById('error-state');
    const recipeContent = document.getElementById('recipe-content');
    const pageTitle = document.getElementById('page-title');
    const headerTitle = document.getElementById('recipe-header-title');
    
    if (loadingState) {
        loadingState.style.display = 'none';
    }
    if (recipeContent) {
        recipeContent.style.display = 'none';
        recipeContent.classList.remove('show');
    }
    if (errorState) {
        errorState.style.display = 'block';
        errorState.classList.add('show');
    }
    if (pageTitle) {
        pageTitle.textContent = 'Recipe Not Found - Flavorfy';
    }
    if (headerTitle) {
        headerTitle.textContent = 'Recipe Not Found';
    }
}

// Função auxiliar para debug
function debugRecipeData(recipe) {
    console.log('Recipe data:', {
        id: recipe.id,
        name: recipe.name,
        hasIngredients: recipe.ingredients && recipe.ingredients.length > 0,
        hasInstructions: recipe.instructions && recipe.instructions.length > 0,
        hasFilters: recipe.filters && recipe.filters.length > 0,
        isSaved: recipe.isSaved,
        isFavorite: recipe.isFavorite,
        hasValidImage: recipe.cover && recipe.cover !== "image" && !recipe.cover.includes('placeholder.svg')
    });
}