// Spoonacular API helper functions
const API_KEY = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;
const BASE_URL = 'https://api.spoonacular.com';

// Search for recipes
export async function searchRecipes(
  query: string, 
  number: number = 10,
  cuisine?: string,
  diet?: string
) {
  const params = new URLSearchParams({
    query,
    number: number.toString(),
    apiKey: API_KEY || '',
    addRecipeInformation: 'true',
  });

  if (cuisine) params.append('cuisine', cuisine);
  if (diet) params.append('diet', diet);

  const response = await fetch(`${BASE_URL}/recipes/complexSearch?${params}`);
  
  if (!response.ok) {
    throw new Error('Failed to search recipes');
  }
  
  return response.json();
}

// Get recipe details by ID
export async function getRecipeDetails(id: number) {
  const response = await fetch(
    `${BASE_URL}/recipes/${id}/information?apiKey=${API_KEY}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to get recipe details');
  }
  
  return response.json();
}

// Get similar recipes
export async function getSimilarRecipes(id: number, number: number = 4) {
  const response = await fetch(
    `${BASE_URL}/recipes/${id}/similar?number=${number}&apiKey=${API_KEY}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to get similar recipes');
  }
  
  return response.json();
}

// Get random recipes
export async function getRandomRecipes(number: number = 10, tags?: string) {
  const params = new URLSearchParams({
    number: number.toString(),
    apiKey: API_KEY || '',
  });

  if (tags) params.append('tags', tags);

  const response = await fetch(`${BASE_URL}/recipes/random?${params}`);
  
  if (!response.ok) {
    throw new Error('Failed to get random recipes');
  }
  
  return response.json();
}

// Autocomplete recipe search
export async function autocompleteRecipe(query: string, number: number = 5) {
  const response = await fetch(
    `${BASE_URL}/recipes/autocomplete?query=${query}&number=${number}&apiKey=${API_KEY}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to autocomplete');
  }
  
  return response.json();
}

// Get recipe nutrition info
export async function getRecipeNutrition(id: number) {
  const response = await fetch(
    `${BASE_URL}/recipes/${id}/nutritionWidget.json?apiKey=${API_KEY}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to get nutrition info');
  }
  
  return response.json();
}

// Get recipes by ingredients (what's in your fridge)
export async function getRecipesByIngredients(ingredients: string[], number: number = 10) {
  const ingredientsStr = ingredients.join(',');
  const response = await fetch(
    `${BASE_URL}/recipes/findByIngredients?ingredients=${ingredientsStr}&number=${number}&apiKey=${API_KEY}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to find recipes by ingredients');
  }
  
  return response.json();
}

// Parse ingredients from text
export async function parseIngredients(ingredientList: string[]) {
  const response = await fetch(
    `${BASE_URL}/recipes/parseIngredients?apiKey=${API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `ingredientList=${ingredientList.join('\n')}`,
    }
  );
  
  if (!response.ok) {
    throw new Error('Failed to parse ingredients');
  }
  
  return response.json();
}
