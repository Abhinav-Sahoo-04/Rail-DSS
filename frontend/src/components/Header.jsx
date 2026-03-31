import React, { useState, useEffect } from "react";
import styles from '../styles/header.module.css';
import axios from "axios";

export default function Header() {
  const [time, setTime] = useState(new Date());
  const [user,setUser]=useState('')
  
  const getUser = async () => {
    try {
      const result = await axios.get(import.meta.env.VITE_USER_API);
      console.log(import.meta.env.VITE_USER_API);
      
    ; // use result.data instead of result
      // console.log(result.data);
      setUser(result.data.username)
    } catch (e) {
      console.error("Error fetching train data:", e);
    }
  };

  // Run once when component mounts
  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    // Cleanup interval when component unmounts
    return () => clearInterval(timer);
  }, []);
  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <strong>Station Controller Dashboard – Howrah Jn</strong>
        <span><p>AI Confidence: 97%</p>{time.toLocaleTimeString()} • Last Updated: just now</span>
      </div>
      <div className={styles.headerRight}>
         <img src="vite.svg" alt="vite.svg" />
         <span>
            <h3>{user}</h3>
            <h4>Station Master</h4>
            </span>

      </div>
    </header>
  )
}
