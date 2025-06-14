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