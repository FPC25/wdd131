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
    { value: 'piece', text: 'piece(s)' },
    { value: 'g', text: 'g (grams)' },
    { value: 'kg', text: 'kg (kilograms)' },
    { value: 'ml', text: 'ml (milliliters)' },
    { value: 'L', text: 'L (liters)' },
    { value: 'cup', text: 'cup(s)' },
    { value: 'tbsp', text: 'tbsp (tablespoon)' },
    { value: 'tsp', text: 'tsp (teaspoon)' },
    { value: 'oz', text: 'oz (ounces)' },
    { value: 'lb', text: 'lb (pounds)' },
    { value: 'can', text: 'can(s)' },
    { value: 'jar', text: 'jar(s)' },
    { value: 'bottle', text: 'bottle(s)' },
    { value: 'bag', text: 'bag(s)' },
    { value: 'box', text: 'box(es)' },
    { value: 'packet', text: 'packet(s)' },
    { value: 'sachet', text: 'sachet(s)' },
    { value: 'pinch', text: 'pinch' },
    { value: 'dash', text: 'dash' },
    { value: 'handful', text: 'handful' },
    { value: 'slice', text: 'slice(s)' },
    { value: 'clove', text: 'clove(s)' },
    { value: 'sprig', text: 'sprig(s)' },
    { value: 'bunch', text: 'bunch(es)' }
];

function initializeForm() {
    // Add initial ingredient rows
    addIngredientRow();
    addIngredientRow();
    
    // Set default values
    document.getElementById('serves').value = 4;
    document.getElementById('cook-time').value = 30;
    document.getElementById('time-unit').value = 'minutes';
    
    // Make image preview area clickable
    setupImagePreviewClick();
}

function setupImagePreviewClick() {
    const preview = document.getElementById('image-preview');
    const fileInput = document.getElementById('cover-image');
    
    // Adicionar evento de clique na área de preview
    preview.addEventListener('click', function(e) {
        // Só abrir seletor se não tem imagem ou se clicou fora dos botões de controle
        if (!preview.classList.contains('has-image')) {
            fileInput.click();
        }
    });
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
    
    // Difficulty select behavior
    setupDifficultySelect();
}

function setupDifficultySelect() {
    const difficultySelect = document.getElementById('difficulty');
    
    difficultySelect.addEventListener('change', function() {
        const defaultOption = this.querySelector('option[value=""]');
        
        // Se uma opção válida foi selecionada, desabilitar a opção padrão
        if (this.value !== '') {
            defaultOption.disabled = true;
            defaultOption.style.display = 'none'; // Esconder também para melhor UX
        }
    });
}

