import type { Metadata } from "next";
import "./globals.css";
import NavLink from "@/components/NavLink";

export const metadata: Metadata = {
  title: "JTL Content Optimizer",
  description: "AI-powered social content optimizer for Javon Technology Ltd.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <aside className="sidebar">
            <div className="sidebar-brand">
              <h1>JTL Content<br />Optimizer</h1>
              <p>Javon Technology Ltd.</p>
            </div>
            <nav className="sidebar-nav">
              <NavLink href="/create">
                <span className="nav-icon">✦</span>
                <span>Create</span>
              </NavLink>
              <NavLink href="/log">
                <span className="nav-icon">◈</span>
                <span>Log</span>
              </NavLink>
              <NavLink href="/dashboard">
                <span className="nav-icon">▦</span>
                <span>Dashboard</span>
              </NavLink>
              <NavLink href="/insights">
                <span className="nav-icon">◉</span>
                <span>Insights</span>
              </NavLink>
            </nav>
          </aside>
          <main className="main-content">{children}</main>
        </div>
      </body>
    </html>
  );
}
