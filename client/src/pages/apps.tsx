import { useQuery } from "@tanstack/react-query";
import { Download, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function Apps() {
  const { toast } = useToast();

  // Fetch user subscription to check tier
  const { data: subscription } = useQuery({
    queryKey: ['/api/user/subscription'],
    queryFn: async () => {
      const response = await fetch('/api/user/subscription', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch subscription');
      const data = await response.json();
      return data.subscription;
    },
  });

  const userTier = subscription?.tier || 'free';
  const hasAnonymizerAccess = ['pro', 'plus', 'admin'].includes(userTier);

  const handleDownload = async () => {
    try {
      const response = await fetch('/api/apps/anonymizer/download', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        toast({
          title: 'Access Denied',
          description: error.error,
          variant: 'destructive',
        });
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'grader-anonymizer.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Download Started',
        description: 'Anonymizer app is downloading...',
      });
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: 'Unable to download anonymizer',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Apps & Tools</h1>
        <p className="text-muted-foreground">
          Additional tools available with your subscription
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {hasAnonymizerAccess ? (
                <Download className="h-5 w-5 text-primary" />
              ) : (
                <Lock className="h-5 w-5 text-muted-foreground" />
              )}
              Anonymizer App
            </CardTitle>
            <CardDescription>
              Desktop tool to remove student identifiers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasAnonymizerAccess ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Windows desktop application to anonymize student submissions before grading.
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                    <li>Remove student names</li>
                    <li>Strip metadata</li>
                    <li>Batch processing</li>
                    <li>Preserve formatting</li>
                  </ul>
                </div>
                <Button onClick={handleDownload} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download for Windows
                </Button>
                <p className="text-xs text-muted-foreground">
                  Version 1.0 • Requires Windows 10 or later
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Available with Pro or Plus subscription
                </p>
                <Button variant="default" className="w-full" asChild>
                  <a href="/subscriptions">
                    Upgrade to Pro
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="opacity-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-muted-foreground" />
              More Tools Coming Soon
            </CardTitle>
            <CardDescription>
              Additional apps in development
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              We're working on more tools to enhance your grading workflow.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}