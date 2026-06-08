import { createContext, useMemo, useState } from "react"

export const AuthContext = createContext()

const AuthContextProvider = (props) => {

    const [token, setToken] = useState(() => localStorage.getItem("token"))

    const backendurl = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "")
    const value = useMemo(() => ({ //Use memo ensures unnecessary re-rendeing
        token,
        setToken,
        backendurl
    }), [backendurl, token])
    
    
    return (
        <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
    )

}

export default AuthContextProvider;
