import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Moon, Sun, FileText } from "lucide-react";

interface NavigationProps {
  onCreateInvoice: () => void;
  onShowRecent: () => void;
  onNavigateHome?: () => void;
}

export function Navigation({ onCreateInvoice, onShowRecent, onNavigateHome }: NavigationProps) {
  const { theme, toggleTheme } = useTheme();

  const handleLogoClick = () => {
    // Navigate to home/landing page using the callback if provided
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      // Fallback to reload if no navigation handler is provided
      window.location.reload();
    }
  };

  return (
    <nav className="fixed top-0 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-50 border-b border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-18 lg:h-20">
          <button 
            onClick={handleLogoClick}
            className="flex items-center space-x-2 sm:space-x-3 cursor-pointer hover:opacity-80 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg p-2 -m-2 group"
            aria-label="Navigate to home"
          >
            <div className="relative flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="Easy Invoice Logo" 
                className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg object-contain group-hover:scale-105 transition-transform duration-200"
                style={{ maxWidth: 'none', maxHeight: 'none' }}
              />
            </div>
            <span className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
              <span className="hidden sm:inline">Easy Invoice</span>
              <span className="sm:hidden">Easy</span>
            </span>
          </button>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 h-8 w-8 sm:h-9 sm:w-9"
            >
              {theme === "dark" ? <Sun className="h-3 w-3 sm:h-4 sm:w-4" /> : <Moon className="h-3 w-3 sm:h-4 sm:w-4" />}
            </Button>
            <Button
              variant="ghost"
              onClick={onShowRecent}
              className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm sm:text-base px-2 sm:px-3"
            >
              <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Recent Invoices</span>
              <span className="sm:hidden">Recent</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
