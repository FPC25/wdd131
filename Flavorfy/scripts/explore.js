// Auto-hide bottom navigation on scroll
document.addEventListener('DOMContentLoaded', async function() {
    // Load recipes data
    await RecipeUtils.loadRecipes();
    
    // Get DOM elements
    const recipesGrid = document.querySelector('.recipe-grid');
    const bottomNav = document.querySelector('.bottom-nav');
    const categoryButtons = document.querySelectorAll('.category-btn');
    const searchInput = document.querySelector('.search-input');
    const searchButton = document.querySelector('.search-button');
    
    // State management
    let lastScrollTop = 0;
    let scrollTimeout;
    let currentFilter = 'all';
    let currentSearch = '';

    // Check URL parameters for search and filters
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    const filterParam = urlParams.get('filter');
    
    console.log('URL search param:', searchParam); // Debug
    console.log('URL filter param:', filterParam); // Debug
    
    // Set initial search and filter from URL
    if (searchParam) {
        currentSearch = searchParam.toLowerCase().trim();
        if (searchInput) {
            searchInput.value = searchParam;
            searchInput.style.backgroundColor = '#e8f5e8';
        }
        console.log('Search set from URL:', currentSearch); // Debug
    }
    
    if (filterParam === 'favorites') {
        currentFilter = 'favorites';
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        // Encontrar e ativar o botão de favoritos se existir
        const favButton = document.querySelector('[data-category="favorites"]');
        if (favButton) favButton.classList.add('active');
    }

    // Initial render with URL parameters
    renderCurrentView();

    // Auto-hide bottom navigation on scroll
    function throttle(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function handleScroll() {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        clearTimeout(scrollTimeout);
        
        if (currentScroll <= 0) {
            bottomNav.classList.remove('hidden');
            lastScrollTop = 0;
            return;
        }
        
        if (currentScroll > lastScrollTop) {
            bottomNav.classList.add('hidden');
        } else if (currentScroll < lastScrollTop) {
            bottomNav.classList.remove('hidden');
        }
        
        lastScrollTop = currentScroll;
        
        if (bottomNav.classList.contains('hidden')) {
            scrollTimeout = setTimeout(() => {
                bottomNav.classList.remove('hidden');
            }, 2000);
        }
    }

    window.addEventListener('scroll', throttle(handleScroll, 100));

    // Unified render function
    function renderCurrentView() {
        let recipes;
        
        console.log('Rendering with search:', currentSearch, 'and filter:', currentFilter); // Debug
        
        if (currentFilter === 'favorites') {
            recipes = RecipeUtils.filterRecipes('favorites', currentSearch);
        } else if (currentFilter === 'all') {
            recipes = RecipeUtils.filterRecipes('all', currentSearch);
        } else {
            recipes = RecipeUtils.filterRecipesByCategory(currentFilter, currentSearch);
        }
        
        console.log('Found recipes:', recipes.length); // Debug
        console.log('Recipes data:', recipes); // Debug
        
        // Custom message based on search/filter state
        let emptyMessage = 'No recipes found.';
        if (currentSearch && currentFilter !== 'all') {
            emptyMessage = `No recipes found in "${currentFilter}" for "${currentSearch}".`;
        } else if (currentSearch) {
            emptyMessage = `No recipes found for "${currentSearch}".`;
        } else if (currentFilter === 'favorites') {
            emptyMessage = 'No favorite recipes yet. Start exploring and add some favorites!';
        }
        
        RecipeUtils.renderRecipes(recipes, recipesGrid, emptyMessage);
        
        // Se há busca ativa, remover seleção de categoria
        if (currentSearch) {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
        }
    }

    // Category button functionality
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            currentFilter = this.dataset.category;
            
            // Limpar busca quando selecionar categoria
            currentSearch = '';
            if (searchInput) {
                searchInput.value = '';
                searchInput.style.backgroundColor = '';
            }
            
            renderCurrentView();
        });
    });

    // Bottom navigation - favorites filter
    const favoritesNavItem = document.querySelector('.bottom-nav .nav-item[href="#"]');
    if (favoritesNavItem) {
        favoritesNavItem.addEventListener('click', function(e) {
            e.preventDefault();
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            currentFilter = 'favorites';
            
            // Limpar busca quando clicar em favoritos
            currentSearch = '';
            if (searchInput) {
                searchInput.value = '';
                searchInput.style.backgroundColor = '';
            }
            
            renderCurrentView();
        });
    }

    // Search functionality
    function performSearch() {
        const searchValue = searchInput ? searchInput.value.trim() : '';
        currentSearch = searchValue.toLowerCase();
        
        console.log('Performing search for:', currentSearch); // Debug
        
        // Visual feedback
        if (currentSearch) {
            searchInput.style.backgroundColor = '#e8f5e8';
        } else {
            searchInput.style.backgroundColor = '';
        }
        
        // Reset filter to 'all' when searching
        currentFilter = 'all';
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        const allButton = document.querySelector('[data-category="all"]');
        if (allButton) allButton.classList.add('active');
        
        renderCurrentView();
    }
    
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

    // Clear search function
    function clearSearch() {
        if (searchInput) {
            searchInput.value = '';
            searchInput.style.backgroundColor = '';
        }
        currentSearch = '';
        currentFilter = 'all';
        
        // Reset to show all recipes
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        const allButton = document.querySelector('[data-category="all"]');
        if (allButton) allButton.classList.add('active');
        
        renderCurrentView();
    }
});