# Spoonacular API Integration

Ang Spoonacular API kay gamiton para sa recipe data (ingredients, instructions, nutritional info, etc.)

## How to Get Your Spoonacular API Key

1. Go to [https://spoonacular.com/food-api](https://spoonacular.com/food-api)
2. Click **"Get Access"** or **"Sign Up"**
3. Create an account (pwede ka mag-sign up using Google)
4. Choose a plan:
   - **Free Plan**: 150 requests/day (okay na para sa testing)
   - **Paid Plans**: Available if you need more requests
5. After signing up, go to **"My Console"** or **"Profile"**
6. Copy your **API Key**

## Add to Environment Variables

1. Open or create `.env.local` in the `my-app` folder
2. Add this line:

```env
NEXT_PUBLIC_SPOONACULAR_API_KEY=your-actual-api-key-here
```

## Example Usage

Here's how to use the Spoonacular API in your Next.js app:

```typescript
// lib/spoonacular.ts
const API_KEY = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;
const BASE_URL = 'https://api.spoonacular.com';

// Search for recipes
export async function searchRecipes(query: string, number: number = 10) {
  const response = await fetch(
    `${BASE_URL}/recipes/complexSearch?query=${query}&number=${number}&apiKey=${API_KEY}`
  );
  return response.json();
}

// Get recipe details
export async function getRecipeDetails(id: number) {
  const response = await fetch(
    `${BASE_URL}/recipes/${id}/information?apiKey=${API_KEY}`
  );
  return response.json();
}

// Get similar recipes
export async function getSimilarRecipes(id: number) {
  const response = await fetch(
    `${BASE_URL}/recipes/${id}/similar?apiKey=${API_KEY}`
  );
  return response.json();
}

// Get random recipes
export async function getRandomRecipes(number: number = 10) {
  const response = await fetch(
    `${BASE_URL}/recipes/random?number=${number}&apiKey=${API_KEY}`
  );
  return response.json();
}
```

## API Endpoints Available

- **Search Recipes**: `/recipes/complexSearch`
- **Recipe Information**: `/recipes/{id}/information`
- **Similar Recipes**: `/recipes/{id}/similar`
- **Random Recipes**: `/recipes/random`
- **Autocomplete**: `/recipes/autocomplete`
- **Nutritional Info**: `/recipes/{id}/nutritionWidget.json`

## Rate Limits

- **Free Plan**: 150 points/day (most requests = 1 point)
- Monitor your usage in the Spoonacular console

## Important Notes

- ✅ API key should start with `NEXT_PUBLIC_` para ma-access sa client-side
- ✅ Free plan is limited to 150 requests per day
- ✅ Mag-cache ka sa results para dili ka maubos ug API calls
- ❌ Never commit your actual API key to GitHub (use `.env.local` only)

## Example: Fetch Recipes in Your Component

```typescript
'use client';

import { useState, useEffect } from 'react';

export default function RecipeExplore() {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    async function fetchRecipes() {
      const apiKey = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;
      const response = await fetch(
        `https://api.spoonacular.com/recipes/random?number=10&apiKey=${apiKey}`
      );
      const data = await response.json();
      setRecipes(data.recipes);
    }
    fetchRecipes();
  }, []);

  return (
    <div>
      {recipes.map((recipe: any) => (
        <div key={recipe.id}>
          <h3>{recipe.title}</h3>
          <img src={recipe.image} alt={recipe.title} />
        </div>
      ))}
    </div>
  );
}
```

## Troubleshooting

- **401 Unauthorized**: Check if your API key is correct
- **402 Payment Required**: You've exceeded your daily limit
- **No results**: Try a different search query

## Documentation

Full API documentation: [https://spoonacular.com/food-api/docs](https://spoonacular.com/food-api/docs)
