import React, { useRef } from "react";
import "../styles/BadgeDisplay.css";

const allBadges = [
  {
    id: 6,
    name: "Feedback-Geber",
    image: "/badges/6.svg",
    description: "Du hast Feedback gegeben!"
  },
  {
    id: 2,
    name: "Erstes Modul",
    image: "/badges/2.svg",
    description: "Du hast dein erstes Modul abgeschlossen!"
  },
  {
    id: 1,
    name: "Erstes Quiz",
    image: "/badges/1.svg",
    description: "Du hast dein erstes Quiz abgeschlossen!"
  },
  {
    id: 8,
    name: "3 Übungen abgeschlossen",
    image: "/badges/8.svg",
    description: "Du hast 3 Übungen abgeschlossen!"
  },
  {
    id: 4,
    name: "500 XP erreicht",
    image: "/badges/4.svg",
    description: "Du hast 500 XP erreicht!"
  },
  {
    id: 3,
    name: "Alle Module abgeschlossen",
    image: "/badges/3.svg",
    description: "Du hast alle Module abgeschlossen!"
  },
  {
    id: 5,
    name: "Alle Quizze abgeschlossen",
    image: "/badges/5.svg",
    description: "Du hast alle Quizze abgeschlossen!"
  },
  {
    id: 9,
    name: "Alles abgeschlossen!",
    image: "/badges/9.svg",
    description: "Du hast alles erfolgreich abgeschlossen!"
  }
];

const BadgeDisplay = ({ earnedBadgeIds }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    const scrollAmount = 320;
    scrollRef.current.scrollLeft += direction === "left" ? -scrollAmount : scrollAmount;
  };

  return (
    <div className="badge-display-wrapper">
      <button className="scroll-btn left" onClick={() => scroll("left")}>‹</button>

      <div className="badge-scroll-container" ref={scrollRef}>
        {allBadges.map((badge) => (
          <div key={badge.id} className="badge-card">
            {earnedBadgeIds.includes(badge.id) ? (
              <img src={badge.image} alt={badge.name} className="badge-img" />
            ) : (
              <div className="badge-placeholder"></div>
            )}
            <p className="badge-name">{badge.name}</p>
            <p className="badge-desc">{badge.description}</p>
          </div>
        ))}
      </div>

      <button className="scroll-btn right" onClick={() => scroll("right")}>›</button>
    </div>
  );
};

export default BadgeDisplay;
