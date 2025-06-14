// creating DOM elements 
const currentYear = document.querySelector("#currentYear");
const lastModified = document.querySelector("#lastModified");

// creating a new date object
const today = new Date();

// getting the current year
if (currentYear) currentYear.textContent = today.getFullYear();

// getting the last modified date
if (lastModified) lastModified.textContent = `Last Modification: ${document.lastModified}`;

// Hamburger Menu Functionality
const hamburger = document.getElementById('hamburger');
const nav = document.querySelector('.hamburger-menu');

if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
        nav.classList.toggle('open');
        hamburger.textContent = nav.classList.contains('open') ? '✕' : '☰';
    });
}

// Close menu with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && nav && nav.classList.contains('open')) {
        nav.classList.remove('open');
        if (hamburger) hamburger.textContent = '☰';
    }
});

// Favorite Button Functionality
document.addEventListener('DOMContentLoaded', function() {
    const favoriteButtons = document.querySelectorAll('.favorite-btn');
    
    favoriteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            this.classList.toggle('active');
            
            // Optional: Add visual feedback or save state
            console.log('Recipe favorited:', this.classList.contains('active'));
        });
    });
});

// Utility functions for recipe management

let recipesData = [];

// Load recipes data
async function loadRecipes() {
    try {
        const response = await fetch('./scripts/recipes.json');
        recipesData = await response.json();
        return recipesData;
    } catch (error) {
        console.error('Error loading recipes:', error);
        return [];
    }
}

// Create recipe card HTML
function createRecipeCard(recipe) {
    const favoriteClass = recipe.favorite ? 'active' : '';
    const cookTime = `${recipe.cookTime.time} ${recipe.cookTime.unit}`;
    const difficulty = recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1);
    
    return `
        <div class="recipe-card" data-recipe-id="${recipe.name}">
            <div class="recipe-image">
                <img src="./images/placeholder.svg" alt="${recipe.name}">
            </div>
            <div class="recipe-info">
                <div class="recipe-header">
                    <h3>${recipe.name}</h3>
                    <button class="favorite-btn ${favoriteClass}" aria-label="Add to favorites" data-recipe="${recipe.name}"></button> 
                </div>
                <p>${difficulty} • ${cookTime} • Serves ${recipe.serves}</p>
            </div>
        </div>
    `;
}

// Filter recipes by criteria
function filterRecipes(criteria) {
    switch (criteria) {
        case 'favorites':
            return recipesData.filter(recipe => recipe.favorite === true);
        case 'saved':
            return recipesData.filter(recipe => recipe.saved === true);
        case 'all':
        default:
            return recipesData;
    }
}

// Filter recipes by category
function filterRecipesByCategory(category) {
    if (category === 'all') return recipesData;
    return recipesData.filter(recipe => 
        recipe.Filters.some(filter => 
            filter.toLowerCase() === category.toLowerCase()
        )
    );
}

// Toggle favorite status
function toggleFavorite(recipeName) {
    const recipe = recipesData.find(r => r.name === recipeName);
    if (recipe) {
        recipe.favorite = !recipe.favorite;
        // In a real app, you would save this to a backend
        console.log(`${recipeName} favorite status: ${recipe.favorite}`);
        return recipe.favorite;
    }
    return false;
}

// Render recipes to container
function renderRecipes(recipes, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (recipes.length === 0) {
        container.innerHTML = '<p>No recipes found.</p>';
        return;
    }
    
    container.innerHTML = recipes.map(recipe => createRecipeCard(recipe)).join('');
    
    // Add event listeners to favorite buttons
    const favoriteButtons = container.querySelectorAll('.favorite-btn');
    favoriteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const recipeName = this.dataset.recipe;
            const isNowFavorite = toggleFavorite(recipeName);
            this.classList.toggle('active', isNowFavorite);
        });
    });
}

// Export functions for use in other files
window.RecipeUtils = {
    loadRecipes,
    createRecipeCard,
    filterRecipes,
    filterRecipesByCategory,
    toggleFavorite,
    renderRecipes,
    getRecipesData: () => recipesData
};