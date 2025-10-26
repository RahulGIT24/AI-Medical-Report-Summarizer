import { useState, useRef, useEffect } from "react"
import { 
  Upload, 
  X, 
  FileText, 
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  File,
  Clock
} from "lucide-react"
import { useNavigate } from "react-router"
import { apiCall } from "../lib/apiCall"
import { toast } from "react-toastify"

interface Report {
  id: number;
  url: string;
  data_extracted: boolean;
  enqueued: boolean;
  error: boolean;
  errormsg: string;
  created_at: string;
  file?: File;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
  preview?: string;
}

const UploadReportsPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [enqueuedReports, setEnqueuedReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnqueuedReports();
  }, []);

  const fetchEnqueuedReports = async () => {
    try {
      setLoading(true);
      const response = await apiCall("user/reports-enqueued");
      setEnqueuedReports(response);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name} is not a valid file type`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error(`${file.name} is too large (max 10MB)`);
        return false;
      }
      return true;
    });

    validFiles.forEach(file => uploadFile(file));
  };

  const uploadFile = async (file: File) => {
    // Create preview for images
    let preview: string | undefined;
    if (file.type.startsWith('image/')) {
      preview = URL.createObjectURL(file);
    }

    const uploadingFile: UploadingFile = {
      file,
      progress: 0,
      status: 'uploading',
      preview
    };

    setUploadingFiles(prev => [...prev, uploadingFile]);

    try {
      const formData = new FormData();
      formData.append('files', file);

      // Simulate progress (replace with actual upload logic)
      const uploadPromise = apiCall("/report/upload",'POST', formData, "multipart/form-data");

      // Simulate progress updates
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 10;
        if (progress <= 90) {
          setUploadingFiles(prev => prev.map(f => 
            f.file === file ? { ...f, progress } : f
          ));
        }
      }, 200);

      const response = await uploadPromise;
      clearInterval(progressInterval);

      // Update to success
      setUploadingFiles(prev => prev.map(f => 
        f.file === file 
          ? { ...f, progress: 100, status: 'success' } 
          : f
      ));

      toast.success(`${file.name} uploaded successfully`);
      
      // Refresh enqueued reports
      fetchEnqueuedReports();

      // Remove from uploading list after 2 seconds
      setTimeout(() => {
        setUploadingFiles(prev => prev.filter(f => f.file !== file));
      }, 2000);

    } catch (error) {
      setUploadingFiles(prev => prev.map(f => 
        f.file === file 
          ? { ...f, status: 'error', error: 'Upload failed' } 
          : f
      ));
      toast.error(`Failed to upload ${file.name}`);
    }
  };

  const removeUploadingFile = (file: File) => {
    setUploadingFiles(prev => prev.filter(f => f.file !== file));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-slate-900 to-gray-900">
      {/* Header */}
      <div className="bg-gray-800/60 backdrop-blur-xl border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Upload Health Reports</h1>
                <p className="text-sm text-gray-400">Upload your medical reports for AI analysis</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Upload Area */}
        <div className="bg-gray-800/60 backdrop-blur-xl rounded-3xl border border-gray-700 p-8">
          <div
            className={`relative border-2 border-dashed rounded-2xl p-12 transition-all duration-300 ${
              dragActive 
                ? 'border-blue-500 bg-blue-500/10' 
                : 'border-gray-600 hover:border-gray-500'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={handleFileInput}
              className="hidden"
            />
            
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-linear-to-br from-blue-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto">
                <Upload className="text-white" size={40} />
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Drop your files here
                </h3>
                <p className="text-gray-400 mb-4">
                  or click to browse from your device
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-linear-to-r from-blue-600 to-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105"
                >
                  Choose Files
                </button>
              </div>

              <div className="pt-4 border-t border-gray-700">
                <p className="text-sm text-gray-500">
                  Supported formats: JPG, PNG, PDF • Max size: 10MB
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Uploading Files */}
        {uploadingFiles.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Uploading</h2>
            {uploadingFiles.map((uploadFile, index) => (
              <div
                key={index}
                className="bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-700 p-4"
              >
                <div className="flex items-center space-x-4">
                  {/* Preview */}
                  <div className="w-16 h-16 bg-gray-900 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                    {uploadFile.preview ? (
                      <img src={uploadFile.preview} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <File className="text-gray-600" size={32} />
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white font-medium truncate">{uploadFile.file.name}</p>
                      <button
                        onClick={() => removeUploadingFile(uploadFile.file)}
                        className="text-gray-400 hover:text-white transition-colors ml-2"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    
                    <p className="text-sm text-gray-400 mb-2">
                      {formatFileSize(uploadFile.file.size)}
                    </p>

                    {/* Progress Bar */}
                    {uploadFile.status === 'uploading' && (
                      <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-linear-to-r from-blue-500 to-green-500 h-full transition-all duration-300"
                          style={{ width: `${uploadFile.progress}%` }}
                        />
                      </div>
                    )}

                    {/* Status */}
                    {uploadFile.status === 'success' && (
                      <div className="flex items-center space-x-2 text-green-400">
                        <CheckCircle2 size={16} />
                        <span className="text-sm">Upload complete</span>
                      </div>
                    )}

                    {uploadFile.status === 'error' && (
                      <div className="flex items-center space-x-2 text-red-400">
                        <AlertCircle size={16} />
                        <span className="text-sm">{uploadFile.error}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Enqueued Reports */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Processing Queue</h2>
            <button
              onClick={fetchEnqueuedReports}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="animate-spin text-blue-400" size={32} />
            </div>
          ) : enqueuedReports.length === 0 ? (
            <div className="bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-700 p-8 text-center">
              <div className="w-16 h-16 bg-gray-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="text-gray-600" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">All caught up!</h3>
              <p className="text-gray-400">No reports currently being processed</p>
            </div>
          ) : (
            <div className="space-y-3">
              {enqueuedReports.map((report) => (
                <div
                  key={report.id}
                  className="bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-700 p-4 hover:border-gray-600 transition-all"
                >
                  <div className="flex items-center space-x-4">
                    {/* Preview */}
                    <div className="w-16 h-16 bg-gray-900 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                      {report.url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                        <img 
                          src={report.url} 
                          alt="Report preview" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <FileText className="text-gray-600" size={32} />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-white font-medium">Report #{report.id}</p>
                        <div className="flex items-center space-x-2 text-yellow-400">
                          <Clock size={16} className="animate-pulse" />
                          <span className="text-sm font-medium">Processing</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400">
                        Uploaded {formatDate(report.created_at)}
                      </p>
                      
                      {/* Processing Animation */}
                      <div className="mt-3 w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-linear-to-r from-yellow-500 to-orange-500 h-full animate-processing" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="bg-linear-to-br from-blue-500/10 to-green-500/10 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center shrink-0">
              <AlertCircle className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Processing Time</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                Reports typically take 2-5 minutes to process depending on file size and complexity. 
                You'll be able to query your reports once processing is complete. We'll extract all 
                relevant medical data and make it available for AI analysis.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes processing {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(400%);
          }
        }

        .animate-processing {
          animation: processing 1.5s ease-in-out infinite;
          width: 25%;
        }
      `}</style>
    </div>
  )
}

export default UploadReportsPage