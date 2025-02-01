<template>
  <div
    class="
      relative h-[max(65vh,25rem)] overflow-hidden rounded border-5 bg-white graph-paper border-white p-5
      shadow-2xl
    "
  >
    <button type="button" class="float-right" @click="like">
      <Icon name="lucide:heart" size="1.5rem" />
    </button>

    <h2 class="mb-8 text-2xl font-bold">
      {{ recipe.name }}
    </h2>

    <table class="w-full">
      <tbody>
        <tr
          v-for="ingrediant, index in recipe.ingredients"
          :key="index"
          class="text-lg odd:bg-slate-300/50"
        >
          <td class="pl-2">
            {{ ingrediant.name }}
          </td>
          <td class="whitespace-nowrap px-2 text-right">
            {{ ingrediant.amount }}
            {{ ingrediant.unit }}
          </td>
        </tr>
      </tbody>
    </table>

    <p v-if="recipe.description" class="mt-8">
      {{ recipe.description }}
    </p>

    <div v-if="recipe.source" class="mt-8">
      <a :href="recipe.source" aria-label="Rezept" target="_blank">
        [Rezept]
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Selectable } from 'kysely'
import type { Ingredient, Recipe } from '~/types/kysely'

const props = defineProps<{
  recipe: Ref<Selectable<Recipe> & { ingredients: Ingredient[] }>
}>()
const emit = defineEmits<{
  like: []
}>()

const recipe = computed(() => props.recipe.value)

async function like() {
  await $fetch('/api/recipe/like', {
    method: 'post',
    body: {
      ids: [recipe.value.id],
    },
  })
  emit('like')
}
</script>
