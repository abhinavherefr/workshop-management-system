import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../src/context/AuthContext'
import { toast } from 'react-toastify';
import axios from "axios"
import { useNavigate } from 'react-router';

const Home = () => {

  const { backendurl, token } = useContext(AuthContext)
  const [vehicles, setVehicles] = useState([])
  const [activeFilter, setActiveFilter] = useState("Pending")
  const navigate = useNavigate()

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

    if (activeFilter === "All") return true;
    return item.status === activeFilter

  })

  // console.log(vehicles)


  return (
    <div className="min-h-screen bg-[#0f1117] text-white">

      <div className="p-4 flex flex-col md:flex-row gap-6">

        {/* LEFT SIDE - CARDS */}
        <div className="md:w-1/3 grid grid-cols-2 md:grid-cols-1 gap-4 md:self-start">

          <div
            onClick={() => setActiveFilter("Pending")}
            className={`bg-[#1a1f2b] cursor-pointer p-6 rounded-2xl border border-red-400 hover:scale-105 ${activeFilter === "Pending" ? "border-red-400 ring-red-400/40" : "border-red-400/40"}`}
          >
            <h2 className='text-gray-400 text-sm'>Pending vehicles</h2>
            <p className='text-3xl font-bold mt-3'>{pendingVehicles}</p>
            <p className='text-sm text-gray-400 mt-3'>Needs attention</p>
          </div>

          <div
            onClick={() => setActiveFilter("In Progress")}
            className={`bg-[#1a1f2b] cursor-pointer p-6 rounded-2xl border border-red-400 hover:scale-105 ${activeFilter === "In Progress" ? "border-yellow-400 ring-yellow-400/40" : "border-yellow-400/40"}`}
          >
            <h2 className='text-gray-400 text-sm'>In Progress</h2>
            <p className='text-3xl font-bold mt-3'>{inProgressVehicles}</p>
            <p className='text-sm text-gray-400 mt-3'>Work ongoing</p>
          </div>

          <div
            onClick={() => setActiveFilter("Completed")}
            className={`bg-[#1a1f2b] cursor-pointer p-6 rounded-2xl border border-green-400 hover:scale-105 ${activeFilter === "Completed" ? "border-green-400 ring-green-400/40" : "border-green-400/40"}`}green
          >
            <h2 className='text-gray-400 text-sm'>Completed</h2>
            <p className='text-3xl font-bold mt-3'>{completedVehicles}</p>
            <p className='text-sm text-gray-400 mt-3'>Finished job</p>
          </div>

          <div
            className={`bg-[#1a1f2b] cursor-pointer p-6 rounded-2xl border border-blue-400 hover:scale-105 ${activeFilter === "All" ? "border-blue-400 ring-blue-400/40" : "border-blue-400/40"}`}blue
            onClick={() => setActiveFilter("All")}
          >
            <h2 className='text-gray-400 text-sm'>Total Vehicles</h2>
            <p className='text-3xl font-bold mt-3'>{vehicles.length}</p>
            <p className='text-sm text-gray-400 mt-3'>Workshop records</p>
          </div>

        </div>

        {/* RIGHT SIDE - LIST */}
        <div className="md:w-2/3 bg-[#1a1f2b] rounded-2xl p-6">

          {!activeFilter ? (
            <p className="text-gray-400"></p>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-4">
                {activeFilter} Vehicles
              </h2>

              <div className="space-y-3">
                {filteredVehicles.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center mt-8">
                    No {activeFilter} vehicles
                  </p>
                ) : (
                  filteredVehicles.map(item => (
                    <div
                      key={item._id}
                      className="flex justify-between bg-[#0f1117] p-2 text-sm rounded-xl cursor-pointer"
                      onClick={() => navigate(`/vehicle/${item._id}`)}
                    >
                      <span>{item.vehicleNumber}</span>
                      <span className="text-gray-400">{item.ownerName}</span>
                    </div>
                  ))

                )
                }
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  )
}


export default Home
