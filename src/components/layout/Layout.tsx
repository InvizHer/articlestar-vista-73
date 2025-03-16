
import React from "react";
import Navigation from "./Navigation";
import Footer from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, fullWidth = false }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main className={`flex-grow ${fullWidth ? "" : "container mx-auto px-4 py-6 sm:px-6 lg:px-8"}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
