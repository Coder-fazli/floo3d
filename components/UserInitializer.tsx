"use client";
import { useEffect } from "react";

export default function UserInitializer() {
    useEffect(() => {
        let attempts = 0;
        const run = () => {
            fetch("/api/user/init", { method: "POST" })
                .then(r => r.json())
                .then(d => {
                    if (!d.ok && ++attempts < 4)
                        setTimeout(run, 1500);
                });
        };
        run();
    }, []);
    return null;
}