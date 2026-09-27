// store.js：到期时刻与是否到期
export function expireAt(now, ttl) {
  return now + ttl;
}

export function isExpired(expire, now) {
  return expire <= now;
}
