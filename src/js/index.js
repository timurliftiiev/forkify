import Search from "./models/Search";
import Recipe from "./models/Recipe";
import List from "./models/List";
import Likes from "./models/Likes";
import * as searchView from "./views/searchView";
import * as recipeView from "./views/recipeView";
import * as listView from "./views/listView";
import * as likesView from "./views/likesView";
import { elements, renderLoader, clearLoader } from "./views/base";

/** Global state of APP
 *- Search object
 *- Current recipe object
 *- Shopping list object
 *- Like recipes
 */
const state = {};


// SEARCH CONTROLLER
const controlSearch = async () => {
  // 1. Get query from view
  const query = searchView.getInput();

  if (query) {
    // 2. New search object add to state
    state.search = new Search(query);

    // 3. Prepare UI for results
    searchView.clearInput();
    searchView.clearResults();
    renderLoader(elements.searchResult);

    try {
      // 4. Search for results
      await state.search.getResults();

      // Render results on UI
      clearLoader();
      searchView.renderRecipes(state.search.result);
      
    } catch (error) {
      console.log(error);
      clearLoader();
    }
  }
};

elements.searchForm.addEventListener("submit", event => {
  event.preventDefault();
  controlSearch();
});

elements.searchResultPages.addEventListener("click", event => {
  const button = event.target.closest(".btn-inline");

  if (button) {
    const goToPage = +button.dataset.goto;
    searchView.clearResults();
    searchView.renderRecipes(state.search.result, goToPage);
  }
});

// RECIPE CONTROLLER
const controlRecipe = async () => {
  // Get the ID from URL
  const id = window.location.hash.replace("#", "");

  if (id) {
    // Prepare UI for changes
    recipeView.clearRecipe();
    renderLoader(elements.recipe);

    // Highlight controller
    if (state.search) searchView.highlitedSelector(id);

    // Create new Recipe object
    state.recipe = new Recipe(id);

    try {
      // Get Recipe Data
      await state.recipe.getRecipe();

      state.recipe.parseIngridients();

      // Calculate time and serving
      state.recipe.calcTime();
      state.recipe.calcServings();

      // Render recipe
      clearLoader();
      recipeView.renderRecipe(
        state.recipe,
        state.likes.isLiked(id)
        );

    } catch (error) {
      console.log(error);
    }
  }
};

["hashchange", "load"].forEach(event => {
  window.addEventListener(event, controlRecipe);
});

// LIST CONTROLLER
const controlList = () => {
  // Create a new List if there in NO ONE
  if (!state.list) state.list = new List();

  // Add each ingridient to the list
  state.recipe.ingredients.forEach(ing => {
    const item = state.list.addItem(ing.count, ing.unit, ing.ingredient);
    listView.renderItem(item);
  });
};


// LIKE CONTROLLER
const controlLike = () => {
  if (!state.likes) state.likes = new Likes();

  const currentID = state.recipe.id;

  state.likes.isLiked(currentID)

  // User HAS NOT liked this recipe
  if (!state.likes.isLiked(currentID)) {
    // Add like to the state
    const newLike = state.likes.addLike(
      currentID,
      state.recipe.title,
      state.recipe.author,
      state.recipe.img
    );

    // Toggle the like button
    likesView.toogleLikeBtn(true);

    // Add like to UI list
    likesView.renderLike(newLike);
  } else {
  // User HAS liked this recipe

  // Remove like from the state
  state.likes.deleteLike(currentID);

  // Toogle like button
  likesView.toogleLikeBtn(false);

  // Remove like from UI list
  likesView.deleteLike(currentID);

  }

  likesView.toogleLikesMenu(state.likes.getNumberOfLikes());
};

// Restore liked recipes on page load
window.addEventListener('load', () => {
    state.likes = new Likes();

    state.likes.readStorage();

    likesView.toogleLikesMenu(state.likes.getNumberOfLikes());

    state.likes.likes.forEach(el => likesView.renderLike(el));
});

elements.recipe.addEventListener('click', event => {
  if (event.target.matches('.btn-decrease, .btn-decrease *')) {
    if (state.recipe.servings > 1) {
      state.recipe.updateServings('dec');
      recipeView.updateServingsIngridients(state.recipe);
    }

  } else if (event.target.matches('.btn-increase, .btn-increase *')) {
    state.recipe.updateServings('inc');
    recipeView.updateServingsIngridients(state.recipe);
  } else if (event.target.matches('.recipe__btn--add, .recipe__btn--add *')) {

    // Add recipe to shopping List
    controlList();
  } else if (event.target.matches('.recipe__love, .recipe__love *')) {
    
    // Add Likes object
    controlLike(); 
  }
});

// Handle delete and update buttons events
elements.shopping.addEventListener('click', event => {
  const id = event.target.closest('.shopping__item').dataset.itemid;

  // Handle delete button
  if (event.target.matches('.shopping__delete, .shopping__delete *')) {
    // Delete from state
    state.list.deleteItem(id);

    // Delete from UI
    listView.deleteItem(id);

    // Handle count update
  } else if (event.target.matches('.shopping__count--value')) {
    const val = parseFloat(event.target.value, 10);
    state.list.updateCount(id, val);
  }
});