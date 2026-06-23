import { useContext } from 'react'
import { NavLink } from 'react-router-dom'
import { AuthContext } from '../src/context/AuthContext'

const navItems = [
    { to: "/", label: "Home", icon: "🏠" },
    { to: "/add", label: "Add Vehicle", icon: "➕" },
    { to: "/all", label: "All Vehicles", icon: "🚗" },
    { to: "/history", label: "Vehicle History", icon: "🕒" },
    { to: "/mechanic", label: "Mechanic Dashboard", icon: "🔧" },
]

const Sidebar = ({ showSidebar, setShowSidebar }) => {

    const linkStyle = ({ isActive }) =>
        `relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
            isActive
                ? "bg-white/10 text-white"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
        }`

    return (
        <>
            {/* Backdrop overlay */}
            <div
                onClick={() => setShowSidebar(false)}
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
                    showSidebar ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
            />

            {/* Sidebar panel */}
            <div className={`fixed top-0 left-0 h-full w-64 bg-[#0d1117] pt-6 px-4 border-r border-white/5 transition-transform duration-300 z-50 flex flex-col ${
                showSidebar ? "translate-x-0" : "-translate-x-full"
            }`}>

                <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4 px-2">
                    <h2 className="text-gray-500 text-xs font-semibold tracking-widest">
                        MENU
                    </h2>

                    <button
                        onClick={() => setShowSidebar(false)}
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center cursor-pointer transition-all duration-200"
                    >
                        <img src="/close.png" className='w-3 invert opacity-80' alt="close" />
                    </button>
                </div>

                <ul className='flex flex-col gap-1.5'>
                    {navItems.map((item) => (
                        <li key={item.to}>
                            <NavLink
                                onClick={() => setShowSidebar(false)}
                                to={item.to}
                                className={linkStyle}
                            >
                                {({ isActive }) => (
                                    <>
                                        {isActive && (
                                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-500 rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.6)]"></span>
                                        )}
                                        <span className="text-base">{item.icon}</span>
                                        {item.label}
                                    </>
                                )}
                            </NavLink>
                        </li>
                    ))}
                </ul>

                <div className="mt-auto mb-6 px-2 pt-4 border-t border-white/5">
                    <p className="text-[11px] text-gray-600">Workshop Management System</p>
                </div>
            </div>
        </>
    )
}

export default Sidebar