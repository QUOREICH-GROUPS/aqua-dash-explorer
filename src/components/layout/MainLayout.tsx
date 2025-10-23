import { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Header } from './Header';
import { AppSidebar } from './Sidebar';
import { Footer } from './Footer';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full flex-col">
        <Header />
        
        <div className="flex flex-1 w-full">
          <AppSidebar />
          
          <main className="flex-1 overflow-auto bg-gradient-to-br from-background via-background to-secondary/20">
            <div className="container mx-auto p-6">
              {children}
            </div>
          </main>
        </div>
        
        <Footer />
      </div>
    </SidebarProvider>
  );
};
