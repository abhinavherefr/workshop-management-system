import React from 'react'
import { NavLink } from 'react-router-dom'

const Sidebar = () => {

    const linkStyle = ({ isActive }) => 
        `flex items-center gap-3 px-4 py-3 rounded-xl transition ${isActive ? "bg-[#2a3142] text-white" : "text-gray-400 hover:bg-[#232a3a] hover: text-white"}`

    return (
        <div className='w-64 min-h-screen bg-[#1a1f2b] p-5 border-r border-[#2a3142]'>

            {/* <h2 className="text-gray-400 text-sm mb-6 tracking-wider">
                MENU
            </h2> */}

            <ul className='flex flex-col gap-2 text-lg'>
                <li><NavLink to="/" className={linkStyle}>Home</NavLink></li>
                <li><NavLink to="/add" className={linkStyle}>Add Vehicles</NavLink></li>
                <li><NavLink to="/all" className={linkStyle}>All Vehicles</NavLink></li>
                <li><NavLink to="/history" className={linkStyle}>Vehicle History</NavLink></li>
            </ul>
        </div>
    )
}

export default Sidebar