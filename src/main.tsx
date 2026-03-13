import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(<HelmetProvider>
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider >
</HelmetProvider >);
