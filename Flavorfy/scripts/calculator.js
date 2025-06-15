document.addEventListener('DOMContentLoaded', async function() {
    await RecipeUtils.loadRecipes();
    initializeCalculator();
    setupEventListeners();
    loadCalculationHistory();
    setupBottomNavigation();
});

let currentRecipe = null;
let ingredientCosts = {};
let calculationResults = {};

// Sistema de conversões simplificado
const unitConversions = {
    weight: {
        baseUnit: 'g',
        conversions: { 'g': 1, 'kg': 1000, 'lb': 453.592, 'oz': 28.3495 }
    },
    volume: {
        baseUnit: 'ml',
        conversions: {
            'ml': 1, 'l': 1000, 'cup': 240, 'tbsp': 15, 'tsp': 5,
            'fl oz': 29.5735, 'pint': 473.176, 'quart': 946.353, 'gallon': 3785.41
        }
    },
    unit: {
        baseUnit: 'piece',
        conversions: { 'piece': 1 }
    }
};

// Base de dados de conversão volume-peso
const ingredientConversions = {
    'flour': { 'cup': 120 }, 'all-purpose flour': { 'cup': 120 }, 'bread flour': { 'cup': 120 },
    'almond flour': { 'cup': 96 }, 'farinha': { 'cup': 120 }, 'farinha de trigo': { 'cup': 120 },
    'sugar': { 'cup': 200 }, 'granulated sugar': { 'cup': 200 }, 'brown sugar': { 'cup': 213 },
    'powdered sugar': { 'cup': 113.5 }, 'açúcar': { 'cup': 200 }, 'açúcar cristal': { 'cup': 200 },
    'açúcar mascavo': { 'cup': 213 }, 'butter': { 'cup': 227 }, 'milk': { 'cup': 240 },
    'manteiga': { 'cup': 227 }, 'leite': { 'cup': 240 }, 'oats': { 'cup': 85 },
    'rolled oats': { 'cup': 85 }, 'aveia': { 'cup': 85 }, 'cocoa powder': { 'cup': 84 },
    'chocolate chips': { 'cup': 170 }, 'cacau em pó': { 'cup': 84 }, 'nuts': { 'cup': 113 },
    'walnuts': { 'cup': 113 }, 'nozes': { 'cup': 113 }, 'honey': { 'cup': 340 },
    'maple syrup': { 'cup': 340 }, 'mel': { 'cup': 340 }
};

function getUnitType(unit) {
    if (!unit) return 'unit';
    const unitLower = unit.toLowerCase().trim();
    
    if (unitConversions.weight.conversions[unitLower] !== undefined) return 'weight';
    if (unitConversions.volume.conversions[unitLower] !== undefined) return 'volume';
    return 'unit';
}

function convertUnits(fromQuantity, fromUnit, toUnit) {
    if (!fromUnit || !toUnit || fromUnit === toUnit) return fromQuantity;
    
    const fromType = getUnitType(fromUnit);
    const toType = getUnitType(toUnit);
    
    if (fromType !== toType) return fromQuantity;
    
    const conversionTable = unitConversions[fromType];
    if (!conversionTable) return fromQuantity;
    
    const fromFactor = conversionTable.conversions[fromUnit.toLowerCase()];
    const toFactor = conversionTable.conversions[toUnit.toLowerCase()];
    
    if (!fromFactor || !toFactor) return fromQuantity;
    
    return (fromQuantity * fromFactor) / toFactor;
}

function convertVolumeToWeight(quantity, volumeUnit, ingredientName) {
    if (!ingredientName) return null;
    
    const ingredientKey = ingredientName.toLowerCase().trim();
    let conversionData = ingredientConversions[ingredientKey];
    
    if (!conversionData) {
        for (const [key, data] of Object.entries(ingredientConversions)) {
            if (ingredientKey.includes(key) || key.includes(ingredientKey)) {
                conversionData = data;
                break;
            }
        }
    }
    
    if (!conversionData) return null;
    
    const quantityInCups = convertUnits(quantity, volumeUnit, 'cup');
    return quantityInCups * conversionData.cup;
}

// FIX: Apenas habilitar botão e selecionar receita quando vem da URL
function initializeCalculator() {
    populateRecipeSelect();
    
    // Verificar se há um ID de receita na URL
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get('recipe');
    
    if (recipeId) {
        // Aguardar um pouco para garantir que o select foi populado
        setTimeout(() => {
            preselectRecipeFromUrl(recipeId);
        }, 100);
    }
}

