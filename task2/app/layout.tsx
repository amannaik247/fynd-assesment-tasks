import './globals.css';
export const metadata = { title: 'Fynd Feedback', description: 'User feedback form' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-black text-white">
      <body>{children}</body>
    </html>
  );
}
