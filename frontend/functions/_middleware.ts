export const onRequest: PagesFunction = async (context) => {
    const response = await context.next();

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
        return response;
    }

    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    const nonce = btoa(String.fromCharCode(...bytes));

    let html = await response.text();

    // Avoid duplicating nonce if already present
    html = html.replace(/<script(?![^>]*\bnonce=)(?=[\s>])/gi, `<script nonce="${nonce}"`);
    html = html.replace(/<style(?![^>]*\bnonce=)(?=[\s>])/gi, `<style nonce="${nonce}"`);
    html = html.replace(
        /<link(?![^>]*\bnonce=)([^>]*rel=["']stylesheet["'][^>]*)/gi,
        `<link nonce="${nonce}"$1`,
    );

    const ttScript = `
<script nonce="${nonce}">
if(window.trustedTypes&&trustedTypes.createPolicy){
    try{
        trustedTypes.createPolicy('default',{
            createHTML:s=>s,createScriptURL:s=>s,createScript:s=>s
        });
    }catch(e){}
}
</script>`;

    html = html.replace("</head>", `${ttScript}\n</head>`);

    const csp = [
        "default-src 'self'",
        "script-src 'nonce-" + nonce + "' 'strict-dynamic' 'unsafe-inline' https:",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' https://res.cloudinary.com https://ui-avatars.com https://maps.googleapis.com https://maps.gstatic.com data:",
        "font-src 'self'",
        "connect-src 'self' https://serenity.fly.dev https://maps.googleapis.com",
        "frame-src https://www.google.com https://maps.google.com",
        "media-src 'self' blob: https://res.cloudinary.com",
        "worker-src 'self' blob:",
        "manifest-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "trusted-types default google-maps-api-loader google-maps-api#html lit-html",
        "require-trusted-types-for 'script'",
    ].join("; ");

    const headers = new Headers(response.headers);
    headers.set("Content-Security-Policy", csp);
    headers.set("X-Content-Type-Options", "nosniff");

    return new Response(html, {
        status: response.status,
        statusText: response.statusText,
        headers,
    });
};
