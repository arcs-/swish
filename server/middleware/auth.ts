import { getSession } from '~/server/utils/auth'

const withoutLoginUrls = [
  '/api/user/me',
  '/api/user/login',
  '/api/user/register',
  '/api/recipe/suggestions',
]

export default defineEventHandler((event) => {
  const url = getRequestURL(event)

  if (!url.pathname.startsWith('/api/')) return

  const session = getSession(event)
  event.context.auth = session

  if (withoutLoginUrls.includes(url.pathname)) {
    return
  }

  if (!session) {
    throw new Error('Not authenticated')
  }
})
