/*
 * File for main configuration of application business logic
 */

export const SHORT_URL_CODE_LENGTH = 6;
export const SHORT_URL_EXPIRATION_TIME_MS = 24 * 60 * 60 * 1000; // 24 hours

// Rate limits
export const DEFAULT_RATE_LIMITS_REQ_PER_MIN = 1000;
export const POST_SHORTEN_RATE_LIMITS_REQ_PER_MIN = 10;
