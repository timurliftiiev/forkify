import { elements } from "./base";

// Get Input Value
export const getInput = () => elements.searchInput.value;

// Clear Search Input
export const clearInput = () => {
    elements.searchInput.value = '';
};

// Clear previous Search result from UI
export const clearResults = () => {
    elements.searchResultList.innerHTML = '';
    elements.searchResultPages.innerHTML = '';
};

// Add active class to selected recipe
export const highlitedSelector = id => {
    const results = document.querySelectorAll('.results__link');
    results.forEach(el => el.classList.remove('results__link--active'));

    if (document.querySelector(`.results__link[href="#${id}"]`)) {
        document.querySelector(`.results__link[href="#${id}"]`).classList.add('results__link--active');
    }
};

// Reduce title
export const limitRecipeTitle = (title, limit = 17) => {
    const newTitle = [];

    if (title.length > limit) {
        title.split(' ').reduce((accumulator, current) => {
            if (accumulator + current.length < 17) newTitle.push(current);
            return accumulator + current.length;
        }, 0);

        return `${newTitle.join(' ')} ...`;
    }

    return title;
};

// Add search result to UI
const renderRecipe = recipe => {
  const markup = `
    <li>
    <a class="results__link" href="#${recipe.recipe_id}">
        <figure class="results__fig">
            <img src="${recipe.image_url}" alt="${recipe.title}">
        </figure>
        <div class="results__data">
            <h4 class="results__name">${limitRecipeTitle(recipe.title)}</h4>
            <p class="results__author">${recipe.publisher}</p>
        </div>
     </a>
    </li>
    `;

    elements.searchResultList.insertAdjacentHTML('beforeend', markup);
};

// Create button, type 'prev' or 'next'
const createButton = (page, type) => `
        <button class="btn-inline results__btn--${type}" data-goto=${type === 'prev' ? +page - 1 : +page + 1}>
            <span>Page ${type === 'prev' ? +page - 1 : +page + 1}</span>   
            <svg class="search__icon">
                <use href="img/icons.svg#icon-triangle-${type === 'prev' ? 'left' : 'right'}"></use>
            </svg>
        </button>
    `;

// Render button
const renderButtons = (page, numResults, resPerPage) => {
    const pages = Math.ceil(numResults / resPerPage);
    let button; 

    if (page === 1 && pages > 1) {
       button = createButton(page, 'next');
    } else if (page < pages) {
        button = `
        ${createButton(page, 'next')}
        ${button = createButton(page, 'prev')}
        `;
    } else if (page === pages && pages > 1) {
        button = createButton(page, 'prev');
    }

    elements.searchResultPages.insertAdjacentHTML('afterbegin', button);
};

// Render search result
export const renderRecipes = (recipes, page = 1, resPerPage = 10) => {
    // Render results of current page
    const start = (page - 1) * resPerPage;
    const end = resPerPage * page;

  recipes.slice(start, end).forEach(renderRecipe);

    // Render pagination buttons
    renderButtons(page, recipes.length, resPerPage);
};
