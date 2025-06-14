document.addEventListener('DOMContentLoaded', async function() {
    // Carregar receitas primeiro
    await RecipeUtils.loadRecipes();
    
    // Inicializar calculadora
    initializeCalculator();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Carregar histórico de cálculos
    loadCalculationHistory();
    
    // Configurar bottom navigation
    setupBottomNavigation();
});

let currentRecipe = null;
let ingredientCosts = {};
let calculationResults = {};

// Inicializa a calculadora
function initializeCalculator() {
    populateRecipeSelect();
    
    // Verificar se há um ID de receita na URL
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get('recipe');
    if (recipeId) {
        const select = document.getElementById('recipe-select');
        select.value = recipeId;
        select.dispatchEvent(new Event('change'));
        if (select.value) { // Só carregar se a receita estiver salva
            document.getElementById('load-recipe-btn').click();
        }
    }
}

// Popula o select com as receitas salvas apenas
function populateRecipeSelect() {
    const recipes = RecipeUtils.getRecipesData();
    const select = document.getElementById('recipe-select');
    
    // Limpar opções existentes (exceto a primeira)
    select.innerHTML = '<option value="">Choose a saved recipe to calculate costs...</option>';
    
    // Filtrar apenas receitas salvas que têm ingredientes
    const savedRecipes = recipes.filter(recipe => 
        recipe.isSaved && 
        recipe.ingredients && 
        recipe.ingredients.length > 0
    );
    
    if (savedRecipes.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'No saved recipes available. Save some recipes first!';
        option.disabled = true;
        select.appendChild(option);
        return;
    }
    
    // Adicionar receitas salvas
    savedRecipes.forEach(recipe => {
        const option = document.createElement('option');
        option.value = recipe.id;
        option.textContent = recipe.name;
        select.appendChild(option);
    });
}

// Configura event listeners
function setupEventListeners() {
    const recipeSelect = document.getElementById('recipe-select');
    const loadBtn = document.getElementById('load-recipe-btn');
    const calculateBtn = document.getElementById('calculate-btn');
    const profitMarginInput = document.getElementById('profit-margin');
    const toggleBreakdownBtn = document.getElementById('toggle-breakdown');
    const saveBtn = document.getElementById('save-calculation');
    const resetBtn = document.getElementById('reset-calculator');
    
    // Recipe selection
    recipeSelect.addEventListener('change', function() {
        loadBtn.disabled = !this.value;
    });
    
    loadBtn.addEventListener('click', loadSelectedRecipe);
    
    // Calculation
    calculateBtn.addEventListener('click', calculateCosts);
    
    // Profit margin changes
    profitMarginInput.addEventListener('input', updateProfitCalculations);
    
    // Toggle breakdown
    toggleBreakdownBtn.addEventListener('click', toggleCostBreakdown);
    
    // Action buttons
    saveBtn.addEventListener('click', saveCalculation);
    resetBtn.addEventListener('click', resetCalculator);
}

// Carrega a receita selecionada
function loadSelectedRecipe() {
    const recipeId = parseInt(document.getElementById('recipe-select').value);
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
    
    currentRecipe = recipe;
    displayRecipe(recipe);
    setupCostInputs(recipe);
    
    // Mostrar seções relevantes
    document.getElementById('recipe-display').style.display = 'block';
    document.getElementById('cost-input').style.display = 'block';
    document.getElementById('results').style.display = 'none';
    
    // Reset previous calculations
    ingredientCosts = {};
    calculationResults = {};
}

// Exibe os dados da receita
function displayRecipe(recipe) {
    document.getElementById('selected-recipe-name').textContent = recipe.name;
    document.getElementById('recipe-serves').textContent = `Serves: ${recipe.serves}`;
    document.getElementById('recipe-difficulty').textContent = `Difficulty: ${recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}`;
    
    // Imagem da receita
    const imageElement = document.getElementById('recipe-image-calc');
    const hasImage = recipe.cover && recipe.cover !== "image" && !recipe.cover.includes('placeholder.svg');
    
    if (hasImage) {
        imageElement.src = recipe.cover;
        imageElement.alt = recipe.name;
    } else {
        imageElement.src = './images/placeholder.svg';
        imageElement.alt = 'No image available';
    }
}

