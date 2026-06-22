import React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router'


const SlotBoard = ({ vehicles }) => {

    // console.log(vehicles)
    const navigate = useNavigate()
    const getVehicleBySlot = (slot) => {
        return vehicles.find(v => v.slotNumber === slot)
    }

    return (

        <div className="p-6 flex flex-col">
            <div className="mb-10 grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-3 sm:flex sm:gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-full bg-gray-600 hover:bg-gray-500 text-white flex items-center justify-center cursor-pointer transition shrink-0"
                >
                    ←
                </button>

                <div className="flex items-center gap-2 justify-center sm:flex-1">
                    <h1 className="text-2xl sm:text-3xl font-bold">
                        Workshop Slots
                    </h1>
                    <div className="bg-white h-[2px] w-10"></div>
                </div>

                <div className="sm:hidden"></div>
            </div>
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 md:gap-20 gap-15 mb-20'>


                {[...Array(10)].map((_, i) => {
                    const slotNumber = i + 1;
                    const vehicle = getVehicleBySlot(slotNumber)

                    return (
                        <div key={slotNumber} className={`text-xs sm:text-sm hover:scale-[1.02] transition duration-200 lg:text-lg p-6  flex flex-col items-center lg:p-8 justify-center ${vehicle ? "border border-red-600/60 border-b-0" : "border border-b-0 border-green-400/40"}`}>
                            <p className='underline'>Slot {slotNumber}</p>

                            {vehicle ? (
                                <div className="mt-2 text-center space-y-1 break-words">
                                    {/* Occupied ui */}
                                    <p className='text-xl'>{vehicle.ownerName}</p>
                                    <p className='text-gray-400'>{vehicle.vehicleNumber}</p>
                                    <p className='text-gray-400'>{vehicle.phone}</p>
                                </div>
                            ) :
                                (
                                    <div className="text-green-400 opacity-70 mt-2">
                                        <h2>Available</h2>
                                    </div>
                                )
                            }

                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default SlotBoard