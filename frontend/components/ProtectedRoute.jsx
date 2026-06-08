import { useContext } from 'react'
import { AuthContext } from '../src/context/AuthContext'
import { Navigate, useLocation } from 'react-router-dom'

const ProtectedRoute = (props) => {

    const { children } = props;
    const { token } = useContext(AuthContext)
    const location = useLocation()

    return (
        !token ? <Navigate to="/login" replace state={{ from: location }} />
            : children
    )
}

export default ProtectedRoute
