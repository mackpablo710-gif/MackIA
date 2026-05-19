import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Toaster } from 'react-hot-toast'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-bg text-text-main">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <Outlet />
      </main>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#111118', border: '1px solid #1E1E2E', color: '#F0F0FF' },
          success: { iconTheme: { primary: '#6C47FF', secondary: '#F0F0FF' } },
        }}
      />
    </div>
  )
}
