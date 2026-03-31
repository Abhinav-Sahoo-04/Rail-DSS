import React, { useState,useEffect } from "react";
import styles from "../styles/trainItem.module.css";
import axios from "axios";
export default function TrainItem({train,color,msg}) {

  const [delay,setDelay]=useState('')

  const getDelay = async () => {
    try {
      const result = await axios.get(import.meta.env.VITE_TRAIN_LIVE_STATUS_API+train.train_no);
      // console.log(train.train_no);
      
      setDelay(result.data.delay); // use result.data instead of result
      // console.log(result.data);
      // console.log(trainData.data[0].arrival_time);
    } catch (e) {
      console.error("Error fetching train data:", e);
    }
  };

  // Run once when component mounts
  useEffect(() => {
    getDelay();
  }, []);

  // console.log(train);
  
  return (
    <li  className={styles.trainItem}>
      <div className={styles.train}>
        <h3>{train.train_no}</h3>
        <h4>{train.train_name}</h4>
      </div>
      <div className={styles.status}>
        {delay && delay.length !== 0 ? (
  <span className={styles[color]}>{delay} m</span>
) : (
  <span className={styles[color]}>{msg}</span>
)}

      </div>
      <div className={styles.pta}>
        {train.arrival_time}
      </div>
      <div className={styles.platform}>
        {train.departure_time}
      </div>
    </li>
  );
}
