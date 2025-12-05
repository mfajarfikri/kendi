import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import DetailTrip from '../../Pages/Kendaraan/DetailTrip.jsx'

describe('DetailTrip Edit Feature', () => {
  const trip = {
    code_trip: 'TEST12345',
    km_awal: 1000,
    km_akhir: 1200,
    jarak: 200,
    tujuan: 'GI Kosambi Baru',
    waktu_keberangkatan: '2025-12-02T08:00',
    waktu_kembali: '2025-12-02T10:00',
    foto_berangkat: JSON.stringify([]),
    foto_kembali: JSON.stringify([]),
    kendaraan: { id: 1, plat_kendaraan: 'B 1234 CD', merek: 'Toyota' },
    driver: { id: 1, name: 'Andi', phone_number: '08123456789' },
  }
  const auth = { user: { role: 'admin' } }
  const allVehicles = [
    { id: 1, plat_kendaraan: 'B 1234 CD', merek: 'Toyota' },
    { id: 2, plat_kendaraan: 'D 5678 EF', merek: 'Honda' },
  ]
  const allDrivers = [
    { id: 1, name: 'Andi', phone_number: '08123456789' },
    { id: 2, name: 'Budi', phone_number: '08129876543' },
  ]

  test('opens edit panel and shows driver combobox options', async () => {
    render(<DetailTrip trip={trip} auth={auth} allVehicles={allVehicles} allDrivers={allDrivers} />)
    const editBtn = screen.getByRole('button', { name: /Edit Trip/i })
    fireEvent.click(editBtn)
    // Focus combobox input for driver
    const driverInput = await screen.findByPlaceholderText(/Cari atau pilih driver/i)
    fireEvent.click(driverInput)
    const option = await screen.findByText(/Budi - 08129876543/i)
    expect(option).toBeInTheDocument()
  })

  test('autosave draft to localStorage when edit data changes', async () => {
    vi.useFakeTimers()
    render(<DetailTrip trip={trip} auth={auth} allVehicles={allVehicles} allDrivers={allDrivers} />)
    const editBtn = screen.getByRole('button', { name: /Edit Trip/i })
    fireEvent.click(editBtn)
    const tujuanInput = await screen.findByPlaceholderText(/Contoh: GI Kosambi Baru/i)
    fireEvent.change(tujuanInput, { target: { value: 'Workshop' } })
    await act(async () => { vi.advanceTimersByTime(600) })
    const raw = localStorage.getItem(`trip:${trip.code_trip}:editDraft`)
    const draft = JSON.parse(raw)
    expect(draft.tujuan).toBe('Workshop')
    vi.useRealTimers()
  })
})
