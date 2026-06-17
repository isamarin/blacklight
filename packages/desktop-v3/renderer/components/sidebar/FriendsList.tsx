import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useTRPC } from '../../utils/trpc'
import { useAuth } from '../../contexts/AuthContext'

export default function FriendsList() {
  const { t } = useTranslation()
  const trpc = useTRPC()
  const { isAuthenticated, getWebToken } = useAuth()

  const friends = useQuery({
    ...trpc.profile_get_friends.queryOptions(getWebToken()),
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  })

  const people = friends.data?.data?.people || []

  return (
    <aside className="hidden xl:flex w-56 flex-col border-l border-white/5 bg-[#0a0a0a] p-4">
      <h3 className="text-sm font-semibold text-white/60 mb-3">
        {t('sidebar.friends.title', { defaultValue: 'Friends' })}
      </h3>
      {friends.isLoading ? (
        <p className="text-xs text-white/30">Loading...</p>
      ) : people.length === 0 ? (
        <p className="text-xs text-white/30">No friends online</p>
      ) : (
        <ul className="space-y-2">
          {people.map((friend: any) => (
            <li key={friend.xuid} className="text-sm text-white/70 truncate">
              <span className="inline-block w-2 h-2 rounded-full bg-[#107C10] mr-2" />
              {friend.gamertag}
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}