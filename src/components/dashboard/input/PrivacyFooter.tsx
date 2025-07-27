
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { CardFooter } from "@/components/ui/card";

export function PrivacyFooter() {
  return (
    <CardFooter className="flex flex-col border-t p-4">
      <Alert variant="default" className="w-full mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Privacy Note</AlertTitle>
        <AlertDescription>
          Your review will be sent to our API for analysis.
        </AlertDescription>
      </Alert>
    </CardFooter>
  );
}
