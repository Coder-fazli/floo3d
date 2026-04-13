"use client";

import { useState } from "react";
import { Sparkles, Building2, Ruler, Layers, BedDouble, Bath, UtensilsCrossed, Sofa, Coffee, Briefcase } from "lucide-react";

type RoomKey = "bedroom" | "bathroom" | "kitchen" | "livingRoom" | "diningRoom" | "office";
type ExtraKey = "garage" | "balcony" | "terrace" | "garden";
export type FpgStyle = "blueprint" | "colored" | "isometric" | "3d top-down";

export interface FpgConfig {
  propertyType: string;
  area: number;
  areaUnit: "m2" | "sqft";
  floors: number;
  rooms: Record<RoomKey, number>;
  extras: Record<ExtraKey, boolean>;
  style: FpgStyle;
}

interface Props {
  config: FpgConfig;
  onChange: (updater: (prev: FpgConfig) => FpgConfig) => void;
  getStyleImage: (style: string) => string;
}

const ROOMS: { key: RoomKey; label: string; icon: React.ReactNode }[] = [
  { key: "bedroom",    label: "Bedroom",     icon: <BedDouble size={13} strokeWidth={2} /> },
  { key: "bathroom",   label: "Bathroom",    icon: <Bath size={13} strokeWidth={2} /> },
  { key: "kitchen",    label: "Kitchen",     icon: <UtensilsCrossed size={13} strokeWidth={2} /> },
  { key: "livingRoom", label: "Living Room", icon: <Sofa size={13} strokeWidth={2} /> },
  { key: "diningRoom", label: "Dining Room", icon: <Coffee size={13} strokeWidth={2} /> },
  { key: "office",     label: "Office",      icon: <Briefcase size={13} strokeWidth={2} /> },
];

const EXTRAS: { key: ExtraKey; label: string }[] = [
  { key: "garage",  label: "Garage" },
  { key: "balcony", label: "Balcony" },
  { key: "terrace", label: "Terrace" },
  { key: "garden",  label: "Garden" },
];

const STYLES: { key: FpgStyle; label: string }[] = [
  { key: "blueprint",    label: "Blueprint" },
  { key: "colored",      label: "Colored" },
  { key: "isometric",    label: "Isometric" },
  { key: "3d top-down",  label: "3D Top-Down" },
];

export default function FpgSidebarSection({ config, onChange, getStyleImage }: Props) {
  const [areaStr, setAreaStr] = useState(String(config.area));

  return (
    <div className="viz-sb-section">
      <div className="viz-sb-section-title">
        <Sparkles size={13} strokeWidth={2.5} style={{ color: "#ec5b13" }} />
        Configure Floor Plan
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>

        {/* Property type */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem", color: "#475569", fontWeight: 600 }}>
            <Building2 size={13} strokeWidth={2} />
            Property Type
          </span>
          <select className="viz-room-select" value={config.propertyType} onChange={e => onChange(c => ({ ...c, propertyType: e.target.value }))}>
            {["House", "Apartment", "Villa", "Studio", "Office"].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        {/* Area + unit */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem", color: "#475569", fontWeight: 600 }}>
            <Ruler size={13} strokeWidth={2} />
            Total Area
          </span>
          <div style={{ display: "flex", gap: "0.4rem" }}>
            <input
              type="number"
              className="viz-room-select"
              style={{ flex: 1 }}
              value={areaStr}
              min={20}
              max={2000}
              onChange={e => {
                const raw = e.target.value.replace(/^0+(?=\d)/, "");
                setAreaStr(raw);
                const num = parseInt(raw, 10);
                if (!isNaN(num)) onChange(c => ({ ...c, area: num }));
              }}
              onBlur={e => {
                const num = Math.max(20, Math.min(2000, parseInt(e.target.value, 10) || 20));
                setAreaStr(String(num));
                onChange(c => ({ ...c, area: num }));
              }}
            />
            <select className="viz-room-select" style={{ width: "70px" }} value={config.areaUnit} onChange={e => onChange(c => ({ ...c, areaUnit: e.target.value as "m2" | "sqft" }))}>
              <option value="m2">m²</option>
              <option value="sqft">sqft</option>
            </select>
          </div>
        </div>

        {/* Floors */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem", color: "#475569", fontWeight: 600 }}>
            <Layers size={13} strokeWidth={2} />
            Floors
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <button className="viz-icon-btn" onClick={() => onChange(c => ({ ...c, floors: Math.max(1, c.floors - 1) }))}>-</button>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, minWidth: "1rem", textAlign: "center" }}>{config.floors}</span>
            <button className="viz-icon-btn" onClick={() => onChange(c => ({ ...c, floors: Math.min(5, c.floors + 1) }))}>+</button>
          </div>
        </div>

        {/* Rooms */}
        {ROOMS.map(({ key, label, icon }) => (
          <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem", color: "#475569", fontWeight: 500 }}>
              {icon}
              {label}
            </span>
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

        {/* Style */}
        <div style={{ marginTop: "0.25rem" }}>
          <div className="viz-sb-section-title" style={{ marginBottom: "0.5rem" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ec5b13" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
            Design Style
          </div>
          <div className="viz-style-scroll">
            <div className="viz-style-grid">
              {STYLES.map(({ key, label }) => (
                <div
                  key={key}
                  className={`viz-style-card${config.style === key ? " viz-style-card-active" : ""}`}
                  onClick={() => onChange(c => ({ ...c, style: key }))}
                >
                  <div className="viz-style-card-img">
                    <img src={getStyleImage(label)} alt={label} />
                    {config.style === key && (
                      <div className="viz-style-card-check">
                        <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.5"><polyline points="2,6 5,9 10,3"/></svg>
                      </div>
                    )}
                  </div>
                  <div className="viz-style-card-label">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
