'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/navbar'
import { t, type Language } from '@/lib/i18n'

interface Transaction {
  id: string; type: 'income' | 'expense'; amount: number; category: string; description: string; date: string;
}

export default function Transactions() {
  const router = useRouter()
  const [lang, setLang] = useState<Language>('en')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')
  const supabase = createClient()
  const tx = t[lang]

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth'); return }
    const [{ data: prof }, { data: txns }] = await Promise.all([
      supabase.from('profiles').select('language').eq('id', user.id).single(),
      supabase.from('transactions').select('*').eq('user_id', user.id).order('date', { ascending: false })
    ])
    if (prof?.language) setLang(prof.language as Language)
    if (txns) setTransactions(txns)
    setLoading(false)
  }, [router, supabase])

  useEffect(() => { load() }, [load])

  const toggleLang = async () => {
    const newLang = lang === 'en' ? 'bn' : 'en'
    setLang(newLang)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) await supabase.from('profiles').update({ language: newLang }).eq('id', user.id)
  }

  const filtered = filter === 'all' ? transactions : transactions.filter(t => t.type === filter)
  const fmt = (n: number) => '৳' + n.toLocaleString('en-BD', { maximumFractionDigits: 0 })

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-green-700">{tx.loading}</div></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar lang={lang} onLangToggle={toggleLang} />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{tx.transactions}</h1>
          <Link href="/transactions/new" className="bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-800">
            + {tx.addTransaction}
          </Link>
        </div>

        <div className="flex border border-gray-200 rounded-lg p-1 mb-6 bg-white">
          {(['all', 'income', 'expense'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`flex-1 py-2 rounded-md text-xs font-medium transition-colors ${filter === f ? 'bg-green-700 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
              {f === 'all' ? (lang === 'en' ? 'All' : 'সব') : f === 'income' ? tx.income : tx.expense}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-sm">{tx.noTransactions}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map(txn => (
                <div key={txn.id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${txn.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'}`}>
                      {txn.type === 'income' ? '↑' : '↓'}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{txn.description || tx.categories[txn.category as keyof typeof tx.categories] || txn.category}</div>
                      <div className="text-xs text-gray-400">{txn.date} · {tx.categories[txn.category as keyof typeof tx.categories] || txn.category}</div>
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