// Configura inputs de custo para ingredientes
function setupCostInputs(recipe) {
    const container = document.getElementById('ingredients-cost-grid');
    container.innerHTML = '';
    
    recipe.ingredients.forEach((ingredient, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'ingredient-cost-item';
        
        const isToTaste = ingredient.quantity === 'to taste' || ingredient.quantity === 'to taste';
        
        if (isToTaste) {
            // Interface especial para ingredientes "to taste"
            itemDiv.innerHTML = `
                <div class="ingredient-info">
                    <div class="ingredient-name">${ingredient.item}</div>
                    <div class="ingredient-quantity to-taste-label">Recipe calls for: to taste</div>
                    <div class="to-taste-note">Enter the actual amount you'll use:</div>
                </div>
                <div class="to-taste-inputs">
                    <div class="cost-input-group">
                        <label>Quantity used:</label>
                        <input type="number" 
                               step="0.01" 
                               min="0" 
                               placeholder="0"
                               data-ingredient-index="${index}"
                               class="quantity-used-input">
                    </div>
                    <div class="cost-input-group">
                        <label>Unit:</label>
                        <select data-ingredient-index="${index}" class="unit-used-select">
                            <option value="">Select unit</option>
                            <option value="g">gram(s)</option>
                            <option value="kg">kg</option>
                            <option value="ml">ml</option>
                            <option value="l">liter(s)</option>
                            <option value="cup">cup(s)</option>
                            <option value="tbsp">tablespoon(s)</option>
                            <option value="tsp">teaspoon(s)</option>
                            <option value="oz">ounce(s)</option>
                            <option value="lb">pound(s)</option>
                            <option value="piece">piece(s)</option>
                            <option value="can">can(s)</option>
                            <option value="package">package(s)</option>
                            <option value="pinch">pinch</option>
                            <option value="dash">dash</option>
                        </select>
                    </div>
                    <div class="cost-input-group">
                        <label>Cost per unit:</label>
                        <input type="number" 
                               step="0.01" 
                               min="0" 
                               placeholder="0.00"
                               data-ingredient-index="${index}"
                               class="ingredient-cost-input">
                    </div>
                </div>
                <div class="ingredient-total-cost" data-total-index="${index}">
                    $0.00
                </div>
            `;
        } else {
            // Interface normal para ingredientes com quantidade específica
            const quantityText = ingredient.unit ? 
                `${ingredient.quantity} ${ingredient.unit}` : 
                `${ingredient.quantity}`;
            
            itemDiv.innerHTML = `
                <div class="ingredient-info">
                    <div class="ingredient-name">${ingredient.item}</div>
                    <div class="ingredient-quantity">Recipe needs: ${quantityText}</div>
                </div>
                <div class="cost-input-group">
                    <label>Cost per ${ingredient.unit || 'unit'}:</label>
                    <input type="number" 
                           step="0.01" 
                           min="0" 
                           placeholder="0.00"
                           data-ingredient-index="${index}"
                           class="ingredient-cost-input">
                </div>
                <div class="ingredient-total-cost" data-total-index="${index}">
                    $0.00
                </div>
            `;
        }
        
        container.appendChild(itemDiv);
        
        // Adicionar event listeners para cálculo em tempo real
        if (isToTaste) {
            const quantityInput = itemDiv.querySelector('.quantity-used-input');
            const unitSelect = itemDiv.querySelector('.unit-used-select');
            const costInput = itemDiv.querySelector('.ingredient-cost-input');
            
            const updateTotal = () => {
                const quantity = parseFloat(quantityInput.value) || 0;
                const unit = unitSelect.value;
                const cost = parseFloat(costInput.value) || 0;
                
                if (quantity > 0 && unit && cost > 0) {
                    updateIngredientTotal(index, cost, {
                        ...ingredient,
                        quantity: quantity,
                        unit: unit
                    });
                } else {
                    ingredientCosts[index] = null;
                    const totalElement = document.querySelector(`[data-total-index="${index}"]`);
                    totalElement.textContent = '$0.00';
                    checkAllCostsEntered();
                }
            };
            
            quantityInput.addEventListener('input', updateTotal);
            unitSelect.addEventListener('change', updateTotal);
            costInput.addEventListener('input', updateTotal);
        } else {
            const input = itemDiv.querySelector('.ingredient-cost-input');
            input.addEventListener('input', function() {
                updateIngredientTotal(index, this.value, ingredient);
            });
        }
    });
}

