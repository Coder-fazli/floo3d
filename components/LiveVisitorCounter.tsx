"use client";

import { useState, useEffect, useRef } from "react";
import "./LiveVisitorCounter.css";

const AVATARS: string[] = [
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Woman%20Technologist.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Man%20Student.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Man%20Mechanic.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Woman%20Student.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Woman%20Teacher.png",
];

const AVATAR_COLORS: string[] = ["#dbeafe", "#dcfce7", "#fce7f3", "#ffedd5", "#f3f4f6"];

interface AvatarConfig { displayLimit: number; showPlus: boolean; }
interface DigitPlaceProps { place: number; value: number; }

const DigitPlace: React.FC<DigitPlaceProps> = ({ place, value }) => {
  const [offset, setOffset] = useState<number>(0);
  const targetRef = useRef<number>(0);
  const currentRef = useRef<number>(0);

  useEffect(() => {
    const valueRoundedToPlace = Math.floor(value / place);
    targetRef.current = valueRoundedToPlace % 10;
    let animationFrame: number;
    const animate = () => {
      const diff = targetRef.current - currentRef.current;
      if (Math.abs(diff) > 0.01) {
        currentRef.current += diff * 0.15;
        setOffset(currentRef.current);
        animationFrame = requestAnimationFrame(animate);
      } else {
        currentRef.current = targetRef.current;
        setOffset(targetRef.current);
      }
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, place]);

  if (value < place) return null;

  return (
    <div className="lvc-digit-place">
      {[0,1,2,3,4,5,6,7,8,9].map((num) => {
        let digitOffset = (10 + num - offset) % 10;
        let translateY = digitOffset * 20;
        if (digitOffset > 5) translateY -= 10 * 20;
        return (
          <span
            key={num}
            className="lvc-digit-number"
            style={{ transform: `translateY(${translateY}px)`, transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1)" }}
          >
            {num}
          </span>
        );
      })}
    </div>
  );
};

export default function LiveVisitorCounter() {
  const [visitorCount, setVisitorCount] = useState<number>(135);
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>({ displayLimit: 3, showPlus: false });

  useEffect(() => {
    const visitorsAboveBase = visitorCount - 135;
    const additionalAvatars = Math.floor(visitorsAboveBase / 3);
    const calculatedLimit = 5 + additionalAvatars;
    const displayLimit = Math.max(1, Math.min(calculatedLimit, 5));
    setAvatarConfig({ displayLimit, showPlus: calculatedLimit > 5 });
  }, [visitorCount]);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisitorCount(prev => {
        const change = Math.floor(Math.random() * 11) - 5;
        return Math.max(105, Math.min(140, prev + change));
      });
    }, 1660);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="lvc-card">
      <div className="lvc-header">
        <span className="lvc-label">Live Visitors</span>
        <span className="lvc-pulse-dot">
          <span className="lvc-pulse-ring"></span>
          <span className="lvc-pulse-core"></span>
        </span>
      </div>
      <div className="lvc-content">
        <div className="lvc-counter">
          {[10000, 1000, 100, 10, 1].map(place => (
            <DigitPlace key={place} place={place} value={visitorCount} />
          ))}
        </div>
        <div className="lvc-avatar-stack">
          {AVATARS.slice(0, avatarConfig.displayLimit).map((url, i) => (
            <div
              key={i}
              className="lvc-avatar"
              style={{ zIndex: 10 + i, backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length], animationDelay: `${i * 120}ms` }}
            >
              <img src={url} alt={`Visitor ${i}`} />
            </div>
          ))}
          {avatarConfig.showPlus && (
            <div className="lvc-avatar-plus" style={{ zIndex: 20 }}><span>+</span></div>
          )}
        </div>
      </div>
    </div>
  );
}
