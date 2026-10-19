import { Redis } from "@upstash/redis";
import { ProjectDraft } from "./types";

// In-memory fallback for local dev when Upstash is not configured
interface MemoryCacheEntry<T> {
  value: T;
  expiresAt: number;
}

const memoryStore = new Map<string, MemoryCacheEntry<unknown>>();

let redisClient: Redis | null = null;

function getRedisClient(): Redis | null {
  if (redisClient) return redisClient;

  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (url && token) {
    redisClient = new Redis({ url, token });
    return redisClient;
  }

  return null;
}

export function generateLLMCacheKey(username: string, repoName: string, pushedAt: string): string {
  // Key incorporates username, repoName, and pushedAt timestamp so cache auto-invalidates on new commits
  return `llm_draft:${username.toLowerCase()}:${repoName.toLowerCase()}:${pushedAt}`;
}

export async function getLLMCache(
  username: string,
  repoName: string,
  pushedAt: string
): Promise<ProjectDraft | null> {
  const key = generateLLMCacheKey(username, repoName, pushedAt);
  const client = getRedisClient();

  if (client) {
    try {
      const data = await client.get<ProjectDraft>(key);
      if (data) return data;
    } catch (err) {
      console.warn("[Cache] Redis get failed, falling back to memory:", err);
    }
  }

  // Fallback to memory
  const mem = memoryStore.get(key);
  if (mem && mem.expiresAt > Date.now()) {
    return mem.value as ProjectDraft;
  }
  return null;
}

export async function setLLMCache(
  username: string,
  repoName: string,
  pushedAt: string,
  data: ProjectDraft
): Promise<void> {
  const key = generateLLMCacheKey(username, repoName, pushedAt);
  const client = getRedisClient();
  const oneWeekInSeconds = 7 * 24 * 60 * 60;

  if (client) {
    try {
      await client.set(key, data, { ex: oneWeekInSeconds });
      return;
    } catch (err) {
      console.warn("[Cache] Redis set failed:", err);
    }
  }

  // Memory fallback
  memoryStore.set(key, {
    value: data,
    expiresAt: Date.now() + oneWeekInSeconds * 1000,
  });
}

export function generatePrepCacheKey(username: string, repoName: string, pushedAt: string): string {
  return `interview_prep:${username.toLowerCase()}:${repoName.toLowerCase()}:${pushedAt}`;
}

export async function getPrepCache<T>(
  username: string,
  repoName: string,
  pushedAt: string
): Promise<T | null> {
  const key = generatePrepCacheKey(username, repoName, pushedAt);
  const client = getRedisClient();

  if (client) {
    try {
      const data = await client.get<T>(key);
      if (data) return data;
    } catch {
      // Fallback to memory
    }
  }

  const mem = memoryStore.get(key);
  if (mem && mem.expiresAt > Date.now()) {
    return mem.value as T;
  }
  return null;
}

export async function setPrepCache<T>(
  username: string,
  repoName: string,
  pushedAt: string,
  data: T
): Promise<void> {
  const key = generatePrepCacheKey(username, repoName, pushedAt);
  const client = getRedisClient();
  const oneWeekInSeconds = 7 * 24 * 60 * 60;

  if (client) {
    try {
      await client.set(key, data, { ex: oneWeekInSeconds });
      return;
    } catch {
      // Fallback to memory
    }
  }

  memoryStore.set(key, {
    value: data,
    expiresAt: Date.now() + oneWeekInSeconds * 1000,
  });
}

export async function getGitHubCache<T>(key: string): Promise<T | null> {
  const fullKey = `gh_cache:${key}`;
  const client = getRedisClient();

  if (client) {
    try {
      const data = await client.get<T>(fullKey);
      if (data) return data;
    } catch {
      // Ignore cache miss
    }
  }

  const mem = memoryStore.get(fullKey);
  if (mem && mem.expiresAt > Date.now()) {
    return mem.value as T;
  }
  return null;
}

export async function setGitHubCache<T>(
  key: string,
  data: T,
  ttlSeconds: number = 300 // 5 minutes default
): Promise<void> {
  const fullKey = `gh_cache:${key}`;
  const client = getRedisClient();

  if (client) {
    try {
      await client.set(fullKey, data, { ex: ttlSeconds });
      return;
    } catch {
      // Ignore cache failure
    }
  }

  memoryStore.set(fullKey, {
    value: data,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}
