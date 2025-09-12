"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import ModeToggle from "@/app/theme/page"

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted p-6">
      {/* Hero Section */}
      <ModeToggle />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-3xl text-center"
      >
        <h1 className="text-5xl font-extrabold tracking-tight mb-4">
          Welcome to <span className="text-primary">Ultimi</span>
        </h1>
        <p className="text-lg text-muted-foreground mb-6">
          Generate, practice, and challenge yourself with AI-powered quizzes.
          Learn smarter, faster, and better.
        </p>

        <div className="flex gap-4 justify-center">
          <Link href="/auth/register">
            <Button size="lg" className="rounded-2xl shadow-lg">
              Get Started
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button size="lg" variant="outline" className="rounded-2xl">
              Sign In
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="grid md:grid-cols-3 gap-6 mt-20 w-full max-w-5xl"
      >
        <Card className="rounded-2xl shadow-md hover:shadow-lg transition">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-semibold mb-2">📚 AI Quiz Generator</h3>
            <p className="text-sm text-muted-foreground">
              Upload notes or enter topics and instantly generate quizzes tailored to your needs.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-md hover:shadow-lg transition">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-semibold mb-2">⚡ Smart Practice</h3>
            <p className="text-sm text-muted-foreground">
              Adaptive question difficulty that grows with you as you improve.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-md hover:shadow-lg transition">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-semibold mb-2">🌍 Study Anywhere</h3>
            <p className="text-sm text-muted-foreground">
              Responsive design so you can learn seamlessly on mobile, tablet, or desktop.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="mt-20 text-sm text-muted-foreground"
      >
        © {new Date().getFullYear()} Ultimi. All rights reserved.
      </motion.footer>
    </main>
  )
}
