import { useContext } from 'react'
import Home from './pages/Home'
import Login from './pages/Login'
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'
import {ToastContainer} from "react-toastify"
import { dataContext } from './context/UserContext'

function App() {
  const { user, currentPage } = useContext(dataContext)

  if (!user) {
    return (
      <>
        <Login />
        <ToastContainer />
      </>
    )
  }

  // Only block non-admins from accessing admin page
  let activePage = currentPage
  if (user.role !== 'admin' && activePage === 'admin') activePage = 'home'

  return (
    <div>
      {activePage === 'home' && <Home />}
      {activePage === 'profile' && <Profile />}
      {activePage === 'admin' && <AdminDashboard />}
      <ToastContainer />
    </div>
  )
}

export default App
