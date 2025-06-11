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