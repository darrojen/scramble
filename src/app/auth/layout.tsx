import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Authentication",
  description: "Login and Register pages",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left side (form) */}
      <div className="flex-1 flex items-center justify-center bg-background">
        {children}
      </div>

      {/* Right side (image or text) */}
    
    </div>
  )
}
