
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserNav } from "./user-nav";
import { APP_NAME } from "@/lib/constants";
import { Menu, ListTodo } from "lucide-react";
import { Sheet, SheetContent, SheetClose, SheetTrigger } from "@/components/ui/sheet";


export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
            <ListTodo className="h-6 w-6 text-primary" />
            <span className="font-bold sm:inline-block">{APP_NAME}</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/dashboard"
              className="transition-colors hover:text-foreground/80 text-foreground" // Active link styling might be desired
            >
              Tasks
            </Link>
            <Link
              href="/dashboard/archive"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Archive
            </Link>
            <Link
              href="/dashboard/settings"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Settings
            </Link>
          </nav>
        </div>
        
        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden mr-2"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
             <SheetClose asChild>
                <Link
                href="/dashboard"
                className="flex items-center space-x-2 px-4 py-2 border-b mb-2"
                >
                <ListTodo className="h-6 w-6 text-primary" />
                <span className="font-bold">{APP_NAME}</span>
                </Link>
            </SheetClose>
            <div className="space-y-1 p-2">
              <SheetClose asChild>
                <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/dashboard">Tasks</Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/dashboard/archive">Archive</Link>
                </Button>
              </SheetClose>
               <SheetClose asChild>
                <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/dashboard/settings">Settings</Link>
                </Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
        
        <div className="flex flex-1 items-center justify-end space-x-2">
          <UserNav />
        </div>
      </div>
    </header>
  );
}