// FIX: Nova função que apenas pré-seleciona a receita e habilita o botão
function preselectRecipeFromUrl(recipeId) {
    const select = document.getElementById('recipe-select');
    const loadBtn = document.getElementById('load-recipe-btn');
    
    if (!select || !loadBtn) {
        console.error('Select or load button not found');
        return;
    }
    
    // Verificar se a receita existe no select
    const option = select.querySelector(`option[value="${recipeId}"]`);
    if (!option) {
        console.warn('Recipe not found in select options:', recipeId);
        // Mostrar mensagem mais amigável
        alert('This recipe is not available for calculation. Make sure it is saved first.');
        return;
    }
    
    // Selecionar a receita no dropdown
    select.value = recipeId;
    
    // Habilitar o botão de carregar
    loadBtn.disabled = false;
    
    // Adicionar visual feedback de que a receita está pré-selecionada
    select.style.border = '2px solid var(--accent-color)';
    loadBtn.style.background = 'var(--accent-color)';
    loadBtn.style.color = 'var(--secondary-color)';
    
    // Scroll suave para o botão de carregar para chamar atenção
    setTimeout(() => {
        loadBtn.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    }, 300);
}

function populateRecipeSelect() {
    const recipes = RecipeUtils.getRecipesData();
    const select = document.getElementById('recipe-select');
    
    if (!select) {
        console.error('Recipe select element not found');
        return;
    }
    
    select.innerHTML = '<option value="">Choose a saved recipe to calculate costs...</option>';
    
    const savedRecipes = recipes.filter(recipe => 
        recipe.isSaved && recipe.ingredients && recipe.ingredients.length > 0
    );
    
    if (savedRecipes.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'No saved recipes available. Save some recipes first!';
        option.disabled = true;
        select.appendChild(option);
        return;
    }
    
    savedRecipes.forEach(recipe => {
        const option = document.createElement('option');
        option.value = recipe.id;
        option.textContent = recipe.name;
        select.appendChild(option);
    });
}

function setupEventListeners() {
    const recipeSelect = document.getElementById('recipe-select');
    const loadBtn = document.getElementById('load-recipe-btn');
    const calculateBtn = document.getElementById('calculate-btn');
    const profitMarginInput = document.getElementById('profit-margin');
    const toggleBreakdownBtn = document.getElementById('toggle-breakdown');
    const saveBtn = document.getElementById('save-calculation');
    const resetBtn = document.getElementById('reset-calculator');
    
    if (recipeSelect && loadBtn) {
        recipeSelect.addEventListener('change', () => {
            loadBtn.disabled = !recipeSelect.value;
            
            // Remover visual feedback quando usuário muda seleção manualmente
            recipeSelect.style.border = '';
            loadBtn.style.background = '';
            loadBtn.style.color = '';
        });
    }
    if (loadBtn) loadBtn.addEventListener('click', loadSelectedRecipe);
    if (calculateBtn) calculateBtn.addEventListener('click', calculateCosts);
    if (profitMarginInput) profitMarginInput.addEventListener('input', updateProfitCalculations);
    if (toggleBreakdownBtn) toggleBreakdownBtn.addEventListener('click', toggleCostBreakdown);
    if (saveBtn) saveBtn.addEventListener('click', saveCalculation);
    if (resetBtn) resetBtn.addEventListener('click', resetCalculator);
}

