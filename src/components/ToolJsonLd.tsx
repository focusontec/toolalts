"use client";

import { useEffect } from "react";

interface ToolJsonLdProps {
  data: object;
}

export default function ToolJsonLd({ data }: ToolJsonLdProps) {
  useEffect(() => {
    const existing = document.getElementById("tool-json-ld");
    if (existing) {
      existing.remove();
    }

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "tool-json-ld";
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById("tool-json-ld");
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [data]);

  return null;
}

export { ToolJsonLd };
