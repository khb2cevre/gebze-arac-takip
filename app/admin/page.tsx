'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link' // Yönlendirme için eklendi

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  const [stats, setStats] = useState({
    totalVehicles: 0,
    activeVehicles: 0,
    totalDrivers: 0,
    todayTrips: 0
  })

  const [activeTrips, setActiveTrips] = useState<any[]>([])
  const [recentReturns, setRecentReturns] = useState<any[]>([])

  useEffect(() => {
    const initAdmin = async () => {
      try {
        const currentUserStr = localStorage.getItem('currentUser')
        if (!currentUserStr) {
          window.location.href = '/arac-takip-sistemi/'
          return
        }
        
        const parsedUser = JSON.parse(currentUserStr)
        if (parsedUser.role !== 'admin') {
          window.location.href = '/driver'
          return
        }
        setUser(parsedUser)
        await fetchData()
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    initAdmin()
  }, [])

  const fetchData = async () => {
    const { count: vehicleCount } = await supabase.from('vehicles').select('*', { count: 'exact', head: true })
    const { count: activeVehicleCount } = await supabase.from('vehicles').select('*', { count: 'exact', head: true }).eq('status', 'Görevde')
    const { count: driverCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'driver')
    const { count: tripCount } = await supabase.from('trips').select('*', { count: 'exact', head: true })

    setStats({
      totalVehicles: vehicleCount || 0,
      activeVehicles: activeVehicleCount || 0,
      totalDrivers: driverCount || 0,
      todayTrips: tripCount || 0
    })

    const { data: activeData } = await supabase
      .from('trips')
      .select('*, profiles(full_name), vehicles(plate)')
      .eq('status', 'Görevde')
    if (activeData) setActiveTrips(activeData)

    const { data: returnData } = await supabase
      .from('trips')
      .select('*, profiles(full_name), vehicles(plate)')
      .eq('status', 'Döndü')
      .order('return_time', { ascending: false })
      .limit(5)
    if (returnData) setRecentReturns(returnData)
  }

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    window.location.href = '/arac-takip-sistemi/'
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-600">Yükleniyor...</div>

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* SIDEBAR (Sol Menü) - Linkler Güncellendi */}
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
          {/* Aktif sayfa: Genel Bakış */}
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 bg-teal-50 text-teal-700 rounded-xl font-medium cursor-pointer">
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
          <Link href="/admin/suruculer" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            Sürücüler
          </Link>
        </nav>
      </div>

      {/* ANA İÇERİK */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-gray-100 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Genel Bakış</h2>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-gray-800">{user?.full_name}</p>
              <p className="text-xs text-gray-500">{user?.title}</p>
            </div>
            <button onClick={handleLogout} className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer">
              Çıkış Yap
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          
          {/* İstatistik Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="bg-teal-50 p-3 rounded-xl text-teal-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg></div>
              <div><p className="text-2xl font-bold text-gray-800">{stats.totalVehicles}</p><p className="text-sm text-gray-500">Toplam Araç</p></div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="bg-orange-50 p-3 rounded-xl text-orange-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg></div>
              <div><p className="text-2xl font-bold text-gray-800">{stats.activeVehicles}</p><p className="text-sm text-gray-500">Şu An Görevde</p></div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="bg-blue-50 p-3 rounded-xl text-blue-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>
              <div><p className="text-2xl font-bold text-gray-800">{stats.todayTrips}</p><p className="text-sm text-gray-500">Toplam Hareket</p></div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="bg-green-50 p-3 rounded-xl text-green-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg></div>
              <div><p className="text-2xl font-bold text-gray-800">{stats.totalDrivers}</p><p className="text-sm text-gray-500">Sürücü</p></div>
            </div>
          </div>

          {/* Alt Alta Liste Görünümü */}
          <div className="space-y-8">
            
            {/* Aktif Görevler Bölümü */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-4">
                <span className="w-3 h-3 rounded-full bg-orange-500 animate-pulse"></span>
                Aktif Görevler ({activeTrips.length})
              </h3>
              {activeTrips.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">Şu an görevde araç bulunmuyor.</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {activeTrips.map(trip => (
                    <div key={trip.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-gray-800">{trip.vehicles?.plate}</p>
                          <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-md font-medium">Yolda</span>
                        </div>
                        <p className="text-sm text-gray-700 font-medium">{trip.profiles?.full_name} <span className="text-xs text-gray-400 font-normal">(Şoför)</span></p>
                        <p className="text-sm text-gray-500 mt-1"><span className="font-medium text-gray-600">Görev Türü:</span> {trip.task_type}</p>
                        <p className="text-sm text-gray-500"><span className="font-medium text-gray-600">Gidilen Yer:</span> {trip.destination}</p>
                      </div>
                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 min-w-[200px]">
                        <p><span className="text-xs text-gray-400 block mb-1">Çıkış Saati:</span> {new Date(trip.exit_time).toLocaleString('tr-TR')}</p>
                        <p className="mt-1"><span className="text-xs text-gray-400 block mb-1">Çıkış KM:</span> {trip.exit_km}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Son Dönüşler Bölümü */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-4">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Son Dönüşler
              </h3>
              {recentReturns.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">Henüz dönüş kaydı yok.</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recentReturns.map(trip => (
                    <div key={trip.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-gray-800">{trip.vehicles?.plate}</p>
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-md font-medium">Döndü</span>
                        </div>
                        <p className="text-sm text-gray-700 font-medium">{trip.profiles?.full_name} <span className="text-xs text-gray-400 font-normal">(Şoför)</span></p>
                        <p className="text-sm text-gray-500 mt-1"><span className="font-medium text-gray-600">Gidilen Yer:</span> {trip.destination}</p>
                      </div>
                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 min-w-[200px]">
                        <p><span className="text-xs text-gray-400 block mb-1">Dönüş Saati:</span> {new Date(trip.return_time).toLocaleString('tr-TR')}</p>
                        <p className="mt-1"><span className="text-xs text-gray-400 block mb-1">Yapılan KM:</span> {trip.return_km - trip.exit_km} km</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
