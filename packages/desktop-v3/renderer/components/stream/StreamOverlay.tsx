import { useRouter } from 'next/router'
import Button from '../ui/Button'

export default function StreamOverlay({
  status,
  onToggleDebug,
  onAttachGamepad,
  onAttachMkb,
}: {
  status: string
  onToggleDebug: () => void
  onAttachGamepad: () => void
  onAttachMkb: () => void
}) {
  const router = useRouter()

  return (
    <div className="absolute top-4 right-4 z-50 flex flex-col gap-2">
      <div className="glass px-3 py-1 rounded text-xs text-white/70">{status}</div>
      <div className="flex gap-2">
        <Button label="Gamepad" onClick={onAttachGamepad} className="text-xs py-1 px-2" />
        <Button label="Keyboard" onClick={onAttachMkb} className="text-xs py-1 px-2" />
        <Button label="Debug (~)" onClick={onToggleDebug} className="text-xs py-1 px-2" />
        <Button label="Exit" onClick={() => router.back()} className="text-xs py-1 px-2 bg-red-800" />
      </div>
    </div>
  )
}