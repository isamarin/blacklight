import GameTitle from '../game/GameTitle'
import Loader from '../ui/Loader'

export default function TitleRow({
  title,
  titleIds,
}: {
  title: React.ReactNode
  titleIds: string[]
}) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-white mb-4">{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {titleIds.length === 0 ? (
          <Loader />
        ) : (
          titleIds.map((id) => <GameTitle key={id} titleId={id} />)
        )}
      </div>
    </section>
  )
}