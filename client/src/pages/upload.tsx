import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2, FolderUp, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Rubric } from "@shared/schema";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: "pending" | "uploading" | "complete" | "error";
  progress: number;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const academicLevels = [
  { value: "middle-school", label: "Middle School" },
  { value: "high-school", label: "High School" },
  { value: "2-year-college", label: "2-Year Technical College" },
  { value: "4-year-college", label: "4-Year College" },
  { value: "graduate-school", label: "Graduate School" },
];

export default function BulkUpload() {
  const { toast } = useToast();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedRubric, setSelectedRubric] = useState<string>("essay");
  const [selectedAcademicLevel, setSelectedAcademicLevel] = useState<string>("2-year-college");

  const { data: rubrics } = useQuery<Rubric[]>({
    queryKey: ['/api/rubrics'],
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
  }, []);

  const addFiles = (newFiles: File[]) => {
    const acceptedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    const validFiles: UploadedFile[] = [];
    let rejectedCount = 0;

    newFiles.forEach((file) => {
      if (acceptedTypes.includes(file.type) || file.name.endsWith(".doc") || file.name.endsWith(".docx") || file.name.endsWith(".pdf") || file.name.endsWith(".txt")) {
        validFiles.push({
          id: crypto.randomUUID(),
          name: file.name,
          size: file.size,
          status: "pending",
          progress: 0,
        });
      } else {
        rejectedCount++;
      }
    });

    if (rejectedCount > 0) {
      toast({
        title: `${rejectedCount} file(s) rejected`,
        description: "Only PDF, Word documents, and text files are accepted.",
        variant: "destructive",
      });
    }

    if (validFiles.length > 0) {
      setFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const simulateUpload = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select files to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setFiles((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, status: "uploading" as const } : f))
      );

      for (let progress = 0; progress <= 100; progress += 20) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        setFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, progress } : f))
        );
      }

      setFiles((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, status: "complete" as const, progress: 100 } : f))
      );
    }

    setIsUploading(false);
    toast({
      title: "Upload complete",
      description: `${files.length} assignment(s) uploaded successfully.`,
    });
  };

  const completedCount = files.filter((f) => f.status === "complete").length;
  const pendingCount = files.filter((f) => f.status === "pending" || f.status === "uploading").length;
  const allUploaded = files.length > 0 && completedCount === files.length;

  const handleProcessAssignments = async () => {
    if (!selectedRubric) {
      toast({
        title: "Rubric required",
        description: "Please select a rubric before processing.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    toast({
      title: "Processing started",
      description: `${completedCount} assignment(s) are being evaluated using the selected rubric.`,
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2" data-testid="text-upload-title">Bulk Upload</h1>
        <p className="text-muted-foreground" data-testid="text-upload-subtitle">
          Upload up to 400+ student assignments for AI-powered grading
        </p>
      </div>

      <Card
        className={`border-2 border-dashed transition-colors ${
          isDragOver ? "border-primary bg-primary/5" : "border-muted"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="py-12">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <FolderUp className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2" data-testid="text-dropzone-title">
              Drag and drop your assignments here
            </h3>
            <p className="text-muted-foreground mb-4">
              Supports PDF, Word documents (.doc, .docx), and text files
            </p>
            <div className="flex items-center justify-center gap-2">
              <label htmlFor="file-upload">
                <Button asChild data-testid="button-select-files">
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    Select Files
                  </span>
                </Button>
              </label>
              <input
                id="file-upload"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
                onChange={handleFileSelect}
                data-testid="input-file-upload"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg">Selected Files</CardTitle>
              <CardDescription>
                {completedCount} of {files.length} uploaded
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" data-testid="badge-file-count">
                {files.length} file{files.length !== 1 ? "s" : ""}
              </Badge>
              <Button
                onClick={simulateUpload}
                disabled={isUploading || pendingCount === 0}
                data-testid="button-start-upload"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload All
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {files.map((file, index) => (
                <div
                  key={file.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/30"
                  data-testid={`row-file-${index}`}
                >
                  <div className="w-10 h-10 rounded bg-background flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate" data-testid={`text-file-name-${index}`}>
                      {file.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </span>
                      {file.status === "uploading" && (
                        <Progress value={file.progress} className="w-24 h-1" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {file.status === "complete" && (
                      <Badge variant="secondary" className="bg-accent/20 text-accent-foreground">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Uploaded
                      </Badge>
                    )}
                    {file.status === "error" && (
                      <Badge variant="destructive">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Error
                      </Badge>
                    )}
                    {file.status === "uploading" && (
                      <Badge variant="secondary">
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Uploading
                      </Badge>
                    )}
                    {file.status !== "complete" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(file.id)}
                        disabled={file.status === "uploading"}
                        data-testid={`button-remove-file-${index}`}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {allUploaded && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg">Grading Configuration</CardTitle>
            <CardDescription>
              Configure how your {completedCount} assignment(s) will be evaluated
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="rubric-select">Rubric Type</Label>
                <Select
                  value={selectedRubric}
                  onValueChange={setSelectedRubric}
                >
                  <SelectTrigger id="rubric-select" data-testid="select-rubric">
                    <SelectValue placeholder="Select a rubric" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="essay">Essay Writing</SelectItem>
                    <SelectItem value="research-paper">Research Paper</SelectItem>
                    <SelectItem value="presentation">Presentation</SelectItem>
                    {rubrics?.filter(r => !r.is_template).map((rubric) => (
                      <SelectItem key={rubric.id} value={rubric.id.toString()}>
                        {rubric.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Select the rubric to use for evaluating assignments
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="level-select">Academic Level</Label>
                <Select
                  value={selectedAcademicLevel}
                  onValueChange={setSelectedAcademicLevel}
                >
                  <SelectTrigger id="level-select" data-testid="select-academic-level">
                    <SelectValue placeholder="Select academic level" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Grading expectations will be adjusted based on academic level
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Ready to process <span className="font-medium text-foreground">{completedCount}</span> assignment(s)
              </div>
              <Button
                onClick={handleProcessAssignments}
                disabled={isProcessing || !selectedRubric}
                data-testid="button-process-assignments"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit for Grading
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium">Supported Formats</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>PDF documents (.pdf)</li>
                <li>Word documents (.doc, .docx)</li>
                <li>Plain text files (.txt)</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Best Practices</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Include student name in filename</li>
                <li>Ensure documents are readable/not corrupted</li>
                <li>Maximum 400 files per batch</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}