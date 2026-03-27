import React, { useState, useEffect } from "react";
import styles from '../styles/header.module.css';

export default function Header() {
  const [time, setTime] = useState(new Date());

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
            <h3>Abhinav Sahoo</h3>
            <h4>Station Master</h4>
            </span>

      </div>
    </header>
  )
}
