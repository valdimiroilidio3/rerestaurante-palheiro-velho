import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { SiteContentProvider } from "@/content/SiteContentProvider";
import { markReady } from "@/lib/anim";

// Segurança: mesmo que a biblioteca de animação nunca chegue, o conteúdo
// aparece passado este prazo.
window.setTimeout(markReady, 2500);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SiteContentProvider>
      <App />
    </SiteContentProvider>
  </StrictMode>,
);
