import type { Metadata } from "next";
import "./globals.css";
import { NavigationProgressProvider } from "@/components/NavigationProgress";
import { PwaRegister } from "@/components/PwaRegister";
import { getChurchName } from "@/lib/config";

export const metadata: Metadata = {
  title: getChurchName(),
  description: "Sisitemu yo gufasha Nyanza SDA Church",
  manifest: "/manifest.json",
  applicationName: getChurchName(),
  appleWebApp: {
    capable: true,
    title: getChurchName(),
    statusBarStyle: "default"
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }
    ]
  }
};

export const viewport = {
  themeColor: "#0f6470"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="rw">
      <body>
        <NavigationProgressProvider>
          <PwaRegister />
          {children}
        </NavigationProgressProvider>
      </body>
    </html>
  );
}
