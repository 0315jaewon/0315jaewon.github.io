import "./globals.css";
import Providers from "../components/Providers";
import AppShell from "../components/AppShell";

export const metadata = {
  title: "Research Ops Planner",
  description: "Time-boxed planning for research, recruiting, and classes."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
