import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from './context/toastContext';

export const metadata = {
  title: "ShareSpace-blog",
  description: "ShareSpace App",
  icons: {
    icon: '/favicon.webp?v=1',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>  
        <ToastProvider>
          {children}
        </ToastProvider>
        
        {/* <Toaster
          position="top-center"
          toastOptions={{
            duration: 5000,
            style: {
              fontSize: '10px',
              borderRadius: '50px',
            },
          }}
        /> */}
      </body>
    </html>
  );
}
