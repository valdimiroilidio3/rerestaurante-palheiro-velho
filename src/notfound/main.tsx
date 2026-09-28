import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/index.css";
import { SiteContentProvider } from "@/content/SiteContentProvider";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { NotFound } from "./NotFound";

createRoot(document.getElementById("notfound")!).render(
  <StrictMode>
    <LocaleProvider>
      <SiteContentProvider>
        <NotFound />
      </SiteContentProvider>
    </LocaleProvider>
  </StrictMode>,
);
