'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase' 

export default function DriverPage() {
  const [user, setUser] = useState<any>(null)
  const [activeTrip, setActiveTrip] = useState<any>(null)
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Çıkış Formu State
  const [selectedVehicle, setSelectedVehicle] = useState('')
  const [destination, setDestination] = useState('')
  const [exitKm, setExitKm] = useState('')
  const [taskType, setTaskType] = useState('Kurum içi / İdari Görev')

  // Dönüş Formu State
  const [returnKm, setReturnKm] = useState('')
  const [fuelPurchased, setFuelPurchased] = useState('Hayır')
  const [fuelAmount, setFuelAmount] = useState('')

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
        
        await fetchVehicles()
        await checkActiveTrip(parsedUser.id)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false) 
      }
    }
    initData()
  }, [])

  const checkActiveTrip = async (driverId: string) => {
    const { data, error } = await supabase
      .from('trips')
      .select('*, vehicles(plate)')
      .eq('driver_id', driverId)
      .eq('status', 'Görevde')
      .maybeSingle()
    
    if (error) console.error(error)
    if (data) setActiveTrip(data)
  }

  const fetchVehicles = async () => {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('status', 'Müsait')
      
    if (error) console.error(error)
    if (data) setVehicles(data)
  }

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    window.location.href = '/gebze-arac-takip/' 
  }

  const handleStartTrip = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedVehicle) return alert('Lütfen bir araç seçiniz!')

    const { error } = await supabase.from('trips').insert([{
      vehicle_id: selectedVehicle,
      driver_id: user.id,
      exit_time: new Date().toISOString(),
      destination: destination,
      exit_km: parseInt(exitKm),
      task_type: taskType, 
      status: 'Görevde'
    }])

    if (error) return alert('Hata: ' + error.message)

    await supabase.from('vehicles').update({ status: 'Görevde' }).eq('id', selectedVehicle)
    window.location.reload()
  }

  const handleEndTrip = async (e: React.FormEvent) => {
    e.preventDefault()

    // KURAL: Dönüş KM, Çıkış KM'den küçük olamaz (Boş girilme kontrolü ile birlikte)
    if (!returnKm || parseInt(returnKm) < activeTrip.exit_km) {
      return alert(`Hata: Dönüş kilometresi boş olamaz ve çıkış kilometresinden (${activeTrip.exit_km}) küçük olamaz!`)
    }

    // KURAL: Yakıt alındıysa miktar zorunlu (HATA BURADAYDI: fuelCost yerine fuelAmount yazdık)
    if (fuelPurchased === 'Evet' && !fuelAmount) {
      return alert('Lütfen yakıt miktarını giriniz!')
    }
    
    const { error } = await supabase.from('trips').update({
      return_time: new Date().toISOString(),
      return_km: parseInt(returnKm),
      fuel_purchased: fuelPurchased === 'Evet',
      fuel_amount: fuelPurchased === 'Evet' ? parseFloat(fuelAmount) : 0,
      status: 'Döndü'
    }).eq('id', activeTrip.id)

    if (error) return alert('Hata: ' + error.message)

    await supabase.from('vehicles').update({ 
      status: 'Müsait',
      current_km: parseInt(returnKm) 
    }).eq('id', activeTrip.vehicle_id)

    window.location.reload()
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Merhaba, {user?.full_name}</h1>
            <p className="text-sm text-gray-500">{user?.title}</p>
          </div>
          <button onClick={handleLogout} className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer">
            Çıkış Yap
          </button>
        </div>

        {activeTrip ? (
          // AKTİF GÖREV VAR (Dönüş Ekranı)
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="bg-teal-50 text-teal-800 p-4 rounded-xl mb-6 border border-teal-100">
              <h2 className="font-bold mb-2">Şu An Görevdesiniz</h2>
              <p className="text-sm">Araç: <strong>{activeTrip.vehicles?.plate}</strong></p>
              <p className="text-sm">Görev Türü: {activeTrip.task_type}</p>
              <p className="text-sm">Gidilen Yer: {activeTrip.destination}</p>
              <p className="text-sm">Çıkış KM: {activeTrip.exit_km}</p>
            </div>
            
            <form onSubmit={handleEndTrip} className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Dönüş İşlemi</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dönüş Kilometresi (KM) *</label>
                <input type="number" required min={activeTrip.exit_km} value={returnKm} onChange={(e) => setReturnKm(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none" placeholder={`En az: ${activeTrip.exit_km}`} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Yakıt Alındı mı? *</label>
                  <select value={fuelPurchased} onChange={(e) => setFuelPurchased(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none">
                    <option value="Hayır">Hayır</option>
                    <option value="Evet">Evet</option>
                  </select>
                </div>
                
                {fuelPurchased === 'Evet' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Yakıt Miktarı (Litre) *</label>
                    <input type="number" step="0.01" required value={fuelAmount} onChange={(e) => setFuelAmount(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Örn: 45.5" />
                  </div>
                )}
              </div>

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/30 mt-4 cursor-pointer">
                Dönüş Yap ve Görevi Bitir
              </button>
            </form>
          </div>
        ) : (
          // AKTİF GÖREV YOK (Yeni Görev Çıkış Ekranı)
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 border-b pb-2">Yeni Görev Çıkışı Başlat</h2>
            
            <form onSubmit={handleStartTrip} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Araç Seçin *</label>
                <select required value={selectedVehicle} onChange={(e) => setSelectedVehicle(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none">
                  <option value="">Araç seçin...</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.plate} ({v.brand_model})</option>
                  ))}
                </select>
                {vehicles.length === 0 && <p className="text-xs text-red-500 mt-1">Müsait araç bulunamadı.</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Görev Türü *</label>
                <select required value={taskType} onChange={(e) => setTaskType(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none">
                  <option value="Kurum içi / İdari Görev">Kurum içi / İdari Görev</option>
                  <option value="Resmi Evrak / Posta / Kargo">Resmi Evrak / Posta / Kargo</option>
                  <option value="Personel Taşıma / Toplantı - Eğitim">Personel Taşıma / Toplantı - Eğitim</option>
                  <option value="Satın Alma / Malzeme / Lojistik Sevki">Satın Alma / Malzeme / Lojistik Sevki</option>
                  <option value="Sağlık Tesisleri Ziyareti / Koordinasyon">Sağlık Tesisleri Ziyareti / Koordinasyon</option>
                  <option value="Denetim / İnceleme / Soruşturma">Denetim / İnceleme / Soruşturma</option>
                  <option value="Bakım / Onarım / Servis">Bakım / Onarım / Servis</option>
                  <option value="Diğer">Diğer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gidilecek Yer / Görev Tanımı *</label>
                <input type="text" required value={destination} onChange={(e) => setDestination(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Örn: Kocaeli İl Sağlık Müdürlüğü" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Çıkış KM *</label>
                <input type="number" required value={exitKm} onChange={(e) => setExitKm(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Örn: 45230" />
              </div>

              <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-teal-600/30 mt-4 cursor-pointer">
                Görevi Başlat (Çıkış Yap)
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
