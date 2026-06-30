import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../src/context/AuthContext'
import { toast } from 'react-toastify';
import axios from "axios"
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

const AnimatedNumber = ({ value, prefix = "" }) => {
  const motionVal = useMotionValue(0)
  const spring = useSpring(motionVal, { damping: 25, stiffness: 90 })
  const rounded = useTransform(spring, (v) => `${prefix}${Math.round(v).toLocaleString("en-IN")}`)

  useEffect(() => {
    motionVal.set(value)
  }, [value])

  return <motion.span>{rounded}</motion.span>
}

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
          headers: { Authorization: `Bearer ${token}` }
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

  const totalRevenue = vehicles.reduce((sum, v) => sum + (v.totalCost || 0), 0)
  const completedRevenue = vehicles
    .filter(v => v.status === "Completed")
    .reduce((sum, v) => sum + (v.totalCost || 0), 0)

  const averageRevenue = completedVehicles === 0 ? 0 : Math.round(completedRevenue / completedVehicles)
  const revenueProgress = totalRevenue === 0 ? 0 : Math.min(100, Math.round((completedRevenue / totalRevenue) * 100))

  const filteredVehicles = vehicles.filter(item => {
    if (activeFilter === "All") return true;
    return item.status === activeFilter
  })

  // Service type breakdown (Basic / Full / Engine / Electrical) — varies in practice, unlike vehicle type
  const serviceCounts = vehicles.reduce((acc, v) => {
    const type = v.serviceType || "Other"
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {})

  const chartData = Object.entries(serviceCounts).map(([name, value]) => ({ name, value }))

  const COLORS = ["#3b82f6", "#a855f7", "#f97316", "#ef4444"]

  const cards = [
    { key: "Pending", label: "Pending vehicles", sub: "Needs attention", count: pendingVehicles, color: "red" },
    { key: "In Progress", label: "In progress", sub: "Work ongoing", count: inProgressVehicles, color: "yellow" },
    { key: "Completed", label: "Completed", sub: "Finished job", count: completedVehicles, color: "green" },
    { key: "All", label: "Total vehicles", sub: "Workshop records", count: vehicles.length, color: "blue" },
  ]

  const colorMap = {
    red: { ring: "shadow-[0_0_0_1px_rgba(248,113,113,0.5)]", glow: "shadow-[0_0_30px_-5px_rgba(248,113,113,0.4)]", dot: "bg-red-400", text: "text-red-400", bg: "bg-red-400/10" },
    yellow: { ring: "shadow-[0_0_0_1px_rgba(250,204,21,0.5)]", glow: "shadow-[0_0_30px_-5px_rgba(250,204,21,0.4)]", dot: "bg-yellow-400", text: "text-yellow-400", bg: "bg-yellow-400/10" },
    green: { ring: "shadow-[0_0_0_1px_rgba(74,222,128,0.5)]", glow: "shadow-[0_0_30px_-5px_rgba(74,222,128,0.4)]", dot: "bg-green-400", text: "text-green-400", bg: "bg-green-400/10" },
    blue: { ring: "shadow-[0_0_0_1px_rgba(96,165,250,0.5)]", glow: "shadow-[0_0_30px_-5px_rgba(96,165,250,0.4)]", dot: "bg-blue-400", text: "text-blue-400", bg: "bg-blue-400/10" },
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className='min-h-screen bg-[#0a0d12] text-white relative overflow-hidden'
    >
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/[0.07] rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-green-500/[0.05] rounded-full blur-[120px] pointer-events-none"></div>

      <div className="p-6 sm:p-10 flex flex-col relative z-10">

        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl tracking-tight">Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Workshop overview at a glance</p>
          </div>
        </div>

        {/* Revenue hero row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <motion.div
            whileHover={{ y: -3 }}
            className="relative bg-[#11151c] border border-white/5 p-5 rounded-2xl overflow-hidden"
          >
            <div className="absolute -right-6 -top-6 w-28 h-28 bg-green-500/10 rounded-full blur-2xl"></div>
            <p className="text-gray-500 text-xs tracking-widest uppercase relative z-10">Total revenue</p>
            <h2 className="text-3xl text-green-400 mt-2 relative z-10">
              <AnimatedNumber value={totalRevenue} prefix="₹" />
            </h2>
            <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden relative z-10">
              <motion.div
                className="h-full bg-green-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${revenueProgress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <p className="text-gray-600 text-xs mt-2 relative z-10">{revenueProgress}% collected</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="relative bg-[#11151c] border border-white/5 p-5 rounded-2xl overflow-hidden"
          >
            <div className="absolute -right-6 -top-6 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl"></div>
            <p className="text-gray-500 text-xs tracking-widest uppercase relative z-10">Completed revenue</p>
            <h2 className="text-3xl text-blue-400 mt-2 relative z-10">
              <AnimatedNumber value={completedRevenue} prefix="₹" />
            </h2>
            <p className="text-gray-600 text-xs mt-2 relative z-10">{completedVehicles} jobs closed</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="relative bg-[#11151c] border border-white/5 p-5 rounded-2xl overflow-hidden"
          >
            <div className="absolute -right-6 -top-6 w-28 h-28 bg-yellow-500/10 rounded-full blur-2xl"></div>
            <p className="text-gray-500 text-xs tracking-widest uppercase relative z-10">Average job value</p>
            <h2 className="text-3xl text-yellow-400 mt-2 relative z-10">
              <AnimatedNumber value={averageRevenue} prefix="₹" />
            </h2>
            <p className="text-gray-600 text-xs mt-2 relative z-10">per completed job</p>
          </motion.div>
        </div>

        {/* Service type distribution */}
        <div className="bg-[#11151c] border border-white/5 rounded-2xl p-6 mb-6">
          <h2 className="text-base text-gray-300 mb-1 tracking-wide">
            Service type distribution
          </h2>
          <p className="text-gray-600 text-xs mb-4">
            Breakdown of all {vehicles.length} vehicles by service type
          </p>

          {vehicles.length === 0 ? (
            <div className="border border-dashed border-white/10 rounded-xl py-10 text-center ">
              <p className="text-gray-500 text-sm focus:outline-none">No data yet</p>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center gap-6 focus:outline-none">
              <div className="h-64 w-full md:w-1/2 relative focus:outline-none">
                <ResponsiveContainer width="100%" height="100%" className='focus:outline-none'>
                  <PieChart>
                    <Pie
                      className='focus:outline-none'
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={62}
                      outerRadius={90}
                      paddingAngle={2}
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "#0a0d12",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "10px",
                        fontSize: "13px",
                        color: "#e5e7eb",
                        padding: "8px 12px",
                      }}
                      itemStyle={{ color: "#e5e7eb" }}
                      labelStyle={{ color: "#9ca3af" }}
                      cursor={false}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-2xl text-white">{vehicles.length}</p>
                  <p className="text-gray-500 text-xs">total</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 w-full md:w-1/2">
                {chartData.map((entry, index) => {
                  const percentage = vehicles.length === 0 ? 0 : Math.round((entry.value / vehicles.length) * 100)
                  return (
                    <div key={entry.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></span>
                        <span className="text-gray-400">{entry.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-200">{entry.value}</span>
                        <span className="text-gray-600 text-xs w-10 text-right">{percentage}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-6">

          {/* LEFT SIDE - CARDS */}
          <div className="md:w-1/3 grid grid-cols-2 md:grid-cols-1 gap-4 md:self-start">

            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="bg-[#11151c] border border-white/5 rounded-2xl p-6 h-[120px] animate-pulse" />
              ))
            ) : (
              cards.map((card, idx) => {
                const c = colorMap[card.color]
                const isActive = activeFilter === card.key

                return (
                  <motion.div
                    key={card.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setActiveFilter(card.key)}
                    whileHover={{ y: -4, scale: 1.01 }}
                    whileTap={{ scale: 0.97 }}
                    className={`relative bg-[#11151c] cursor-pointer p-6 rounded-2xl border border-white/5 transition-shadow duration-300 ${isActive ? `${c.ring} ${c.glow}` : ""}`}
                  >
                    <div className="flex items-center justify-between relative z-10">
                      <h2 className='text-gray-500 text-xs tracking-widest uppercase'>{card.label}</h2>
                      <span className={`w-2 h-2 rounded-full ${c.dot} ${isActive ? "shadow-[0_0_8px] " + c.dot.replace('bg-', 'shadow-') : ""}`}></span>
                    </div>
                    <p className='text-3xl mt-3 relative z-10'>
                      <AnimatedNumber value={card.count} />
                    </p>
                    <p className={`text-sm mt-2 relative z-10 ${isActive ? c.text : "text-gray-500"}`}>{card.sub}</p>

                    {isActive && (
                      <motion.div
                        layoutId="activeGlow"
                        className={`absolute inset-0 rounded-2xl ${c.bg} -z-0`}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </motion.div>
                )
              })
            )}

          </div>

          {/* RIGHT SIDE - LIST */}
          <div className="md:w-2/3 bg-[#11151c] border border-white/5 rounded-2xl p-6">

            <h2 className="text-base mb-5 flex items-center gap-2 tracking-wide">
              {activeFilter} vehicles
              <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-md">
                {filteredVehicles.length}
              </span>
            </h2>

            <div className="space-y-2">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="h-11 bg-[#0a0d12] rounded-xl animate-pulse" />
                ))
              ) : filteredVehicles.length === 0 ? (
                <div className="border border-dashed border-white/10 rounded-xl py-12 text-center">
                  <p className="text-gray-600 text-2xl mb-2">∅</p>
                  <p className="text-gray-500 text-sm">
                    No {activeFilter.toLowerCase()} vehicles
                  </p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredVehicles.map((item, idx) => (
                    <motion.div
                      key={item._id}
                      layout
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: Math.min(idx * 0.03, 0.2) }}
                      whileHover={{ x: 4 }}
                      className="flex justify-between items-center bg-[#0a0d12] border border-white/5 hover:border-white/15 px-4 py-3 text-sm rounded-xl cursor-pointer transition-colors duration-150"
                      onClick={() => navigate(`/vehicle/${item._id}`)}
                    >
                      <span className="font-mono tracking-wide text-gray-200">{item.vehicleNumber}</span>
                      <span className="text-gray-400">{item.ownerName}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

          </div>

        </div>
      </div>
    </motion.div>
  )
}

export default Home