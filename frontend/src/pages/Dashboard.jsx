import React from 'react';
import styles from '../styles/dashboard.module.css';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import LiveTrainTracking from './LiveTrainTracking';

export default function Dashboard() {
  return (
    <div className={styles.dashboard}>
      <div className={styles.dashLeft}>
        <Sidebar/>
      </div>
      <div className={styles.dashRight}>
        <div className={styles.dashTop}>
          <Header/>
        </div>
        <div className={styles.dashActivity}>
          <div className={styles.activity}>
            <div className={styles.activityIcon}>
              <strong>8</strong>
            </div>
            <div className={styles.activityInfo}>
              <strong>Monitored Trains</strong>
              <h2>Active Model</h2>
            </div>
          </div>
          <div className={styles.activity2}>
            <div className={styles.activityIcon}>
              <strong><i class="ri-time-line"></i></strong>
            </div>
            <div className={styles.activityInfo}>
              <strong>Next Arrival</strong>
              <h2>In 4 Minute</h2>
            </div>
          </div>
          <div className={styles.activity3}>
            <div className={styles.activityIcon}>
              <strong><i class="ri-percent-line"></i></strong>
            </div>
            <div className={styles.activityInfo}>
              <strong>System status</strong>
              <h2>Optimal</h2>
            </div>
          </div>
        </div>
        <ul className={styles.dashLink}>
          <li>Live Tracking</li>
          <li>AI Suggestion</li>
        </ul>
        <LiveTrainTracking/>
      </div>
    </div>
  )
}
