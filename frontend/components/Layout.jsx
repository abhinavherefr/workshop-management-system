import React, { useState } from 'react'
import DashboardNav from './DashboardNav'
import Sidebar from './Sidebar'
import { Outlet } from 'react-router-dom'
import { AnimatePresence, motion } from "framer-motion"

const Layout = () => {

    const [showSidebar, setShowSidebar] = useState(false)

    return (
        <div className="min-h-screen flex bg-[#0f1117] text-white">

            {/* SIDEBAR */}
            <Sidebar showSidebar={showSidebar} setShowSidebar={setShowSidebar} />

            <AnimatePresence>
                {showSidebar && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/50 z-40 md:hidden"
                        onClick={() => setShowSidebar(false)}
                    />
                )}
            </AnimatePresence>

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
