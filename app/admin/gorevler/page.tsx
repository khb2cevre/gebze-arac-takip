'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import Link from 'next/link'
import * as XLSX from 'xlsx' // Excel kütüphanesi

export default function GorevKayitlari() {
  const [user, setUser] = useState<any>(null)
  const [trips, setTrips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initData = async () => {
      try {
        const currentUserStr = localStorage.getItem('currentUser')
        if (!currentUserStr) {
          window.location.href = '/gebze-arac-takip/'
          return
        }
        const parsedUser = JSON.parse(currentUserStr)
        setUser(parsedUser)
        await fetchTrips()
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    initData()
  }, [])

  const fetchTrips = async () => {
    const { data } = await supabase
      .from('trips')
      .select('*, vehicles(plate), profiles(full_name)')
      .order('exit_time', { ascending: false })
    
    if (data) setTrips(data)
  }

  // SİLME FONKSİYONU
  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Bu görev kaydını kalıcı olarak silmek istediğinize emin misiniz?")
    if (!confirmDelete) return

    try {
      const { error } = await supabase.from('trips').delete().eq('id', id)
      if (error) throw error
      
      // Ekrandan da anında kaldır
      setTrips(trips.filter(trip => trip.id !== id))
    } catch (error: any) {
      alert("Silme işlemi başarısız: " + error.message)
    }
  }

  // EXCEL'E AKTARMA FONKSİYONU
  const handleExportExcel = () => {
    if (trips.length === 0) return alert("Aktarılacak veri bulunmuyor.")

    // Verileri Excel başlıklarıyla eşleştiriyoruz
    const excelData = trips.map(trip => ({
      "Plaka": trip.vehicles?.plate || '-',
      "Sürücü": trip.profiles?.full_name || '-',
      "Görev Türü": trip.task_type || '-',
      "Gidilen Yer": trip.destination || '-',
      "Çıkış Tarihi/Saat": new Date(trip.exit_time).toLocaleString('tr-TR'),
      "Çıkış KM": trip.exit_km,
      "Dönüş Tarihi/Saat": trip.return_time ? new Date(trip.return_time).toLocaleString('tr-TR') : '-',
      "Dönüş KM": trip.return_km || '-',
      "Yapılan KM": trip.return_km ? (trip.return_km - trip.exit_km) : '-',
      "Yakıt Alındı mı?": trip.fuel_purchased ? "Evet" : "Hayır",
      "Yakıt Miktarı (Lt)": trip.fuel_amount > 0 ? trip.fuel_amount : '-',
      "Durum": trip.status
    }))

    // Excel dosyasını oluştur ve indir
    const worksheet = XLSX.utils.json_to_sheet(excelData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Görev Kayıtları")
    
    // Sütun genişliklerini ayarla
    worksheet['!cols'] = [
      { wch: 15 }, { wch: 20 }, { wch: 30 }, { wch: 30 }, 
      { wch: 20 }, { wch: 10 }, { wch: 20 }, { wch: 10 }, 
      { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 10 }
    ]

    XLSX.writeFile(workbook, `Arac_Takip_Gorev_Kayitlari_${new Date().toLocaleDateString('tr-TR')}.xlsx`)
  }

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    window.location.href = '/gebze-arac-takip/'
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
          <Link href="/admin/gorevler" className="flex items-center gap-3 px-4 py-3 bg-teal-50 text-teal-700 rounded-xl font-medium cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
            Görev Kayıtları
          </Link>
          <Link href="/admin/araclar" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition cursor-pointer">
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
          <h2 className="text-xl font-bold text-gray-800">Görev Kayıtları</h2>
          <div className="flex items-center gap-3">
            <button onClick={handleExportExcel} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer flex items-center gap-2 shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              Excel'e Aktar
            </button>
            <button onClick={handleLogout} className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer">
              Çıkış Yap
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                    <th className="p-4 font-medium">Araç / Şoför</th>
                    <th className="p-4 font-medium">Görev Türü / Yer</th>
                    <th className="p-4 font-medium">Çıkış</th>
                    <th className="p-4 font-medium">Dönüş</th>
                    <th className="p-4 font-medium">KM Bilgisi</th>
                    <th className="p-4 font-medium">Yakıt (Lt)</th>
                    <th className="p-4 font-medium">Durum</th>
                    <th className="p-4 font-medium text-center">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {trips.map((trip) => {
                    const yapilanKm = trip.return_km ? trip.return_km - trip.exit_km : null;
                    
                    return (
                      <tr key={trip.id} className="hover:bg-gray-50">
                        <td className="p-4">
                          <p className="font-bold text-gray-800">{trip.vehicles?.plate}</p>
                          <p className="text-xs text-gray-500">{trip.profiles?.full_name}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-medium text-gray-700">{trip.task_type || '-'}</p>
                          <p className="text-xs text-gray-500">{trip.destination}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-gray-800">{new Date(trip.exit_time).toLocaleDateString('tr-TR')}</p>
                          <p className="text-xs text-gray-500">{new Date(trip.exit_time).toLocaleTimeString('tr-TR', {hour:'2-digit', minute:'2-digit'})} - {trip.exit_km} KM</p>
                        </td>
                        <td className="p-4">
                          {trip.return_time ? (
                            <>
                              <p className="text-gray-800">{new Date(trip.return_time).toLocaleDateString('tr-TR')}</p>
                              <p className="text-xs text-gray-500">{new Date(trip.return_time).toLocaleTimeString('tr-TR', {hour:'2-digit', minute:'2-digit'})} - {trip.return_km} KM</p>
                            </>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="p-4">
                          {yapilanKm !== null ? (
                            <span className={`font-medium ${yapilanKm < 0 ? 'text-red-600' : 'text-teal-600'}`}>
                              {yapilanKm} km
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="p-4">
                          {trip.fuel_purchased ? (
  <span className="text-green-600 font-medium">{trip.fuel_amount} Lt</span>
) : (
  <span className="text-gray-400 text-xs">Alınmadı</span>
)}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-medium ${trip.status === 'Görevde' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                            {trip.status}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button 
                            onClick={() => handleDelete(trip.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Kaydı Sil"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                  {trips.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-500">Kayıtlı görev bulunamadı.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
