import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">

      <div className="absolute top-4 right-4 flex items-center gap-2">
        <Link href="/sign-in">
          <Button variant="outline">Sign In</Button>
        </Link>

        <ThemeToggle />
      </div>

      <div className="flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold">Code-GPT</h1>
        <p className="text-sm text-muted-foreground">
          Code-GPT is a platform for generating code
        </p>
      </div>
      <div className="flex flex-col items-center justify-center">
        <Link href="/sign-up">
          <Button className="group">
            Get Started for free
            <ArrowRightIcon className="size-4 group-hover:translate-x-1 transition-all duration-300" />
          </Button>
        </Link>
      </div>
    </div>
  );
}