function addIngredientRow() {
    const container = document.getElementById('ingredients-container');
    const row = document.createElement('div');
    row.className = 'ingredient-row';
    row.dataset.ingredientId = ingredientCount++;
    
    // Create quantity datalist
    const quantityDatalistId = `quantity-options-${row.dataset.ingredientId}`;
    // Create unit datalist
    const unitDatalistId = `unit-options-${row.dataset.ingredientId}`;
    
    row.innerHTML = `
        <div class="form-group">
            <label>Quantity</label>
            <input type="text" list="${quantityDatalistId}" class="quantity-input" placeholder="Select..." required>
            <datalist id="${quantityDatalistId}">
                ${quantityOptions.map(option => `<option value="${option}">`).join('')}
            </datalist>
        </div>
        <div class="form-group">
            <label>Unit</label>
            <input type="text" list="${unitDatalistId}" class="unit-input" placeholder="Select or type...">
            <datalist id="${unitDatalistId}">
                ${unitOptions.map(option => `<option value="${option.value}">${option.text}</option>`).join('')}
            </datalist>
        </div>
        <div class="form-group">
            <label>Ingredient</label>
            <input type="text" class="ingredient-input" placeholder="e.g., tomatoes" required>
        </div>
        <button type="button" class="remove-ingredient" onclick="removeIngredientRow(this)">×</button>
    `;
    
    container.appendChild(row);
    
    // Add event listener to quantity input to handle "to taste" selection
    const quantityInput = row.querySelector('.quantity-input');
    const unitInput = row.querySelector('.unit-input');
    
    quantityInput.addEventListener('input', function() {
        if (this.value === 'to taste') {
            unitInput.disabled = true;
            unitInput.value = '';
            unitInput.placeholder = 'Not needed';
        } else {
            unitInput.disabled = false;
            unitInput.placeholder = 'Select or type...';
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
        // Verificar se o formato é válido
        const validFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        
        if (!validFormats.includes(file.type)) {
            alert('Please upload a valid image format (JPG, PNG, or WebP)');
            event.target.value = ''; // Limpar o input
            return;
        }
        
        // Verificar tamanho do arquivo (opcional - máximo 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB em bytes
        if (file.size > maxSize) {
            alert('Image size must be less than 5MB');
            event.target.value = ''; // Limpar o input
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.alt = 'Recipe preview';
            
            // Adicionar classe para esconder ícone e texto
            preview.classList.add('has-image');
            
            // Remover imagem anterior se existir
            const existingImg = preview.querySelector('img:not(#camera-icon)');
            if (existingImg) {
                existingImg.remove();
            }
            
            // Adicionar nova imagem
            preview.appendChild(img);
            
            // Adicionar botão de troca/remoção
            addChangeImageButton(preview);
        };
        
        reader.onerror = function() {
            alert('Error reading the image file');
            event.target.value = ''; // Limpar o input
        };
        
        reader.readAsDataURL(file);
    } else {
        // Remover imagem e classe quando nenhum arquivo está selecionado
        removeImage(preview);
    }
}

function addChangeImageButton(preview) {
    // Remover botão anterior se existir
    const existingButton = preview.querySelector('.change-image-btn');
    if (existingButton) {
        existingButton.remove();
    }
    
    // Criar botão de troca
    const changeButton = document.createElement('div');
    changeButton.className = 'change-image-btn';
    changeButton.innerHTML = `
        <div class="change-overlay">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="13" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </div>
        <button type="button" class="remove-image-btn" title="Remove image">×</button>
    `;
    
    preview.appendChild(changeButton);
    
    // Event listener para trocar imagem
    changeButton.querySelector('.change-overlay').addEventListener('click', function(e) {
        e.stopPropagation();
        document.getElementById('cover-image').click();
    });
    
    // Event listener para remover imagem
    changeButton.querySelector('.remove-image-btn').addEventListener('click', function(e) {
        e.stopPropagation();
        removeImage(preview);
        document.getElementById('cover-image').value = ''; // Limpar input
    });
}

function removeImage(preview) {
    preview.classList.remove('has-image');
    
    // Remover imagem
    const existingImg = preview.querySelector('img:not(#camera-icon)');
    if (existingImg) {
        existingImg.remove();
    }
    
    // Remover botão de troca
    const changeButton = preview.querySelector('.change-image-btn');
    if (changeButton) {
        changeButton.remove();
    }
}

function collectFormData() {
    const existingRecipes = RecipeUtils.getRecipesData();
    const nextId = Math.max(...existingRecipes.map(r => r.id)) + 1;
    
    // Collect basic info
    const name = document.getElementById('recipe-name').value.trim();
    const source = document.getElementById('source').value.trim() || '';
    const difficulty = document.getElementById('difficulty').value;
    
    // Handle serves - default to 1 if empty
    const servesValue = document.getElementById('serves').value;
    const serves = servesValue ? parseInt(servesValue) : 1;
    
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
        const unit = row.querySelector('.unit-input').value.trim(); // Now it's an input, not select
        
        if (quantity && item) {
            ingredients.push({
                item: item,
                quantity: quantity === 'to taste' ? 'to taste' : parseFloat(quantity) || quantity,
                unit: quantity === 'to taste' ? null : (unit || null)
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