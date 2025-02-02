import { z, object } from 'zod'
import { db } from '~/server/storage/db'

export const oneSchema = object({
  id: z.coerce.number(),
})

export default defineEventHandler(async (event) => {
  const body = oneSchema.parse(getQuery(event))

  const recipe = await db.selectFrom('recipe')
    .where('recipe.id', '=', body.id)
    .selectAll()
    .select(eb => [withIngredients(eb)])
    .executeTakeFirstOrThrow()

  return recipe
})
