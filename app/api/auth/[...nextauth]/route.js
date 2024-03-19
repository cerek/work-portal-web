import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import axios from 'axios'
import { userAgent } from 'next/server'

const BACKEND_ACCESS_TOKEN_LIFETIME = 60 * 60
const BACKEND_REFRESH_TOKEN_LIFETIME = 1 * 24 * 60 * 60

const getCurrentEpochTime = () => {
  return Math.floor(new Date().getTime())
}


export const authOptions = {
  // secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: BACKEND_REFRESH_TOKEN_LIFETIME,
  },
  providers: [
    CredentialsProvider({
      default: true,
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        const ua = req.headers['user-agent']
        const clientIp = req.headers['x-forwarded-for']
        try {
          const response = await axios({
            url: process.env.NEXTAUTH_BACKEND_URL + '/login/',
            method: 'post',
            headers: {
              'User-Agent': ua,
              'User-Ip-Address': clientIp,
            },
            data: credentials,
          })
          const data = response.data
          if (data) return data
        } catch (error) {
          // Logging to file
          // console.log(error)
        }
        return null
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      session.user = token.user
      return session
    },
    async jwt({ user, token, account }) {
      if (user) {
        token.user = user
      }

      const access_token_expiration = Date.parse(token.user.access_expiration)
      const nowTime = getCurrentEpochTime()
      if (nowTime > access_token_expiration) {
        const response = await axios({
          method: 'post',
          url: process.env.NEXTAUTH_BACKEND_URL + '/token/refresh/',
          data: {
            refresh: token.user.refresh,
          },
        });

        token.user.access = response.data.access
        token.user.access_expiration = response.data.access_expiration
        return token
      }
      
      return token
    },
  },
  pages: {
    signIn: '/',
  },
}

export const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
