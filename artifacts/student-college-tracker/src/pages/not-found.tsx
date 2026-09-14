import { Card, CardContent } from '@workspace/studywell-design-system/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="grain flex min-h-screen w-full items-center justify-center bg-background px-5">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-[hsl(var(--destructive))]" />
            <h1 className="font-display text-2xl font-semibold">
              404 Page Not Found
            </h1>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            This page is not part of your Attendex workspace yet.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
