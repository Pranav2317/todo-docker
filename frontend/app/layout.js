import "./globals.css";

export const metadata = {
  title: "Dock Tasks",
  description: "A to-do app running on Next.js, FastAPI and PostgreSQL in Docker",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
