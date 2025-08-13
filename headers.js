// 1 year
const CACHE_CONTROL_IMMUTABLE = 'public, max-age=31536000, immutable';
// 1 hour, then revalidate
const CACHE_CONTROL_DEFAULT = 'public, max-age=0, s-maxage=3600, stale-while-revalidate';
// no cache
const CACHE_CONTROL_NO_CACHE = 'private, no-cache, no-store, must-revalidate';


const securityHeaders = [
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-DNS-Prefetch-Control
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
];

const headers = [
  ...securityHeaders,
  {
    key: 'Cache-Control',
    value: CACHE_CONTROL_DEFAULT,
  },
  {
    key: 'Access-Control-Allow-Origin',
    value: '*',
  },
];

// For static assets, we can use a more aggressive caching strategy.
const staticAssetHeaders = [
  ...securityHeaders,
  {
    key: 'Cache-Control',
    value: CACHE_CONTROL_IMMUTABLE,
  },
  {
    key: 'Access-Control-Allow-Origin',
    value: '*',
  },
];

module.exports = {
  headers,
  staticAssetHeaders
}
