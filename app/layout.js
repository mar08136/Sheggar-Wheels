
import "./globals.css";
import DemoDataInitializer from "./components/DemoDataInitializer";

export const metadata = {
  title: "Sheggar Wheels | Premium Car Rentals in Addis Ababa",
  description:
    "Discover and rent exceptional cars in Addis Ababa with Sheggar Wheels. Explore vehicles, compare daily rates, and plan your next journey.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <DemoDataInitializer />
        {children}
      </body>
    </html>
  );
}
