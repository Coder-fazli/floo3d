"use client";

import { Sparkles } from "lucide-react";

type RoomKey = "bedroom" | "bathroom" | "kitchen" | "livingRoom" | "diningRoom" | "office";
type ExtraKey = "garage" | "balcony" | "terrace" | "garden";

export interface FpgConfig {
  propertyType: string;
  area: number;
  areaUnit: "m2" | "sqft";
  floors: number;
  rooms: Record<RoomKey, number>;
  extras: Record<ExtraKey, boolean>;
}

interface Props {
  config: FpgConfig;
  onChange: (updater: (prev: FpgConfig) => FpgConfig) => void;
}

const ROOMS: { key: RoomKey; label: string }[] = [
  { key: "bedroom", label: "Bedroom" },
  { key: "bathroom", label: "Bathroom" },
  { key: "kitchen", label: "Kitchen" },
  { key: "livingRoom", label: "Living Room" },
  { key: "diningRoom", label: "Dining Room" },
  { key: "office", label: "Office" },
];

const EXTRAS: { key: ExtraKey; label: string }[] = [
  { key: "garage", label: "Garage" },
  { key: "balcony", label: "Balcony" },
  { key: "terrace", label: "Terrace" },
  { key: "garden", label: "Garden" },
];

export default function FpgSidebarSection({ config, onChange }: Props) {
  return (
    <div className="viz-sb-section">
      <div className="viz-sb-section-title">
        <Sparkles size={13} strokeWidth={2.5} style={{ color: "#ec5b13" }} />
        Configure Floor Plan
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>

        {/* Property type */}
        <select className="viz-room-select" value={config.propertyType} onChange={e => onChange(c => ({ ...c, propertyType: e.target.value }))}>
          {["House", "Apartment", "Villa", "Studio", "Office"].map(t => <option key={t}>{t}</option>)}
        </select>

        {/* Area + unit */}
        <div style={{ display: "flex", gap: "0.4rem" }}>
          <input
            type="number"
            className="viz-room-select"
            style={{ flex: 1 }}
            value={config.area}
            min={20}
            max={2000}
            onChange={e => onChange(c => ({ ...c, area: Number(e.target.value) }))}
          />
          <select className="viz-room-select" style={{ width: "70px" }} value={config.areaUnit} onChange={e => onChange(c => ({ ...c, areaUnit: e.target.value as "m2" | "sqft" }))}>
            <option value="m2">m²</option>
            <option value="sqft">sqft</option>
          </select>
        </div>

        {/* Floors */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "0.78rem", color: "#475569", fontWeight: 600 }}>Floors</span>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <button className="viz-icon-btn" onClick={() => onChange(c => ({ ...c, floors: Math.max(1, c.floors - 1) }))}>-</button>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, minWidth: "1rem", textAlign: "center" }}>{config.floors}</span>
            <button className="viz-icon-btn" onClick={() => onChange(c => ({ ...c, floors: Math.min(5, c.floors + 1) }))}>+</button>
          </div>
        </div>

        {/* Rooms */}
        {ROOMS.map(({ key, label }) => (
          <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.75rem", color: "#475569", fontWeight: 500 }}>{label}</span>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <button className="viz-icon-btn" onClick={() => onChange(c => ({ ...c, rooms: { ...c.rooms, [key]: Math.max(0, c.rooms[key] - 1) } }))}>-</button>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, minWidth: "1rem", textAlign: "center" }}>{config.rooms[key]}</span>
              <button className="viz-icon-btn" onClick={() => onChange(c => ({ ...c, rooms: { ...c.rooms, [key]: c.rooms[key] + 1 } }))}>+</button>
            </div>
          </div>
        ))}

        {/* Extras */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.25rem" }}>
          {EXTRAS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onChange(c => ({ ...c, extras: { ...c.extras, [key]: !c.extras[key] } }))}
              style={{
                padding: "0.25rem 0.6rem",
                borderRadius: "9999px",
                border: "1.5px solid",
                borderColor: config.extras[key] ? "#ec5b13" : "#e2e8f0",
                background: config.extras[key] ? "rgba(236,91,19,0.08)" : "#f8fafc",
                color: config.extras[key] ? "#ec5b13" : "#64748b",
                fontSize: "0.72rem",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {label}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
