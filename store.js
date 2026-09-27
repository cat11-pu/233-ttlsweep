// store.js：到期时刻 = 写入时刻 + 存活期；到期时刻不大于当前时刻即算到期
export function expireAt(now, ttl) {
  return now + ttl;
}

export function isExpired(expire, now) {
  return expire <= now;
}
