import React, { createContext, useContext, useState, useCallback } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import Home from './pages/Home.jsx'
import Details from './pages/Details.jsx'
import Login from './pages/Login.jsx'
import SignUp from './pages/SignUp.jsx'
import AddWord from './pages/AddWord.jsx'

export const AuthContext = createContext(null)
export function useAuth() { return useContext(AuthContext) }

const ToastContext = createContext(null)
export function useToast() { return useContext(ToastContext) }

function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)
  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])
  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
    </ToastContext.Provider>
  )
}

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('elingo_user')) } catch { return null }
  })
  const [token, setToken] = useState(() => localStorage.getItem('elingo_token') || null)

  const login = useCallback((userData, accessToken) => {
    setUser(userData); setToken(accessToken)
    localStorage.setItem('elingo_user', JSON.stringify(userData))
    localStorage.setItem('elingo_token', accessToken)
  }, [])

  const logout = useCallback(() => {
    setUser(null); setToken(null)
    localStorage.removeItem('elingo_user')
    localStorage.removeItem('elingo_token')
  }, [])

  return (
    <HelmetProvider>
      <AuthContext.Provider value={{ user, token, login, logout }}>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/word/:id" element={<Details />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/add-word" element={<AddWord />} />
              <Route path="/word/:id/add-definition" element={<AddWord addDefOnly />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthContext.Provider>
    </HelmetProvider>
  )
}
