import "./globals.css";
import { CartProvider } from "./context/CartContext";
import MainLayoutWrapper from "./components/MainLayoutWrapper";

export const metadata = {
  title: "Navvyata — Kids Apparel",
  description: "Fun, comfy, and durable styles for every adventure — from newborns to tweens. 100% OEKO-TEX certified skin-safe fabrics.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <MainLayoutWrapper>
            {children}
          </MainLayoutWrapper>
        </CartProvider>
      </body>
    </html>
  );
}
