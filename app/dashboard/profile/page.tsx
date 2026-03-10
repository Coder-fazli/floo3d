"use client";

import Navbar from "@/components/Navbar";
import { UserProfile } from "@clerk/nextjs";

export default function ProfilePage() {
  return (
    <div className="home">
      <Navbar />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "100px", paddingBottom: "60px" }}>
        <a href="/dashboard" style={{ alignSelf: "flex-start", marginLeft: "2rem", marginBottom: "1.5rem" }}>← Back to Dashboard</a>
        <UserProfile />
      </div>
    </div>
  );
}
