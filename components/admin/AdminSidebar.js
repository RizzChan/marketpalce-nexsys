"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tag,
  Users,
  LogOut,
  BarChart3,
} from "lucide-react";

const menus = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Produk", href: "/admin/products", icon: Package },
  { label: "Pesanan", href: "/admin/orders", icon: ShoppingBag },
  { label: "Kategori", href: "/admin/categories", icon: Tag },
  { label: "Report", href: "/admin/reports", icon: BarChart3 },
  { label: "Pengguna", href: "/admin/users", icon: Users },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  function isActive(menu) {
    if (menu.exact) return pathname === menu.href;
    return pathname.startsWith(menu.href);
  }

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-100 flex flex-col z-40">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Nexsys"
            width={28}
            height={28}
            className="rounded-lg object-contain"
          />
          <div>
            <p className="font-bold text-gray-900 text-sm">NEXSYS</p>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menus.map((menu) => (
          <Link
            key={menu.href}
            href={menu.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive(menu)
                ? "bg-black text-white"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <menu.icon className="w-4 h-4 shrink-0" />
            {menu.label}
          </Link>
        ))}
      </nav>

      {/* User Info + Logout */}
      <div className="px-3 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4 text-gray-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </button>
      </div>
    </aside>
  );
}
