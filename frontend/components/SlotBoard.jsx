import React from 'react'
import { useNavigate } from 'react-router'

const SlotBoard = ({ vehicles }) => {

    const navigate = useNavigate()
    const getVehicleBySlot = (slot) => {
        return vehicles.find(v => v.slotNumber === slot)
    }

    return (
        <div className="p-6 sm:p-10 flex flex-col min-h-screen bg-[#0a0d12]">
            {/* Header */}
            <div className="mb-12 grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-3 sm:flex sm:gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white flex items-center justify-center cursor-pointer transition-all duration-200 shrink-0"
                >
                    ←
                </button>

                <div className="flex items-center gap-3 justify-center sm:flex-1">
                    <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
                        Workshop Slots
                    </h1>
                    <div className="bg-gradient-to-r from-blue-500 to-transparent h-[2px] w-12 hidden sm:block"></div>
                </div>

                <div className="sm:hidden"></div>
            </div>

            {/* Legend */}
            <div className="flex gap-6 justify-center mb-10 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></span>
                    <span className="text-gray-400">Available</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
                    <span className="text-gray-400">Occupied</span>
                </div>
            </div>

            {/* Grid */}
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5 md:gap-6 mb-20'>
                {[...Array(10)].map((_, i) => {
                    const slotNumber = i + 1;
                    const vehicle = getVehicleBySlot(slotNumber)
                    const occupied = Boolean(vehicle)

                    return (
                        <div
                            key={slotNumber}
                            className={`relative min-h-[170px] rounded-2xl p-5 lg:p-6 flex flex-col items-center justify-center text-center backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl
                                ${occupied
                                    ? "bg-red-500/[0.06] border border-red-500/30 hover:border-red-500/50 hover:shadow-red-500/10"
                                    : "bg-emerald-500/[0.06] border border-emerald-400/30 hover:border-emerald-400/50 hover:shadow-emerald-400/10"
                                }`}
                        >
                            {/* Status dot top-right */}
                            <span className={`absolute top-3 right-3 w-2 h-2 rounded-full ${
                                occupied
                                    ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]"
                                    : "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)] animate-pulse"
                            }`}></span>

                            <p className='text-[11px] sm:text-xs uppercase tracking-widest text-gray-500 font-medium mb-1'>
                                Slot {String(slotNumber).padStart(2, '0')}
                            </p>

                            {occupied ? (
                                <div className="mt-2 space-y-1.5 break-words">
                                    <p className='text-base sm:text-lg font-semibold text-white leading-tight'>
                                        {vehicle.ownerName}
                                    </p>
                                    <p className='text-gray-400 text-xs sm:text-sm font-mono tracking-wide'>
                                        {vehicle.vehicleNumber}
                                    </p>
                                    <p className='text-gray-500 text-xs sm:text-sm'>
                                        {vehicle.phone}
                                    </p>
                                </div>
                            ) : (
                                <div className="mt-3 mb-1">
                                    <h2 className="text-emerald-400/90 font-semibold text-sm sm:text-base tracking-wide">
                                        Available
                                    </h2>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default SlotBoard