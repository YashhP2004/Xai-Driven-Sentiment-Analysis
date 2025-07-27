
import { useState } from "react";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload } from "lucide-react";
import { toast } from "sonner";

interface FileUploadTabProps {
  setInputText: (text: string) => void;
}

export function FileUploadTab({ setInputText }: FileUploadTabProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "text/plain" || file.type === "text/csv" || file.type === "application/json") {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setInputText(event.target.result as string);
            toast("File uploaded successfully", {
              description: `${file.name} has been loaded for analysis.`,
            });
          }
        };
        reader.readAsText(file);
      } else {
        toast.error("Unsupported file format", {
          description: "Please upload a text file containing reviews.",
        });
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setInputText(event.target.result as string);
          toast("File uploaded successfully", {
            description: `${file.name} has been loaded for analysis.`,
          });
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <CardContent className="flex-1 pt-6">
      <div
        className={`border-2 border-dashed rounded-lg h-[calc(100vh-380px)] min-h-[200px] flex flex-col items-center justify-center p-6 transition-colors ${
          dragActive ? "border-secondary bg-secondary/5" : "border-muted-foreground/20"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleFileDrop}
      >
        <Upload className="h-10 w-10 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground mb-2">
          Drag and drop your review file here, or click to browse
        </p>
        <p className="text-xs text-muted-foreground">
          Supports: .txt files
        </p>
        
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => document.getElementById("fileInput")?.click()}
        >
          <FileText className="h-4 w-4 mr-2" />
          Choose File
        </Button>
        <input
          id="fileInput"
          type="file"
          accept=".txt"
          className="hidden"
          onChange={handleFileInput}
        />
      </div>
    </CardContent>
  );
}
