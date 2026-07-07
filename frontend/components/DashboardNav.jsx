import React, { useContext } from 'react'
import { AuthContext } from '../src/context/AuthContext'
import { Link, useNavigate } from 'react-router-dom';

const DashboardNav = ({ setShowSidebar }) => {

    const navigate = useNavigate()
    const { setToken } = useContext(AuthContext);

    return (
        <div className="sticky top-0 z-30 bg-[#0a0d12]/80 backdrop-blur-md border-b border-white/5">
            <div className="flex justify-between items-center px-4 sm:px-6 py-3.5">

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowSidebar(prev => !prev)}
                        className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center cursor-pointer transition-all duration-200 shrink-0"
                    >
                        <img src="/menu-bar.png" width={16} className='invert opacity-80' alt="menu" />
                    </button>

                    <div className="flex items-center gap-3">
                        <div>
                            <Link to="/">
                                <h1 className='text-base sm:text-lg font-bold text-white leading-tight'>
                                    Workshop Dashboard
                                </h1>
                            </Link>
                            <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
                                Manage vehicles and workshop activity
                            </p>
                        </div>
                        {/* <span className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full ml-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)] animate-pulse"></span>
                            Live
                        </span> */}
                    </div>
                </div>

                <button
                    className='group cursor-pointer text-gray-300 hover:text-white px-4 py-2.5 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 rounded-xl text-sm font-medium flex items-center gap-2 transition-all duration-200'
                    onClick={() => {
                        setToken(null)
                        localStorage.removeItem("token")
                        navigate("/login")
                    }}
                >
                    <svg className="w-4 h-4 group-hover:text-red-400 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="group-hover:text-red-400 transition-colors duration-200 hidden sm:inline">Log out</span>
                </button>

            </div>
        </div>
    )
}

export default DashboardNav