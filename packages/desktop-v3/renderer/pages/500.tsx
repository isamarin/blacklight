import Link from 'next/link'

export default function ErrorPage() {
  return (
    <div className="h-screen bg-[#0d0d0d] flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-white mb-2">500</h1>
      <p className="text-white/50 mb-6">Something went wrong</p>
      <Link href="/home/" className="text-[#107C10] hover:underline">
        Return home
      </Link>
    </div>
  )
}