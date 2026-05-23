import { useAuth } from "../contexts/AuthContext";

export default function Sidebar() {

  const { authState } = useAuth();

  return (
    <aside className="w-64 h-full flex flex-col bg-[#0d0d0d] border-r border-white/5 relative z-20">
    
        <div className="h-full overflow-y-auto">
            <div className="p-6 md:p-8 max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-6 animate-fade-in-up">
                <h2 className="text-2xl font-bold text-white mb-1">Greenlight</h2>
                <p className="text-white/40 text-sm">{ authState?.webToken?.data.DisplayClaims?.xui?.[0]?.gtg || 'Gamertag'}</p>
                {/* <pre>{ JSON.stringify(authState, null, 2) }</pre> */}
                </div>
            </div>
        </div>

    </aside>
  )
}