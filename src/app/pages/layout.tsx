import { Footer } from "@/components/ui/footer";
import { Header } from "@/components/ui/header";

export default function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Header />

      <main className="px-4 py-12 md:px-8 lg:py-16">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border-2 border-border bg-background p-8 shadow-lg md:p-12">
            <article className="prose max-w-none">{children}</article>
          </div>
        </div>
      </main>

      <div className="mt-20">
        <Footer />
      </div>
    </div>
  );
}
