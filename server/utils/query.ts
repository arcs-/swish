import type { ExpressionBuilder } from 'kysely'
import { jsonArrayFrom } from 'kysely/helpers/sqlite'
import type { DB } from '~/types/kysely'

export function withIngredients(eb: ExpressionBuilder<DB, 'recipe'>) {
  return jsonArrayFrom(
    eb.selectFrom('ingredient')
      .select(['name', 'amount', 'unit', 'optional'])
      .whereRef('ingredient.recipe_id', '=', 'recipe.id')
      .orderBy('ingredient.order', 'asc'),
  ).as('ingredients')
}
