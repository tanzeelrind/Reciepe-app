document.getElementById('search-button').addEventListener('click', () => {
    const query = document.getElementById('search-bar').value;
    searchRecipe(query);
});

function searchRecipe(query) {
    const cachedRecipe = localStorage.getItem(query);
    if (cachedRecipe) {
        displayRecipe(JSON.parse(cachedRecipe));
    } else {
        fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${query}&number=10&apiKey=1d41ac0be80e4219a08bbb456820c037`)
            .then(response => response.json())
            .then(data => {
                localStorage.setItem(query, JSON.stringify(data.results));
                displayRecipe(data.results);
            })
            .catch(error => {
                console.error('Failed to fetch recipes:', error);
            });
    }
}

function displayRecipe(recipes) {
    const container = document.getElementById('recipe-container');
    container.innerHTML = '';

    const fetchRecipesDetails = recipes.map(recipe => {
        const recipeId = recipe.id;
        return fetch(`https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=1d41ac0be80e4219a08bbb456820c037`)
            .then(response => response.json())
            .then(details => {
                const card = createRecipeCard(details);
                container.appendChild(card);
            })
            .catch(error => {
                console.error('Failed to fetch recipe details:', error);
            });
    });

    Promise.all(fetchRecipesDetails);
}

function createRecipeCard(details) {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    const imageUrl = details.image ? details.image : 'null';
    const title = details.title.split(' ').slice(0, 2).join(' ');
    card.innerHTML = `
        <img src="${imageUrl}" alt="${details.title}">
        <h3>${title}</h3>`;
    card.addEventListener('click', () => {
        showRecipeDetails(details);
    });
    return card;
}

function showRecipeDetails(details) {
    const modal = document.getElementById('recipe-modal');
    const modalContent = document.getElementById('recipe-modal-content');
    const ingredients = details.extendedIngredients
        ? details.extendedIngredients.map(ingredient => `<li>${ingredient.original}</li>`).join('')
        : 'N/A';
    const pricePerServing = details.pricePerServing ? details.pricePerServing : 'N/A';

    modalContent.innerHTML = `
        <img src="${details.image}" alt="${details.title}">
        <h2>${details.title}</h2>
        <p><strong>Ingredients:</strong></p>
        <ul>${ingredients}</ul>
        <p><strong>Price Per Serving:</strong> ${pricePerServing}</p>
        <p><strong>Summary:</strong> ${details.summary ? details.summary.replace(/<[^>]*>?/gm, '') : 'N/A'}</p>
        <p><strong>Instructions:</strong> ${details.instructions ? details.instructions.replace(/<[^>]*>?/gm, '') : 'N/A'}</p>
        <button id="back-to-menu">Back to Menu</button>
    `;

    modal.style.display = 'block';

    // Event listener for the back to menu button
    document.getElementById('back-to-menu').addEventListener('click', () => {
        modal.style.display = 'none';
    });
}


