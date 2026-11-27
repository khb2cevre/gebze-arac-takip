'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import Link from 'next/link'

export default function SuruculerPage() {
  const [drivers, setDrivers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Yeni Sürücü Form State
  const [fullName, setFullName] = useState('')
  const [title, setTitle] = useState('')
  const [phone, setPhone] = useState('')
  const [pinCode, setPinCode] = useState('')

  useEffect(() => {
    fetchDrivers()
  }, [])

  const fetchDrivers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'driver')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      if (data) setDrivers(data)
    } catch (error) {
      console.error("Sürücüler çekilemedi:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pinCode.length !== 4) return alert('PIN kodu 4 haneli olmalıdır!')

    try {
      const { error } = await supabase.from('profiles').insert([{
        full_name: fullName,
        title: title,
        phone: phone,
        pin_code: pinCode,
        role: 'driver'
      }])

      if (error) throw error

      setIsModalOpen(false)
      setFullName('')
      setTitle('')
      setPhone('')
      setPinCode('')
      
      fetchDrivers()
    } catch (error: any) {
      alert('Sürücü eklenirken hata oluştu: ' + error.message)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    window.location.href = '/arac-takip-sistemi/'
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* SIDEBAR (Diğer sayfalarla aynı, burada Araçlar yerine Sürücüler aktif) */}
      <div className="w-64 bg-white border-r border-gray-100 flex flex-col hidden md:flex">
        <div className="p-6 flex items-center gap-3 border-b border-gray-100">
          <div className="bg-teal-600 w-10 h-10 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
          </div>
          <div>
            <h1 className="font-bold text-gray-800 text-sm leading-tight">Araç Takip Sistemi</h1>
            <p className="text-xs text-gray-500">Gebze İlçe Sağlık Müdürlüğü</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            Genel Bakış
          </Link>
          <Link href="/admin/gorevler" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
            Görev Kayıtları
          </Link>
          <Link href="/admin/araclar" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
            Araçlar
          </Link>
          <Link href="/admin/suruculer" className="flex items-center gap-3 px-4 py-3 bg-teal-50 text-teal-700 rounded-xl font-medium cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            Sürücüler
          </Link>
        </nav>
      </div>

      {/* ANA İÇERİK */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-gray-100 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Sürücüler</h2>
          <div className="flex items-center gap-4">
             <button onClick={() => setIsModalOpen(true)} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                Yeni Sürücü
            </button>
            <button onClick={handleLogout} className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer">
              Çıkış Yap
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {drivers.map(d => (
              <div key={d.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="bg-teal-50 p-4 rounded-full text-teal-600">
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{d.full_name}</h3>
                  <p className="text-sm text-gray-500">{d.title || 'Şoför'}</p>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                    {d.phone}
                  </p>
                </div>
              </div>
            ))}
            
            {drivers.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                Henüz kayıtlı sürücü bulunmuyor.
              </div>
            )}
          </div>
        </main>
      </div>

      {/* YENİ SÜRÜCÜ MODALI */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Yeni Sürücü Ekle</h3>
                <p className="text-xs text-gray-500 mt-1">Araç kullanan personeli kaydedin</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <form onSubmit={handleAddDriver} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad *</label>
                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Sürücünün adını ve soyadını giriniz" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unvan</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Şoför, Sağlık Teknikeri..." />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon *</label>
                <input type="text" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="05XX XXX XX XX" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giriş PIN Kodu (4 Hane) *</label>
                <input type="text" required maxLength={4} value={pinCode} onChange={(e) => setPinCode(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none text-center tracking-[1em] font-bold" placeholder="••••" />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition cursor-pointer">
                  İptal
                </button>
                <button type="submit" className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium transition cursor-pointer">
                  Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
