import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const root = document.documentElement;
root.classList.add("light");
// root.classList.add("dark");
root.classList.remove("dark");
// root.classList.remove("light");
root.style.setProperty("--nav-offset", "0px");
try {
  localStorage.removeItem("theme");
} catch {
  // ignore
}

createRoot(document.getElementById("root")!).render(<App />);
