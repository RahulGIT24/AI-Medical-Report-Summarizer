import { Route, BrowserRouter as Router, Routes } from 'react-router'
import HealthScanLanding from './pages/home'
import Signin from './pages/auth/SignIn'
import Signup from './pages/auth/SignUp'
import Dashboard from './pages/dashboard'
import PublicRoute from './pages/auth/Public'
import ProtectedRoute from './pages/auth/Protected'
import AIChatInterface from './pages/Chat'
import ReportsPage from './pages/MyReports'
import UploadReportsPage from './pages/UploadFile'
import Report from './pages/Report'
import VerifyAccount from './pages/auth/VerifyAccount'

const App = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-slate-900 to-gray-900">
    <Router>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path='/' element={<HealthScanLanding />} />
          <Route path='/signin' element={<Signin />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/verify-account' element={<VerifyAccount />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/reports' element={<ReportsPage />} />
          <Route path='/upload' element={<UploadReportsPage />} />
          <Route path='/chat' element={<AIChatInterface />} />
          <Route path='/report/:id' element={<Report />} />
        </Route>
      </Routes>
    </Router>
    </div>
  )
}

export default App