"use client";
import { useEffect } from "react";

export default function UserInitializer() {
    useEffect(() => {
        fetch("/api/user/init", { method: "POST" });
    }, []);
    return null; 
}