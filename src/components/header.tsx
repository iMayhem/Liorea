import Link from "next/link";
import { AppLogo } from "./icons";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <AppLogo />
            <span className="font-bold">NEET Trackr</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
           <Button asChild variant="ghost" size="sm">
             <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Calendar
             </Link>
           </Button>
        </div>
      </div>
    </header>
  );
}
