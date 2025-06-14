document.addEventListener('DOMContentLoaded', async function() {
    // Load existing recipes to get the next ID
    await RecipeUtils.loadRecipes();
    
    // Initialize form
    initializeForm();
    
    // Add event listeners
    addEventListeners();
});

let ingredientCount = 0;

// Quantity options for ingredients
const quantityOptions = [
    'to taste',
    '1/8', '1/4', '1/3', '3/8', '1/2', '2/3', '5/8', '3/4', '7/8',
    '1', '1 1/4', '1 1/3', '1 1/2', '1 2/3', '1 3/4',
    '2', '2 1/4', '2 1/3', '2 1/2', '2 2/3', '2 3/4',
    '3', '4', '5', '6', '7', '8', '9', '10'
];

// Unit options for ingredients
const unitOptions = [
    { value: '', text: 'Select unit' },
    { value: 'unit', text: 'unit(s)' },
    { value: 'g', text: 'g' },
    { value: 'kg', text: 'kg' },
    { value: 'ml', text: 'ml' },
    { value: 'L', text: 'L' },
    { value: 'cup', text: 'cup(s)' },
    { value: 'tbsp', text: 'tbsp' },
    { value: 'tsp', text: 'tsp' },
    { value: 'oz', text: 'oz' },
    { value: 'lb', text: 'lb' },
    { value: 'can', text: 'can(s)' },
    { value: 'sachets', text: 'sachet(s)' },
    { value: 'pinch', text: 'pinch' }
];

function initializeForm() {
    // Add initial ingredient rows
    addIngredientRow();
    addIngredientRow();
    
    // Set default values
    document.getElementById('serves').value = 4;
    document.getElementById('cook-time').value = 30;
    document.getElementById('time-unit').value = 'minutes';
}

function addEventListeners() {
    // Back button
    document.getElementById('back-btn').addEventListener('click', () => {
        window.history.back();
    });
    
    // Add ingredient button
    document.getElementById('add-ingredient-btn').addEventListener('click', addIngredientRow);
    
    // Form submission
    document.getElementById('recipe-form').addEventListener('submit', handleFormSubmit);
    
    // Save draft
    document.getElementById('save-draft-btn').addEventListener('click', saveDraft);
    
    // Image upload preview
    document.getElementById('cover-image').addEventListener('change', handleImageUpload);
}

function addIngredientRow() {
    const container = document.getElementById('ingredients-container');
    const row = document.createElement('div');
    row.className = 'ingredient-row';
    row.dataset.ingredientId = ingredientCount++;
    
    // Create quantity datalist
    const quantityDatalistId = `quantity-options-${row.dataset.ingredientId}`;
    
    row.innerHTML = `
        <div class="form-group">
            <label>Quantity</label>
            <input type="text" list="${quantityDatalistId}" class="quantity-input" placeholder="Select..." required>
            <datalist id="${quantityDatalistId}">
                ${quantityOptions.map(option => `<option value="${option}">`).join('')}
            </datalist>
        </div>
        <div class="form-group">
            <label>Ingredient</label>
            <input type="text" class="ingredient-input" placeholder="e.g., tomatoes" required>
        </div>
        <div class="form-group">
            <label>Unit</label>
            <select class="unit-input">
                ${unitOptions.map(option => `<option value="${option.value}">${option.text}</option>`).join('')}
            </select>
        </div>
        <button type="button" class="remove-ingredient" onclick="removeIngredientRow(this)">×</button>
    `;
    
    container.appendChild(row);
    
    // Add event listener to quantity input to handle "to taste" selection
    const quantityInput = row.querySelector('.quantity-input');
    const unitSelect = row.querySelector('.unit-input');
    
    quantityInput.addEventListener('input', function() {
        if (this.value === 'to taste') {
            unitSelect.disabled = true;
            unitSelect.value = '';
        } else {
            unitSelect.disabled = false;
        }
    });
}

function removeIngredientRow(button) {
    const ingredientsContainer = document.getElementById('ingredients-container');
    if (ingredientsContainer.children.length > 1) {
        button.closest('.ingredient-row').remove();
    }
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('image-preview');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Recipe preview">`;
        };
        reader.readAsDataURL(file);
    } else {
        preview.innerHTML = '<span>Upload Cover Image</span>';
    }
}

