
import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LessonData } from '@/types/lesson';
import { useLessonProcessor } from '@/hooks/useLessonProcessor';

interface FileUploadProps {
  onUploadComplete: (lessonData: LessonData) => void;
  chunkSize?: number;
}

const FileUpload = ({ onUploadComplete, chunkSize = 18 }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { processFileToLesson, isProcessing, processingProgress } = useLessonProcessor();

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

  const handleFile = async (file: File) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    
    if (!validTypes.includes(file.type)) {
      alert('Please upload a PDF, DOCX, or TXT file');
      return;
    }

    setUploadedFile(file);
    
    try {
      const lessonData = await processFileToLesson(file, chunkSize);
      onUploadComplete(lessonData);
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file. Please try again.');
    }
  };

  if (isProcessing) {
    return (
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-blue-600">Processing Your Document</CardTitle>
          <CardDescription className="text-gray-600">
            We're analyzing your content and creating interactive exercises
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
              <FileText className="h-10 w-10 text-white" />
            </div>
            <h3 className="font-semibold mb-2 text-lg">{uploadedFile?.name}</h3>
            <p className="text-gray-600 mb-4">
              {processingProgress < 30 && "Extracting text content..."}
              {processingProgress >= 30 && processingProgress < 60 && "Creating semantic chunks..."}
              {processingProgress >= 60 && processingProgress < 90 && "Generating comprehension questions..."}
              {processingProgress >= 90 && "Finalizing exercises..."}
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progress</span>
              <span>{Math.round(processingProgress)}%</span>
            </div>
            <Progress value={processingProgress} className="w-full h-3" />
          </div>

          {processingProgress === 100 && (
            <div className="text-center animate-fade-in">
              <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-3" />
              <p className="text-green-600 font-semibold text-lg">Processing Complete!</p>
              <p className="text-gray-600">Ready to start learning</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Upload Your Learning Material
        </CardTitle>
        <CardDescription className="text-gray-600">
          Upload PDF, DOCX, or TXT files to create interactive typing exercises
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
            isDragging
              ? 'border-blue-500 bg-blue-50 scale-105'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2 text-gray-700">Drop your files here</h3>
          <p className="text-gray-600 mb-6">
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
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            Choose File
          </Button>
          
          <p className="text-sm text-gray-500 mt-6">
            Supported formats: PDF, DOCX, TXT • Max size: 10MB
          </p>
        </div>

        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
          <h4 className="font-semibold text-gray-800 mb-3">What happens next?</h4>
          <ul className="text-sm text-gray-700 space-y-2">
            <li className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              Content split into 16-20 word semantic chunks
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
              Interactive typing exercises generated
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              AI-powered comprehension questions created
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
              Progress tracking and gamification enabled
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUpload;
