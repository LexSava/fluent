import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export async function getCached<T>(key: string): Promise<T | null> {
  return redis.get<T>(key)
}

export async function setCached<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  await redis.set(key, value, { ex: ttlSeconds })
}

export async function invalidateCache(key: string): Promise<void> {
  await redis.del(key)
}

const dueItemsKey = (userId: string) => `due_items:${userId}`

export async function getDueItemsCache(userId: string): Promise<string[] | null> {
  return redis.get<string[]>(dueItemsKey(userId))
}

export async function setDueItemsCache(userId: string, items: string[]): Promise<void> {
  await redis.set(dueItemsKey(userId), items, { ex: 60 * 60 })
}
