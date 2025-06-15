document.addEventListener('DOMContentLoaded', async function() {
    // Carregar dados das receitas
    await RecipeUtils.loadRecipes();
    
    // Obter elementos DOM que existem no index.html
    const favoritesGrid = document.querySelector('.favorites .recipe-grid');
    const savedGrid = document.querySelector('.recent .recipe-grid');
    const searchInput = document.querySelector('.search-input');
    const searchButton = document.querySelector('.search-button');
    
    // Estado da busca
    let currentSearch = '';
    
    // Renderização inicial
    renderFavoritesSection();
    renderSavedSection();
    displayUserRecipes();
    
    // Registrar callback para mudanças nos dados
    RecipeUtils.onFavoritesChange(() => {
        renderFavoritesSection();
        renderSavedSection();
    });
    
    // Escutar mudanças no localStorage de outras páginas
    window.addEventListener('storage', function(e) {
        if (e.key === 'flavorfy_favorites' || e.key === 'flavorfy_saved' || e.key === 'recipesData') {
            RecipeUtils.loadRecipes().then(() => {
                renderFavoritesSection();
                renderSavedSection();
            });
        }
    });
    
    // Atualizar quando a página ficar visível
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            RecipeUtils.loadRecipes().then(() => {
                renderFavoritesSection();
                renderSavedSection();
            });
        }
    });
    
    // Função de busca
    function performSearch() {
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            // Redirecionar para explore com parâmetro de busca
            window.location.href = `./explore.html?search=${encodeURIComponent(searchTerm)}`;
        }
    }
    
    // Event listeners para busca
    if (searchButton) {
        searchButton.addEventListener('click', performSearch);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        // Feedback visual durante digitação
        searchInput.addEventListener('input', function() {
            if (this.value.trim()) {
                this.style.backgroundColor = '#e8f5e8';
            } else {
                this.style.backgroundColor = '';
            }
        });
    }
    
    // Renderizar seção de favoritos
    function renderFavoritesSection() {
        const favoriteRecipes = RecipeUtils.filterRecipes('favorites', currentSearch);
        const emptyMessage = 'No favorite recipes yet. Start exploring and add some favorites!';
        RecipeUtils.renderRecipes(favoriteRecipes, favoritesGrid, emptyMessage);
    }
    
    // Renderizar seção de receitas salvas
    function renderSavedSection() {
        const savedRecipes = RecipeUtils.filterRecipes('saved', currentSearch);
        const emptyMessage = 'No saved recipes yet. Create your first recipe or save some from explore!';
        RecipeUtils.renderRecipes(savedRecipes, savedGrid, emptyMessage);
    }
    
    // Exibe as receitas do usuário incluindo drafts
    function displayUserRecipes() {
        const container = document.querySelector('.your-recipes .recipe-grid');
        if (!container) return;
        
        // Carregar receitas salvas do usuário
        const userRecipes = getUserRecipes();
        
        // Carregar draft se existir
        const draft = getDraft();
        const allUserContent = [];
        
        // Adicionar draft primeiro se existir
        if (draft) {
            allUserContent.push({
                ...draft,
                isDraft: true,
                id: 'draft-' + Date.now()
            });
        }
        
        // Adicionar receitas salvas
        allUserContent.push(...userRecipes);
        
        if (allUserContent.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>You haven't created any recipes yet.</p>
                    <a href="./recipe.html" class="btn-accent">Create Your First Recipe</a>
                </div>
            `;
            return;
        }
        
        container.innerHTML = allUserContent.map(recipe => createUserRecipeCard(recipe)).join('');
        
        // Adicionar event listeners
        addUserRecipeListeners();
    }
    
    // Função para carregar draft do localStorage
    function getDraft() {
        try {
            const draftData = localStorage.getItem('recipeDraft');
            if (draftData) {
                const draft = JSON.parse(draftData);
                // Validar se o draft tem pelo menos nome
                if (draft.name && draft.name.trim()) {
                    return draft;
                }
            }
        } catch (error) {
            console.error('Error loading draft:', error);
        }
        return null;
    }
    
    // Cria card para receitas do usuário (incluindo drafts)
    function createUserRecipeCard(recipe) {
        const cookTime = recipe.cookTime ? `${recipe.cookTime.time} ${recipe.cookTime.unit}` : 'Not specified';
        const difficulty = recipe.difficulty ? recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1) : 'Not specified';
        const serves = recipe.serves || 'Not specified';
        
        const hasImage = recipe.cover && recipe.cover !== "image" && !recipe.cover.includes('placeholder.svg');
        const imageSrc = hasImage ? recipe.cover : './images/placeholder.svg';
        const imageClass = hasImage ? 'has-photo' : 'no-photo';
        
        // Badge para draft
        const draftBadge = recipe.isDraft ? '<span class="draft-badge">Draft</span>' : '';
        
        // Ações diferentes para draft vs receita completa
        const actions = recipe.isDraft ? `
            <button class="action-btn edit-draft-btn" 
                    data-action="edit-draft" 
                    aria-label="Continue editing draft">
                <img src="./images/edit.svg" alt="Edit">
            </button>
            <button class="action-btn delete-draft-btn" 
                    data-action="delete-draft" 
                    aria-label="Delete draft">
                <img src="./images/trash.svg" alt="Delete">
            </button>
        ` : `
            <button class="action-btn edit-btn" 
                    data-recipe-id="${recipe.id}" 
                    data-action="edit" 
                    aria-label="Edit recipe">
                <img src="./images/edit.svg" alt="Edit">
            </button>
            <button class="action-btn delete-btn" 
                    data-recipe-id="${recipe.id}" 
                    data-action="delete" 
                    aria-label="Delete recipe">
                <img src="./images/trash.svg" alt="Delete">
            </button>
        `;
        
        return `
            <div class="recipe-card ${recipe.isDraft ? 'draft-card' : 'user-recipe-card'}" data-recipe-id="${recipe.id}">
                <div class="recipe-image ${imageClass}">
                    <img src="${imageSrc}" alt="${recipe.name}">
                    ${draftBadge}
                    <div class="recipe-actions">
                        ${actions}
                    </div>
                </div>
                <div class="recipe-info">
                    <h3 class="recipe-name">${recipe.name}</h3>
                    <div class="recipe-meta">
                        <span class="cook-time">${cookTime}</span>
                        <span class="difficulty">${difficulty}</span>
                        <span class="serves">Serves ${serves}</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Event listeners para receitas do usuário
    function addUserRecipeListeners() {
        const container = document.querySelector('.your-recipes .recipe-grid');
        if (!container) return;
        
        container.addEventListener('click', function(e) {
            const actionBtn = e.target.closest('.action-btn');
            if (!actionBtn) return;
            
            const action = actionBtn.dataset.action;
            const recipeId = actionBtn.dataset.recipeId;
            
            switch (action) {
                case 'edit-draft':
                    editDraft();
                    break;
                case 'delete-draft':
                    deleteDraft();
                    break;
                case 'edit':
                    editRecipe(recipeId);
                    break;
                case 'delete':
                    deleteRecipe(recipeId);
                    break;
            }
        });
        
        // Click no card para abrir receita (exceto drafts)
        container.addEventListener('click', function(e) {
            const card = e.target.closest('.recipe-card');
            if (!card || e.target.closest('.recipe-actions')) return;
            
            if (card.classList.contains('draft-card')) {
                // Draft - redirecionar para edição
                editDraft();
            } else {
                // Receita completa - abrir detalhes
                const recipeId = card.dataset.recipeId;
                window.location.href = `./recipe-detail.html?id=${recipeId}`;
            }
        });
    }
    
    // Função para editar draft
    function editDraft() {
        // Redirecionar para o formulário de receita
        window.location.href = './recipe.html';
    }
    
    // Função para deletar draft
    function deleteDraft() {
        if (confirm('Are you sure you want to delete this draft? This action cannot be undone.')) {
            localStorage.removeItem('recipeDraft');
            displayUserRecipes(); // Recarregar a lista
            console.log('Draft deleted successfully');
        }
    }
    
    // Função para editar receita existente
    function editRecipe(recipeId) {
        // Implementar edição de receita existente
        console.log('Edit recipe:', recipeId);
        // Por enquanto, apenas log - implementar depois se necessário
    }
    
    // Função para deletar receita
    function deleteRecipe(recipeId) {
        if (confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
            // Remover das receitas do usuário
            let userRecipes = getUserRecipes();
            userRecipes = userRecipes.filter(recipe => recipe.id !== recipeId);
            saveUserRecipes(userRecipes);
            
            displayUserRecipes(); // Recarregar a lista
            console.log('Recipe deleted successfully');
        }
    }
    
    // Atualizar DOMContentLoaded para incluir displayUserRecipes
    document.addEventListener('DOMContentLoaded', async function() {
        console.log('Index page loaded');
        
        try {
            await loadRecipes();
            displayFeaturedRecipes();
            displayRecentRecipes();
            displayUserRecipes(); // Adicionar esta linha
        } catch (error) {
            console.error('Error loading page:', error);
        }
    });
});

