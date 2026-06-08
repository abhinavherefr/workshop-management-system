import { act, use, useContext, useEffect, useState } from 'react'
import { AuthContext } from '../src/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import DashboardNav from '../components/DashboardNav';
import { toast } from 'react-toastify';
import axios from "axios"

const Home = () => {

  const navigate = useNavigate();
  const { setToken, backendurl, token } = useContext(AuthContext)
  const [vehicles, setVehicles] = useState([])
  const [activeFilter, setActiveFilter] = useState("Pending")

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await axios.get(`${backendurl}/api/vehicle/all`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
        )
        if (response.data.success) {
          setVehicles(response.data.vehicles)
        }
      } catch (error) {
        toast.error(error.message)
      }
    }
    fetchVehicles()
  }, [token, backendurl])

  const pendingVehicles = vehicles.filter(item => item.status === "Pending").length
  const inProgressVehicles = vehicles.filter(item => item.status === "In Progress").length
  const completedVehicles = vehicles.filter(item => item.status === "Completed").length

  const filteredVehicles = vehicles.filter(item => {
    if (!activeFilter) return false;
    return item.status === activeFilter
  })

  console.log(vehicles)


  return (
    <div className="min-h-screen bg-[#0f1117] text-white">

      <div className="p-4 flex flex-col lg:flex-row gap-6">

        {/* LEFT SIDE - CARDS */}
        <div className="lg:w-1/3 grid grid-cols-1 gap-6">

          <div
            onClick={() => setActiveFilter("Pending")}
            className="bg-[#1a1f2b] cursor-pointer p-6 rounded-2xl border border-red-400 hover:scale-105 transition"
          >
            <h2 className='text-gray-400 text-sm'>Pending vehicles</h2>
            <p className='text-3xl font-bold mt-3'>{pendingVehicles}</p>
            <p className='text-sm text-gray-400 mt-3'>Needs attention</p>
          </div>

          <div
            onClick={() => setActiveFilter("In Progress")}
            className="bg-[#1a1f2b] cursor-pointer p-6 rounded-2xl border border-yellow-400 hover:scale-105 transition"
          >
            <h2 className='text-gray-400 text-sm'>In Progress</h2>
            <p className='text-3xl font-bold mt-3'>{inProgressVehicles}</p>
            <p className='text-sm text-gray-400 mt-3'>Work ongoing</p>
          </div>

          <div
            onClick={() => setActiveFilter("Completed")}
            className="bg-[#1a1f2b] cursor-pointer p-6 rounded-2xl border border-green-400 hover:scale-105 transition"
          >
            <h2 className='text-gray-400 text-sm'>Completed</h2>
            <p className='text-3xl font-bold mt-3'>{completedVehicles}</p>
            <p className='text-sm text-gray-400 mt-3'>Finished job</p>
          </div>

        </div>

        {/* RIGHT SIDE - LIST */}
        <div className="lg:w-2/3 bg-[#1a1f2b] rounded-2xl p-6">

          {!activeFilter ? (
            <p className="text-gray-400"></p>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-4">
                {activeFilter} Vehicles
              </h2>

              <div className="space-y-3">
                {filteredVehicles.map(item => (
                  <div
                    key={item._id}
                    className="flex justify-between bg-[#0f1117] p-2 text-sm rounded-xl"
                  >
                    <span>{item.vehicleNumber}</span>
                    <span className="text-gray-400">{item.ownerName}</span>
                  </div>
                ))}
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  )
}


export default Home
