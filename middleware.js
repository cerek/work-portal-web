import { withAuth } from 'next-auth/middleware'

export default withAuth(
  async function middleware(request) {
  },
  {
    pages: {
      signIn: '/',
    },
  }
)

export const config = {
  matcher: [
    // Match all request paths except for these
    '/((?!api|_next/static|_next/image|dist|img|plugins|favicon.ico|themes|layout/images).*)',
  ],
}
