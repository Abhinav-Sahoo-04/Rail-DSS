import React, { useState } from 'react'
import styles from '../styles/login.module.css'
export default function Login() {
  const [formData,setFormData]=useState({
    username:"",
    password:""
  })
  const handelChange=(e)=>{
    setFormData({...formData,[e.target.name]:e.target.value})
  }
  const handelSubmit=(e)=>{
    e.preventDefault()
    console.log(formData);
    
  }
  return (
    <div className={styles.loginConatiner}>
      <form className={styles.login} onSubmit={handelSubmit}>
          <h1><i class="ri-train-fill"></i> Rail DSS</h1>
          <p>AI-Powered Train Traffic Control System</p>
          <div className={styles.formGroup}>
            <label htmlFor="username">Username</label>
          <input type="text" name='username' id='username' onChange={handelChange} value={formData.username} placeholder='E.G : Username@123' required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
          <input type="password" name='password' id='password' onChange={handelChange} value={formData.password} placeholder='*******' required />
          </div>
          <button type='submit'><i class="ri-shield-star-fill"></i> Authenticate</button>
          <small>Authorized Station Controllers Only</small>
      </form>
    </div>
  )
}
