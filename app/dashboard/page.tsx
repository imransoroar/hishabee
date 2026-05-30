'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/navbar'
import { t, type Language } from '@/lib/i18n'

interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string
  date: string
}

interface Profile {
  business_name: string
  language: string
}

export default function Dashboard() {
  const router = useRouter()
  const [lang, setLang] = useState<Language>('en')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const tx = t[lang]

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth'); return }

    const [{ data: prof }, { data: txns }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('transactions').select('*')
        .eq('user_id', user.id)
        .gte('date', monthStart)
        .lte('date', monthEnd)
        .order('date', { ascending: false })
    ])

    if (prof) {
      setProfile(prof)
      setLang((prof.language as Language) || 'en')
    }
    if (txns) setTransactions(txns)
    setLoading(false)
  }, [router, supabase, monthStart, monthEnd])

  useEffect(() => { load() }, [load])

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const netProfit = totalIncome - totalExpense

  const toggleLang = async () => {
    const newLang = lang === 'en' ? 'bn' : 'en'
    setLang(newLang)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) await supabase.from('profiles').update({ language: newLang }).eq('id', user.id)
  }

  const fmt = (n: number) => '৳' + n.toLocaleString('en-BD', { maximumFractionDigits: 0 })
  const monthName = now.toLocaleDateString(lang === 'en' ? 'en-US' : 'bn-BD', { month: 'long', year: 'numeric' })

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-green-700 font-medium">{tx.loading}</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar lang={lang} onLangToggle={toggleLang} businessName={profile?.business_name} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Greeting */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {tx.greeting}, {profile?.business_name || ''} 👋
            </h1>
            <p className="text-gray-500 text-sm mt-1">{monthName} — {tx.thisMonth}</p>
          </div>
          <Link
            href="/transactions/new"
            className="bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-green-800 flex items-center gap-2"
          >
            <span>+</span> {tx.addTransaction}
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{tx.totalIncome}</div>
            <div className="text-3xl font-bold text-green-600">{fmt(totalIncome)}</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{tx.totalExpenses}</div>
            <div className="text-3xl font-bold text-red-500">{fmt(totalExpense)}</div>
          </div>
          <div className={`rounded-2xl p-6 border shadow-sm ${netProfit >= 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{tx.netProfit}</div>
            <div className={`text-3xl font-bold ${netProfit >= 0 ? 'text-green-700' : 'text-red-600'}`}>
              {fmt(netProfit)}
            </div>
          </div>
        </div>

        {/* Insight */}
        {transactions.length > 0 && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-8">
            <div className="text-xs font-medium text-blue-400 uppercase mb-1">💡 {tx.insights}</div>
            {totalIncome > 0 ? (
              <p className="text-blue-800 text-sm">
                {tx.profitMargin}: <strong>{((netProfit / totalIncome) * 100).toFixed(1)}%</strong>
                {netProfit < 0
                  ? (lang === 'en' ? ' — expenses exceed income this month.' : ' — এই মাসে খরচ আয়ের বেশি।')
                  : (lang === 'en' ? ' — you are profitable this month!' : ' — এই মাসে আপনি লাভে আছেন!')}
              </p>
            ) : (
              <p className="text-blue-800 text-sm">
                {lang === 'en' ? 'Add your income transactions to see profitability insights.' : 'লাভের বিশ্লেষণ দেখতে আয়ের লেনদেন যোগ করুন।'}
              </p>
            )}
          </div>
        )}

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-900">{tx.transactions}</h2>
            <Link href="/transactions" className="text-xs text-green-700 hover:underline">
              {lang === 'en' ? 'View all' : 'সব দেখুন'}
            </Link>
          </div>
          {transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-sm">{tx.noTransactions}</p>
              <Link href="/transactions/new" className="mt-4 inline-block text-green-700 text-sm font-medium hover:underline">
                + {tx.addTransaction}
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {transactions.slice(0, 10).map(txn => (
                <div key={txn.id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      txn.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {txn.type === 'income' ? '↑' : '↓'}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 capitalize">{txn.description || txn.category}</div>
                      <div className="text-xs text-gray-400">{txn.date}</div>
                    </div>
                  </div>
                  <div className={`text-sm font-semibold ${txn.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                    {txn.type === 'income' ? '+' : '-'}{fmt(txn.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
