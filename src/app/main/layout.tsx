// 'use client'

// import '../globals.css'
// import { ThemeProvider } from 'next-themes'
// import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
// import ModeToggle from '@/app/theme/page'
// import ProtectedRoute, { useUser } from '@/components/ui/ProtectedRoute'
// import Box from '@/components/ui/box'
// import Sidebar from '@/components/ui/app-sidebar'

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en">
//       <body suppressHydrationWarning={true}>
//         <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
//           <SidebarProvider>
//             <ProtectedRoute>
//               <MainLayout>{children}</MainLayout>
//             </ProtectedRoute>
//           </SidebarProvider>
//         </ThemeProvider>
//       </body>
//     </html>
//   )
// }

// Main layout consumes user context and renders sidebar + main content
// function MainLayout({ children }: { children: React.ReactNode }) {
//   const user = useUser()

//   if (!user) return null

//   return (
//     <Box className="flex min-h-screen">
//       <Sidebar user={user} />

//       <Box as="main" className="flex-1 flex flex-col">
//         <Box className="p-4 flex items-center gap-2 border-b">
//           <SidebarTrigger />
//           <ModeToggle />
//         </Box>

//         <Box className="flex-1 p-6">{children}</Box>
//       </Box>
//     </Box>
//   )
// }


'use client'

import { ThemeProvider } from 'next-themes'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import ProtectedRoute from '@/components/ui/ProtectedRoute'
import Box from '@/components/ui/box'
import ModeToggle from '@/app/theme/page'
import Sidebar from '@/components/ui/app-sidebar'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SidebarProvider>
        <ProtectedRoute>
          <DashboardLayout>{children}</DashboardLayout>
        </ProtectedRoute>
      </SidebarProvider>
    </ThemeProvider>
  )
}

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box className="flex min-h-screen">
      <Sidebar /> {
      /* prevent sidebar from shrinking */}
      <SidebarTrigger className='relative'/>
      <Box
        as="main"
        className="flex-1 flex flex-col transition-all duration-300" // flex-1 fills remaining space
      >
        {/* Header */}
        {/* <Box className="p-4 flex items-center gap-2 border-b">
          <ModeToggle />
        </Box> */}

        {/* Main content */}
        <Box className="flex-1  overflow-auto">{children}</Box>
      </Box>
    </Box>
  )
}
