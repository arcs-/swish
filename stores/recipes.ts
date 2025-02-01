import type { Selectable } from 'kysely'
import type { Recipe } from '~/types/kysely'

export const useRecipesStore = defineStore('recipes', {
  state: () => ({
    recipes: [] as Selectable<Recipe>[],
    suggestions: [] as Selectable<Recipe>[],
    potentialMatches: [] as number[],
  }),
  actions: {
    async fetchAll() {
      const { recipes } = await $fetch('/api/recipe/all')
      this.recipes = recipes
    },
    async fetchSuggestions() {
      try {
        const { recipes } = await $fetch('/api/recipe/suggestions', {
          params: { position: 0 },
        })
        this.suggestions = recipes
        const { potentialMatches } = await $fetch('/api/recipe/potentialMatches')
        this.potentialMatches = potentialMatches.map(o => o.recipe_id)
      } catch (e) {
        console.error(e)
      }
    },
  },
})
