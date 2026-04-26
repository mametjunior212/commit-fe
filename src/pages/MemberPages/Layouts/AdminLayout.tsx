
import Header, { HeaderProps } from './Header'
import Sidebar from './Sidebar'
import Headbar from './Headbar'
import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';


export default function AdminLayout() {
  const qc = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('data_user');

    qc.removeQueries({ queryKey: ['listEventMember'] });
    qc.removeQueries({ queryKey: ['listVotingMember'] });

    toast({
      title: 'Logout',
      description: `Anda Berhasil Logout.`,
    });

    window.location.href = '/login';
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("data_user") || "null");
    if (user == null) handleLogout();
  }, []);

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
          description: `Anda Berhasil Logout.`,
        });
        qc.removeQueries({ queryKey: ['listEventMember'] })
        qc.removeQueries({ queryKey: ['listVotingMember'] })
        window.location.href = '/login';
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
