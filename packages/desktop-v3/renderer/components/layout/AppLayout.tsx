import Head from 'next/head'
import Sidebar from '../sidebar'
import FriendsList from '../sidebar/FriendsList'

export default function AppLayout({
  title,
  children,
}: {
  title?: string
  children: React.ReactNode
}) {
  return (
    <>
      <Head>
        <title>{title ? `Greenlight - ${title}` : 'Greenlight'}</title>
      </Head>
      <div className="flex h-screen bg-[#0d0d0d] bg-pattern overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden relative flex">
          <div className="flex-1 overflow-y-auto">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#107C10]/3 rounded-full blur-3xl pointer-events-none" />
            <div className="p-6 md:p-8 max-w-6xl mx-auto">{children}</div>
          </div>
          <FriendsList />
        </main>
      </div>
    </>
  )
}