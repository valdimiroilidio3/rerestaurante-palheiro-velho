import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/index.css";
import { SiteContentProvider } from "@/content/SiteContentProvider";
import { LegalPage } from "./LegalPage";

createRoot(document.getElementById("legal")!).render(
  <StrictMode>
    <SiteContentProvider>
      <LegalPage />
    </SiteContentProvider>
  </StrictMode>,
);
