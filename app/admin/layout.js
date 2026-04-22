import AdminSidebar from '@/components/admin/AdminSidebar'

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <main className="flex-1 min-w-0 ml-64">
        {children}
      </main>
    </div>
  )
}
