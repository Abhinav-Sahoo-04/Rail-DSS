import { useState, useMemo } from "react";
import styles from "../styles/ManualOverride.module.css";

const PLATFORMS = [1, 2, 3, 4, 5];

// Minimum gap (minutes) between two trains on the same platform
// before a collision warning is raised
const COLLISION_BUFFER_MINUTES = 5;

const initialForm = {
  train_no: "",
  train_name: "",
  arrival_time: "",
  departure_time: "",
  platform: "",
  reason: "",
};

// ── Helpers ────────────────────────────────────────────────────
const toMin = (t) => {
  if (!t) return null;
  const [h, m] = t.slice(0, 5).split(":").map(Number);
  return h * 60 + m;
};

/**
 * Returns an array of collision objects for the current form selection.
 * Checks against:
 *   1. All other trains on trainData assigned to the same platform (if any)
 *   2. All already-logged overrides on the same platform
 *
 * A collision exists when the windows [arr - BUFFER, dep + BUFFER] overlap.
 */
const detectCollisions = (form, trainData, overrides) => {
  if (!form.train_no || !form.platform || !form.arrival_time || !form.departure_time)
    return [];

  const selArr = toMin(form.arrival_time);
  const selDep = toMin(form.departure_time);
  if (selArr === null || selDep === null) return [];

  const collisions = [];

  // Build candidate list: other trains on same platform from trainData
  // (trainData itself doesn't carry platform assignment, so we skip that —
  //  but we DO check overrides which have explicit platform)
  const overrideCandidates = overrides.filter(
    (o) => o.platform === form.platform && o.train_no !== form.train_no
  );

  for (const candidate of overrideCandidates) {
    const cArr = toMin(candidate.arrival_time);
    const cDep = toMin(candidate.departure_time);
    if (cArr === null || cDep === null) continue;

    // Overlap check with buffer on both sides
    const overlaps =
      selArr - COLLISION_BUFFER_MINUTES < cDep + COLLISION_BUFFER_MINUTES &&
      selDep + COLLISION_BUFFER_MINUTES > cArr - COLLISION_BUFFER_MINUTES;

    if (overlaps) {
      const gapMinutes = Math.max(
        0,
        Math.min(
          Math.abs(selArr - cDep),
          Math.abs(cArr - selDep)
        )
      );
      collisions.push({
        train_no: candidate.train_no,
        train_name: candidate.train_name,
        arrival_time: candidate.arrival_time,
        departure_time: candidate.departure_time,
        gapMinutes,
        severity: gapMinutes <= 2 ? "critical" : "warning",
      });
    }
  }

  return collisions;
};

