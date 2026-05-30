'use client'
import { useState } from 'react'
import Link from 'next/link'
import { t, type Language } from '@/lib/i18n'

export default function LandingPage() {
  const [lang, setLang] = useState<Language>('en')
  const tx = t[lang]

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📒</span>
          <span className="font-bold text-xl text-green-700">{tx.appName}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
            className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1 rounded-full"
          >
            {tx.language}
          </button>
          <Link href="/auth" className="text-sm font-medium text-green-700 hover:text-green-800">
            {tx.signIn}
          </Link>
          <Link href="/auth?tab=signup" className="text-sm font-medium bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800">
            {tx.signUp}
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="inline-block bg-green-50 text-green-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          {tx.tagline}
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
          {tx.heroTitle}
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          {tx.heroSubtitle}
        </p>
        <Link
          href="/auth?tab=signup"
          className="inline-block bg-green-700 text-white text-lg font-semibold px-8 py-4 rounded-xl hover:bg-green-800 transition-colors shadow-lg"
        >
          {tx.getStarted} →
        </Link>
      </section>

      {/* Stats */}
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
            <div className="text-green-100 text-sm 