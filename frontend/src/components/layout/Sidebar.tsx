import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Sparkles, Library, Settings, LogOut, Zap, Building2 } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { CreditMeter } from '../ui/CreditMeter'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/brands', icon: Building2, label: 'Mis Marcas' },
  { to: '/studio', icon: Sparkles, label: 'Studio' },
  { to: '/library', icon: Library, label: 'Biblioteca' },
  { to: '/settings', icon: Settings, label: 'Configuración' },
]

export function Sidebar() {
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-surface border-r border-border flex flex-col z-40">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-text-main text-sm">AdGenius AI</h1>
            <p className="text-xs text-text-muted">Tu agencia. En segundos.</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-primary/15 text-primary border border-primary/30'
                  : 'text-text-muted hover:text-text-main hover:bg-white/5'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 space-y-3 border-t border-border">
        <CreditMeter />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-primary">{user?.email?.[0]?.toUpperCase()}</span>
            </div>
            <span className="text-xs text-text-muted truncate">{user?.email}</span>
          </div>
          <button onClick={handleSignOut} className="text-text-muted hover:text-red-400 transition-colors ml-2">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  )
}
