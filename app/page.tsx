'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Veritabanında telefon ve pin eşleşmesini ara
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('phone', phone)
      .eq('pin_code', pin)
      .single()

    if (error || !data) {
      setError('Telefon numarası veya PIN kodu hatalı!')
      setLoading(false)
      return
    }

      // Giriş başarılıysa kullanıcı bilgilerini tarayıcı hafızasına kaydet
    localStorage.setItem('currentUser', JSON.stringify(data))
    console.log("Giriş başarılı, yönlendiriliyor...")
    
    // Rolüne göre yönlendir (GitHub Pages basePath uyumlu)
    if (data.role === 'admin') {
      window.location.href = '/arac-takip-sistemi/admin'
    } else {
      window.location.href = '/arac-takip-sistemi/driver'
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        
        {/* Logo ve Başlık */}
        <div className="text-center mb-8">
          <div className="mx-auto bg-teal-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Araç Takip Sistemi</h2>
          <p className="text-gray-500 text-sm mt-1">Gebze İlçe Sağlık Müdürlüğü</p>
        </div>

        {/* Hata Mesajı */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 text-center border border-red-100">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Telefon Numarası</label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-gray-800"
              placeholder="5XXXXXXXXX"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">PIN Kodu</label>
            <input
              type="password"
              required
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-center text-2xl tracking-[1em] font-bold"
              placeholder="••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg shadow-teal-600/30 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-gray-400">
          <p>Tüm veriler gerçek zamanlı saklanır.</p>
        </div>
      </div>
    </div>
  )
}
