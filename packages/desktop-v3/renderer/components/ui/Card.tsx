export default function Card({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`glass rounded-xl p-5 border border-white/5 ${className}`}>{children}</div>
  )
}