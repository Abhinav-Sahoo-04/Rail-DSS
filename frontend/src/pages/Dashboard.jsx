import React, { useState, useEffect } from "react";
import { liveAtStation } from "irctc-connect";
import styles from "../styles/dashboard.module.css";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import LiveTrainTracking from "./LiveTrainTracking";
import axios from "axios";

export default function Dashboard() {
  const [timeDiff, setTimeDiff] = useState(null);
  const [trainData, setTrainData] = useState([]);

  const getTT = async () => {
    try {
      const result = await axios.get(import.meta.env.VITE_TRAIN_API);
      setTrainData(result.data); // use result.data instead of result
      console.log(result.data);
      // console.log(trainData.data[0].arrival_time);
    } catch (e) {
      console.error("Error fetching train data:", e);
    }
  };

  // Run once when component mounts
  useEffect(() => {
    getTT();
  }, []);

  useEffect(() => {
  if (Array.isArray(trainData?.data) && trainData.data.length > 0) {
    const arrivalTimeStr = trainData.data[0].arrival_time; 
    // Example format: "14:30" (HH:mm)

    const [hours, minutes] = arrivalTimeStr.split(":").map(Number);
    const now = new Date();
    const arrival = new Date(now);

    arrival.setHours(hours, minutes, 0, 0);

    // If arrival time is earlier than now, assume it's tomorrow
    if (arrival < now) {
      arrival.setDate(arrival.getDate() + 1);
    }

    const diffMs = arrival - now;
    const diffMinutes = Math.floor(diffMs / 1000 / 60);

    setTimeDiff(diffMinutes);
  }
}, [trainData]);


  return (
    <div className={styles.dashboard}>
      <div className={styles.dashLeft}>
        <Sidebar />
      </div>
      <div className={styles.dashRight}>
        <div className={styles.dashTop}>
          <Header />
        </div>
        <div className={styles.dashActivity}>
          {/* Your activity blocks */}
          <div className={styles.activity}>
            <div className={styles.activityIcon}>
              <strong>8</strong>
            </div>
            <div className={styles.activityInfo}>
              <strong>Next Train</strong>
              {Array.isArray(trainData?.data) && trainData.data.length > 0 && (
                <h2>{trainData.data[0].train_name}</h2>
              )}
            </div>
          </div>
          <div className={styles.activity2}>
            <div className={styles.activityIcon}>
              <strong>
                <i className="ri-time-line"></i>
              </strong>
            </div>
            <div className={styles.activityInfo}>
              <strong>Next Arrival</strong>
              <h2>{timeDiff} minutes </h2>
            </div>
          </div>
          <div className={styles.activity3}>
            <div className={styles.activityIcon}>
              <strong>%</strong>
            </div>
            <div className={styles.activityInfo}>
              <strong>System Status</strong>
              <h2>Optimal</h2>
            </div>
          </div>
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
