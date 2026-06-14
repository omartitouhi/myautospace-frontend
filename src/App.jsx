import { Navigate, Route, Routes } from 'react-router-dom'
import { Landing } from './pages/Landing'
import { Login } from './pages/auth/Login'
import { Register } from './pages/auth/Register'
import { AppLayout } from './pages/app/AppLayout'
import { Browse } from './pages/app/Browse'
import { VehicleDetail } from './pages/app/VehicleDetail'
import { Garage } from './pages/app/Garage'
import { SellForm } from './pages/app/SellForm'
import { Profile } from './pages/app/Profile'
import { Company } from './pages/app/Company'
import { Bookings } from './pages/app/Bookings'
import { Notifications } from './pages/app/Notifications'
import { Welcome } from './pages/app/Welcome'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/app" element={<AppLayout />}>
        <Route index element={<Browse />} />
        <Route path="vehicles/:id" element={<VehicleDetail />} />
        <Route path="garage" element={<Garage />} />
        <Route path="sell" element={<SellForm />} />
        <Route path="sell/:id" element={<SellForm />} />
        <Route path="profile" element={<Profile />} />
        <Route path="company" element={<Company />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="welcome" element={<Welcome />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
