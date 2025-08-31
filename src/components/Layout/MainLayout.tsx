'use client';

import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import { SidebarProvider } from '../../contexts/SidebarContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

function LayoutContent({ children }: MainLayoutProps) {

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header />
        
        {/* Main content area */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
        
        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
}