const visitsDisplay = document.querySelector("#visits");
let numVisits = Number(window.localStorage.getItem("numVisits-ls")) || 1;   
if (visitsDisplay) {
	visitsDisplay.textContent = `${numVisits} answer(s) so far.`;
}
numVisits++;
window.localStorage.setItem("numVisits-ls", numVisits);