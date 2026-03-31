import React, { useState, useEffect } from "react";
import { liveAtStation } from "irctc-connect";
import styles from "../styles/dashboard.module.css";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import LiveTrainTracking from "./LiveTrainTracking";
import axios from "axios";

export default function Dashboard() {
  const [trainData, setTrainData] = useState([]);

  const getTT = async () => {
    try {
      const result = await axios.get(import.meta.env.VITE_TRAIN_API);
      setTrainData(result.data); // use result.data instead of result
      // console.log(result.data);
    } catch (e) {
      console.error("Error fetching train data:", e);
    }
  };

  // Run once when component mounts
  useEffect(() => {
    getTT();
  }, []);

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashLeft}>
        <Sidebar />
      </div>
      <div className={styles.dashRight}>
        <div className={styles.dashTop}>
          <Header  />
        </div>
        <div className={styles.dashActivity}>
          {/* Your activity blocks */}
        </div>
        <ul className={styles.dashLink}>
          <li key={"live-tracking"}>Live Tracking</li>
          <li key={"Platform-Allocation"}>Platform Allocation</li>
        </ul>
        <LiveTrainTracking trainData={trainData.data} />
      </div>
    </div>
  );
}
