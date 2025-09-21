"use client"; // required for interactivity
import { useState } from "react";
import styles from "./LandingPage.module.css";
import SignInForm from "@/app/component/General/LandingPage/Tab/\SignInForms"; 

export default function LandingPageContent() {
  const [showSignIn, setShowSignIn] = useState(false);

  return (
    <div className={styles.heroText}>
      {/* Headlines */}
      <div className={styles.headline}>
        <span className={styles.stayGold}>STAY</span>
        <span className={styles.subWhite}> UPDATED</span>
      </div>
      <div className={styles.headline}>
        <span className={styles.stayGold}>STAY</span>
        <span className={styles.subWhite}> CONNECTED</span>
      </div>

      {/* Subtitle */}
      <p className={styles.subtitle}>
        From school events to lost &amp; found, Katipunan Hub keeps the whole
        CIT community in one place
      </p>

      {/* CTA buttons */}
      <div className={styles.ctaButtons}>
        <button
          className={styles.btnJoin}
          onClick={() => setShowSignIn(true)}
        >
          Join Hub
        </button>
        <button className={styles.btnLearn}>Learn More</button>
      </div>

      {/* Sign In Form modal */}
      {showSignIn && <SignInForm onClose={() => setShowSignIn(false)} />}
    </div>
  );
}
