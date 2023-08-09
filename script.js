class GetMeal {
  constructor(id) {
    this.id = id;
    this.single_mealEl = document.getElementById('single-meal');
  }

  async getMealByID() {
    try {
      const mealDetails = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${this.id}`);
      if (!mealDetails.ok) {
        throw new Error("Failed to fetch meal details.");
      }
      const data = await mealDetails.json();
      this.addMealToDom(data.meals[0])
    } catch (err) {
      console.error("Fetching error: ", err.message);
    }
  }

  addMealToDom(meal) {
    const ingredients = [];
    let i = 1;
    while (meal[`strIngredient${i}`]) {
      ingredients.push(`${meal[`strIngredient${i}`]} - ${meal[`strMeasure${i}`]}`)
      i++;
    }

    this.single_mealEl.innerHTML = `
      <div class="single-meal">
        <h3>${meal.strMeal}</h3>
        <img src="${meal.strMealThumb}" alt="{meal.strMeal}" />
        <div class="single-meal-info">
          ${meal.strCategory ? `<p>${meal.strCategory}</p>` : ""} 
          ${meal.strArea ? `<p>${meal.strArea}</p>` : ""} 
        </div>
        <div class="main">
        <p>${meal.strInstructions}</p>
        <h2>Ingredients</h2>
        <ul>
        ${ingredients.map(ing => `<li>${ing}</li>`).join('')}
        </ul>
        </div>
      </div>
    `
  }
}

class Search extends GetMeal {
  constructor() {
    super();
    this.search = document.getElementById('search');
    this.submit = document.getElementById('submit');
    this.submit.addEventListener('submit', this.searchMeal.bind(this));
  }
  
  showAlert() {
    alert('please enter something')
  }
  
  async searchMeal(event) {
    event.preventDefault();
    const term = this.search.value;
    this.single_mealEl.innerHTML = '';
    if (term.trim()) {
      const result = await this.fetching(term);
      const updateUI = new UpdateUI(result);
      updateUI.showMeal(term);
    } else {
      this.showAlert();
      return;
    }
  }
  
  async fetching(query) {
    try {
      const meal = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
      if (!meal.ok) {
        throw new Error("Failed to fetch meal.");
      }
      const data = await meal.json();
      return data;
    } catch (err) {
      console.error("Fetching error: ", err.message);
    }
  } 
}

class UpdateUI extends Search{
  constructor(data) {
    super();
      this.resultHeading = document.getElementById('result-heading');
      this.mealsEl = document.getElementById('meals');
      this.mealsEl.addEventListener('click', this.openMeal.bind(this));
      this.data = data;
    }
  
    showMeal(term) {
      this.resultHeading.innerHTML = `<h2>Search results for ${term}:</h2>`
      if (!this.data.meals) {
        this.resultHeading.innerHTML = '<h2>No result. Please try again!</h2>'
        this.mealsEl.innerHTML = "";
      } else {
        this.mealsEl.innerHTML = this.data.meals.map(meal => 
          `<div class="meal">
        <img src="${meal.strMealThumb}" alt="{meal.strMeal}" />
        <div class="meal-info" data-mealID="${meal.idMeal}">
          <h3>${meal.strMeal}</h3>
        </div>
        </div>`).join('')
      }
      this.search.value = "";
  }
  
  openMeal(event) {
    const mealInfo = event.target.classList.contains('meal-info')
      ? event.target
      : event.target.parentNode.classList.contains('meal-info')
        ? event.target.parentNode : null;
    
    if (mealInfo) {
      const mealID = mealInfo.getAttribute('data-mealID')
      const getMeal = new GetMeal(mealID);
      getMeal.getMealByID();
    } else {
      return;
        }
  }
}
  
class Random extends UpdateUI {
  constructor() {
    super();
    this.random = document.getElementById('random');
    this.single_mealEl = document.getElementById('single-meal');
      this.random.addEventListener('click', this.getRandomMeal.bind(this));
  }

  async getRandomMeal() {
    this.single_mealEl.innerHTML = "";
    const result = await this.searchRandomMeal();
    const getMeal = new GetMeal(result);
    getMeal.getMealByID();
    this.resultHeading.innerHTML = "";
    this.mealsEl.innerHTML = "";
    }

  async searchRandomMeal() {
    try {
        const randomMeal = await fetch(`https://www.themealdb.com/api/json/v1/1/random.php`);
        if (!randomMeal.ok) {
            throw new Error("Failed to fetch meal.");
        }
        const data = await randomMeal.json(); 
      return data.meals[0].idMeal;
      } catch (err) {
          console.error("Fetching error: ", err.message);
      }
  }
  }
  
  class App {
    constructor() {
      this.init();
    }
    init() {
      const search = new Search();
      const random = new Random();
      random.getRandomMeal();
    }
  }
  
  new App();
        

