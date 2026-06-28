import { Navigate, Route, Routes } from 'react-router-dom'
import { Landing } from './pages/Landing'
import { Login } from './pages/auth/Login'
import { Register } from './pages/auth/Register'
import { AppLayout } from './pages/app/AppLayout'
import { Dashboard } from './pages/app/Dashboard'
import { Browse } from './pages/app/Browse'
import { VehicleDetail } from './pages/app/VehicleDetail'
import { Garage } from './pages/app/Garage'
import { SellForm } from './pages/app/SellForm'
import { Profile } from './pages/app/Profile'
import { Company } from './pages/app/Company'
import { Providers } from './pages/app/Providers'
import { ProviderDetail } from './pages/app/ProviderDetail'
import { ProviderManage } from './pages/app/ProviderManage'
import { Admin } from './pages/app/Admin'
import { Wallet } from './pages/app/Wallet'
import { Contracts } from './pages/app/Contracts'
import { Messages } from './pages/app/Messages'
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
        <Route index element={<Dashboard />} />
        <Route path="browse" element={<Browse />} />
        <Route path="vehicles/:id" element={<VehicleDetail />} />
        <Route path="garage" element={<Garage />} />
        <Route path="sell" element={<SellForm />} />
        <Route path="sell/:id" element={<SellForm />} />
        <Route path="providers" element={<Providers />} />
        <Route path="providers/:id" element={<ProviderDetail />} />
        <Route path="provider" element={<ProviderManage />} />
        <Route path="admin" element={<Admin />} />
        <Route path="wallet" element={<Wallet />} />
        <Route path="contracts" element={<Contracts />} />
        <Route path="messages" element={<Messages />} />
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
