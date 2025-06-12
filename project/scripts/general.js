// creating DOM elements 
const currentYear = document.querySelector("#currentYear");
const lastModified = document.querySelector("#lastModified");

// creating a new date object
const today = new Date();

// getting the current year
currentYear.textContent = today.getFullYear();

// getting the last modified date
lastModified.textContent = `Last Modification: ${document.lastModified}`;


// Hamburger Menu Functionality
const hamburger = document.getElementById('hamburger');
const nav = document.querySelector('.hamburger-menu');

hamburger.addEventListener('click', () => {
    nav.classList.toggle('open');
    hamburger.textContent = nav.classList.contains('open') ? '✕' : '☰';
});

// Close menu with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
        toggleMenu();
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