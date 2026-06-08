import { useContext, useState } from 'react'
import axios from "axios"
import { useLocation, useNavigate } from 'react-router-dom'
import { AuthContext } from '../src/context/AuthContext'
import { toast } from "react-toastify"

const Login = () => {

    const { setToken, backendurl } = useContext(AuthContext)
    
    const navigate = useNavigate();
    const location = useLocation();
    const redirectTo = location.state?.from?.pathname || "/";


    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const [currentState, setCurrentState] = useState('Sign In')

    const submitHandler = async (e) => {
        e.preventDefault();

        try {
            if(currentState === 'Sign In'){
                const response = await axios.post(`${backendurl}/api/user/login`, {email, password})
                if(response.data.success){
                    toast.success("Signed in successfully")
                    localStorage.setItem('token', response.data.token);
                    setToken(response.data.token)
                    navigate(redirectTo, { replace: true })
                    setName('')
                    setEmail('')
                    setPassword('')
                    // console.log(t oken)
                }
                else{
                    toast.error(response.data.message)
                    // console.log(response.data.message)
                }
            }
            else{
                const response = await axios.post(`${backendurl}/api/user/register`, {name, email, password})
                if(response.data.success){
                    toast.success("Account created. Login now.")
                    setToken(response.data.token)
                    localStorage.setItem('token', response.data.token)
                    navigate(redirectTo, { replace: true })
                    console.log('user registered successfully with token: ', response.data.token)
                    setName('')
                    setEmail('')
                    setPassword('')
                    // setCurrentState('Sign In')
                }
                else{
                    toast.error(response.data.message)
                    console.log(response.data.message)
                }
            }
        } catch (error) {
            console.log(error.message)
            toast.error(error.response?.data?.message || "Unable to connect to the server")
        }
    }



    return (
        <form onSubmit={submitHandler} className="min-h-screen bg-[#0f1117] flex flex-col items-center justify-center">

            <div className="flex text-white items-center justify-cente mb-10">
                {currentState === 'Sign In' ? 'Sign In' : 'Sign up'}
            </div>
            
            <div className="w-[390px] ">
                {/* Card */}
                <div className="bg-[#1a1f2b] p-8 rounded-2xl">
                    <div className="flex flex-col gap-6 text-white text-sm">
                        {currentState === 'Sign up' && <input value={name} onChange={(e) => { setName(e.target.value) }} className='border border-gray-700 p-4 focus:outline-none w-full focus:border-orange-500' placeholder='Enter your name' type="text" />}
                        <input onChange={(e) => { setEmail(e.target.value) }} value={email} className='border border-gray-700 p-4 focus:outline-none w-full focus:border-orange-500' placeholder='Enter your email' type="text" />
                        <input onChange={(e) => { setPassword(e.target.value) }} value={password} className='border border-gray-700 p-4 focus:outline-none w-full focus:border-orange-500' placeholder='Enter your password' type="password" />
                    </div>
                    <button type='submit' className='bg-orange-600 mt-10 p-3 text-lg rounded-2xl w-full cursor-pointer text-[white] hover:bg-orange-700'>Submit</button>
                    <div className="text-sm mt-4 text-gray-400 flex justify-between">
                        <p className='text-sm font-light cursor-pointer'>Forget password</p>
                        <p onClick={() => { currentState === 'Sign In' ? setCurrentState('Sign up') : setCurrentState('Sign In') }} className='text-sm font-light cursor-pointer'>{currentState === 'Sign In' ? 'Register here' : 'Sign In instead'}</p>
                    </div>
                </div>
            </div>
        </form>
    )
}

export default Login
