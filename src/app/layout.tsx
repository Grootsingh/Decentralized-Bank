import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { type ReactNode } from "react";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";
import { Providers } from "./providers";
import { config } from "@/wagmi";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Decentralized Bank",
  description: "A Decentralized bank Smart Contract",
  icons: {
    icon: {
      type: "image/svg+xml",
      url: "/favicon.svg",
    },
  },
};

export default function RootLayout(props: { children: ReactNode }) {
  const initialState = cookieToInitialState(config, headers().get("cookie"));
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers initialState={initialState}>{props.children}</Providers>
      </body>
    </html>
  );
}
