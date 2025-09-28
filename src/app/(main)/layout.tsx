'use client'

import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'

import Box from '@/components/ui/box'
import ProtectedRoute from '@/components/ui/ProtectedRoute'
import Sidebar from '@/components/ui/app-sidebar'
import { ThemeProvider } from 'next-themes'
import { cn } from '@/lib/utils'

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
 // Base classes for the button
   const buttonClasses = cn(
    'top-[20px] z-[1000] cursor-pointer left-[20px] fixed',
    'hover:text-primary-dark',
  );

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box className="flex min-h-screen">
      <Sidebar /> 
      {/* prevent sidebar from shrinking */}
      {/* <SidebarTrigger className='absolute top-[15] left-[15px] z-50 sm:w-10 sm:h-10'/> */}
      <Box
        as="main"
        className="flex-1 flex flex-col transition-all duration-300" // flex-1 fills remaining space
      >
              <SidebarTrigger size="icon" className='absolute'/>


        {/* Main content */}
        <Box className="flex-1  overflow-auto">{children}</Box>
      </Box>
    </Box>
  )
}
