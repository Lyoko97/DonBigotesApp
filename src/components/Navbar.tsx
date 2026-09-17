"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/menu", label: "Menú" },
  { href: "/pedidos", label: "Pedidos" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  return (
    <nav className="bg-vino text-white shadow-md">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-3">
        <span className="text-lg font-bold tracking-wide">Don Bigotes</span>

        <div className="flex flex-wrap items-center gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "bg-cobre text-vino"
                  : "text-white/90 hover:bg-white/10"
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="ml-2 flex items-center gap-3 border-l border-white/20 pl-4">
            <span className="text-sm">
              {user.nombre}{" "}
              <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs uppercase tracking-wide">
                {user.role}
              </span>
            </span>
            <button
              type="button"
              onClick={logout}
              className="rounded bg-cobre px-3 py-1 text-sm font-semibold text-white transition-colors hover:bg-cobre/80"
            >
              Salir
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
