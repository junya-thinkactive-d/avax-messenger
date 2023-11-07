import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-stone-900">
      <div className="mx-auto flex h-screen w-full max-w-6xl items-center justify-center">
        <Link href={'/'}>
          <button className="my-4 rounded-md bg-white/40 p-2 text-white drop-shadow">Let&rsquo;s dive to web3</button>
        </Link>
      </div>
    </main>
  )
}
