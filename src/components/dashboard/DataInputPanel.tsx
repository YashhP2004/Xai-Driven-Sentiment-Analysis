
import { useState } from "react";
import { FilePenLine, FileText, FileBox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { SentimentResult } from "@/utils/sentimentAnalysis";
import { TextInputTab } from "./input/TextInputTab";
import { FileUploadTab } from "./input/FileUploadTab";
import { ModelFilesTab } from "./input/ModelFilesTab";
import { PrivacyFooter } from "./input/PrivacyFooter";
import { performSentimentAnalysis } from "./input/AnalysisService";

interface DataInputPanelProps {
  onAnalysisComplete: (result: any) => void;
}

export function DataInputPanel({ onAnalysisComplete }: DataInputPanelProps) {
  const [inputText, setInputText] = useState("");
  const [modelFiles, setModelFiles] = useState<{
    modelFile?: File;
    encoderFile?: File;
  }>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSubmit = async () => {
    if (!inputText.trim()) {
      toast.error("Input is required", {
        description: "Please provide a review for sentiment analysis.",
      });
      return;
    }

    setIsAnalyzing(true);
    toast("Analysis started", {
      description: "Your review is being analyzed. Results will appear soon.",
    });
    
    try {
      const result = await performSentimentAnalysis(inputText);
      console.log('Analysis result:', result);
      
      onAnalysisComplete(result);
      
      toast.success("Analysis complete", {
        description: `Sentiment detected: ${result.sentiment}`,
      });
    } catch (error) {
      console.error("Analysis failed:", error);
      toast.error("Analysis failed", {
        description: "Unable to analyze the text. Please try again.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Review Input</CardTitle>
        <CardDescription>
          Enter or upload a review to analyze its sentiment
        </CardDescription>
      </CardHeader>
      <Tabs defaultValue="text" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="text" className="flex items-center gap-1">
            <FilePenLine className="h-4 w-4" />
            <span>Text Input</span>
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span>File Upload</span>
          </TabsTrigger>
          <TabsTrigger value="model" className="flex items-center gap-1">
            <FileBox className="h-4 w-4" />
            <span>Model Files</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="text" className="flex-1 flex flex-col">
          <TextInputTab inputText={inputText} setInputText={setInputText} />
        </TabsContent>
        
        <TabsContent value="upload" className="flex-1 flex flex-col">
          <FileUploadTab setInputText={setInputText} />
        </TabsContent>
        
        <TabsContent value="model" className="flex-1 flex flex-col">
          <ModelFilesTab modelFiles={modelFiles} setModelFiles={setModelFiles} />
        </TabsContent>
      </Tabs>
      <PrivacyFooter />
      <div className="px-6 pb-6">
        <Button
          className="w-full"
          size="lg"
          onClick={handleSubmit}
          disabled={!inputText.trim() || isAnalyzing}
        >
          {isAnalyzing ? "Analyzing..." : "Analyze Sentiment"}
        </Button>
      </div>
    </Card>
  );
}
