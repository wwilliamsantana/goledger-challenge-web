import Link from "next/link";
import { Tv } from "lucide-react";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-xl border-b border-border/30">
      <div className="container mx-auto flex h-16 items-center gap-4 px-4">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight group">
          <div className="relative">
            <Tv className="h-5 w-5 text-primary transition-transform duration-300 group-hover:scale-110" />
            <div className="absolute inset-0 blur-md bg-primary/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <span className="gradient-text">StreamHub</span>
        </Link>
        <nav className="ml-auto flex items-center gap-6 text-sm">
          <Link
            href="/"
            className="text-muted-foreground hover:text-primary transition-colors duration-300 relative after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
          >
            TV Shows
          </Link>
          <Link
            href="/sobre"
            className="text-muted-foreground hover:text-primary transition-colors duration-300 relative after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
          >
            Sobre
          </Link>
        </nav>
      </div>
    </header>
  );
}
