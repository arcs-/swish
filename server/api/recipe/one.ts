import { z, object } from 'zod'
import { db } from '~/server/storage/db'

export const oneSchema = object({
  id: z.number(),
})

export default defineEventHandler(async (event) => {
  const body = oneSchema.parse(await readBody(event))

  const recipe = await db.selectFrom('recipe')
    .where('recipe.id', '=', body.id)
    .selectAll()
    .select(eb => [withIngredients(eb)])
    .executeTakeFirstOrThrow()

  return recipe
})
