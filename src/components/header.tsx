import Link from "next/link";
import { Tv } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-14 items-center gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <Tv className="h-5 w-5 text-primary" />
          StreamHub
        </Link>
        <nav className="ml-auto flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            TV Shows
          </Link>
        </nav>
      </div>
    </header>
  );
}
