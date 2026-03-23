export const onRequest: PagesFunction = async (context) => {
  const response = await context.next();

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) {
    return response;
  }

  // 128-bit cryptographic nonce
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const nonce = btoa(String.fromCharCode(...bytes));

  let html = await response.text();

  // Inject nonce into all <script>, <style>, and stylesheet <link> tags
  html = html.replace(/<script(?=[\s>])/gi, `<script nonce="${nonce}"`);
  html = html.replace(/<style(?=[\s>])/gi, `<style nonce="${nonce}"`);
  html = html.replace(
    /<link([^>]*rel=["']stylesheet["'])/gi,
    `<link nonce="${nonce}"$1`,
  );

  // Inject Trusted Types default policy before </head>
  // Permissive — required so Google Maps' internal innerHTML calls don't throw
  const ttScript = `
<script nonce="${nonce}">
if(window.trustedTypes&&trustedTypes.createPolicy){
  trustedTypes.createPolicy('default',{
    createHTML:s=>s,createScriptURL:s=>s,createScript:s=>s
  });
}
</script>`;
  html = html.replace("</head>", `${ttScript}\n</head>`);

  const csp = [
    "default-src 'self'",
    `script-src 'nonce-${nonce}' 'strict-dynamic'`,
    // unsafe-inline needed while Framer Motion injects <style> tags;
    // tighten to nonce-only after GSAP migration (Phase 4)
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' https://res.cloudinary.com data:",
    "font-src 'self'",
    "connect-src 'self' https://serenity.fly.dev https://maps.googleapis.com",
    "frame-src https://www.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "trusted-types default",
    "require-trusted-types-for 'script'",
  ].join("; ");

  const headers = new Headers(response.headers);
  headers.set("Content-Security-Policy", csp);
  // Prevent older browsers falling back to sniffing
  headers.set("X-Content-Type-Options", "nosniff");

  return new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};
