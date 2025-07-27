
import { useState } from "react";
import { CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface TextInputTabProps {
  inputText: string;
  setInputText: (text: string) => void;
}

export function TextInputTab({ inputText, setInputText }: TextInputTabProps) {
  return (
    <CardContent className="flex-1 pt-6">
      <Textarea
        placeholder="Enter your review here..."
        className="h-[calc(100vh-380px)] min-h-[200px] resize-none"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />
    </CardContent>
  );
}
