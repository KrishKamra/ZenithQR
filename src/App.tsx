import { useEffect, useState } from "react";
import ZenithQR from "./components/ZenithQR";

export default function App() {
  const [data, setData] = useState({
    qualityScore: 0,
    latencyMs: 0,
    safetyStatus: "warning" as const,
    qrData: "Initializing...",
  });

  useEffect(() => {
    // Poll the Python bridge every 500ms
    const interval = setInterval(async () => {
      try {
        const response = await fetch("http://localhost:8000/telemetry");
        const json = await response.json();
        setData(json);
      } catch (err) {
        console.error("Bridge not found. Run bridge.py!");
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <ZenithQR
      qualityScore={data.qualityScore}
      latencyMs={data.latencyMs}
      safetyStatus={data.safetyStatus}
      qrData={data.qrData}
    />
  );
}