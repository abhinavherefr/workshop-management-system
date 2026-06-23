import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../src/context/AuthContext'
import { toast } from 'react-toastify';
import axios from "axios"
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion"

const Home = () => {

  const { backendurl, token } = useContext(AuthContext)
  const [vehicles, setVehicles] = useState([])
  const [activeFilter, setActiveFilter] = useState("Pending")
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${backendurl}/api/vehicle/all`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        if (response.data.success) {
          setVehicles(response.data.vehicles)
        }
      } catch (error) {
        toast.error(error.message)
      } finally {
        setLoading(false)
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

  const cards = [
    {
      key: "Pending",
      label: "Pending Vehicles",
      sub: "Needs attention",
      count: pendingVehicles,
      color: "red",
    },
    {
      key: "In Progress",
      label: "In Progress",
      sub: "Work ongoing",
      count: inProgressVehicles,
      color: "yellow",
    },
    {
      key: "Completed",
      label: "Completed",
      sub: "Finished job",
      count: completedVehicles,
      color: "green",
    },
    {
      key: "All",
      label: "Total Vehicles",
      sub: "Workshop records",
      count: vehicles.length,
      color: "blue",
    },
  ]

  const colorMap = {
    red: {
      border: "border-red-400/30 hover:border-red-400/60",
      activeBorder: "border-red-400 shadow-red-400/20",
      dot: "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]",
      text: "text-red-400",
    },
    yellow: {
      border: "border-yellow-400/30 hover:border-yellow-400/60",
      activeBorder: "border-yellow-400 shadow-yellow-400/20",
      dot: "bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]",
      text: "text-yellow-400",
    },
    green: {
      border: "border-green-400/30 hover:border-green-400/60",
      activeBorder: "border-green-400 shadow-green-400/20",
      dot: "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]",
      text: "text-green-400",
    },
    blue: {
      border: "border-blue-400/30 hover:border-blue-400/60",
      activeBorder: "border-blue-400 shadow-blue-400/20",
      dot: "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]",
      text: "text-blue-400",
    },
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className='min-h-screen bg-[#0a0d12] text-white'
    >
      <div className="p-6 sm:p-10 flex flex-col">

        <div className="mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
            <div className="bg-gradient-to-r from-blue-500 to-transparent h-[2px] w-12 hidden sm:block"></div>
          </div>
          <p className="text-gray-500 text-sm mt-1">Workshop overview at a glance</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">

          {/* LEFT SIDE - CARDS */}
          <div className="md:w-1/3 grid grid-cols-2 md:grid-cols-1 gap-4 md:self-start">

            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="bg-[#11151c] border border-white/5 rounded-2xl p-6 h-[120px] animate-pulse" />
              ))
            ) : (
              cards.map((card) => {
                const c = colorMap[card.color]
                const isActive = activeFilter === card.key

                return (
                  <motion.div
                    key={card.key}
                    onClick={() => setActiveFilter(card.key)}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    className={`relative bg-[#11151c] cursor-pointer p-6 rounded-2xl border transition-all duration-200
                      ${isActive ? `${c.activeBorder} shadow-lg` : c.border}`}
                  >
                    <span className={`absolute top-4 right-4 w-2 h-2 rounded-full ${c.dot}`}></span>

                    <h2 className='text-gray-500 text-xs uppercase tracking-wider'>{card.label}</h2>
                    <p className='text-3xl font-bold mt-3'>{card.count}</p>
                    <p className={`text-sm mt-2 ${isActive ? c.text : "text-gray-500"}`}>{card.sub}</p>
                  </motion.div>
                )
              })
            )}

          </div>

          {/* RIGHT SIDE - LIST */}
          <div className="md:w-2/3 bg-[#11151c] border border-white/5 rounded-2xl p-6">

            <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
              {activeFilter} Vehicles
              <span className="text-xs font-normal text-gray-500 bg-white/5 px-2 py-0.5 rounded-md">
                {filteredVehicles.length}
              </span>
            </h2>

            <div className="space-y-2">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="h-11 bg-[#0a0d12] rounded-xl animate-pulse" />
                ))
              ) : filteredVehicles.length === 0 ? (
                <div className="border border-dashed border-white/10 rounded-xl py-10 text-center">
                  <p className="text-gray-500 text-sm">
                    No {activeFilter.toLowerCase()} vehicles
                  </p>
                </div>
              ) : (
                filteredVehicles.map(item => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ x: 4 }}
                    className="flex justify-between items-center bg-[#0a0d12] border border-white/5 hover:border-white/15 px-4 py-3 text-sm rounded-xl cursor-pointer transition-colors duration-150"
                    onClick={() => navigate(`/vehicle/${item._id}`)}
                  >
                    <span className="font-mono tracking-wide text-white">{item.vehicleNumber}</span>
                    <span className="text-gray-400">{item.ownerName}</span>
                  </motion.div>
                ))
              )}
            </div>

          </div>

        </div>
      </div>
    </motion.div>
  )
}

export default Home