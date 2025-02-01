<template>
  <UiContainer class="flex flex-col gap-6 pt-8">
    <div class="rounded-md bg-white p-4 pb-8 shadow-xl graph-paper">
      <h2 class="mb-4 text-lg font-bold">
        Neues Rezept
      </h2>

      <form class="flex flex-col items-start gap-2" @submit.prevent="add">
        <UiInput v-model="form.name" placeholder="Name" required />
        <UiInput v-model="form.description" placeholder="Beschreibung" />

        <h3>Zutaten</h3>
        <div v-for="ingredient, index in form.ingredients" :key="index" class="flex gap-1">
          <UiInput v-model="ingredient.name" placeholder="Name" class="!w-3/5" />
          <UiInput v-model="ingredient.amount" placeholder="Menge" class="!w-2/5" />
        </div>

        <UiInput
          v-model="form.instructions"
          placeholder="Zubereitung"
          textarea
          class="mt-4"
        />

        <UiButton type="submit" class="mt-4">
          Hinzufügen
        </UiButton>
      </form>
    </div>
  </UiContainer>
</template>

<script setup lang="ts">
const router = useRouter()
const localePath = useLocalePath()

const form = ref({
  name: '',
  description: '',
  instructions: '',
  ingredients: [] as {
    id: number
    name: string
    amount: string
  }[],
})

watch(() => form.value.ingredients, () => {
  const empty = form.value.ingredients.filter(o => !o.name).length
  if (empty === 0) {
    form.value.ingredients.push({
      id: Math.random(),
      name: '',
      amount: '',
    })
  }
}, {
  deep: true,
  immediate: true,
})

async function add() {
  const req = await $fetch('/api/recipe/add', {
    method: 'post',
    body: {
      ...form.value,
      ingredients: form.value.ingredients.filter(o => o.name),
    },
  })
  console.log(req)

  router.push(localePath({ name: 'index' }))
}
</script>
