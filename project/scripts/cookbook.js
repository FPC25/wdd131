// Auto-hide bottom navigation on scroll
document.addEventListener('DOMContentLoaded', function() {
    const bottomNav = document.querySelector('.bottom-nav');
    let lastScrollTop = 0;
    let scrollTimeout;

    // Throttle scroll events for better performance
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
        
        // Clear any existing timeout
        clearTimeout(scrollTimeout);
        
        // Don't hide nav at the very top of the page
        if (currentScroll <= 0) {
            bottomNav.classList.remove('hidden');
            lastScrollTop = 0;
            return;
        }
        
        // Hide nav when scrolling down, show when scrolling up
        if (currentScroll > lastScrollTop) {
            // Scrolling down - hide nav
            bottomNav.classList.add('hidden');
        } else if (currentScroll < lastScrollTop) {
            // Scrolling up - show nav
            bottomNav.classList.remove('hidden');
        }
        
        lastScrollTop = currentScroll;
        
        // Only show nav again after user stops scrolling for 2 seconds AND nav is currently hidden
        if (bottomNav.classList.contains('hidden')) {
            scrollTimeout = setTimeout(() => {
                bottomNav.classList.remove('hidden');
            }, 2000);
        }
    }

    // Add throttled scroll listener
    window.addEventListener('scroll', throttle(handleScroll, 100));

    // Check URL parameters for filters
    const urlParams = new URLSearchParams(window.location.search);
    const filterParam = urlParams.get('filter');
    
    // Category button functionality
    const categoryButtons = document.querySelectorAll('.category-btn');
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const selectedCategory = this.dataset.category;
            console.log('Filtering by category:', selectedCategory);
            // Add your category filtering logic here
        });
    });

    // Bottom navigation functionality
    const favoritesNavItem = document.querySelector('.bottom-nav .nav-item[href="#"]');
    if (favoritesNavItem) {
        favoritesNavItem.addEventListener('click', function(e) {
            e.preventDefault();
            // Clear category filters
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            // Apply favorites filter
            applyFavoritesFilter();
        });
    }

    // Apply favorites filter function
    function applyFavoritesFilter() {
        console.log('Filtering by favorites');
        // Add your favorites filtering logic here
        // This should show only recipes marked as favorites
    }

    // Check if page loaded with favorites filter
    if (filterParam === 'favorites') {
        applyFavoritesFilter();
    }
});