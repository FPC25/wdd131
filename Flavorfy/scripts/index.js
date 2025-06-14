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
});