'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { t, type Language } from '@/lib/i18n'

function AuthForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [lang, setLang] = useState<Language>('en')
  const [tab, setTab] = useState<'signin' | 'signup'>(
    searchParams.get('tab') === 'signup' ? 'signup' : 'signin'
  )
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const tx = t[lang]
  const supabase = createClient()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        business_name: businessName,
        language: lang,
      })
      router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-3xl">📒</span>
            <span className="font-bold text-2xl text-green-700">{tx.appName}</span>
          </Link>
          <div className="mt-2">
            <button
              onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
              className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 px-2 py-0.5 rounded-full"
            >
              {tx.language}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* Tabs */}
          <div className="flex border border-gray-200 rounded-lg p-1 mb-6">
            {(['signin', 'signup'] as const).map(t2 => (
              <button
                key={t2}
                onClick={() => setTab(t2)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                  tab === t2 ? 'bg-green-700 text-white' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t2 === 'signin' ? tx.signIn : tx.signUp}
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={tab === 'signin' ? handleSignIn : handleSignUp} className="space-y-4">
            {tab === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{tx.businessName}</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder={lang === 'en' ? 'e.g. Rahman Traders' : 'যেমন: রহমান ট্রেডার্স'}
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{tx.email}</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{tx.password}</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-700 text-white py-3 rounded-lg font-medium text-sm hover:bg-green-800 disabled:opacity-50 transition-colors"
            >
              {loading ? tx.loading : tab === 'signin' ? tx.signIn : tx.createAccount}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {tab === 'signin' ? tx.dontHave : tx.alreadyHave}{' '}
            <button
              onClick={() => setTab(tab === 'signin' ? 'signup' : 'signin')}
              className="text-green-700 font-medium hover:underline"
            >
              {tab === 'signin' ? tx.signUp : tx.signIn}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  )
}
