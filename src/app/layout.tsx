import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { CartProvider } from "@/components/cart-provider";
import { AssistantTriggerBridge } from "@/components/assistant-trigger-bridge";
import { CommerceProvider } from "@/components/commerce-provider";
import { CustomerAssistant } from "@/components/customer-assistant";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Sunshine | Everyday finds for India",
    template: "%s | Sunshine",
  },
  description:
    "An Indian retail experience with conversational shopping and reliable order support.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${dmSans.variable} ${fraunces.variable}`}>
      <body>
        <CommerceProvider>
          <CartProvider>
            <Header />
            <main>{children}</main>
            <Footer />
            <AssistantTriggerBridge />
            <CustomerAssistant />
          </CartProvider>
        </CommerceProvider>
      </body>
    </html>
  );
}
