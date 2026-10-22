const reserveScript = `
local perMinute = tonumber(ARGV[1])
local dailyLimit = tonumber(ARGV[2])
local dayTtl = tonumber(ARGV[3])
local minuteCount = tonumber(redis.call('GET', KEYS[1]) or '0')
if minuteCount >= perMinute then return -1 end
minuteCount = redis.call('INCR', KEYS[1])
if minuteCount == 1 then redis.call('PEXPIRE', KEYS[1], 60000) end
if ARGV[4] ~= '1' then return -3 end
local dayCount = tonumber(redis.call('GET', KEYS[2]) or '0')
if dayCount >= dailyLimit then return -2 end
dayCount = redis.call('INCR', KEYS[2])
if dayCount == 1 then redis.call('EXPIRE', KEYS[2], dayTtl) end
return dailyLimit - dayCount
`;
const reserveDailyScript = `
local dailyLimit = tonumber(ARGV[1])
local dayCount = tonumber(redis.call('GET', KEYS[1]) or '0')
if dayCount >= dailyLimit then return -2 end
dayCount = redis.call('INCR', KEYS[1])
if dayCount == 1 then redis.call('EXPIRE', KEYS[1], tonumber(ARGV[2])) end
return dailyLimit - dayCount
`;

function redisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ""), token };
}

async function evalRedis<T>(script: string, keys: string[], args: (string | number)[]): Promise<T> {
  const config = redisConfig();
  if (!config) throw new Error("Shared usage limiter is not configured.");
  const response = await fetch(config.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(["EVAL", script, String(keys.length), ...keys, ...args.map(String)]),
    cache: "no-store",
    signal: AbortSignal.timeout(4000),
  });
  if (!response.ok) throw new Error("Shared usage limiter request failed.");
  const payload = await response.json() as { result?: T; error?: string };
  if (payload.error || payload.result === undefined) throw new Error("Shared usage limiter returned an invalid response.");
  return payload.result;
}

function usageKeys(userId: string) {
  const day = new Date().toISOString().slice(0, 10);
  const prefix = `aitools:writing:${userId}`;
  return { minute: `${prefix}:minute`, day: `${prefix}:day:${day}` };
}

export type ReserveResult = { ok: true; remainingToday: number | null } | { ok: false; reason: "rate" | "daily" };

function secondsToUtcMidnight() {
  const now = Date.now();
  return Math.max(60, Math.ceil((Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate() + 1) - now) / 1000));
}

export async function reserveWritingUse(userId: string, dailyLimit: number, chargeDaily = true): Promise<ReserveResult> {
  const keys = usageKeys(userId);
  const result = await evalRedis<number>(reserveScript, [keys.minute, keys.day], [3, dailyLimit, secondsToUtcMidnight(), chargeDaily ? 1 : 0]);
  if (result === -1) return { ok: false, reason: "rate" };
  if (result === -2) return { ok: false, reason: "daily" };
  if (result === -3 && !chargeDaily) return { ok: true, remainingToday: null };
  if (!Number.isInteger(result) || result < 0) throw new Error("Shared usage limiter returned an invalid quota result.");
  return { ok: true, remainingToday: result };
}

export async function reserveFreeDailyUse(userId: string, dailyLimit: number): Promise<number | null> {
  const { day } = usageKeys(userId);
  const result = await evalRedis<number>(reserveDailyScript, [day], [dailyLimit, secondsToUtcMidnight()]);
  if (result === -2) return null;
  if (!Number.isInteger(result) || result < 0) throw new Error("Shared usage limiter returned an invalid quota result.");
  return result;
}

export async function releaseFailedWritingUse(userId: string, chargedDaily: boolean): Promise<void> {
  if (!chargedDaily) return;
  const { day } = usageKeys(userId);
  // Only undo the daily reservation. The short rate limit still counts attempts.
  await evalRedis<number>("local count = tonumber(redis.call('GET', KEYS[1]) or '0'); if count > 0 then return redis.call('DECR', KEYS[1]) end; return 0", [day], []);
}

export function freeDailyWritingLimit() {
  const configured = Number(process.env.AI_FREE_DAILY_LIMIT ?? "5");
  return Number.isInteger(configured) && configured >= 1 && configured <= 100 ? configured : 5;
}
