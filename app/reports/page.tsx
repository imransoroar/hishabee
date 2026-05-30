'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/navbar'
import { t, type Language } from '@/lib/i18n'

interface Transaction {
  id: string; type: 'income' | 'expense'; amount: number; category: string; description: string; date: string;
}

export default function Reports() {
  const router = useRouter()
  const [lang, setLang] = useState<Language>('en')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const supabase = createClient()
  const tx = t[lang]

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth'); return }
    const [year, month] = selectedMonth.split('-')
    const start = `${year}-${month}-01`
    const end = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0]
    const [{ data: prof }, { data: txns }] = await Promise.all([
      supabase.from('profiles').select('language').eq('id', user.id).single(),
      supabase.from('transactions').select('*').eq('user_id', user.id).gte('date', start).lte('date', end).order('date', { ascending: false })
    ])
    if (prof?.language) setLang(prof.language as Language)
    if (txns) setTransactions(txns)
    setLoading(false)
  }, [router, supabase, selectedMonth])

  useEffect(() => { load() }, [load])

  const toggleLang = async () => {
    const newLang = lang === 'en' ? 'bn' : 'en'
    setLang(newLang)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) await supabase.from('profiles').update({ language: newLang }).eq('id', user.id)
  }

  const income = transactions.filter(t => t.type === 'income')
  const expenses = transactions.filter(t => t.type === 'expense')
  const totalIncome = income.reduce((s, t) => s + t.amount, 0)
  const totalExpense = expenses.reduce((s, t) => s + t.amount, 0)
  const netProfit = totalIncome - totalExpense

  const byCategory = (items: Transaction[]) => {
    const map: Record<string, number> = {}
    items.forEach(i => { map[i.category] = (map[i.category] || 0) + i.amount })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }

  const fmt = (n: number) => '৳' + n.toLocaleString('en-BD', { maximumFractionDigits: 0 })

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-green-700">{tx.loading}</div></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar lang={lang} onLangToggle={toggleLang} />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{tx.reports}</h1>
          <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>

        {/* P&L Summary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-900">{tx.profitLoss}</h2>
          </div>
          <div className="p-6 space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-sm text-gray-600">{tx.totalIncome}</span>
              <span className="text-sm font-semibold text-green-600">{fmt(totalIncome)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-sm text-gray-600">{tx.totalExpenses}</span>
              <span className="text-sm font-semibold text-red-500">({fmt(totalExpense)})</span>
            </div>
            <div className={`flex justify-between py-3 px-4 rounded-xl ${netProfit >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <span className="text-sm font-bold text-gray-900">{tx.netProfit}</span>
              <span className={`text-sm font-bold ${netProfit >= 0 ? 'text-green-700' : 'text-red-600'}`}>{fmt(netProfit)}</span>
            </div>
            {totalIncome > 0 && (
              <div className="text-xs text-gray-400 text-right">
                {tx.profitMargin}: {((netProfit / totalIncome) * 100).toFixed(1)}%
              </div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Income Breakdown */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-50">
              <h2 className="font-semibold text-gray-900">↑ {tx.income}</h2>
            </div>
            <div className="p-4 space-y-2">
              {byCategory(income).length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">{tx.noTransactions}</p>
              ) : byCategory(income).map(([cat, amt]) => (
                <div key={cat} className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="text-xs text-gray-600 mb-1">{tx.categories[cat as keyof typeof tx.categories] || cat}</div>
                    <div className="h-1.5 bg-gray-100 rounded-full">
                      <div className="h-1.5 bg-green-500 rounded-full" style={{ width: `${(amt/totalIncome)*100}%` }} />
                    </div>
                  </div>
                  <span className="text-xs font-medium text-green-600 ml-3 w-20 text-right">{fmt(amt)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Expense Breakdown */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-50">
              <h2 className="font-semibold text-gray-900">↓ {tx.expense}</h2>
            </div>
            <div className="p-4 space-y-2">
              {byCategory(expenses).length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">{tx.noTransactions}</p>
              ) : byCategory(expenses).map(([cat, amt]) => (
                <div key={cat} className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="text-xs text-gray-600 mb-1">{tx.categories[cat as keyof typeof tx.categories] || cat}</div>
                    <div className="h-1.5 bg-gray-100 rounded-full">
                      <div className="h-1.5 bg-red-400 rounded-full" style={{ width: `${(amt/totalExpense)*100}%` }} />
                    </div>
                  </div>
                  <span className="text-xs font-medium text-red-500 ml-3 w-20 text-right">{fmt(amt)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insights */}
        {transactions.length > 0 && (
          <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-6">
            <h2 className="font-semibold text-gray-900 mb-4">💡 {tx.insights}</h2>
            <div className="space-y-3 text-sm text-blue-800">
              {totalIncome > 0 && (
                <p>• {tx.profitMargin}: <strong>{((netProfit/totalIncome)*100).toFixed(1)}%</strong></p>
              )}
              {byCategory(expenses)[0] && (
                <p>• {tx.topExpense} <strong>{tx.categories[byCategory(expenses)[0][0] as keyof typeof tx.categories] || byCategory(expenses)[0][0]}</strong> ({fmt(byCategory(expenses)[0][1])})</p>
              )}
              {netProfit < 0 && (
                <p>• {lang === 'en' ? '⚠️ You spent more than you earned this month. Review your expenses.' : '⚠️ এই মাসে আয়ের চেয়ে বেশি খরচ হয়েছে। খরচ পর্যালোচনা করুন।'}</p>
              )}
              {netProfit > 0 && (
                <p>• {lang === 'en' ? '✅ Great job! You are profitable this month.' : '✅ চমৎকার! এই মাসে আপনি লাভে আছেন।'}</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
