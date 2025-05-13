
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_NAME } from "@/lib/constants";
import { CheckCircle, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary flex items-center">
          <ListTodoIcon className="w-7 h-7 mr-2" />
          {APP_NAME}
        </Link>
        <nav className="space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <section className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6">
            Organize Your Life with <span className="text-primary">{APP_NAME}</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground mb-10">
            Simplify your tasks, boost your productivity, and achieve your goals with an intuitive and powerful task manager.
          </p>
          <Button size="lg" className="text-lg px-8 py-6 shadow-lg hover:shadow-primary/30 transition-shadow duration-300" asChild>
            <Link href="/dashboard">
              Get Started <Zap className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <div className="mt-16">
            <Image 
              src="https://picsum.photos/1200/600?grayscale" 
              alt="TaskMaster application interface showing tasks"
              data-ai-hint="productivity app interface"
              width={1200} 
              height={600} 
              className="rounded-xl shadow-2xl mx-auto object-cover"
              priority
            />
          </div>
        </section>

        <section className="py-20 md:py-32">
          <h2 className="text-3xl font-bold text-center text-foreground mb-16">Why Choose {APP_NAME}?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<CheckCircle className="h-8 w-8 text-primary" />}
              title="Effortless Task Management"
              description="Create, organize, and prioritize tasks with ease. Due dates, subtasks, and tags keep you on track."
            />
            <FeatureCard
              icon={<AISuggestionIcon className="h-8 w-8 text-primary" />}
              title="AI-Powered Categories"
              description="Smart suggestions for task categories help you classify your work and personal life seamlessly."
            />
            <FeatureCard
              icon={<BellIcon className="h-8 w-8 text-primary" />}
              title="Timely Reminders"
              description="Never miss a deadline with our flexible reminder system. Stay ahead of your schedule."
            />
          </div>
        </section>
      </main>

      <footer className="py-8 text-center text-muted-foreground border-t">
        <p>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
          {icon}
        </div>
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  );
}

// Minimalist Icons
function ListTodoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="6" height="6" rx="1" />
      <path d="m3 17 2 2 4-4" />
      <rect x="15" y="5" width="6" height="6" rx="1" />
      <path d="m15 17 2 2 4-4" />
    </svg>
  );
}

function AISuggestionIcon(props: React.SVGProps<SVGSVGElement>) { // Placeholder for AI icon
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
      <path d="M12 17h.01"/>
      <path d="M2.5 10.5c0-2.31.91-4.44 2.4-6A8 8 0 0 1 12 2a8 8 0 0 1 7.1 6.5"/>
      <path d="M12 22a8 8 0 0 0 4.9-1.7l2.4-1.8A2.5 2.5 0 0 0 21.5 16V8"/>
      <path d="M2.5 16A2.5 2.5 0 0 1 0 13.5v-6A2.5 2.5 0 0 1 2.5 5"/>
    </svg>
  );
}

function BellIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}
