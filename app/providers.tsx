"use client";
import { SessionProvider } from "next-auth/react";
import { useState } from "react";
import {
  FluentProvider,
  SSRProvider,
  RendererProvider,
  createDOMRenderer,
  renderToStyleElements,
  createLightTheme,
  BrandVariants,
  Theme,
} from "@fluentui/react-components";
import { useServerInsertedHTML } from "next/navigation";

export function Providers({ children }: { children: React.ReactNode }) {
  const [renderer] = useState(() => createDOMRenderer());

  useServerInsertedHTML(() => {
    return <>{renderToStyleElements(renderer)}</>;
  });

  const webinux: BrandVariants = {
    10: "#030403",
    20: "#171A19",
    30: "#252A29",
    40: "#303734",
    50: "#3A4340",
    60: "#46514C",
    70: "#515E58",
    80: "#5D6C64",
    90: "#6A7A71",
    100: "#77887D",
    110: "#84978A",
    120: "#91A696",
    130: "#9FB5A3",
    140: "#ADC4AF",
    150: "#BCD4BC",
    160: "#CBE3C8",
  };

  const lightTheme: Theme = {
    ...createLightTheme(webinux),
  };

  return (
    <SessionProvider>
      <RendererProvider renderer={renderer}>
        <SSRProvider>
          <FluentProvider theme={lightTheme}>
            {children}
          </FluentProvider>
        </SSRProvider>
      </RendererProvider>
    </SessionProvider>
  );
}
