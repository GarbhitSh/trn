export function Footer() {
  return (
    <footer className="w-full py-6 text-center text-sm text-gray-400">
      <p>© {new Date().getFullYear()} StoryForge. All rights reserved.</p>
      <p className="mt-2">
        Powered by <span className="text-purple-400">The Root Network</span> and{" "}
        <span className="text-green-400">$ROOT</span> tokens
      </p>
    </footer>
  )
}
