import React, { useState } from 'react'
import DashboardNav from './DashboardNav'
import Sidebar from './Sidebar'
import { Outlet } from 'react-router-dom'

const Layout = () => {

    const [showSidebar, setShowSidebar] = useState(false)

    return (
        <div className="min-h-screen flex bg-[#0f1117] text-white">

            {/* SIDEBAR */}
            {showSidebar && <Sidebar />}

            {/* MAIN AREA */}
            <div className="flex-1 flex flex-col">

                {/* NAVBAR INSIDE MAIN AREA */}
                <DashboardNav setShowSidebar={setShowSidebar} />

                {/* PAGE CONTENT */}
                <div className="flex-1 p-4">
                    <Outlet />
                </div>

            </div>

        </div>
    )
}

export default Layout