// Atualiza o total de um ingrediente específico
function updateIngredientTotal(index, costPerUnit, ingredient) {
    const quantity = parseFloat(ingredient.quantity) || 0;
    const cost = parseFloat(costPerUnit) || 0;
    const total = quantity * cost;
    
    // Armazenar custo do ingrediente
    ingredientCosts[index] = {
        ingredient: ingredient,
        costPerUnit: cost,
        totalCost: total
    };
    
    // Atualizar display
    const totalElement = document.querySelector(`[data-total-index="${index}"]`);
    totalElement.textContent = `$${total.toFixed(2)}`;
    
    // Habilitar botão de calcular se todos os custos foram preenchidos
    checkAllCostsEntered();
}

// Verifica se todos os custos foram inseridos
function checkAllCostsEntered() {
    const totalIngredients = currentRecipe.ingredients.length;
    const filledIngredients = Object.keys(ingredientCosts).filter(key => ingredientCosts[key] !== null).length;
    
    // Habilitar se pelo menos metade dos ingredientes foram preenchidos
    const calculateBtn = document.getElementById('calculate-btn');
    calculateBtn.disabled = filledIngredients === 0;
    
    // Atualizar texto do botão
    if (filledIngredients === 0) {
        calculateBtn.textContent = 'Calculate Costs';
    } else if (filledIngredients < totalIngredients) {
        calculateBtn.textContent = `Calculate Costs (${filledIngredients}/${totalIngredients} ingredients)`;
    } else {
        calculateBtn.textContent = 'Calculate Costs (All ingredients)';
    }
}

// Calcula os custos totais
function calculateCosts() {
    if (!currentRecipe || Object.keys(ingredientCosts).filter(key => ingredientCosts[key] !== null).length === 0) {
        alert('Please enter costs for at least one ingredient');
        return;
    }
    
    // Calcular custo total (apenas ingredientes com custo definido)
    const totalCost = Object.values(ingredientCosts)
        .filter(item => item !== null)
        .reduce((sum, item) => sum + item.totalCost, 0);
    
    // Calcular custo por porção
    const costPerPortion = totalCost / currentRecipe.serves;
    
    // Contar ingredientes incluídos vs total
    const includedIngredients = Object.keys(ingredientCosts).filter(key => ingredientCosts[key] !== null).length;
    const totalIngredients = currentRecipe.ingredients.length;
    
    // Armazenar resultados
    calculationResults = {
        recipeId: currentRecipe.id,
        recipeName: currentRecipe.name,
        totalCost: totalCost,
        costPerPortion: costPerPortion,
        serves: currentRecipe.serves,
        ingredientCosts: { ...ingredientCosts },
        includedIngredients: includedIngredients,
        totalIngredients: totalIngredients,
        timestamp: new Date().toISOString()
    };
    
    // Exibir resultados
    displayResults();
    
    // Mostrar seção de resultados
    document.getElementById('results').style.display = 'block';
    
    // Scroll para resultados
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}

// Exibe os resultados do cálculo
function displayResults() {
    const { totalCost, costPerPortion, includedIngredients, totalIngredients } = calculationResults;
    
    // Exibir custos básicos
    document.getElementById('total-cost').textContent = totalCost.toFixed(2);
    document.getElementById('cost-per-portion').textContent = costPerPortion.toFixed(2);
    
    // Adicionar nota sobre ingredientes incluídos se não todos foram calculados
    const totalCostCard = document.querySelector('.result-card .cost-description');
    if (includedIngredients < totalIngredients) {
        totalCostCard.textContent = `Total cost of ${includedIngredients} out of ${totalIngredients} ingredients`;
    } else {
        totalCostCard.textContent = 'Total cost of all ingredients';
    }
    
    // Calcular preços sugeridos
    updateProfitCalculations();
    
    // Criar breakdown detalhado
    createCostBreakdown();
}

