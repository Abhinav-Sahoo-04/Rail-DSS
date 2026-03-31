
import './App.css'
import { BrowserRouter,Routes,Route } from 'react-router-dom'
import React from 'react'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import { useState } from 'react'

export default function App() {
  const [user,setUser]=useState('')
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