function collectFormData() {
    const existingRecipes = RecipeUtils.getRecipesData();
    const nextId = Math.max(...existingRecipes.map(r => r.id)) + 1;
    
    // Collect basic info
    const name = document.getElementById('recipe-name').value.trim();
    const source = document.getElementById('source').value.trim() || '';
    const difficulty = document.getElementById('difficulty').value;
    const serves = parseInt(document.getElementById('serves').value);
    const cookTime = {
        time: parseInt(document.getElementById('cook-time').value),
        unit: document.getElementById('time-unit').value
    };
    
    // Collect filters
    const filterCheckboxes = document.querySelectorAll('#filters-group input[type="checkbox"]:checked');
    const filters = Array.from(filterCheckboxes).map(cb => cb.value);
    
    // Collect ingredients
    const ingredientRows = document.querySelectorAll('.ingredient-row');
    const ingredients = [];
    
    ingredientRows.forEach(row => {
        const quantity = row.querySelector('.quantity-input').value.trim();
        const item = row.querySelector('.ingredient-input').value.trim();
        const unit = row.querySelector('.unit-input').value;
        
        if (quantity && item) {
            ingredients.push({
                item: item,
                quantity: quantity === 'to taste' ? 'to taste' : parseFloat(quantity) || quantity,
                unit: quantity === 'to taste' ? null : unit || null
            });
        }
    });
    
    // Collect instructions
    const instructionsText = document.getElementById('instructions').value.trim();
    const instructions = instructionsText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
    
    // Collect favorite status
    const isFavorite = document.getElementById('mark-favorite').checked;
    
    // Create recipe object
    const recipe = {
        id: nextId,
        name: name,
        cover: "image",
        source: source,
        difficulty: difficulty,
        cookTime: cookTime,
        filters: filters,
        ingredients: ingredients,
        instructions: instructions,
        saved: true, // Always saved when created
        favorite: isFavorite,
        serves: serves
    };
    
    return recipe;
}

function validateForm() {
    const name = document.getElementById('recipe-name').value.trim();
    const difficulty = document.getElementById('difficulty').value;
    const cookTime = document.getElementById('cook-time').value;
    const instructions = document.getElementById('instructions').value.trim();
    
    if (!name) {
        alert('Please enter a recipe name.');
        return false;
    }
    
    if (!difficulty) {
        alert('Please select a difficulty level.');
        return false;
    }
    
    if (!cookTime) {
        alert('Please enter cooking time.');
        return false;
    }
    
    if (!instructions) {
        alert('Please enter cooking instructions.');
        return false;
    }
    
    // Check if at least one ingredient is filled
    const ingredientRows = document.querySelectorAll('.ingredient-row');
    let hasValidIngredient = false;
    
    ingredientRows.forEach(row => {
        const quantity = row.querySelector('.quantity-input').value.trim();
        const item = row.querySelector('.ingredient-input').value.trim();
        
        if (quantity && item) {
            hasValidIngredient = true;
        }
    });
    
    if (!hasValidIngredient) {
        alert('Please add at least one ingredient.');
        return false;
    }
    
    return true;
}

function handleFormSubmit(event) {
    event.preventDefault();
    
    if (!validateForm()) {
        return;
    }
    
    const recipeData = collectFormData();
    
    // Add to recipes data
    const existingRecipes = RecipeUtils.getRecipesData();
    existingRecipes.push(recipeData);
    
    // Update localStorage
    if (recipeData.favorite) {
        const favorites = RecipeUtils.getFavoritesFromStorage();
        favorites.push(recipeData.id);
        localStorage.setItem('flavorfy_favorites', JSON.stringify(favorites));
    }
    
    const saved = RecipeUtils.getSavedFromStorage();
    saved.push(recipeData.id);
    localStorage.setItem('flavorfy_saved', JSON.stringify(saved));
    
    console.log('Recipe saved:', recipeData);
    
    // Show success message
    alert('Recipe saved successfully!');
    
    // Redirect to home page
    window.location.href = './index.html';
}

function saveDraft() {
    if (!validateForm()) {
        return;
    }
    
    const recipeData = collectFormData();
    
    // Save as draft in localStorage
    localStorage.setItem('flavorfy_draft_recipe', JSON.stringify(recipeData));
    
    alert('Recipe saved as draft!');
}

// Load draft if exists
function loadDraft() {
    const draft = localStorage.getItem('flavorfy_draft_recipe');
    if (draft && confirm('You have a saved draft. Would you like to load it?')) {
        const recipeData = JSON.parse(draft);
        // Populate form with draft data
        populateForm(recipeData);
        // Remove draft
        localStorage.removeItem('flavorfy_draft_recipe');
    }
}

function populateForm(recipeData) {
    document.getElementById('recipe-name').value = recipeData.name;
    document.getElementById('source').value = recipeData.source;
    document.getElementById('difficulty').value = recipeData.difficulty;
    document.getElementById('serves').value = recipeData.serves;
    document.getElementById('cook-time').value = recipeData.cookTime.time;
    document.getElementById('time-unit').value = recipeData.cookTime.unit;
    document.getElementById('mark-favorite').checked = recipeData.favorite;
    
    // Set filters
    recipeData.filters.forEach(filter => {
        const checkbox = document.querySelector(`#filters-group input[value="${filter}"]`);
        if (checkbox) checkbox.checked = true;
    });
    
    // Set instructions
    document.getElementById('instructions').value = recipeData.instructions.join('\n');
    
    // Clear existing ingredients and add new ones
    document.getElementById('ingredients-container').innerHTML = '';
    recipeData.ingredients.forEach(ingredient => {
        addIngredientRow();
        const lastRow = document.querySelector('.ingredient-row:last-child');
        lastRow.querySelector('.quantity-input').value = ingredient.quantity;
        lastRow.querySelector('.ingredient-input').value = ingredient.item;
        lastRow.querySelector('.unit-input').value = ingredient.unit || '';
    });
}

// Check for draft on page load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(loadDraft, 1000); // Check after form initialization
});