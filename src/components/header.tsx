import { AppLogo } from "@/components/icons";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-2">
        <AppLogo />
        <h1 className="font-headline text-xl font-bold tracking-tight text-accent">
          NEET Trackr
        </h1>
      </div>
    </header>
  );
}
