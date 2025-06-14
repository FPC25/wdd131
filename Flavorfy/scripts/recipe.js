document.addEventListener('DOMContentLoaded', async function() {
    await RecipeUtils.loadRecipes();
    initializeForm();
    addEventListeners();
    loadDraftIfExists();
});

let ingredientCount = 0;

// Opções de quantidade para ingredientes
const quantityOptions = [
    'to taste',
    '1/8', '1/4', '1/3', '3/8', '1/2', '2/3', '5/8', '3/4', '7/8',
    '1', '1 1/4', '1 1/3', '1 1/2', '1 2/3', '1 3/4',
    '2', '2 1/4', '2 1/3', '2 1/2', '2 2/3', '2 3/4',
    '3', '4', '5', '6', '7', '8', '9', '10'
];

// Opções de unidades para ingredientes
const unitOptions = [
    { value: '', text: 'Select unit' },
    { value: 'ml', text: 'ml' },
    { value: 'l', text: 'liter(s)' },
    { value: 'g', text: 'gram(s)' },
    { value: 'kg', text: 'kg' },
    { value: 'cup', text: 'cup(s)' },
    { value: 'tbsp', text: 'tablespoon(s)' },
    { value: 'tsp', text: 'teaspoon(s)' },
    { value: 'oz', text: 'ounce(s)' },
    { value: 'lb', text: 'pound(s)' },
    { value: 'piece', text: 'piece(s)' },
    { value: 'can', text: 'can(s)' },
    { value: 'package', text: 'package(s)' },
    { value: 'sachet', text: 'sachet(s)' },
    { value: 'pinch', text: 'pinch' },
    { value: 'dash', text: 'dash' },
    { value: 'handful', text: 'handful' },
    { value: 'slice', text: 'slice(s)' },
    { value: 'clove', text: 'clove(s)' },
    { value: 'sprig', text: 'sprig(s)' },
    { value: 'bunch', text: 'bunch(es)' }
];

// Inicializa o formulário com valores padrão
function initializeForm() {
    addIngredientRow();
    addIngredientRow();
    
    document.getElementById('serves').value = 4;
    document.getElementById('cook-time').value = 30;
    document.getElementById('time-unit').value = 'minutes';
    
    setupImagePreviewClick();
}

// Configura clique na área de preview da imagem
function setupImagePreviewClick() {
    const preview = document.getElementById('image-preview');
    const fileInput = document.getElementById('cover-image');
    
    preview.addEventListener('click', function(e) {
        if (!preview.classList.contains('has-image')) {
            fileInput.click();
        }
    });
}

// Adiciona todos os event listeners
function addEventListeners() {
    document.getElementById('back-btn').addEventListener('click', () => {
        window.history.back();
    });
    
    document.getElementById('add-ingredient-btn').addEventListener('click', addIngredientRow);
    document.getElementById('recipe-form').addEventListener('submit', handleFormSubmit);
    document.getElementById('save-draft-btn').addEventListener('click', saveDraft);
    
    const imageInput = document.getElementById('cover-image');
    if (imageInput) {
        imageInput.addEventListener('change', handleImageUpload);
    }
    
    setupDifficultySelect();
}

// Configura comportamento do select de dificuldade
function setupDifficultySelect() {
    const difficultySelect = document.getElementById('difficulty');
    
    difficultySelect.addEventListener('change', function() {
        const defaultOption = this.querySelector('option[value=""]');
        
        if (this.value !== '') {
            defaultOption.disabled = true;
            defaultOption.style.display = 'none';
        }
    });
}

// Adiciona nova linha de ingrediente
function addIngredientRow() {
    const container = document.getElementById('ingredients-container');
    ingredientCount++;
    
    const quantityOptionsHTML = quantityOptions.map(option => 
        `<option value="${option}">${option}</option>`
    ).join('');
    
    const unitOptionsHTML = unitOptions.map(option => 
        `<option value="${option.value}">${option.text}</option>`
    ).join('');
    
    const ingredientRow = document.createElement('div');
    ingredientRow.className = 'ingredient-row';
    ingredientRow.innerHTML = `
        <div>
            <label>Quantity</label>
            <select class="quantity-input">
                <option value="">Select</option>
                ${quantityOptionsHTML}
            </select>
        </div>
        <div>
            <label>Unit</label>
            <select class="unit-input">
                ${unitOptionsHTML}
            </select>
        </div>
        <div>
            <label>Ingredient</label>
            <input type="text" class="ingredient-input" placeholder="e.g., flour, sugar">
        </div>
        <button type="button" class="remove-ingredient" onclick="removeIngredientRow(this)">×</button>
    `;
    
    container.appendChild(ingredientRow);
    
    const quantitySelect = ingredientRow.querySelector('.quantity-input');
    const unitSelect = ingredientRow.querySelector('.unit-input');
    
    quantitySelect.addEventListener('change', function() {
        if (this.value === 'to taste') {
            unitSelect.value = '';
            unitSelect.disabled = true;
            unitSelect.classList.add('disabled-gray');
        } else {
            unitSelect.disabled = false;
            unitSelect.classList.remove('disabled-gray');
        }
    });
}

