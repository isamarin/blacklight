export default function Button({
  label,
  onClick,
  className = '',
  type = 'button',
  disabled = false,
}: {
  label: string
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit'
  disabled?: boolean
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg bg-[#107C10] hover:bg-[#0e6b0e] text-white font-medium transition disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    >
      {label}
    </button>
  )
}