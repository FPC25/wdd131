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

    // Initial render - show all recipes
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
        
        if (currentFilter === 'favorites') {
            recipes = RecipeUtils.filterRecipes('favorites', currentSearch);
        } else if (currentFilter === 'all') {
            recipes = RecipeUtils.filterRecipes('all', currentSearch);
        } else {
            recipes = RecipeUtils.filterRecipesByCategory(currentFilter, currentSearch);
        }
        
        RecipeUtils.renderRecipes(recipes, recipesGrid);
    }

    // Category button functionality
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            currentFilter = this.dataset.category;
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
            renderCurrentView();
        });
    }

    // Search functionality
    function performSearch() {
        currentSearch = searchInput ? searchInput.value.toLowerCase().trim() : '';
        renderCurrentView();
        
        if (currentSearch) {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
        }
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
    }

    // Check URL parameters for filters
    const urlParams = new URLSearchParams(window.location.search);
    const filterParam = urlParams.get('filter');
    if (filterParam === 'favorites') {
        currentFilter = 'favorites';
        renderCurrentView();
    }
});