// Remove linha de ingrediente
function removeIngredientRow(button) {
    const row = button.closest('.ingredient-row');
    row.remove();
}

// Manipula upload de imagem
function handleImageUpload(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const file = event.target.files[0];
    const preview = document.getElementById('image-preview');
    
    if (!file) return;
    
    const validFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validFormats.includes(file.type)) {
        alert('Please upload a valid image format (JPG, PNG, or WebP)');
        event.target.value = '';
        return;
    }
    
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        alert('Image size must be less than 5MB');
        event.target.value = '';
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        preview.innerHTML = `
            <img src="${e.target.result}" alt="Recipe preview" style="
                width: 100%; 
                height: 100%; 
                object-fit: cover; 
                border-radius: 8px;
                position: relative;
            ">
            <button type="button" class="remove-image-btn" onclick="removeImageSimple()" style="
                position: absolute;
                top: 8px;
                right: 8px;
                background: rgba(255, 0, 0, 0.8);
                color: white;
                border: none;
                border-radius: 50%;
                width: 24px;
                height: 24px;
                cursor: pointer;
                z-index: 3;
                font-weight: bold;
            ">×</button>
        `;
        
        preview.classList.add('has-image');
        
        setTimeout(() => {
            event.target.value = '';
        }, 100);
    };
    
    reader.onerror = function() {
        alert('Error reading the image file');
        event.target.value = '';
    };
    
    reader.readAsDataURL(file);
}

// Remove imagem de forma simples
function removeImageSimple() {
    const imagePreview = document.querySelector('.image-preview');
    const imageInput = document.getElementById('cover-image');
    
    if (imagePreview) {
        imagePreview.innerHTML = `
            <img src="./images/camera.svg" alt="camera icon" id="camera-icon">
            <span>Upload cover image</span>
            <small>JPG, PNG up to 5MB</small>
        `;
        imagePreview.classList.remove('has-image');
    }
    
    if (imageInput) {
        imageInput.value = '';
    }
}

// Coleta dados do formulário
function collectFormData() {
    let existingRecipes = [];
    try {
        existingRecipes = RecipeUtils.getRecipesData() || [];
    } catch (error) {
        existingRecipes = [];
    }
    
    const nextId = existingRecipes.length > 0 ? Math.max(...existingRecipes.map(r => r.id || 0)) + 1 : 1;
    
    const name = document.getElementById('recipe-name').value.trim();
    const source = document.getElementById('source').value.trim() || '';
    const difficulty = document.getElementById('difficulty').value;
    const servesValue = document.getElementById('serves').value;
    const serves = servesValue ? parseInt(servesValue) : 1;
    
    const cookTime = {
        time: parseInt(document.getElementById('cook-time').value),
        unit: document.getElementById('time-unit').value
    };
    
    const filterCheckboxes = document.querySelectorAll('#filters-group input[type="checkbox"]:checked');
    const filters = Array.from(filterCheckboxes).map(cb => cb.value);
    
    const ingredientRows = document.querySelectorAll('.ingredient-row');
    const ingredients = [];
    
    ingredientRows.forEach(row => {
        const quantity = row.querySelector('.quantity-input').value.trim();
        const item = row.querySelector('.ingredient-input').value.trim();
        const unit = row.querySelector('.unit-input').value.trim();
        
        if (quantity && item) {
            ingredients.push({
                item: item,
                quantity: quantity === 'to taste' ? 'to taste' : parseFloat(quantity) || quantity,
                unit: quantity === 'to taste' ? null : (unit || null)
            });
        }
    });
    
    const instructionsText = document.getElementById('instructions').value.trim();
    const instructions = instructionsText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
    
    const isFavorite = document.getElementById('mark-favorite').checked;
    
    let cover = "image";
    const uploadedImage = document.querySelector('.image-preview img[src^="data:"]');
    if (uploadedImage) {
        cover = uploadedImage.src;
    }
    
    return {
        id: nextId,
        name: name,
        cover: cover,
        source: source,
        difficulty: difficulty,
        cookTime: cookTime,
        filters: filters,
        ingredients: ingredients,
        instructions: instructions,
        isSaved: true,
        isFavorite: isFavorite,
        serves: serves,
    };
}