// Atualiza cálculos de lucro
function updateProfitCalculations() {
    if (!calculationResults.costPerPortion) return;
    
    const margin = parseFloat(document.getElementById('profit-margin').value) || 0;
    const costPerPortion = calculationResults.costPerPortion;
    const serves = calculationResults.serves;
    
    // Calcular preço sugerido por porção
    const suggestedPrice = costPerPortion / (1 - margin / 100);
    
    // Calcular preço total de venda
    const totalSalePrice = suggestedPrice * serves;
    
    // Calcular lucro esperado
    const profit = totalSalePrice - calculationResults.totalCost;
    
    // Atualizar displays
    document.getElementById('suggested-price').textContent = suggestedPrice.toFixed(2);
    document.getElementById('total-sale-price').textContent = totalSalePrice.toFixed(2);
    document.getElementById('profit-amount').textContent = profit.toFixed(2);
}

// Cria breakdown detalhado dos custos
function createCostBreakdown() {
    const container = document.getElementById('cost-breakdown');
    container.innerHTML = '';
    
    // Ingredientes incluídos no cálculo
    const includedItems = Object.values(ingredientCosts).filter(item => item !== null);
    
    if (includedItems.length > 0) {
        const includedHeader = document.createElement('h4');
        includedHeader.textContent = 'Ingredients Included in Calculation:';
        includedHeader.style.marginBottom = '1rem';
        includedHeader.style.color = 'var(--text-color)';
        container.appendChild(includedHeader);
        
        includedItems.forEach(item => {
            const breakdownItem = document.createElement('div');
            breakdownItem.className = 'breakdown-item';
            
            const quantityText = item.ingredient.unit ? 
                `${item.ingredient.quantity} ${item.ingredient.unit}` : 
                `${item.ingredient.quantity}`;
            
            breakdownItem.innerHTML = `
                <div class="breakdown-ingredient">
                    <div class="breakdown-name">${item.ingredient.item}</div>
                    <div class="breakdown-quantity">${quantityText} @ $${item.costPerUnit.toFixed(2)}/${item.ingredient.unit || 'unit'}</div>
                </div>
                <div class="breakdown-cost">$${item.totalCost.toFixed(2)}</div>
            `;
            
            container.appendChild(breakdownItem);
        });
    }
    
    // Ingredientes não incluídos
    const excludedIngredients = currentRecipe.ingredients.filter((ingredient, index) => 
        !ingredientCosts[index] || ingredientCosts[index] === null
    );
    
    if (excludedIngredients.length > 0) {
        const excludedHeader = document.createElement('h4');
        excludedHeader.textContent = 'Ingredients Not Included:';
        excludedHeader.style.marginTop = '2rem';
        excludedHeader.style.marginBottom = '1rem';
        excludedHeader.style.color = 'var(--text-color)';
        excludedHeader.style.opacity = '0.7';
        container.appendChild(excludedHeader);
        
        excludedIngredients.forEach(ingredient => {
            const breakdownItem = document.createElement('div');
            breakdownItem.className = 'breakdown-item excluded';
            breakdownItem.style.opacity = '0.6';
            breakdownItem.style.background = '#f8f8f8';
            
            const quantityText = ingredient.quantity === 'to taste' ? 'to taste' :
                ingredient.unit ? `${ingredient.quantity} ${ingredient.unit}` : `${ingredient.quantity}`;
            
            breakdownItem.innerHTML = `
                <div class="breakdown-ingredient">
                    <div class="breakdown-name">${ingredient.item}</div>
                    <div class="breakdown-quantity">${quantityText}</div>
                </div>
                <div class="breakdown-cost">Not calculated</div>
            `;
            
            container.appendChild(breakdownItem);
        });
    }
}

// Toggle do breakdown detalhado
function toggleCostBreakdown() {
    const breakdown = document.getElementById('cost-breakdown');
    const btn = document.getElementById('toggle-breakdown');
    
    if (breakdown.style.display === 'none') {
        breakdown.style.display = 'block';
        btn.textContent = 'Hide Details';
    } else {
        breakdown.style.display = 'none';
        btn.textContent = 'Show Details';
    }
}

