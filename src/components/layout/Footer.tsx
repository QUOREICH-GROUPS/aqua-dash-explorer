import { Heart } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>© {currentYear} Gestion des Plans d'Eau</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              Créé avec <Heart className="h-3 w-3 text-destructive fill-destructive" /> pour l'environnement
            </span>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span className="font-mono">v1.0.0</span>
            <a href="#" className="hover:text-foreground transition-colors">
              Documentation
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Support
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Licence
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
