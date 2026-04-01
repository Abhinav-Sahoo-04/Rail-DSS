import React from "react";
import { Link } from "react-router-dom";
import styles from "../styles/platformallocation.module.css";
import axios from "axios";
import { useState, useEffect } from "react";

export default function PlatformAllocation() {
  const [allocate, setAllocate] = useState(null);

  const getArrange = async () => {
    try {
      const result = await axios.get(
        import.meta.env.VITE_TRAIN_OPTIMIZED_API
      );
      setAllocate(result.data.arranged_data);
      console.log(result.data.arranged_data);
    } catch (e) {
      console.error("Error fetching train data:", e);
    }
  };

  useEffect(() => {
    getArrange();
  }, []);

  return (
    <div className={styles.platformWrap}>
      <div className={styles.entry}>
        <h1>E</h1>
        <h1>N</h1>
        <h1>T</h1>
        <h1>R</h1>
        <h1>Y</h1>
      </div>

      {allocate &&
        [...(allocate.active ?? []), ...(allocate.reserve ?? [])].map((train) => (
          <>
            <div className={styles.platforms}>
        <small>{train.train_no}</small>
        <div className={styles.boxes}>
          <p>{train.train_name}</p>
        </div>
        <div className={styles.boxes}></div>
        <div className={styles.boxes}></div>
        <div className={styles.boxes}></div>
        <div className={styles.endbox}>X</div>
      </div>
      <div className={styles.walkway}></div>
          </>
        ))}
      
      
      
      <div className={styles.Choices}>
        <Link>Change Arrengment</Link>
        <ul>
          <li>
            <strong>Train on waiting</strong>
          </li>
          {allocate &&
            allocate.pending?.map((train) => (
              <li key={train.train_no}>{train.train_no}</li>
            ))}
        </ul>
      </div>
    </div>
  );
}
