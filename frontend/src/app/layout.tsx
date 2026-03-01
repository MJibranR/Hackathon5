import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NovaSaaS Support Dashboard",
  description: "AI-Powered Customer Success Agent Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-50`}>
        <div className="flex flex-col md:flex-row min-h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <main className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-8">
              {children}
            </main>
            <footer className="border-t border-slate-800 p-6 text-center">
              <p className="text-slate-500 text-sm font-medium tracking-wide">
                &copy; 2026 NovaSaaS • Made by <span className="text-indigo-400">Muhammad Jibran Rehan</span>
              </p>
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
