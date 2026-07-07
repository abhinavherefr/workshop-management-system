import { Route, Routes } from 'react-router-dom'
import Login from '../pages/Login.jsx'
import Home from '../pages/Home.jsx'
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from '../components/ProtectedRoute.jsx'
import AddVehicle from '../pages/AddVehicle.jsx'
import Vehicles from '../pages/Vehicles.jsx';
import Layout from '../components/Layout.jsx';
import VehicleHistory from '../pages/VehicleHistory.jsx';
import VehicleDetails from '../pages/VehicleDetails.jsx';
import Mechanics from '../pages/Mechanics.jsx';
import EditVehicle from '../pages/EditVehicle.jsx';
import ManageUsers from '../pages/ManageUsers.jsx';



const App = () => {

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10">
        
      </div>

      <ToastContainer />

      <Routes>
        <Route path='/login' element={<Login />} />

        <Route element={<Layout />}>

          <Route path='/' element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />

          <Route path='/add' element={
            <ProtectedRoute>
              <AddVehicle />
            </ProtectedRoute>
          } />

          <Route path='/all' element={
            <ProtectedRoute>
              <Vehicles />
            </ProtectedRoute>
          }></Route>

          <Route path='/history' element={
            <ProtectedRoute>
              <VehicleHistory />
            </ProtectedRoute>
          }
          ></Route>
          <Route path='/vehicle/:id' element={
            <ProtectedRoute>
              <VehicleDetails />
            </ProtectedRoute>
          }>
          </Route>
          <Route path='/mechanic' element={
            <ProtectedRoute>
              <Mechanics />
            </ProtectedRoute>
          }>
          </Route>
          <Route path='/edit/:id' element={
            <ProtectedRoute>
              <EditVehicle />
            </ProtectedRoute>
          }>
          </Route>
          <Route path='/users' element={
            <ProtectedRoute>
              <ManageUsers />
            </ProtectedRoute>
          }>
          </Route>
        </Route>
        <Route path='*' element={
          <div className='min-h-screen bg-[#0f1117] text-white flex items-center justify-center text-2xl'>
            404 - Page not found
          </div>
        }></Route>
      </Routes>
    </div>
  )
}

export default App