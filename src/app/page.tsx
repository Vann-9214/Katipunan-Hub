"use client";

import React, { useState } from "react";
import LandingPageTab from "@/app/component/General/LandingPage/LandingPageTab/LandingPageTab";
// This import will now work because of the change in Step 1
import LandingPageContent, {
  AuthMode,
} from "./component/General/LandingPage/LandingPageContent/LandingPageContent";

export default function LandingPage() {
  // Explicitly type the state as AuthMode
  const [mode, setMode] = useState<AuthMode>("signin");

  return (
    <div>
      {/* You likely need to pass setMode here too if the Tabs control the mode */}
      <LandingPageTab />

      {/* Pass setMode to the content */}
      <LandingPageContent setMode={setMode} />
    </div>
  );
}
