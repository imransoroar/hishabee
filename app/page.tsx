'use client'
import { useState } from 'react'
import Link from 'next/link'
import { t, type Language } from '@/lib/i18n'

export default function LandingPage() {
  const [lang, setLang] = useState<Language>('en')
  const tx = t[lang]

  return (
    <div className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📒</span>
          <span className="font-bold text-xl text-green-700">{tx.appName}</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
            className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1 rounded-full">
            {tx.language}
          </button>
          <Link href="/auth" className="text-sm font-medium text-green-700 hover:text-green-800">{tx.signIn}</Link>
          <Link href="/auth?tab=signup" className="text-sm font-medium bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800">{tx.signUp}</Link>
        </div>
      </nav>

      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="inline-block bg-green-50 text-green-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">{tx.tagline}</div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">{tx.heroTitle}</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">{tx.heroSubtitle}</p>
        <Link href="/auth?tab=signup" className="inline-block bg-green-700 text-white text-lg font-semibold px-8 py-4 rounded-xl hover:bg-green-800 transition-colors shadow-lg">
          {tx.getStarted} →
        </Link>
      </section>

      <section className="bg-green-700 text-white py-12">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold">৬৬%</div>
            <div className="text-green-100 text-sm mt-1">{lang === 'en' ? 'of SMBs fail within 5 years' : 'ছোট ব্যবসা ৫ বছরে বন্ধ হয়'}</div>
          </div>
          <div>
            <div className="text-3xl font-bold">#১</div>
            <div className="text-green-100 text-sm mt-1">{lang === 'en' ? 'reason: poor financial management' : 'কারণ: দুর্বল আর্থিক ব্যবস্থাপনা'}</div>
          </div>
          <div>
            <div className="text-3xl font-bold">২×</div>
            <div className="text-green-100 text-sm mt-1">{lang === 'en' ? 'more likely to survive with records' : 'বেশি টিকে থাকে যারা হিসাব রাখে'}</div>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">{tx.whyAccounting}</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: '💰', title: tx.reason1Title, desc: tx.reason1Desc },
            { icon: '📊', title: tx.reason2Title, desc: tx.reason2Desc },
            { icon: '🏛️', title: tx.reason3Title, desc: tx.reason3Desc },
          ].map((item, i) => (
            <div key={i} className="bg-gray-50 rounded-2xl p-6">
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="font-semibold text-gray-900 text-lg mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {lang === 'en' ? 'How Hishabee works' : 'হিসাবি কীভাবে কাজ করে'}
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '১', text: lang === 'en' ? 'Sign up with your email' : 'ইমেইল দিয়ে সাইন আপ করুন' },
              { step: '২', text: lang === 'en' ? 'Add income & expenses daily' : 'প্রতিদিন আয় ও খরচ লিখুন' },
              { step: '৩', text: lang === 'en' ? 'See your P&L in seconds' : 'সেকেন্ডে লাভ-ক্ষতি দেখুন' },
              { step: '৪', text: lang === 'en' ? 'Make smarter decisions' : 'সঠিক সিদ্ধান্ত নিন' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 bg-green-700 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">{item.step}</div>
                <p className="text-gray-700 text-sm">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {lang === 'en' ? 'Ready to take control of your finances?' : 'আপনার আর্থিক নিয়ন্ত্রণ নিতে প্রস্তুত?'}
        </h2>
        <p className="text-gray-600 mb-8">
          {lang === 'en' ? 'Free to use. No accountant needed.' : 'সম্পূর্ণ বিনামূল্যে। কোনো হিসাবরক্ষক লাগবে না।'}
        </p>
        <Link href="/auth?tab=signup" className="inline-block bg-green-700 text-white text-lg font-semibold px-8 py-4 rounded-xl hover:bg-green-800 transition-colors">
          {tx.getStarted}
        </Link>
      </section>

      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        <span className="font-bold text-green-700">{tx.appName}</span> — {lang === 'en' ? 'Made for Bangladesh' : 'বাংলাদেশের জন্য তৈরি'}
      </footer>
    </div>
  )
}
