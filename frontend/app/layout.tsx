import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import '../styles/globals.css';
import { CartProvider } from '../components/CartContext';
import { AuthProvider } from '../components/AuthContext';
import { AuthModal } from '../components/AuthModal';
import { AlertProvider } from '../components/AlertContext';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'สั่งอาหารร้านเดียว',
  description: 'ระบบสั่งอาหารสำหรับร้านเดียว'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className={spaceGrotesk.className}>
        <AlertProvider>
          <AuthProvider>
            <CartProvider>
              {children}
              <AuthModal />
            </CartProvider>
          </AuthProvider>
        </AlertProvider>
      </body>
    </html>
  );
}
