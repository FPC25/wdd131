// creating DOM elements 
const currentYear = document.querySelector("#currentYear");
const lastModified = document.querySelector("#lastModified");

// creating a new date object
const today = new Date();

// getting the current year
currentYear.textContent = today.getFullYear();

// getting the last modified date
lastModified.textContent = `Last Modification: ${document.lastModified}`;