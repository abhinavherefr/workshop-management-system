import React, { useContext, useState } from 'react'
import { AuthContext } from '../src/context/AuthContext'
import { useNavigate } from 'react-router-dom';

const DashboardNav = ({ setShowSidebar }) => {

    const navigate = useNavigate()
    const { setToken } = useContext(AuthContext);

    return (
        <div className="bg-[#0f1117] text-gray-300">
            <div className="flex justify-between items-center p-4 mb-10">
                <div className="flex items-center justify-center gap-5">
                    <img src="/menu-bar.png" width={20} onClick={() => { setShowSidebar(prev => !prev) }} className='invert cursor-pointer' alt="" />
                    <div className="">
                        <h1 className='text-lg font-bold'>Workshop Dashboard</h1>
                        <p className=" text-gray-500 text-lg mt-1">Manage vehicles and workshop activity</p>
                    </div>
                </div>
                <div
                    className='cursor-pointer text-white px-3 py-3 w-32 bg-red-500 hover:bg-red-600 rounded-3xl text-sm flex justify-center hover:scale-105 transition'
                    onClick={() => {
                        setToken(null)
                        localStorage.removeItem("token")
                        navigate("/login")
                    }}
                >
                    <button className=''>Log out</button>
                </div>
            </div>
        </div>
    )
}

export default DashboardNav