function loadSelectedRecipe() {
    const recipeSelect = document.getElementById('recipe-select');
    const loadBtn = document.getElementById('load-recipe-btn');
    
    if (!recipeSelect || !recipeSelect.value) {
        alert('Please select a recipe first');
        return;
    }
    
    const recipeId = parseInt(recipeSelect.value);
    const recipes = RecipeUtils.getRecipesData();
    const recipe = recipes.find(r => r.id === recipeId);
    
    if (!recipe) {
        alert('Recipe not found');
        return;
    }
    
    if (!recipe.isSaved) {
        alert('Only saved recipes can be calculated. Please save this recipe first.');
        return;
    }
    
    // Remover visual feedback após carregar
    recipeSelect.style.border = '';
    loadBtn.style.background = '';
    loadBtn.style.color = '';
    
    currentRecipe = recipe;
    displayRecipe(recipe);
    setupCostInputs(recipe);
    
    // Show/hide sections - using correct IDs from HTML
    const recipeDisplaySection = document.getElementById('recipe-display');
    const costInputSection = document.getElementById('cost-input');
    const resultsSection = document.getElementById('results');
    
    if (recipeDisplaySection) recipeDisplaySection.style.display = 'block';
    if (costInputSection) costInputSection.style.display = 'block';
    if (resultsSection) resultsSection.style.display = 'none';
    
    ingredientCosts = {};
    calculationResults = {};
    
    // Scroll suave para a seção de inputs de custo após carregar
    setTimeout(() => {
        const costInputSection = document.getElementById('cost-input');
        if (costInputSection) {
            costInputSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    }, 300);
}

function displayRecipe(recipe) {
    const nameElement = document.getElementById('selected-recipe-name');
    const servesElement = document.getElementById('recipe-serves');
    const difficultyElement = document.getElementById('recipe-difficulty');
    
    if (nameElement) nameElement.textContent = recipe.name;
    if (servesElement) servesElement.textContent = `Serves: ${recipe.serves}`;
    if (difficultyElement) {
        difficultyElement.textContent = `Difficulty: ${recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}`;
    }
    
    // Note: Recipe image functionality removed as requested
    console.log('Recipe loaded successfully:', recipe.name);
}

function setupCostInputs(recipe) {
    const container = document.getElementById('ingredients-cost-grid');
    if (!container) {
        console.error('Ingredients cost grid container not found');
        return;
    }
    
    container.innerHTML = '';
    
    const { essentialIngredients, toTasteIngredients } = separateIngredients(recipe);
    
    if (essentialIngredients.length > 0) {
        addSectionHeader(container, 'Essential Ingredients');
        essentialIngredients.forEach(ingredient => createIngredientItem(ingredient, container));
    }
    
    if (toTasteIngredients.length > 0) {
        createToTasteSection(toTasteIngredients, container);
    }
}

function separateIngredients(recipe) {
    const essentialIngredients = [];
    const toTasteIngredients = [];
    
    recipe.ingredients.forEach((ingredient, index) => {
        const ingredientWithIndex = { ...ingredient, originalIndex: index };
        if (ingredient.quantity === 'to taste') {
            toTasteIngredients.push(ingredientWithIndex);
        } else {
            essentialIngredients.push(ingredientWithIndex);
        }
    });
    
    return { essentialIngredients, toTasteIngredients };
}

function addSectionHeader(container, title) {
    const header = document.createElement('h3');
    header.textContent = title;
    header.className = 'ingredients-section-header';
    container.appendChild(header);
}

function createIngredientItem(ingredient, container, isOptional = false) {
    const index = ingredient.originalIndex;
    const itemDiv = document.createElement('div');
    itemDiv.className = `ingredient-item ${isOptional ? 'optional' : ''}`;
    itemDiv.dataset.ingredientIndex = index;
    
    const recipeQuantity = ingredient.quantity === 'to taste' ? 'to taste' :
        ingredient.unit ? `${ingredient.quantity} ${ingredient.unit}` : `${ingredient.quantity}`;
    
    itemDiv.innerHTML = createIngredientTemplate(ingredient, index, recipeQuantity, isOptional);
    container.appendChild(itemDiv);
    
    setupIngredientEventListeners(itemDiv, ingredient, index);
}

function createIngredientTemplate(ingredient, index, recipeQuantity, isOptional) {
    const removeButton = isOptional ? 
        `<button type="button" class="remove-btn" data-index="${index}">×</button>` : '';
    
    const actualUsageSection = ingredient.quantity === 'to taste' ? `
        <div class="actual-usage">
            <h5>Amount you'll actually use:</h5>
            <div class="usage-inputs">
                <input type="number" class="actual-quantity" data-ingredient-index="${index}"
                       placeholder="Amount" step="0.01" min="0">
                <select class="actual-unit" data-ingredient-index="${index}">
                    <option value="">Unit</option>
                    <option value="g">grams</option>
                    <option value="kg">kg</option>
                    <option value="lb">pounds</option>
                    <option value="oz">ounces</option>
                    <option value="ml">ml</option>
                    <option value="l">liters</option>
                    <option value="cup">cups</option>
                    <option value="tbsp">tbsp</option>
                    <option value="tsp">tsp</option>
                    <option value="piece">pieces</option>
                </select>
            </div>
        </div>
    ` : '';
    
    return `
        <div class="ingredient-header">
            <div class="ingredient-name">${ingredient.item}</div>
            <div class="recipe-needs">Recipe needs: ${recipeQuantity}</div>
            ${removeButton}
        </div>
        
        ${actualUsageSection}
        
        <div class="purchase-inputs">
            <div class="input-group">
                <label>Quantity you buy:</label>
                <input type="number" class="purchase-quantity" data-ingredient-index="${index}"
                       placeholder="e.g., 1000" step="0.01" min="0">
            </div>
            
            <div class="input-group">
                <label>Unit:</label>
                <select class="purchase-unit" data-ingredient-index="${index}">
                    <option value="">Select unit</option>
                    ${createUnitOptions()}
                </select>
            </div>
            
            <div class="input-group">
                <label>Total price paid:</label>
                <div class="price-input">
                    <span class="currency">$</span>
                    <input type="number" class="purchase-price" data-ingredient-index="${index}"
                           placeholder="0.00" step="0.01" min="0">
                </div>
            </div>
        </div>
        
        <div class="cost-display">
            <div class="conversion-info" id="conversion-info-${index}" style="display: none;">
                <small class="conversion-text">Conversion: <span class="conversion-details"></span></small>
            </div>
            <div class="unit-cost">Cost per unit: <span class="unit-cost-value">$0.00</span></div>
            <div class="recipe-cost">Cost for this recipe: <span class="recipe-cost-value">$0.00</span></div>
        </div>
    `;
}

function createUnitOptions() {
    const unitOptions = ['piece']
        .map(unit => `<option value="${unit}">${unit}</option>`).join('');
    const weightOptions = ['g', 'kg', 'lb', 'oz']
        .map(unit => `<option value="${unit}">${unit}</option>`).join('');
    const volumeOptions = ['ml', 'l', 'cup', 'tbsp', 'tsp', 'fl oz', 'pint', 'quart', 'gallon']
        .map(unit => `<option value="${unit}">${unit}</option>`).join('');
    
    return `
        <optgroup label="Units">${unitOptions}</optgroup>
        <optgroup label="Weight">${weightOptions}</optgroup>
        <optgroup label="Volume">${volumeOptions}</optgroup>
    `;
}

function setupIngredientEventListeners(itemDiv, ingredient, index) {
    const inputs = itemDiv.querySelectorAll('.purchase-quantity, .purchase-unit, .purchase-price, .actual-quantity, .actual-unit');
    const updateCalculation = () => calculateIngredientCost(index, ingredient, itemDiv);
    
    inputs.forEach(input => {
        if (input) {
            input.addEventListener('input', updateCalculation);
            input.addEventListener('change', updateCalculation);
        }
    });
    
    const removeBtn = itemDiv.querySelector('.remove-btn');
    if (removeBtn) {
        removeBtn.addEventListener('click', () => removeToTasteIngredient(index));
    }
}

function createToTasteSection(toTasteIngredients, container) {
    const toTasteSection = document.createElement('section');
    toTasteSection.className = 'to-taste-section';
    toTasteSection.innerHTML = `
        <h3 class="ingredients-section-header">Other Ingredients (Optional)</h3>
        <p class="section-description">
            These ingredients are marked as "to taste" in the recipe. 
            Select which ones you want to include in your cost calculation:
        </p>
        <div class="to-taste-controls">
            <button type="button" id="add-to-taste-btn" class="add-btn">
                + Add Optional Ingredient
            </button>
            <div class="to-taste-selector" id="to-taste-selector" style="display: none;">
                <select id="to-taste-ingredient-select">
                    <option value="">Choose an ingredient...</option>
                    ${toTasteIngredients.map(ingredient => 
                        `<option value="${ingredient.originalIndex}">${ingredient.item}</option>`
                    ).join('')}
                </select>
                <button type="button" id="confirm-to-taste-btn" class="confirm-btn">Add</button>
                <button type="button" id="cancel-to-taste-btn" class="cancel-btn">Cancel</button>
            </div>
        </div>
        <div class="to-taste-ingredients" id="to-taste-ingredients"></div>
    `;
    
    container.appendChild(toTasteSection);
    setupToTasteEventListeners(toTasteIngredients);
}

function setupToTasteEventListeners(toTasteIngredients) {
    const addBtn = document.getElementById('add-to-taste-btn');
    const selector = document.getElementById('to-taste-selector');
    const select = document.getElementById('to-taste-ingredient-select');
    const confirmBtn = document.getElementById('confirm-to-taste-btn');
    const cancelBtn = document.getElementById('cancel-to-taste-btn');
    
    if (!addBtn || !selector || !select || !confirmBtn || !cancelBtn) {
        console.error('To-taste elements not found');
        return;
    }
    
    addBtn.addEventListener('click', () => {
        const availableOptions = Array.from(select.options).filter(option => 
            option.value !== '' && !option.disabled
        );
        
        if (availableOptions.length === 0) {
            alert('All optional ingredients have been added.');
            return;
        }
        
        addBtn.style.display = 'none';
        selector.style.display = 'flex';
        select.value = '';
    });
    
    confirmBtn.addEventListener('click', () => {
        const selectedIndex = parseInt(select.value);
        if (!selectedIndex && selectedIndex !== 0) {
            alert('Please select an ingredient.');
            return;
        }
        
        const ingredient = toTasteIngredients.find(ing => ing.originalIndex === selectedIndex);
        if (ingredient) {
            const container = document.getElementById('to-taste-ingredients');
            if (container) {
                createIngredientItem(ingredient, container, true);
                
                const option = select.querySelector(`option[value="${selectedIndex}"]`);
                if (option) {
                    option.disabled = true;
                    option.style.display = 'none';
                }
            }
        }
        
        addBtn.style.display = 'inline-block';
        selector.style.display = 'none';
        select.value = '';
    });
    
    cancelBtn.addEventListener('click', () => {
        addBtn.style.display = 'inline-block';
        selector.style.display = 'none';
        select.value = '';
    });
}

function removeToTasteIngredient(index) {
    const itemDiv = document.querySelector(`[data-ingredient-index="${index}"].optional`);
    if (itemDiv) itemDiv.remove();
    
    const select = document.getElementById('to-taste-ingredient-select');
    const option = select?.querySelector(`option[value="${index}"]`);
    if (option) {
        option.disabled = false;
        option.style.display = 'block';
    }
    
    delete ingredientCosts[index];
    checkAllCostsEntered();
}

function calculateIngredientCost(index, ingredient, itemDiv) {
    const purchaseQuantity = parseFloat(itemDiv.querySelector('.purchase-quantity')?.value) || 0;
    const purchaseUnit = itemDiv.querySelector('.purchase-unit')?.value;
    const purchasePrice = parseFloat(itemDiv.querySelector('.purchase-price')?.value) || 0;
    
    const unitCostDisplay = itemDiv.querySelector('.unit-cost-value');
    const recipeCostDisplay = itemDiv.querySelector('.recipe-cost-value');
    const conversionInfo = itemDiv.querySelector(`#conversion-info-${index}`);
    const conversionDetails = itemDiv.querySelector('.conversion-details');
    
    if (!purchaseQuantity || !purchaseUnit || !purchasePrice) {
        resetCostDisplay(unitCostDisplay, recipeCostDisplay, conversionInfo, index);
        return;
    }
    
    const costPerPurchaseUnit = purchasePrice / purchaseQuantity;
    if (unitCostDisplay) {
        unitCostDisplay.textContent = `$${costPerPurchaseUnit.toFixed(4)} per ${purchaseUnit}`;
    }
    
    const { recipeQuantityNeeded, recipeUnit } = getRecipeQuantity(ingredient, itemDiv);
    
    if (!recipeQuantityNeeded || !recipeUnit) {
        resetCostDisplay(unitCostDisplay, recipeCostDisplay, conversionInfo, index);
        return;
    }
    
    const { costForRecipe, conversionText } = calculateConvertedCost(
        recipeQuantityNeeded, recipeUnit, purchaseUnit, costPerPurchaseUnit, ingredient.item
    );
    
    if (recipeCostDisplay) {
        recipeCostDisplay.textContent = `$${costForRecipe.toFixed(4)}`;
    }
    
    if (conversionText && conversionDetails && conversionInfo) {
        conversionDetails.textContent = conversionText;
        conversionInfo.style.display = 'block';
    } else if (conversionInfo) {
        conversionInfo.style.display = 'none';
    }
    
    ingredientCosts[index] = {
        ingredient, purchaseQuantity, purchaseUnit, purchasePrice,
        costPerPurchaseUnit, recipeQuantityNeeded, recipeUnit,
        costForRecipe, conversionText, isToTaste: ingredient.quantity === 'to taste'
    };
    
    checkAllCostsEntered();
}

function resetCostDisplay(unitCostDisplay, recipeCostDisplay, conversionInfo, index) {
    if (unitCostDisplay) unitCostDisplay.textContent = '$0.00';
    if (recipeCostDisplay) recipeCostDisplay.textContent = '$0.00';
    if (conversionInfo) conversionInfo.style.display = 'none';
    ingredientCosts[index] = null;
    checkAllCostsEntered();
}

function getRecipeQuantity(ingredient, itemDiv) {
    if (ingredient.quantity === 'to taste') {
        const actualQuantity = itemDiv.querySelector('.actual-quantity');
        const actualUnit = itemDiv.querySelector('.actual-unit');
        return {
            recipeQuantityNeeded: parseFloat(actualQuantity?.value) || 0,
            recipeUnit: actualUnit?.value || ''
        };
    } else {
        return {
            recipeQuantityNeeded: parseFloat(ingredient.quantity) || 0,
            recipeUnit: ingredient.unit || 'piece'
        };
    }
}

function calculateConvertedCost(recipeQuantityNeeded, recipeUnit, purchaseUnit, costPerPurchaseUnit, ingredientName) {
    const purchaseUnitType = getUnitType(purchaseUnit);
    const recipeUnitType = getUnitType(recipeUnit);
    
    let costForRecipe = 0;
    let conversionText = '';
    
    if (purchaseUnitType === recipeUnitType) {
        const convertedQuantity = convertUnits(recipeQuantityNeeded, recipeUnit, purchaseUnit);
        costForRecipe = convertedQuantity * costPerPurchaseUnit;
        
        if (recipeUnit.toLowerCase() !== purchaseUnit.toLowerCase()) {
            conversionText = `${recipeQuantityNeeded} ${recipeUnit} = ${convertedQuantity.toFixed(4)} ${purchaseUnit}`;
        }
    } else if (purchaseUnitType === 'volume' && recipeUnitType === 'weight') {
        const result = convertVolumeToWeight(recipeQuantityNeeded, recipeUnit, ingredientName);
        if (result) {
            const volumeNeeded = convertUnits(result, 'g', 'ml');
            const volumeInPurchaseUnit = convertUnits(volumeNeeded, 'ml', purchaseUnit);
            costForRecipe = volumeInPurchaseUnit * costPerPurchaseUnit;
            conversionText = `${recipeQuantityNeeded} ${recipeUnit} ≈ ${result.toFixed(1)}g ≈ ${volumeInPurchaseUnit.toFixed(4)} ${purchaseUnit}`;
        } else {
            costForRecipe = recipeQuantityNeeded * costPerPurchaseUnit;
            conversionText = `Approximate conversion (1:1 ratio)`;
        }
    } else if (purchaseUnitType === 'weight' && recipeUnitType === 'volume') {
        const weightInGrams = convertVolumeToWeight(1, recipeUnit, ingredientName);
        if (weightInGrams) {
            const totalWeightNeeded = recipeQuantityNeeded * weightInGrams;
            const weightInPurchaseUnit = convertUnits(totalWeightNeeded, 'g', purchaseUnit);
            costForRecipe = weightInPurchaseUnit * costPerPurchaseUnit;
            conversionText = `${recipeQuantityNeeded} ${recipeUnit} ≈ ${totalWeightNeeded.toFixed(1)}g ≈ ${weightInPurchaseUnit.toFixed(4)} ${purchaseUnit}`;
        } else {
            costForRecipe = recipeQuantityNeeded * costPerPurchaseUnit;
            conversionText = `Approximate conversion (1:1 ratio)`;
        }
    } else {
        costForRecipe = recipeQuantityNeeded * costPerPurchaseUnit;
        conversionText = `Direct ratio (${recipeQuantityNeeded} ${recipeUnit} = ${recipeQuantityNeeded} ${purchaseUnit})`;
    }
    
    return { costForRecipe, conversionText };
}

function checkAllCostsEntered() {
    if (!currentRecipe) return;
    
    const totalIngredients = currentRecipe.ingredients.length;
    const filledIngredients = Object.keys(ingredientCosts).filter(key => ingredientCosts[key] !== null).length;
    
    const calculateBtn = document.getElementById('calculate-btn');
    if (!calculateBtn) return;
    
    calculateBtn.disabled = filledIngredients === 0;
    
    if (filledIngredients === 0) {
        calculateBtn.textContent = 'Calculate Costs';
    } else if (filledIngredients < totalIngredients) {
        calculateBtn.textContent = `Calculate Costs (${filledIngredients}/${totalIngredients} ingredients)`;
    } else {
        calculateBtn.textContent = 'Calculate Costs (All ingredients)';
    }
}

function calculateCosts() {
    if (!currentRecipe || Object.keys(ingredientCosts).filter(key => ingredientCosts[key] !== null).length === 0) {
        alert('Please enter costs for at least one ingredient');
        return;
    }
    
    const totalCost = Object.values(ingredientCosts)
        .filter(item => item !== null)
        .reduce((sum, item) => sum + item.costForRecipe, 0);
    
    const costPerPortion = totalCost / currentRecipe.serves;
    const includedIngredients = Object.keys(ingredientCosts).filter(key => ingredientCosts[key] !== null).length;
    
    calculationResults = {
        recipeId: currentRecipe.id,
        recipeName: currentRecipe.name,
        totalCost, costPerPortion,
        serves: currentRecipe.serves,
        ingredientCosts: { ...ingredientCosts },
        includedIngredients, totalIngredients: currentRecipe.ingredients.length,
        timestamp: new Date().toISOString()
    };
    
    displayResults();
    
    const resultsSection = document.getElementById('results');
    if (resultsSection) {
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function displayResults() {
    const { totalCost, costPerPortion, includedIngredients, totalIngredients } = calculationResults;
    
    const totalCostElement = document.getElementById('total-cost');
    const costPerPortionElement = document.getElementById('cost-per-portion');
    
    if (totalCostElement) totalCostElement.textContent = totalCost.toFixed(2);
    if (costPerPortionElement) costPerPortionElement.textContent = costPerPortion.toFixed(2);
    
    const totalCostCard = document.querySelector('.result-card .cost-description');
    if (totalCostCard) {
        totalCostCard.textContent = includedIngredients < totalIngredients 
            ? `Total cost of ${includedIngredients} out of ${totalIngredients} ingredients`
            : 'Total cost of all ingredients';
    }
    
    updateProfitCalculations();
    createCostBreakdown();
}

function updateProfitCalculations() {
    if (!calculationResults.costPerPortion) return;
    
    const marginInput = document.getElementById('profit-margin');
    const margin = parseFloat(marginInput?.value) || 0;
    const costPerPortion = calculationResults.costPerPortion;
    const serves = calculationResults.serves;
    
    const suggestedPrice = costPerPortion / (1 - margin / 100);
    const totalSalePrice = suggestedPrice * serves;
    const profit = totalSalePrice - calculationResults.totalCost;
    
    const suggestedPriceElement = document.getElementById('suggested-price');
    const totalSalePriceElement = document.getElementById('total-sale-price');
    const profitAmountElement = document.getElementById('profit-amount');
    
    if (suggestedPriceElement) suggestedPriceElement.textContent = suggestedPrice.toFixed(2);
    if (totalSalePriceElement) totalSalePriceElement.textContent = totalSalePrice.toFixed(2);
    if (profitAmountElement) profitAmountElement.textContent = profit.toFixed(2);
}

function createCostBreakdown() {
    const container = document.getElementById('cost-breakdown');
    if (!container) return;
    
    container.innerHTML = '';
    
    const includedItems = Object.values(ingredientCosts).filter(item => item !== null);
    
    if (includedItems.length > 0) {
        addBreakdownSection(container, 'Ingredients Included in Calculation:', includedItems, false);
    }
    
    const excludedIngredients = currentRecipe.ingredients.filter((ingredient, index) => 
        !ingredientCosts[index] || ingredientCosts[index] === null
    );
    
    if (excludedIngredients.length > 0) {
        addBreakdownSection(container, 'Ingredients Not Included:', excludedIngredients, true);
    }
}

function addBreakdownSection(container, title, items, isExcluded) {
    const header = document.createElement('h4');
    header.textContent = title;
    header.style.marginBottom = '1rem';
    header.style.color = 'var(--text-color)';
    if (isExcluded) {
        header.style.marginTop = '2rem';
        header.style.opacity = '0.7';
    }
    container.appendChild(header);
    
    items.forEach(item => {
        const breakdownItem = document.createElement('div');
        breakdownItem.className = `breakdown-item ${isExcluded ? 'excluded' : ''}`;
        
        if (isExcluded) {
            const quantityText = item.quantity === 'to taste' ? 'to taste' :
                item.unit ? `${item.quantity} ${item.unit}` : `${item.quantity}`;
            
            breakdownItem.innerHTML = `
                <div class="breakdown-ingredient">
                    <div class="breakdown-name">${item.item}</div>
                    <div class="breakdown-details">Recipe needs: ${quantityText}</div>
                </div>
                <div class="breakdown-cost">Not calculated</div>
            `;
        } else {
            const recipeQuantityText = `${item.recipeQuantityNeeded} ${item.recipeUnit}`;
            const purchaseInfo = `${item.purchaseQuantity} ${item.purchaseUnit} for $${item.purchasePrice.toFixed(2)}`;
            const unitCost = `$${item.costPerPurchaseUnit.toFixed(4)} per ${item.purchaseUnit}`;
            
            breakdownItem.innerHTML = `
                <div class="breakdown-ingredient">
                    <div class="breakdown-name">${item.ingredient.item}</div>
                    <div class="breakdown-details">
                        <div>Purchase: ${purchaseInfo}</div>
                        <div>Unit cost: ${unitCost}</div>
                        <div>Recipe uses: ${recipeQuantityText}</div>
                        ${item.conversionText ? `<div class="conversion-info">${item.conversionText}</div>` : ''}
                    </div>
                </div>
                <div class="breakdown-cost">$${item.costForRecipe.toFixed(4)}</div>
            `;
        }
        
        container.appendChild(breakdownItem);
    });
}

function toggleCostBreakdown() {
    const breakdown = document.getElementById('cost-breakdown');
    const btn = document.getElementById('toggle-breakdown');
    
    if (!breakdown || !btn) return;
    
    if (breakdown.style.display === 'none') {
        breakdown.style.display = 'block';
        btn.textContent = 'Hide Details';
    } else {
        breakdown.style.display = 'none';
        btn.textContent = 'Show Details';
    }
}

function saveCalculation() {
    if (!calculationResults.totalCost && calculationResults.totalCost !== 0) {
        alert('No calculation to save');
        return;
    }
    
    const marginInput = document.getElementById('profit-margin');
    const margin = parseFloat(marginInput?.value) || 0;
    const savedCalculation = {
        ...calculationResults,
        profitMargin: margin,
        suggestedPrice: calculationResults.costPerPortion / (1 - margin / 100),
        id: Date.now()
    };
    
    const savedCalculations = JSON.parse(localStorage.getItem('flavorfy_calculations') || '[]');
    savedCalculations.unshift(savedCalculation);
    
    if (savedCalculations.length > 20) {
        savedCalculations.splice(20);
    }
    
    localStorage.setItem('flavorfy_calculations', JSON.stringify(savedCalculations));
    loadCalculationHistory();
    alert('Calculation saved successfully!');
}

function resetCalculator() {
    const recipeSelect = document.getElementById('recipe-select');
    const loadBtn = document.getElementById('load-recipe-btn');
    
    if (recipeSelect) {
        recipeSelect.value = '';
        recipeSelect.style.border = '';
    }
    if (loadBtn) {
        loadBtn.disabled = true;
        loadBtn.style.background = '';
        loadBtn.style.color = '';
    }
    
    const recipeDisplaySection = document.getElementById('recipe-display');
    const costInputSection = document.getElementById('cost-input');
    const resultsSection = document.getElementById('results');
    
    if (recipeDisplaySection) recipeDisplaySection.style.display = 'none';
    if (costInputSection) costInputSection.style.display = 'none';
    if (resultsSection) resultsSection.style.display = 'none';
    
    currentRecipe = null;
    ingredientCosts = {};
    calculationResults = {};
    
    populateRecipeSelect();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function loadCalculationHistory() {
    const savedCalculations = JSON.parse(localStorage.getItem('flavorfy_calculations') || '[]');
    const container = document.getElementById('history-grid');
    
    if (!container) return;
    
    if (savedCalculations.length === 0) {
        container.innerHTML = '<div class="empty-history">No saved calculations yet. Complete a calculation and save it to see it here.</div>';
        return;
    }
    
    container.innerHTML = savedCalculations.map(calc => {
        const date = new Date(calc.timestamp).toLocaleDateString();
        const completeness = calc.includedIngredients && calc.totalIngredients ? 
            ` (${calc.includedIngredients}/${calc.totalIngredients} ingredients)` : '';
        
        return `
            <div class="history-item" data-calculation-id="${calc.id}">
                <div class="history-recipe-name">${calc.recipeName}</div>
                <div class="history-details">
                    <span>${date}${completeness}</span>
                    <span class="history-cost">$${calc.costPerPortion.toFixed(2)}/portion</span>
                </div>
            </div>
        `;
    }).join('');
    
    container.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', function() {
            const calcId = parseInt(this.dataset.calculationId);
            loadSavedCalculation(calcId, savedCalculations);
        });
    });
}

function loadSavedCalculation(calcId, savedCalculations) {
    const calculation = savedCalculations.find(calc => calc.id === calcId);
    if (!calculation) return;
    
    const recipes = RecipeUtils.getRecipesData();
    const recipe = recipes.find(r => r.id === calculation.recipeId);
    
    if (!recipe || !recipe.isSaved) {
        alert('This recipe is no longer saved and cannot be loaded in the calculator.');
        return;
    }
    
    alert(`Saved calculation for ${calculation.recipeName}:\nCost per portion: $${calculation.costPerPortion.toFixed(2)}\nProfit margin: ${calculation.profitMargin}%\nSuggested price: $${calculation.suggestedPrice.toFixed(2)}`);
}

function setupBottomNavigation() {
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    navItems.forEach(item => {
        if (item.getAttribute('href') === './calculator.html') {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}