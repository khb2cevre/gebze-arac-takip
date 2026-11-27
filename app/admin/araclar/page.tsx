'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import Link from 'next/link'

export default function AraclarPage() {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Yeni Araç Form State
  const [plate, setPlate] = useState('')
  const [brandModel, setBrandModel] = useState('')
  const [vehicleType, setVehicleType] = useState('Otomobil')
  const [status, setStatus] = useState('Müsait')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      if (data) setVehicles(data)
    } catch (error) {
      console.error("Araçlar çekilemedi:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase.from('vehicles').insert([{
        plate: plate.toUpperCase(),
        brand_model: brandModel,
        vehicle_type: vehicleType,
        status: status,
        // current_km'yi formda istemiyoruz, varsayılan 0 veya boş kalabilir
        current_km: 0 
      }])

      if (error) throw error

      setIsModalOpen(false)
      // Formu temizle
      setPlate('')
      setBrandModel('')
      setVehicleType('Otomobil')
      setStatus('Müsait')
      setNotes('')
      
      // Listeyi yenile
      fetchVehicles()
    } catch (error: any) {
      alert('Araç eklenirken hata oluştu: ' + error.message)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    window.location.href = '/arac-takip-sistemi/'
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* SIDEBAR */}
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
          {/* Aktif Sayfa: Araçlar */}
          <Link href="/admin/araclar" className="flex items-center gap-3 px-4 py-3 bg-teal-50 text-teal-700 rounded-xl font-medium cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
            Araçlar
          </Link>
          <Link href="/admin/suruculer" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            Sürücüler
          </Link>
        </nav>
      </div>

      {/* ANA İÇERİK */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-gray-100 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Araçlar</h2>
          <div className="flex items-center gap-4">
             <button onClick={() => setIsModalOpen(true)} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                Yeni Araç
            </button>
            <button onClick={handleLogout} className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer">
              Çıkış Yap
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {vehicles.map(v => (
              <div key={v.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="bg-teal-50 p-3 rounded-xl text-teal-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                  </div>
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${v.status === 'Müsait' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {v.status}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{v.plate}</h3>
                  <p className="text-sm text-gray-500">{v.brand_model}</p>
                </div>
                <div>
                  <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md">
                    {v.vehicle_type || 'Belirtilmedi'}
                  </span>
                </div>
              </div>
            ))}
            
            {vehicles.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                Henüz kayıtlı araç bulunmuyor.
              </div>
            )}
          </div>
        </main>
      </div>

      {/* YENİ ARAÇ MODALI */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Yeni Araç Ekle</h3>
                <p className="text-xs text-gray-500 mt-1">Müdürlüğe ait araç kaydedin</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <form onSubmit={handleAddVehicle} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plaka *</label>
                <input type="text" required value={plate} onChange={(e) => setPlate(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none uppercase" placeholder="34 ABC 123" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marka / Model</label>
                <input type="text" value={brandModel} onChange={(e) => setBrandModel(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Ford Transit" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Araç Tipi</label>
                  <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none">
                    <option value="Otomobil">Otomobil</option>
                    <option value="Minibüs">Minibüs</option>
                    <option value="Kamyonet">Kamyonet</option>
                    <option value="Motosiklet">Motosiklet</option>
                    <option value="Diğer">Diğer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none">
                    <option value="Müsait">Müsait</option>
                    <option value="Bakımda">Bakımda</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notlar</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Bakım bilgisi, ruhsat sahibi vb."></textarea>
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
