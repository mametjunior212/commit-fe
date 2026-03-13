import { Menu, Sun, Moon, Search, LogOut, Settings, User, Shuffle } from 'lucide-react'
import { ChangeEventHandler, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Theme = 'light' | 'dark'

export type HeaderProps = {
  onToggleSidebar: () => void
  onLogout?: () => void
  onOpenSettings?: () => void
  onOpenProfile?: () => void
  onSwitchAccount?: () => void
  // Optional: info user untuk avatar
  user?: {
    name?: string
    email?: string
    avatarUrl?: string
    online?: boolean
    alamat_perusahaan?: string
    has_produk?: string
    initial?: string
    jenis_kelamin?: string
    kategori_bidang_usaha_perusahaan?: string
    nama_perusahaan?: string
    nomor?: string
    pekerjaan?: string
    role?: { uuid: string, name: string }[]
    roleActive?: string
    roleNameActive?: string
    tgl_lahir?: string
    token?: string
    userId?: number
    username?: string
  }
}

export default function Header({
  onToggleSidebar,
  onLogout,
  onOpenSettings,
  onOpenProfile,
  onSwitchAccount,
  user,
}: HeaderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light'
    const persisted = localStorage.getItem('theme') as Theme | null
    if (persisted) return persisted
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.remove('dark')
      root.classList.add('light')
    }
    // persist
    localStorage.setItem('theme', theme)

  }, [theme])

  const handleToggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  return (
    <header className="h-16 border-b border-border bg-card/40 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-40">
      <div className="h-full max-w-[1400px] mx-auto px-4 flex items-center gap-4">
        {/* Sidebar Toggle (mobile) */}
        <button
          className="md:hidden inline-flex items-center p-2 rounded-md hover:bg-muted transition-colors"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Logo */}
        <a href='/member/dashboard' className="flex items-center gap-3">
          <img
            src={(import.meta as any).env.VITE_FONT_END + '/assets/logo-Web.png'}
            className="w-full h-6"
            alt="Logo"
          />
        </a>

        {/* Search (opsional) */}
        <div className="hidden md:flex ml-6 flex-1 max-w-lg">
          <div className="relative w-full">
            {/* <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /> */}
            {/* <input
              type="text"
              placeholder="Search…"
              className="w-full pl-9 pr-3 py-2 rounded-md border border-border bg-background/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  // TODO: sambungkan ke fitur search kamu
                }
              }}
            /> */}
          </div>
        </div>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-2">
          {/* Theme toggle */}
          <button
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border hover:bg-muted transition-colors"
            onClick={handleToggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span className="hidden sm:inline text-xs font-medium">
              {theme === 'dark' ? 'Light' : 'Dark'}
            </span>
          </button>

          {/* User Menu */}
          <UserMenu
            user={{
              name: user?.name ?? 'Rahmat Nurrizki',
              email: user?.email ?? 'rahmat@example.com',
              avatarUrl:
                user?.avatarUrl ??
                `https://ui-avatars.com/api/?name=${user.initial}&background=0D8ABC&color=fff`,
              online: user?.online ?? true,
            }}
            onOpenProfile={onOpenProfile}
            onOpenSettings={onOpenSettings}
            onSwitchAccount={onSwitchAccount}
            onLogout={onLogout}
          />
        </div>
      </div>
    </header>
  )
}

/* ----------------------------- UserMenu ------------------------------ */

type UserMenuProps = {
  user: {
    name?: string
    email?: string
    avatarUrl?: string
    online?: boolean
  }
  onOpenProfile?: () => void
  onOpenSettings?: () => void
  onSwitchAccount?: () => void
  onLogout?: () => void
}


