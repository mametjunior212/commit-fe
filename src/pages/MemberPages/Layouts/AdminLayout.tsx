
import Header, { HeaderProps } from './Header'
import Sidebar from './Sidebar'
import Headbar from './Headbar'
import { ReactNode, useMemo, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useMenuMember } from '@/hooks/menuMember'
import { toast } from '@/hooks/use-toast';


export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigate = useNavigate();

  const [dataMember, setdataMember] = useState<HeaderProps["user"]>(() => {
    try {
      return JSON.parse(localStorage.getItem("data_user") || "null") ?? undefined;
    } catch {
      return undefined;
    }
  });



  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} user={dataMember} onLogout={() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('data_user');
        toast({
          title: 'Logout',
          description: `Adnda Berhasil Logout.`,
        });
        navigate('/login', { replace: true });
      }
      } />

      {/* Main Grid: Sidebar + Content */}
      <div className="grid grid-cols-1 md:grid-cols-[260px,1fr] min-h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Content Area */}
        <div className="border-l border-border">
          <Headbar />
          <main className="p-6 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
