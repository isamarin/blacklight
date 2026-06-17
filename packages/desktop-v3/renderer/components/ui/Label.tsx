export default function Label({
  children,
  variant = 'default',
}: {
  children: React.ReactNode
  variant?: 'default' | 'green' | 'orange'
}) {
  const colors = {
    default: 'bg-white/10 text-white/70',
    green: 'bg-green-900/40 text-green-300',
    orange: 'bg-orange-900/40 text-orange-300',
  }
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs ${colors[variant]}`}>
      {children}
    </span>
  )
}