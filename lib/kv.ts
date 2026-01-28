import { kv } from '@vercel/kv';
import { headers } from 'next/headers';

export async function getNow(): Promise<number> {
  if (process.env.TEST_MODE === '1') {
    const headersList = await headers();
    const testNow = headersList.get('x-test-now-ms');
    if (testNow) {
      return parseInt(testNow, 10);
    }
  }
  return Date.now();
}

export { kv };

const FETCH_DECREMENT_SCRIPT = `
local key = KEYS[1]
local now_ms = tonumber(ARGV[1])
local paste = redis.call('HGETALL', key)
if #paste == 0 then return nil end

local content = nil
local remaining_views = nil
local expires_at = nil
local expires_at_ms = nil

for i = 1, #paste, 2 do
    if paste[i] == 'content' then content = paste[i+1]
    elseif paste[i] == 'remaining_views' then remaining_views = tonumber(paste[i+1])
    elseif paste[i] == 'expires_at' then expires_at = paste[i+1]
    elseif paste[i] == 'expires_at_ms' then expires_at_ms = tonumber(paste[i+1])
    end
end

if expires_at_ms and now_ms >= expires_at_ms then
    redis.call('DEL', key)
    return nil
end

if remaining_views == 0 then
    redis.call('DEL', key)
    return nil
end

if remaining_views > 0 then
    remaining_views = remaining_views - 1
    redis.call('HSET', key, 'remaining_views', remaining_views)
end

return {content, tostring(remaining_views), expires_at}
`;

export async function fetchAndDecrementPaste(id: string) {
  const key = `paste:${id}`;
  const now = await getNow();
  const result = await kv.eval(FETCH_DECREMENT_SCRIPT, [key], [now]) as [string, string, string | null] | null;

  if (!result) return null;

  const [content, remaining_views_str, expires_at] = result;
  const remaining_views = parseInt(remaining_views_str, 10);

  return {
    content,
    remaining_views: remaining_views === -1 ? null : remaining_views,
    expires_at
  };
}
