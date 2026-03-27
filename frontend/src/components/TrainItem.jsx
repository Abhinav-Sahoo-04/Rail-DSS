import React from "react";
import styles from "../styles/trainItem.module.css";
export default function TrainItem({color,msg}) {
  return (
    <li className={styles.trainItem}>
      <div className={styles.train}>
        <h3>123456</h3>
        <h4>Puri Express</h4>
      </div>
      <div className={styles.status}>
        <span className={styles[color]}>{msg}</span>
      </div>
      <div className={styles.pta}>
        11:20
      </div>
      <div className={styles.platform}>
        6
      </div>
    </li>
  );
}
