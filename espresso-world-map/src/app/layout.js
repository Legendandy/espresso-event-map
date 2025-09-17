import './globals.css';

export const metadata = {
  title: 'Espresso System World Events',
  description: 'Discover Espressosys events around the world',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}