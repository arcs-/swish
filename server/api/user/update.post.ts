import type { Updateable } from 'kysely'
import { z, object } from 'zod'
import argon2 from '@node-rs/argon2'
import type { User } from '~/types/kysely'
import { db } from '~/server/storage/db'

export const updateSchema = object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().optional(),
  password: z.string().optional(),
  family_id: z.number().optional(),
})

export default defineEventHandler(async (event) => {
  const body = updateSchema.parse(await readBody(event))
  const session = getAuth(event)

  const userUpdate: Updateable<User> = {
    first_name: body.first_name,
    last_name: body.last_name,
    email: body.email,
    family_id: body.family_id,
  }

  if (body.password) {
    userUpdate.login_hash = await argon2.hash(body.password)
  }

  const updated = await db.updateTable('user')
    .set(userUpdate)
    .where('id', '=', session.id)
    .returningAll()
    .executeTakeFirstOrThrow()
  updated.login_hash = null

  return {
    user: updated,
  }
})
