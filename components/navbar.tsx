'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { t, type Language } from '@/lib/i18n'

interface NavbarProps {
  lang: Language
  onLangToggle: () => void
  businessName?: string
}

export default function Navbar({ lang, onLangToggle, businessName }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const tx = t[lang]

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const links = [
    { href: '/dashboard', label: tx.dashboard },
    { href: '/transactions', label: tx.transactions },
    { href: '/reports', label: tx.reports },
  ]

  return (
    <nav className="bg-white border-b border-gray-100 px-6 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl">📒</span>
            <span className="font-bold text-green-700">{tx.appName}</span>
          </Link>
          <div className="hidden md:flex gap-1">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith(link.href)
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {businessName && (
            <span className="text-xs text-gray-500 hidden md:block">{businessName}</span>
          )}
          <button
            onClick={onLangToggle}
            className="text-xs text-gray-500 border border-gray-200 px-2 py-1 rounded-full hover:bg-gray-50"
          >
            {tx.language}
          </button>
          <button
            onClick={signOut}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            {tx.signOut}
          </button>
        </div>
      </div>
      {/* Mobile nav */}
      <div className="md:hidden flex gap-1 mt-2 pt-2 border-t border-gray-50">
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex-1 text-center py-1.5 rounded-lg text-xs font-medium ${
              pathname.startsWith(link.href)
                ? 'bg-green-50 text-green-700'
                : 'text-gray-600'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
