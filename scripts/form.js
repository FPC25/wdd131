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

renderProducts(products);

document.querySelector('form').addEventListener('submit', function() {
    // Add a unique submission ID to prevent counting legitimate duplicates as refreshes
	const submissionId = Date.now() + '-' + Math.random().toString(36).substring(2, 11);
    
    // Add hidden input with unique ID
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.name = 'submissionId';
    hiddenInput.value = submissionId;
    this.appendChild(hiddenInput);
});



