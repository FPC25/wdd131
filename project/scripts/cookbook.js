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
        
        // Show nav again after user stops scrolling for 2 seconds
        scrollTimeout = setTimeout(() => {
            bottomNav.classList.remove('hidden');
        }, 2000);
        
        lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    }

    // Add throttled scroll listener
    window.addEventListener('scroll', throttle(handleScroll, 100));

    // Category button functionality (your existing code)
    const categoryButtons = document.querySelectorAll('.category-btn');
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const selectedCategory = this.dataset.category;
            console.log('Filtering by category:', selectedCategory);
        });
    });
});