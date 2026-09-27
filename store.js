// store.js：到期时刻与是否到期（基线：一律给零与假）
export function expireAt(now, ttl) {
  return 0;
}

export function isExpired(expire, now) {
  return false;
}