function UserMenu({
  user,
  onOpenProfile,
  onOpenSettings,
  onSwitchAccount,
  onLogout,
}: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const [role, setRole] = useState([])
  const btnRef = useRef<HTMLButtonElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  // close saat klik di luar
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      if (menuRef.current?.contains(target) || btnRef.current?.contains(target)) return
      setOpen(false)
    }
    window.addEventListener('click', handler)
    return () => window.removeEventListener('click', handler)
  }, [])

  // close saat Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // SwitchUser
  useEffect(() => {
    setRole(JSON.parse(localStorage.getItem('data_user')).role);
  }, [])


  const switchRole: ChangeEventHandler<HTMLSelectElement> = (e) => {
    const value = e.target.value;

  };


  // animasi varian
  const menuVariants = {
    initial: { opacity: 0, y: -6, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.16, ease: 'easeOut' } },
    exit: { opacity: 0, y: -6, scale: 0.98, transition: { duration: 0.12, ease: 'easeIn' } },
  }

  const ringColor = user.online ? 'bg-emerald-500' : 'bg-gray-400'

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-3 px-2 py-1 rounded-md hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="User menu"
      >
        <div className="relative">
          <img
            src={user.avatarUrl}
            alt="User avatar"
            className="w-8 h-8 rounded-full object-cover border border-border"
          />
          {/* <span
            className={`absolute -bottom-0 -right-0 w-2.5 h-2.5 rounded-full ring-2 ring-background ${ringColor}`}
            aria-hidden="true"
            title={user.online ? 'Online' : 'Offline'}
          /> */}
        </div>
        <div className="hidden sm:flex flex-col items-start leading-tight">
          <span className="text-sm font-medium">{user.name}</span>
          <span className="text-[11px] text-muted-foreground">{user.email}</span>
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={menuRef}
            role="menu"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={menuVariants}
            className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-popover shadow-lg overflow-hidden z-50"
          >
            {/* header mini */}
            <div className="px-3 py-3 bg-muted/50 border-b border-border">
              <div className="flex items-center gap-3">
                <img
                  src={user.avatarUrl}
                  alt="User avatar"
                  className="w-10 h-10 rounded-full object-cover border border-border"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
            </div>

            {/* items */}
            <div className="p-1">
              <div className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-md hover:bg-muted transition-colors focus:outline-none focus:bg-muted">
                <span className="inline-flex items-center gap-3 text-sm">
                  {<User className="w-4 h-4" />}
                </span>
                <select onChange={switchRole} name="role" id="role" className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-md hover:bg-muted transition-colors focus:outline-none focus:bg-muted">
                  {
                    role.map((e, i) =>
                      <option value={e.uuid}>{e.name}</option>
                    )
                  }
                </select>
              </div>
              {/* <MenuItem
                icon={<User className="w-4 h-4" />}
                label="Profile"
                kbd="P"
                onClick={() => {
                  onOpenProfile?.()
                  setOpen(false)
                }}
              />
              <MenuItem
                icon={<Settings className="w-4 h-4" />}
                label="Settings"
                kbd="S"
                onClick={() => {
                  onOpenSettings?.()
                  setOpen(false)
                }}
              />
              <MenuItem
                icon={<Shuffle className="w-4 h-4" />}
                label="Switch account"
                onClick={() => {
                  onSwitchAccount?.()
                  setOpen(false)
                }}
              /> */}
              <div className="my-1 border-t border-border" />
              <MenuItem
                icon={<LogOut className="w-4 h-4 text-red-600" />}
                label={<span className="text-red-600">Logout</span>}
                kbd="L"
                onClick={() => {
                  onLogout?.()
                  setOpen(false)
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---------------------------- MenuItem UI ---------------------------- */

function MenuItem({
  icon,
  label,
  kbd,
  onClick,
}: {
  icon: React.ReactNode
  label: React.ReactNode
  kbd?: string
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      role="menuitem"
      className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-md hover:bg-muted transition-colors focus:outline-none focus:bg-muted"
    >
      <span className="inline-flex items-center gap-3 text-sm">
        {icon}
        {label}
      </span>
      {kbd ? (
        <span className="text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5">
          {kbd}
        </span>
      ) : null}
    </button>
  )
}