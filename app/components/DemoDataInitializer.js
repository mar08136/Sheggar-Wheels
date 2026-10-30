
"use client";

import { useEffect } from "react";
import { initializeDemoData } from "@/lib/storage";

export default function DemoDataInitializer() {
  useEffect(() => {
    initializeDemoData();
  }, []);

  return null;
}
