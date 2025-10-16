import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { debugEnvironment } from "./lib/debug-env";

// Debug environment variables
debugEnvironment();

createRoot(document.getElementById("root")!).render(<App />);