// Valida dados do formulário
function validateForm() {
    const name = document.getElementById('recipe-name').value.trim();
    const difficulty = document.getElementById('difficulty').value;
    const cookTime = document.getElementById('cook-time').value;
    const instructions = document.getElementById('instructions').value.trim();
    
    if (!name) {
        alert('Please enter a recipe name');
        return false;
    }
    
    if (!difficulty) {
        alert('Please select a difficulty level');
        return false;
    }
    
    if (!cookTime || cookTime <= 0) {
        alert('Please enter a valid cook time');
        return false;
    }
    
    if (!instructions) {
        alert('Please enter cooking instructions');
        return false;
    }
    
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
        alert('Please add at least one ingredient');
        return false;
    }
    
    return true;
}

// Manipula submissão do formulário
function handleFormSubmit(event) {
    event.preventDefault();
    
    if (!validateForm()) return;
    
    const recipeData = collectFormData();
    
    try {
        let existingRecipes = [];
        try {
            existingRecipes = RecipeUtils.getRecipesData() || [];
        } catch (error) {
            const storedRecipes = localStorage.getItem('recipesData');
            existingRecipes = storedRecipes ? JSON.parse(storedRecipes) : [];
        }
        
        existingRecipes.push(recipeData);
        localStorage.setItem('recipesData', JSON.stringify(existingRecipes));
        
        try {
            if (recipeData.isFavorite) {
                RecipeUtils.toggleFavorite(recipeData.id);
            }
            RecipeUtils.toggleSaved(recipeData.id);
        } catch (error) {
            const favorites = JSON.parse(localStorage.getItem('flavorfy_favorites') || '[]');
            const saved = JSON.parse(localStorage.getItem('flavorfy_saved') || '[]');
            
            if (!saved.includes(recipeData.id)) {
                saved.push(recipeData.id);
            }
            
            if (recipeData.isFavorite && !favorites.includes(recipeData.id)) {
                favorites.push(recipeData.id);
            }
            
            localStorage.setItem('flavorfy_favorites', JSON.stringify(favorites));
            localStorage.setItem('flavorfy_saved', JSON.stringify(saved));
        }
        
        localStorage.removeItem('recipeDraft');
        
        alert('Recipe saved successfully!');
        window.location.href = './index.html';
        
    } catch (error) {
        console.error('Error saving recipe:', error);
        alert('Error saving recipe. Please try again.');
    }
}

// Salva rascunho da receita
function saveDraft() {
    if (!document.getElementById('recipe-name').value.trim()) {
        alert('Please enter at least a recipe name before saving draft');
        return;
    }
    
    const draftData = collectFormData();
    localStorage.setItem('recipeDraft', JSON.stringify(draftData));
    alert('Draft saved successfully!');
}

// Carrega rascunho se existir
function loadDraftIfExists() {
    const draftData = localStorage.getItem('recipeDraft');
    if (draftData) {
        try {
            const draft = JSON.parse(draftData);
            if (confirm('You have a saved draft. Would you like to continue editing it?')) {
                populateForm(draft);
            } else {
                localStorage.removeItem('recipeDraft');
            }
        } catch (error) {
            localStorage.removeItem('recipeDraft');
        }
    }
}

// Popula formulário com dados da receita
function populateForm(recipeData) {
    document.getElementById('recipe-name').value = recipeData.name;
    document.getElementById('source').value = recipeData.source;
    document.getElementById('difficulty').value = recipeData.difficulty;
    document.getElementById('serves').value = recipeData.serves;
    document.getElementById('cook-time').value = recipeData.cookTime.time;
    document.getElementById('time-unit').value = recipeData.cookTime.unit;
    document.getElementById('mark-favorite').checked = recipeData.isFavorite || false;
    
    recipeData.filters.forEach(filter => {
        const checkbox = document.querySelector(`#filters-group input[value="${filter}"]`);
        if (checkbox) checkbox.checked = true;
    });
    
    document.getElementById('instructions').value = recipeData.instructions.join('\n');
    
    document.getElementById('ingredients-container').innerHTML = '';
    recipeData.ingredients.forEach(ingredient => {
        addIngredientRow();
        const lastRow = document.querySelector('.ingredient-row:last-child');
        lastRow.querySelector('.quantity-input').value = ingredient.quantity;
        lastRow.querySelector('.ingredient-input').value = ingredient.item;
        lastRow.querySelector('.unit-input').value = ingredient.unit || '';
    });
}