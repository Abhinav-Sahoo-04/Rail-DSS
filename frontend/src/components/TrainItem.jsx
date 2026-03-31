import React from "react";
import styles from "../styles/trainItem.module.css";
export default function TrainItem({train,color,msg}) {


  // console.log(train);
  
  return (
    <li  className={styles.trainItem}>
      <div className={styles.train}>
        <h3>{train.train_no}</h3>
        <h4>{train.train_name}</h4>
      </div>
      <div className={styles.status}>
        <span className={styles[color]}>{msg}</span>
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
