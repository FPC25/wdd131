function formatDate(date) {
    const month = date.getMonth().toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
}

// creating DOM elements 
const currentYear = document.querySelector("#currentYear");
const lastModified = document.querySelector("#lastModified");

// creating a new date object
const today = new Date();

// getting the current year
currentYear.textContent = today.getFullYear();

// getting the last modified date
if (lastModified) {
    lastModified.textContent = `Last Modification: ${formatDate(today)}`;
}
