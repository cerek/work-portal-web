import NewLayout from "@/layout/newLayout"

export const metadata = {
  title: "WorkPortal Public",
  description:
    "The Public page.",
  robots: { index: false, follow: false },
  viewport: { initialScale: 1, width: "device-width" },
  
  icons: {
    icon: "/favicon.ico"
  }
}

export default function AppLayout({ children }) {
  return <NewLayout>{children}</NewLayout>
}