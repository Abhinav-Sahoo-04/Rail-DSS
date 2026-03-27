import React from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "../styles/livetraintrack.module.css";
import "../styles/mapStyle.css";
import TrainItem from "../components/TrainItem";

const DEFAULT_CENTER= [22.5829, 88.3428];
const DEFAULT_ZOOM = 13;

// Helper component to reset view
function ResetViewButton() {
  const map = useMap();

  const handleClick = () => {
    map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
  };

  return (
    <button
      onClick={handleClick}
      className="reset-btn"
    >
      Reset View
    </button>
  );
}

export default function LiveTrainTracking() {
  const marker = {
    geocode: DEFAULT_CENTER,
    popup: "Howrah Junction Railway Station"
  };

  const customIcon = new L.Icon({
    iconUrl: "icon-marker.png",
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38]
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
            <li className={styles.header}>
              <p className={styles.train}>Train</p>
              <p className={styles.status}>Status</p>
              <p className={styles.eta}>ETA</p>
              <p className={styles.platform}>Platform</p>
            </li>
            <TrainItem color="success" msg={"ontime"} />
            <TrainItem color="danger" msg={"Delayed"} />
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
