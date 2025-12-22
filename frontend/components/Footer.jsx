"use client"

import { Heart } from "lucide-react"

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-2 text-xs text-gray-500 dark:text-gray-400 fixed bottom-0 left-0 right-0 w-full">
      <div className="container mx-auto px-4 flex flex-wrap items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="w-3 h-3 text-pink-500" fill="#ec4899" />
          <span>© {currentYear} Developer's Match</span>
        </div>

        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-pink-500 transition-colors">
            Terms
          </a>
          <a href="#" className="hover:text-pink-500 transition-colors">
            Privacy
          </a>
          <a href="#" className="hover:text-pink-500 transition-colors">
            Help
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer