
import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface FileUploadProps {
  onUploadComplete: (file: File) => void;
  isProcessing: boolean;
  uploadProgress: number;
}

const FileUpload = ({ onUploadComplete, isProcessing, uploadProgress }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    
    if (!validTypes.includes(file.type)) {
      alert('Please upload a PDF, DOCX, or TXT file');
      return;
    }

    setUploadedFile(file);
    onUploadComplete(file);
  };

  if (isProcessing) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle>Processing Your Document</CardTitle>
          <CardDescription>
            We're analyzing your content and creating interactive exercises
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">{uploadedFile?.name}</h3>
            <p className="text-sm text-gray-600 mb-4">
              {uploadProgress < 30 && "Extracting text content..."}
              {uploadProgress >= 30 && uploadProgress < 60 && "Creating content chunks..."}
              {uploadProgress >= 60 && uploadProgress < 90 && "Generating comprehension questions..."}
              {uploadProgress >= 90 && "Finalizing exercises..."}
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progress</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>

          {uploadProgress === 100 && (
            <div className="text-center">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-2" />
              <p className="text-green-600 font-semibold">Processing Complete!</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Upload Your Learning Material</CardTitle>
        <CardDescription>
          Upload PDF, DOCX, or TXT files to create interactive typing exercises
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">Drop your files here</h3>
          <p className="text-gray-600 mb-4">
            or click to browse your computer
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            Choose File
          </Button>
          
          <p className="text-sm text-gray-500 mt-4">
            Supported formats: PDF, DOCX, TXT (Max size: 10MB)
          </p>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">What happens next?</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Your document will be processed and split into manageable chunks</li>
            <li>• Interactive typing exercises will be generated</li>
            <li>• Comprehension questions will be created using AI</li>
            <li>• You'll be able to track your progress and performance</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUpload;
