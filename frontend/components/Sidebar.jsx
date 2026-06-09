import { NavLink } from 'react-router-dom'

const Sidebar = ({ showSidebar, setShowSidebar }) => {


    const linkStyle = ({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl transition ${isActive ? "bg-[#2a3142] text-white" : "text-gray-400 hover:bg-[#232a3a] hover:text-white"}`


    return (
        <div className={`fixed top-0 left-0 h-full w-64 bg-[#1a1f2b] pt-8 px-4 border-r border-[#2a3142] transition-transform duration-300 z-50 ${showSidebar ? "translate-x-0" : "-translate-x-full"}`}>

            <div className="flex items-center justify-between mb-6 border-b border-[#2a3142] pb-4">
                <h2 className="text-gray-500 text-sm tracking-widest ml-2">
                    MENU
                </h2>

                <img src="/close.png" onClick={() => { setShowSidebar(false) }} className='hover:scale-110 w-3 invert mb-6 cursor-pointer transition' alt="" />
            </div>


            <ul className='flex flex-col gap-3 text-lg mt-2'>
                <li><NavLink onClick={() => setShowSidebar(false)} to="/" className={linkStyle}>Home</NavLink></li>
                <li><NavLink onClick={() => setShowSidebar(false)} to="/add" className={linkStyle}>Add Vehicles</NavLink></li>
                <li><NavLink onClick={() => setShowSidebar(false)} to="/all" className={linkStyle}>All Vehicles</NavLink></li>
                <li><NavLink onClick={() => setShowSidebar(false)} to="/history" className={linkStyle}>Vehicle History</NavLink></li>
            </ul>
        </div>
    )
}

export default Sidebar