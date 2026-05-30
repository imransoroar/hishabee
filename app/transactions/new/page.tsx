'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/navbar'
import { t, incomeCategories, expenseCategories, type Language } from '@/lib/i18n'

export default function NewTransaction() {
  const router = useRouter()
  const [lang, setLang] = useState<Language>('en')
  const [type, setType] = useState<'income' | 'expense'>('income')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()
  const tx = t[lang]

  const loadLang = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth'); return }
    const { data } = await supabase.from('profiles').select('language').eq('id', user.id).single()
    if (data?.language) setLang(data.language as Language)
  }, [router, supabase])

  useEffect(() => { loadLang() }, [loadLang])

  const categories = type === 'income' ? incomeCategories : expenseCategories

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !category) { setError('Please fill all required fields'); return }
    setLoading(true)
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth'); return }
    const { error: err } = await supabase.from('transactions').insert({
      user_id: user.id, type, amount: parseFloat(amount), category, description, date,
    })
    if (err) { setError(err.message); setLoading(false); return }
    router.push('/dashboard')
  }

  const toggleLang = async () => {
    const newLang = lang === 'en' ? 'bn' : 'en'
    setLang(newLang)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) await supabase.from('profiles').update({ language: newLang }).eq('id', user.id)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar lang={lang} onLangToggle={toggleLang} />
      <main className="max-w-lg mx-auto px-4 py-8">
        <div className="mb-6">
          <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
            ← {lang === 'en' ? 'Back' : 'ফিরে যান'}
          </button>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">{tx.addTransaction}</h1>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex border border-gray-200 rounded-xl p-1 mb-6">
            {(['income', 'expense'] as const).map(t2 => (
              <button key={t2} onClick={() => { setType(t2); setCategory('') }}
                className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all ${
                  type === t2 ? (t2 === 'income' ? 'bg-green-600 text-white shadow-sm' : 'bg-red-500 text-white shadow-sm') : 'text-gray-500 hover:text-gray-700'
                }`}>
                {t2 === 'income' ? `↑ ${tx.income}` : `↓ ${tx.expense}`}
              </button>
            ))}
          </div>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{tx.amount} *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">৳</span>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                  className="w-full pl-8 pr-4 border border-gray-200 rounded-lg py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0" min="0" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{tx.category} *</label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map(cat => (
                  <button key={cat} type="button" onClick={() => setCategory(cat)}
                    className={`text-left px-3 py-2 rounded-lg text-xs border transition-colors ${
                      category === cat ? (type === 'income' ? 'border-green-500 bg-green-50 text-green-700 font-medium' : 'border-red-400 bg-red-50 text-red-700 font-medium') : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}>
                    {tx.categories[cat as keyof typeof tx.categories]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{tx.description}</label>
              <input type="text" value={description} onChange={e => setDescription(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder={lang === 'en' ? 'e.g. Monthly office rent' : 'যেমন: মাসিক অফিস ভাড়া'} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{tx.date}</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => router.back()}
                className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-medium hover:bg-gray-50">
                {tx.cancel}
              </button>
              <button type="submit" disabled={loading || !category}
                className={`flex-1 text-white py-3 rounded-xl text-sm font-medium disabled:opacity-50 transition-colors ${
                  type === 'income' ? 'bg-green-700 hover:bg-green-800' : 'bg-red-500 hover:bg-red-600'
                }`}>
                {loading ? tx.loading : tx.save}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
