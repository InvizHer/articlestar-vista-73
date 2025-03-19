
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import Articles from "./pages/Articles";
import Article from "./pages/Article";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminArticles from "./pages/AdminArticles";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminComments from "./pages/AdminComments";
import AdminSettings from "./pages/AdminSettings";
import ArticleEditor from "./pages/ArticleEditor";
import { AdminProvider } from "./context/AdminContext";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import { ThemeProvider } from "./hooks/use-theme";
import { setupDatabase } from "./integrations/supabase/setup";

const queryClient = new QueryClient();

const App = () => {
  const [isDbSetup, setIsDbSetup] = useState(false);
  const [isDbLoading, setIsDbLoading] = useState(true);
  const [setupError, setSetupError] = useState<string | null>(null);

  useEffect(() => {
    const initDatabase = async () => {
      try {
        setIsDbLoading(true);
        const result = await setupDatabase();
        setIsDbSetup(result);
        if (!result) {
          setSetupError("Unable to set up database. Check console for details.");
        }
      } catch (error) {
        console.error("Database setup failed:", error);
        setSetupError("Database setup failed. Check console for details.");
        setIsDbSetup(false);
      } finally {
        setIsDbLoading(false);
      }
    };

    initDatabase();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" defaultColor="purple">
        <AdminProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            {isDbLoading && (
              <div className="bg-blue-500 text-white p-2 text-center">
                Setting up database, please wait...
              </div>
            )}
            {setupError && (
              <div className="bg-red-500 text-white p-2 text-center">
                {setupError}
              </div>
            )}
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/articles" element={<Articles />} />
                <Route path="/article/:slug" element={<Article />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/admin" element={<Admin />} />
                <Route 
                  path="/admin/dashboard" 
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/articles" 
                  element={
                    <ProtectedRoute>
                      <AdminArticles />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/comments" 
                  element={
                    <ProtectedRoute>
                      <AdminComments />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/analytics" 
                  element={
                    <ProtectedRoute>
                      <AdminAnalytics />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/settings" 
                  element={
                    <ProtectedRoute>
                      <AdminSettings />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/article/:articleId" 
                  element={
                    <ProtectedRoute>
                      <ArticleEditor />
                    </ProtectedRoute>
                  } 
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AdminProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
