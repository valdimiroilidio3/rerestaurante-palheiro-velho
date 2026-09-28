import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/index.css";
import { SiteContentProvider } from "@/content/SiteContentProvider";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { LegalPage } from "./LegalPage";

createRoot(document.getElementById("legal")!).render(
  <StrictMode>
    <LocaleProvider>
      <SiteContentProvider>
        <LegalPage />
      </SiteContentProvider>
    </LocaleProvider>
  </StrictMode>,
);
