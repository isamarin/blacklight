import Link from 'next/link'

export default function Breadcrumb({ items }: { items: { href: string; label: string }[] }) {
  return (
    <nav className="flex gap-2 text-sm text-white/50 mb-6">
      {items.map((item, i) => (
        <span key={item.href} className="flex items-center gap-2">
          {i > 0 && <span>/</span>}
          <Link href={item.href} className="hover:text-[#107C10]">
            {item.label}
          </Link>
        </span>
      ))}
    </nav>
  )
}