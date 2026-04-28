import { Metadata } from "next";
import UserInitializer from "@/components/UserInitializer";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function VisualizerLayout({ children }: { children: React.ReactNode }) {
  return <>
  < UserInitializer />
  {children}</>;
}
