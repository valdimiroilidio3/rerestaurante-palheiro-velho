import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/index.css";
import { AdminApp } from "@/admin/AdminApp";
import { ToastHost } from "@/admin/components/ui";

// O painel é uma página escura e independente do site público.
document.body.style.backgroundColor = "#171717";

createRoot(document.getElementById("admin")!).render(
  <StrictMode>
    <ToastHost>
      <AdminApp />
    </ToastHost>
  </StrictMode>,
);
