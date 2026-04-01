import React from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "../styles/livetraintrack.module.css";
import "../styles/mapStyle.css";
import TrainItem from "../components/TrainItem";

const DEFAULT_CENTER = [20.4654939, 85.9007467];
const DEFAULT_ZOOM = 13;

// Helper component to reset view
function ResetViewButton({ trainData = [] }) {
  const map = useMap();

  const handleClick = () => {
    map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
  };

  return (
    <button onClick={handleClick} className="reset-btn">
      Reset View
    </button>
  );
}

export default function LiveTrainTracking({ trainData }) {
  // console.log("from live tracking");
  // console.log(trainData);

  const marker = {
    geocode: DEFAULT_CENTER,
    popup: "Cuttack Railway Station",
  };

  const customIcon = new L.Icon({
    iconUrl: "icon-marker.png",
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  });

  return (
    <div className={styles.LiveTrainTracking}>
      <span className={styles.dashContentHeadline}>
        <strong>Live Train Tracking</strong>{" "}
        <button>Start GPS Simulation</button>
      </span>
      <div className={styles.trainContentWrap}>
        <div className={styles.trainSchedules}>
          <strong>Monitored Trains</strong>
          <ul className={styles.trainList}>
            <li key={'train-head'} className={styles.header}>
              <p className={styles.train}>Train</p>
              <p className={styles.status}>Status</p>
              <p className={styles.eta}>ETA</p>
              <p className={styles.platform}>ETD</p>
            </li>

            {Array.isArray(trainData) &&
              trainData.map((train) => (
                <TrainItem
                  key={train.train_number}
                  color="success"
                  msg="On Time"
                  train={train}
                />
              ))}

            {/* more TrainItems */}
          </ul>
        </div>

        <div className={styles.trainMap} style={{ position: "relative" }}>
          <MapContainer
            center={DEFAULT_CENTER}
            zoom={DEFAULT_ZOOM}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={marker.geocode} icon={customIcon}>
              <Popup>{marker.popup}</Popup>
            </Marker>
            <ResetViewButton />
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
