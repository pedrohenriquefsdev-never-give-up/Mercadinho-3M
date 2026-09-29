const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy", value: [
      "default-src 'self'",
      "img-src 'self' data: blob: https://res.cloudinary.com",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.cloudinary.com https://api.cloudinary.com",
      "frame-ancestors 'self'"
    ].join("; ") }
];
const nextConfig = { async headers(){ return [{ source: "/(.*)", headers: securityHeaders }]; } };
export default nextConfig;
