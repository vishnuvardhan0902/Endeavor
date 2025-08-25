const jwt = require('jsonwebtoken');
require('dotenv').config();

function parseCookies(cookieHeader) {
    const result = {};
    if (!cookieHeader) return result;
    // split on ';' and only split key/value on the first '=' to preserve '=' in values
    const parts = cookieHeader.split(';');
    for (const p of parts) {
        const idx = p.indexOf('=');
        if (idx === -1) continue;
        const k = p.slice(0, idx).trim();
        const v = p.slice(idx + 1).trim();
        try {
            result[k] = decodeURIComponent(v);
        } catch (e) {
            result[k] = v;
        }
    }
    return result;
}

function verifyToken(req, res, next) {
    let token = null;

    // 1) Prefer Authorization: Bearer <token>
    const auth = req.headers && req.headers.authorization;
    if (auth && typeof auth === 'string') {
        const parts = auth.split(' ');
        if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
            token = parts[1].trim();
        }
    }

    // 2) Fallback: look for an accessToken cookie or common NextAuth session cookie names
    if (!token) {
        const cookies = parseCookies(req.headers && req.headers.cookie);
        // prefer a dedicated accessToken cookie if the client sets one
        token = cookies['accessToken'] || cookies['__Secure-next-auth.session-token'] || cookies['next-auth.session-token'] || null;
    }

    if (!token) {
        return res.status(401).json({ error: 'unauthorized access, login to continue' });
    }

    // If the token doesn't look like a JWT (header.payload.signature), refuse and ask to use bearer token.
    if (typeof token !== 'string' || token.split('.').length !== 3) {
        return res.status(401).json({ error: 'unsupported token format; please authenticate and send an access token via Authorization header' });
    }

    // Try verifying with NEXTAUTH_SECRET first (matches NextAuth signing), then fall back to app SECRET_KEY
    const secrets = [process.env.NEXTAUTH_SECRET, process.env.SECRET_KEY].filter(Boolean);
    let decoded = null;
    let lastErr = null;
    for (const secret of secrets) {
        try {
            decoded = jwt.verify(token, secret);
            break;
        } catch (e) {
            lastErr = e;
        }
    }

    if (!decoded) {
        // don't leak secret detail
        return res.status(401).json({ error: 'invalid or expired token' });
    }

    // attach decoded payload for downstream handlers
    req.user = decoded;
    return next();
}

module.exports = verifyToken;