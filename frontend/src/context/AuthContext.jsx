import { createContext, useMemo, useState } from "react"
import { jwtDecode } from "jwt-decode"

export const AuthContext = createContext()

const AuthContextProvider = (props) => {

    const [token, setToken] = useState(() => localStorage.getItem("token"))

    const backendurl = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "")

    const role = token ? jwtDecode(token).role : null;

    const value = useMemo(() => ({ //Use memo ensures unnecessary re-rendeing
        token,
        setToken,
        backendurl,
        role
    }), [backendurl, token])
    
    
    return (
        <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
    )

}

export default AuthContextProvider;
