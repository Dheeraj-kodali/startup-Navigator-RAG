import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Startup Navigator. Helping entrepreneurs build the future.
        </p>
        <div className="flex space-x-6 text-sm text-muted-foreground">
          <Link href="/about" className="hover:text-primary transition-colors">About</Link>
          <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
          <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Resources</a>
        </div>
      </div>
    </footer>
  );
}
