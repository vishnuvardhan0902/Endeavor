import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import jwt from 'jsonwebtoken';

const handler = NextAuth({
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		}),
	],
	secret: process.env.NEXTAUTH_SECRET,
	callbacks: {
		// create a signed token string and expose it to the client via session.accessToken
		async jwt({ token, account, user }) {
			// Verbose debug logs removed by default. Enable with NEXT_PUBLIC_DEBUG_NEXTAUTH=1 or in non-production.
			if (process.env.NEXT_PUBLIC_DEBUG_NEXTAUTH === '1' || process.env.NODE_ENV !== 'production') {
				console.debug('NextAuth JWT callback - token/account/user:', { token, account, user });
			}
			try {
				// ensure we have a reproducible, minimal token payload
				// IMPORTANT: exclude any existing accessToken (or other large nested fields)
				// to avoid nesting signed tokens inside each other which grows the cookie
				// exponentially and can cause HTTP 431 (request header fields too large).
				const { accessToken: _discard, ...tokenWithoutAccess } = token || {};
				const payload = { ...tokenWithoutAccess, ...(account ? { accountProvider: account.provider } : {}) };
				// Remove iat and exp from payload to avoid conflicts with jwt.sign options
				delete payload.iat;
				delete payload.exp;
				if (process.env.NEXT_PUBLIC_DEBUG_NEXTAUTH === '1' || process.env.NODE_ENV !== 'production') {
					console.debug('Payload to sign:', payload);
				}
				
				// sign a compact JWT for client-side use and backend verification
				token.accessToken = jwt.sign(payload, process.env.NEXTAUTH_SECRET || '', { expiresIn: '7d' });
				if (process.env.NEXT_PUBLIC_DEBUG_NEXTAUTH === '1' || process.env.NODE_ENV !== 'production') {
					console.debug('Generated accessToken:', !!token.accessToken);
				}
			} catch (e) {
				console.error('JWT signing error:', e);
				// ignore signing errors
			}
			return token;
		},
		async session({ session, token }) {
			if (process.env.NEXT_PUBLIC_DEBUG_NEXTAUTH === '1' || process.env.NODE_ENV !== 'production') {
				console.debug('NextAuth session callback - before:', session);
				console.debug('Token has accessToken:', !!token.accessToken);
			}

			// expose the signed token to the client session
			session.accessToken = token.accessToken;
			return session;
		}
	}
});

export { handler as GET, handler as POST };
