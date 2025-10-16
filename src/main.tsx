import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { setupMockAuthSession } from "./lib/mock-auth";
import { debugEnvironment } from "./lib/debug-env";

// Debug environment variables
debugEnvironment();

// Setup mock authentication session for static admin user
// This allows the app to work without actual auth while satisfying RLS policies
setupMockAuthSession();

createRoot(document.getElementById("root")!).render(<App />);