export default function ManualOverride({ trainData = [], onOverride = () => {} }) {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [overrides, setOverrides] = useState([]);
  const [errors, setErrors] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);

  // ── Live collision detection ───────────────────────────────
  const collisions = useMemo(
    () => detectCollisions(form, trainData, overrides),
    [form.train_no, form.platform, form.arrival_time, form.departure_time, overrides]
  );

  const hasCollision = collisions.length > 0;
  const hasCritical  = collisions.some((c) => c.severity === "critical");

  // ── Validation ────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.train_no.trim()) e.train_no = "Train number is required";
    if (!form.train_name.trim()) e.train_name = "Train name is required";
    if (!form.platform) e.platform = "Select a platform";
    return e;
  };

  // ── Handlers ──────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleTrainSelect = (e) => {
    const selectedTrainNo = e.target.value;
    if (!selectedTrainNo) { setForm(initialForm); return; }

    const selectedTrain = trainData.find((t) => t.train_no === selectedTrainNo);
    if (selectedTrain) {
      setForm((prev) => ({
        ...prev,
        train_no:       selectedTrain.train_no,
        train_name:     selectedTrain.train_name,
        arrival_time:   selectedTrain.arrival_time?.slice(0, 5) ?? "",
        departure_time: selectedTrain.departure_time?.slice(0, 5) ?? "",
      }));
      setErrors((prev) => ({ ...prev, train_no: undefined, train_name: undefined }));
    }
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    const entry = {
      ...form,
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit", minute: "2-digit",
      }),
    };
    setOverrides((prev) => [entry, ...prev]);
    onOverride(entry);
    setForm(initialForm);
    setErrors({});
    setConfirmOpen(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleRemove = (id) => {
    setOverrides((prev) => prev.filter((o) => o.id !== id));
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <div className={styles.wrapper}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.headerIcon}>⚙</span>
          <div>
            <h2 className={styles.title}>Manual Override</h2>
            <p className={styles.subtitle}>
              Force-assign a platform outside automatic allocation
            </p>
          </div>
        </div>
        <div className={styles.badge}>
          {overrides.length} Override{overrides.length !== 1 ? "s" : ""} Active
        </div>
      </div>

      <div className={styles.body}>

        {/* ── Form Card ── */}
        <div className={styles.formCard}>
          <div className={styles.formTitle}>
            <span className={styles.dot} />
            New Override Entry
          </div>

          <div className={styles.grid2}>

            {/* Train Number */}
            <div className={styles.field}>
              <label className={styles.label}>Train Number</label>
              <select
                className={`${styles.input} ${styles.select} ${errors.train_no ? styles.inputError : ""}`}
                name="train_no"
                value={form.train_no}
                onChange={handleTrainSelect}
              >
                <option value="">-- Select Train --</option>
                {trainData?.map((train) => (
                  <option key={train.train_uid} value={train.train_no}>
                    {train.train_no} — {train.train_name}
                  </option>
                ))}
              </select>
              {errors.train_no && <span className={styles.error}>{errors.train_no}</span>}
            </div>

            {/* Train Name */}
            <div className={styles.field}>
              <label className={styles.label}>Train Name</label>
              <input
                readOnly
                className={`${styles.input} ${errors.train_name ? styles.inputError : ""}`}
                name="train_name"
                value={form.train_name}
                placeholder="Auto-filled on train selection"
              />
              {errors.train_name && <span className={styles.error}>{errors.train_name}</span>}
            </div>

            {/* Arrival Time */}
            <div className={styles.field}>
              <label className={styles.label}>Arrival Time</label>
              <input
                type="time"
                readOnly
                className={`${styles.input} ${errors.arrival_time ? styles.inputError : ""}`}
                name="arrival_time"
                value={form.arrival_time}
              />
              {errors.arrival_time && <span className={styles.error}>{errors.arrival_time}</span>}
            </div>

            {/* Departure Time */}
            <div className={styles.field}>
              <label className={styles.label}>Departure Time</label>
              <input
                type="time"
                readOnly
                className={`${styles.input} ${errors.departure_time ? styles.inputError : ""}`}
                name="departure_time"
                value={form.departure_time}
              />
              {errors.departure_time && <span className={styles.error}>{errors.departure_time}</span>}
            </div>

            {/* Platform Selector */}
            <div className={styles.field}>
              <label className={styles.label}>Assign Platform</label>
              <div className={styles.platformRow}>
                {PLATFORMS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`${styles.pfBtn} ${
                      form.platform === String(p) ? styles.pfBtnActive : ""
                    }`}
                    onClick={() => {
                      setForm((f) => ({ ...f, platform: String(p) }));
                      setErrors((e) => ({ ...e, platform: undefined }));
                    }}
                  >
                    PF {p}
                  </button>
                ))}
              </div>
              {errors.platform && <span className={styles.error}>{errors.platform}</span>}
            </div>

          </div>

          {/* ── Collision Warning Panel ── */}
          {hasCollision && (
            <div className={`${styles.collisionPanel} ${hasCritical ? styles.collisionCritical : styles.collisionWarning}`}>
              <div className={styles.collisionHeader}>
                <span className={styles.collisionIcon}>
                  {hasCritical ? "🚨" : "⚠️"}
                </span>
                <span className={styles.collisionTitle}>
                  {hasCritical
                    ? "CRITICAL — Platform Collision Detected"
                    : "WARNING — Tight Platform Interval"}
                </span>
              </div>
              <p className={styles.collisionDesc}>
                The selected train conflicts with {collisions.length} existing override{collisions.length > 1 ? "s" : ""} on{" "}
                <strong>Platform {form.platform}</strong>. Proceeding may cause a platform collision.
              </p>
              <div className={styles.collisionList}>
                {collisions.map((c, i) => (
                  <div key={i} className={styles.collisionItem}>
                    <div className={styles.collisionItemLeft}>
                      <span className={`${styles.collisionSeverityDot} ${c.severity === "critical" ? styles.dotCritical : styles.dotWarning}`} />
                      <span className={styles.collisionTrainNo}>{c.train_no}</span>
                      <span className={styles.collisionTrainName}>{c.train_name}</span>
                    </div>
                    <div className={styles.collisionItemRight}>
                      <span className={styles.collisionWindow}>
                        🕐 {c.arrival_time} → {c.departure_time}
                      </span>
                      <span className={`${styles.collisionGap} ${c.severity === "critical" ? styles.gapCritical : styles.gapWarning}`}>
                        {c.gapMinutes === 0
                          ? "Full overlap"
                          : `${c.gapMinutes} min gap`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reason */}
          <div className={styles.field} style={{ marginTop: "0.75rem" }}>
            <label className={styles.label}>Reason for Override</label>
            <textarea
              className={`${styles.input} ${styles.textarea} ${errors.reason ? styles.inputError : ""}`}
              name="reason"
              value={form.reason}
              onChange={handleChange}
              placeholder="e.g. Emergency stop, VIP movement, maintenance conflict…"
              rows={3}
            />
            {errors.reason && <span className={styles.error}>{errors.reason}</span>}
          </div>

          <div className={styles.formFooter}>
            <button
              className={styles.resetBtn}
              type="button"
              onClick={() => { setForm(initialForm); setErrors({}); }}
            >
              Reset
            </button>
            <button
              className={`${styles.submitBtn} ${hasCritical ? styles.submitBtnDanger : ""}`}
              type="button"
              onClick={handleSubmit}
            >
              {hasCritical ? "⚠ Override Anyway →" : "Apply Override →"}
            </button>
          </div>

          {submitted && (
            <div className={styles.successBanner}>✓ Override applied successfully</div>
          )}
        </div>

        {/* ── Override Log ── */}
        {overrides.length > 0 && (
          <div className={styles.logCard}>
            <div className={styles.formTitle}>
              <span className={styles.dot} />
              Override Log
            </div>
            <div className={styles.logList}>
              {overrides.map((o) => {
                // Check if this log entry has a collision with any other override
                const logCollisions = overrides.filter((other) => {
                  if (other.id === o.id || other.platform !== o.platform) return false;
                  const oArr = toMin(o.arrival_time);
                  const oDep = toMin(o.departure_time);
                  const aArr = toMin(other.arrival_time);
                  const aDep = toMin(other.departure_time);
                  if (!oArr || !oDep || !aArr || !aDep) return false;
                  return (
                    oArr - COLLISION_BUFFER_MINUTES < aDep + COLLISION_BUFFER_MINUTES &&
                    oDep + COLLISION_BUFFER_MINUTES > aArr - COLLISION_BUFFER_MINUTES
                  );
                });

                return (
                  <div
                    key={o.id}
                    className={`${styles.logItem} ${logCollisions.length > 0 ? styles.logItemCollision : ""}`}
                  >
                    <div className={styles.logTop}>
                      <div className={styles.logLeft}>
                        <span className={styles.logTrainNo}>{o.train_no}</span>
                        <span className={styles.logTrainName}>{o.train_name}</span>
                        {logCollisions.length > 0 && (
                          <span
                            className={styles.logCollisionBadge}
                            title={`Conflicts with: ${logCollisions.map((c) => c.train_no).join(", ")}`}
                          >
                            🚨 Conflict
                          </span>
                        )}
                      </div>
                      <div className={styles.logRight}>
                        <span className={styles.logPf}>Platform {o.platform}</span>
                        <span className={styles.logTime}>{o.timestamp}</span>
                        <button
                          className={styles.removeBtn}
                          onClick={() => handleRemove(o.id)}
                          title="Remove override"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    <div className={styles.logMeta}>
                      <span>🕐 {o.arrival_time} → {o.departure_time}</span>
                      <span className={styles.logReason}>"{o.reason}"</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Confirm Modal ── */}
      {confirmOpen && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} ${hasCritical ? styles.modalDanger : ""}`}>
            <div className={styles.modalIcon}>{hasCritical ? "🚨" : "⚠"}</div>
            <h3 className={styles.modalTitle}>
              {hasCritical ? "Critical Collision Risk!" : "Confirm Override"}
            </h3>

            {hasCollision && (
              <div className={styles.modalCollisionAlert}>
                {collisions.map((c, i) => (
                  <div key={i} className={styles.modalCollisionRow}>
                    <span>{c.severity === "critical" ? "🔴" : "🟡"}</span>
                    <span>
                      <strong>{c.train_no}</strong> on Platform {form.platform} —{" "}
                      {c.gapMinutes === 0 ? "full time overlap" : `only ${c.gapMinutes} min gap`}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <p className={styles.modalText}>
              You are about to manually assign{" "}
              <strong>{form.train_no} — {form.train_name}</strong> to{" "}
              <strong>Platform {form.platform}</strong>. This will bypass automatic allocation.
            </p>
            <div className={styles.modalMeta}>
              <span>Arrival: {form.arrival_time}</span>
              <span>Departure: {form.departure_time}</span>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setConfirmOpen(false)}>
                Cancel
              </button>
              <button
                className={`${styles.confirmBtn} ${hasCritical ? styles.confirmBtnDanger : ""}`}
                onClick={handleConfirm}
              >
                {hasCritical ? "Override Anyway" : "Confirm Override"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
