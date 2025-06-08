function productTemplate(product) {
	return `<option value="${product.id}">${product.name}</option>`;
}

function renderProducts(products) {
	const productSelect = document.querySelector("#product-name");
	productSelect.insertAdjacentHTML(
		"beforeend",
		products.map(productTemplate).join("")
	);
}

function checkNumVisits() {
    const visitsDisplay = document.querySelector("#visits");
    let numVisits = Number(window.localStorage.getItem("numVisits-ls")) || 1;   
	visitsDisplay.textContent = `${numVisits} visit(s) so far.`;
	numVisits++;
    window.localStorage.setItem("numVisits-ls", numVisits);
}

const products = [
	{
		id: "fc-1888",
		name: "flux capacitor",
		averagerating: 4.5,
	},
	{
		id: "fc-2050",
		name: "power laces",
		averagerating: 4.7,
	},
	{
		id: "fs-1987",
		name: "time circuits",
		averagerating: 3.5,
	},
	{
		id: "ac-2000",
		name: "low voltage reactor",
		averagerating: 3.9,
	},
	{
		id: "jj-1969",
		name: "warp equalizer",
		averagerating: 5.0,
	},
];

if (typeof window !== "undefined") {
	renderProducts(products);
    checkNumVisits();
}
