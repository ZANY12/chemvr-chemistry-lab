import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-destructive/50 bg-destructive/5">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <h1 className="text-2xl font-bold text-foreground">404 Page Not Found</h1>
          </div>
          
          <p className="mt-4 text-sm text-muted-foreground mb-6">
            The requested simulation coordinates could not be resolved. The page you are looking for does not exist in this reality.
          </p>

          <Link href="/">
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              Return to Lab
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
