<template>
  <UiContainer>
    <h2 class="text-4xl font-bold">
      Heute
    </h2>

    <ul class="flex grow items-center justify-center">
      <li
        v-for="entry, index in top"
        :key="index"
        ref="cards"
        class="absolute w-[90%] max-w-[25rem]"
        :style="{ zIndex: entry.index.value + 1 }"
      >
        <UiRecipe
          :recipe="entry.recipe"
          class="transition"
          :class="{
            'pointer-events-none': entry.index.value !== 2,
            'translate-x-[-4px] rotate-1': entry.index.value === 0,
            'translate-x-[4px] -rotate-2': entry.index.value === 1,
            '!border-green-500': state === 'match' && entry.index.value === 2,
          }"
        />
        <div
          v-if="state && entry.index.value === 2"
          class="absolute left-0 top-0 flex size-full items-center justify-center"
        >
          <div
            class="absolute left-0 top-0 size-full rounded"
            :class="{
              'bg-red-300': state === 'throw',
              'bg-green-300': state === 'like',
            }"
            :style="{ opacity: stateConfidence * .8 }"
          />
          <Icon
            v-if="state === 'like'"
            name="lucide:cooking-pot"
            size="5rem"
            class="text-green-500"
            :style="{ opacity: stateConfidence }"
          />
          <Icon
            v-else-if="state === 'throw'"
            name="lucide:x"
            size="5rem"
            class="text-red-500"
            :style="{ opacity: stateConfidence }"
          />
        </div>
      </li>
    </ul>
  </UiContainer>
</template>

<script setup lang="ts">
// @ts-expect-error not my lib
import Swing from '@brugarolas/swing/src'
import JSConfetti from 'js-confetti'

const store = useRecipesStore()
await store.fetchSuggestions()

let stack: Swing.Stack
let confetti: JSConfetti

let entryIndex = 8
const size = 3

const top = store.suggestions
  .slice(entryIndex, entryIndex + size)
  .map((e, index) => ({
    recipe: ref(e),
    index: ref(index),
  }))

const cards = ref([])
const state = ref<null | 'like' | 'throw' | 'match'>(null)
const stateConfidence = ref(0)

onMounted(async () => {
  await nextTick()

  confetti = new JSConfetti()

  stack = Swing.Stack({
    throwOutConfidence: (xOffset: number, yOffset: number, element: HTMLElement) => {
      const boost = 3
      const xConfidence = Math.min((Math.abs(xOffset) / element.offsetWidth) * boost, 1)
      const yConfidence = Math.min((Math.abs(yOffset) / element.offsetHeight) * boost, 1)
      return Math.max(xConfidence, yConfidence)
    },
  })
  cards.value.forEach(el => stack.createCard(el))
  stack.on('dragmove', (event: any) => {
    stateConfidence.value = event.throwOutConfidence
    if (event.throwDirection === Swing.Direction.RIGHT) state.value = 'like'
    else if (event.throwDirection === Swing.Direction.LEFT) state.value = 'throw'
    else state.value = null
  })
  stack.on('dragend', () => {
    if (state.value === 'match') return
    state.value = null
  })
  stack.on('throwout', (event: any) => {
    if (event.throwDirection === Swing.Direction.RIGHT) {
      const liked = top.find(o => o.index.value === 2)!
      $fetch('/api/recipe/like', {
        method: 'post',
        body: { ids: [liked.recipe.value.id] },
      })

      if (store.potentialMatches.includes(liked.recipe.value.id)) {
        confetti.addConfetti({ confettiColors: ['#FCC954', '#A24522', '#6B9139', '#3E6529', '#B67830'] })
        state.value = 'match'
        const style = window.getComputedStyle(event.target)
        const matrix = new WebKitCSSMatrix(style.transform)
        stack.getCard(event.target).throwIn(matrix.m41, matrix.m42)
        return
      }
    }

    const next = store.suggestions[entryIndex % store.suggestions.length]
    top.forEach((entry) => {
      entry.index.value = (entry.index.value + 1) % size
      if (entry.index.value === 0) entry.recipe.value = next
    })
    entryIndex += 1
    stack.getCard(event.target).throwIn(0, 0)
  })
})

onUnmounted(() => {
  stack.destroyAll()
  confetti.destroyCanvas()
})
</script>
