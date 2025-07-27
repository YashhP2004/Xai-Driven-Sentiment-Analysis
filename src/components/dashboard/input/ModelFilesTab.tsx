
import { useState } from "react";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileBox } from "lucide-react";
import { toast } from "sonner";

interface ModelFile {
  modelFile?: File;
  encoderFile?: File;
}

interface ModelFilesTabProps {
  modelFiles: ModelFile;
  setModelFiles: (files: ModelFile) => void;
}

export function ModelFilesTab({ modelFiles, setModelFiles }: ModelFilesTabProps) {
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

  const handleModelFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files).forEach(file => {
        if (file.name.endsWith('.pth')) {
          setModelFiles({
            ...modelFiles,
            modelFile: file
          });
          toast("Model file uploaded", {
            description: `${file.name} has been loaded.`,
          });
        } else if (file.name.endsWith('.pkl')) {
          setModelFiles({
            ...modelFiles,
            encoderFile: file
          });
          toast("Encoder file uploaded", {
            description: `${file.name} has been loaded.`,
          });
        } else {
          toast.error("Unsupported file format", {
            description: "Please upload .pth or .pkl files for the model.",
          });
        }
      });
    }
  };

  const handleModelFileInput = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'model' | 'encoder') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (fileType === 'model') {
        setModelFiles({
          ...modelFiles,
          modelFile: file
        });
        toast("Model file uploaded", {
          description: `${file.name} has been loaded.`,
        });
      } else {
        setModelFiles({
          ...modelFiles,
          encoderFile: file
        });
        toast("Encoder file uploaded", {
          description: `${file.name} has been loaded.`,
        });
      }
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
        onDrop={handleModelFileDrop}
      >
        <FileBox className="h-10 w-10 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground mb-2">
          Drag and drop your model files here, or click to browse
        </p>
        <p className="text-xs text-muted-foreground">
          Supports: .pth (model) and .pkl (encoder) files
        </p>
        
        <div className="flex flex-wrap gap-4 justify-center mt-6">
          <Button
            variant="outline"
            className="flex items-center"
            onClick={() => document.getElementById("modelInput")?.click()}
          >
            <FileBox className="h-4 w-4 mr-2" />
            Model File (.pth)
          </Button>
          <Button
            variant="outline"
            className="flex items-center"
            onClick={() => document.getElementById("encoderInput")?.click()}
          >
            <FileBox className="h-4 w-4 mr-2" />
            Encoder File (.pkl)
          </Button>
        </div>
        
        <div className="mt-6 w-full">
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded p-4">
              <h4 className="text-sm font-medium mb-2">Model File</h4>
              <p className="text-xs text-muted-foreground">
                {modelFiles.modelFile ? modelFiles.modelFile.name : "No file selected"}
              </p>
            </div>
            <div className="border rounded p-4">
              <h4 className="text-sm font-medium mb-2">Encoder File</h4>
              <p className="text-xs text-muted-foreground">
                {modelFiles.encoderFile ? modelFiles.encoderFile.name : "No file selected"}
              </p>
            </div>
          </div>
        </div>
        
        <input
          id="modelInput"
          type="file"
          accept=".pth"
          className="hidden"
          onChange={(e) => handleModelFileInput(e, 'model')}
        />
        <input
          id="encoderInput"
          type="file"
          accept=".pkl"
          className="hidden"
          onChange={(e) => handleModelFileInput(e, 'encoder')}
        />
      </div>
    </CardContent>
  );
}
