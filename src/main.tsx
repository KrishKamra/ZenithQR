import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to find the root element. Ensure index.html has <div id='root'></div>");
}

createRoot(rootElement).render(<App />);