// Salva o cálculo atual
function saveCalculation() {
    if (!calculationResults.totalCost && calculationResults.totalCost !== 0) {
        alert('No calculation to save');
        return;
    }
    
    // Adicionar margem de lucro aos resultados
    const margin = parseFloat(document.getElementById('profit-margin').value) || 0;
    const savedCalculation = {
        ...calculationResults,
        profitMargin: margin,
        suggestedPrice: calculationResults.costPerPortion / (1 - margin / 100),
        id: Date.now() // ID único baseado no timestamp
    };
    
    // Obter cálculos salvos existentes
    const savedCalculations = JSON.parse(localStorage.getItem('flavorfy_calculations') || '[]');
    
    // Adicionar novo cálculo
    savedCalculations.unshift(savedCalculation);
    
    // Manter apenas os últimos 20 cálculos
    if (savedCalculations.length > 20) {
        savedCalculations.splice(20);
    }
    
    // Salvar no localStorage
    localStorage.setItem('flavorfy_calculations', JSON.stringify(savedCalculations));
    
    // Atualizar histórico
    loadCalculationHistory();
    
    alert('Calculation saved successfully!');
}

// Reseta a calculadora
function resetCalculator() {
    // Limpar seleção
    document.getElementById('recipe-select').value = '';
    document.getElementById('load-recipe-btn').disabled = true;
    
    // Esconder seções
    document.getElementById('recipe-display').style.display = 'none';
    document.getElementById('cost-input').style.display = 'none';
    document.getElementById('results').style.display = 'none';
    
    // Limpar dados
    currentRecipe = null;
    ingredientCosts = {};
    calculationResults = {};
    
    // Recarregar lista de receitas (pode ter mudado)
    populateRecipeSelect();
    
    // Scroll para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Carrega histórico de cálculos
function loadCalculationHistory() {
    const savedCalculations = JSON.parse(localStorage.getItem('flavorfy_calculations') || '[]');
    const container = document.getElementById('history-grid');
    
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
    
    // Adicionar event listeners para items do histórico
    container.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', function() {
            const calcId = parseInt(this.dataset.calculationId);
            loadSavedCalculation(calcId, savedCalculations);
        });
    });
}

// Carrega um cálculo salvo
function loadSavedCalculation(calcId, savedCalculations) {
    const calculation = savedCalculations.find(calc => calc.id === calcId);
    if (!calculation) return;
    
    // Verificar se a receita ainda está salva
    const recipes = RecipeUtils.getRecipesData();
    const recipe = recipes.find(r => r.id === calculation.recipeId);
    
    if (!recipe || !recipe.isSaved) {
        alert('This recipe is no longer saved and cannot be loaded in the calculator.');
        return;
    }
    
    // Selecionar receita
    const select = document.getElementById('recipe-select');
    select.value = calculation.recipeId;
    
    // Carregar receita
    loadSelectedRecipe();
    
    // Aguardar um pouco para os inputs serem criados
    setTimeout(() => {
        // Preencher custos dos ingredientes
        Object.entries(calculation.ingredientCosts).forEach(([index, costData]) => {
            if (costData === null) return;
            
            const ingredient = currentRecipe.ingredients[index];
            const isToTaste = ingredient && (ingredient.quantity === 'to taste');
            
            if (isToTaste) {
                // Preencher inputs para "to taste"
                const quantityInput = document.querySelector(`[data-ingredient-index="${index}"].quantity-used-input`);
                const unitSelect = document.querySelector(`[data-ingredient-index="${index}"].unit-used-select`);
                const costInput = document.querySelector(`[data-ingredient-index="${index}"].ingredient-cost-input`);
                
                if (quantityInput && unitSelect && costInput) {
                    quantityInput.value = costData.ingredient.quantity;
                    unitSelect.value = costData.ingredient.unit || '';
                    costInput.value = costData.costPerUnit.toFixed(2);
                    
                    // Trigger update
                    costInput.dispatchEvent(new Event('input'));
                }
            } else {
                // Preencher input normal
                const input = document.querySelector(`[data-ingredient-index="${index}"].ingredient-cost-input`);
                if (input) {
                    input.value = costData.costPerUnit.toFixed(2);
                    input.dispatchEvent(new Event('input'));
                }
            }
        });
        
        // Definir margem de lucro
        document.getElementById('profit-margin').value = calculation.profitMargin || 50;
        
        // Calcular automaticamente
        setTimeout(() => {
            calculateCosts();
        }, 100);
    }, 200);
}

// Configura bottom navigation
function setupBottomNavigation() {
    // Marcar item ativo
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    navItems.forEach(item => {
        if (item.getAttribute('href') === './calculator.html') {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}