import { Logo } from "@/components/ui/logo";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t px-4 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-4">
            <Logo size="sm" />
            <p className="text-muted-foreground text-sm">
              © 2024 Pleeboo. Made with ❤️ for communities everywhere.
            </p>
          </div>
          <div className="flex gap-6 text-sm">
            <Link
              href="/pages/about"
              className="text-muted-foreground hover:text-foreground"
            >
              About
            </Link>
            <Link
              href="/pages/privacy"
              className="text-muted-foreground hover:text-foreground"
            >
              Privacy
            </Link>
            <Link
              href="/pages/terms"
              className="text-muted-foreground hover:text-foreground"
            >
              Terms
            </Link>
            <Link
              href="/board"
              className="text-muted-foreground hover:text-foreground"
            >
              Create Board
            </Link>
            <a
              href="https://github.com"
              className="text-muted-foreground hover:text-foreground"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
