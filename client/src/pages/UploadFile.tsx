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
  Clock,
} from "lucide-react"
import { useNavigate } from "react-router"
import { apiCall } from "../lib/apiCall"
import { toast } from "react-toastify"

interface ReportMedia {
  url: string;
}

interface Report {
  id: number;
  data_extracted: boolean;
  enqueued: boolean;
  error: boolean;
  errormsg: string;
  created_at: string;
  reports_media: ReportMedia[];
}

interface UploadingFile {
  file: File;
  preview?: string;
}

interface UploadBatch {
  files: UploadingFile[];
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

const UploadReportsPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<UploadingFile[]>([]);
  const [uploadBatch, setUploadBatch] = useState<UploadBatch | null>(null);
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
      // Handle error silently or with mock data
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
    // Check if adding these files would exceed 10
    if (selectedFiles.length + files.length > 10) {
      toast.error(`You can only upload up to 10 files per report. Currently selected: ${selectedFiles.length}`);
      return;
    }

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

    // Create previews for valid files
    const filesWithPreviews: UploadingFile[] = validFiles.map(file => {
      let preview: string | undefined;
      if (file.type.startsWith('image/')) {
        preview = URL.createObjectURL(file);
      }
      return { file, preview };
    });

    setSelectedFiles(prev => [...prev, ...filesWithPreviews]);
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => {
      const newFiles = [...prev];
      // Revoke the object URL to free memory
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const uploadAllFiles = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select at least one file to upload");
      return;
    }

    setUploadBatch({
      files: selectedFiles,
      progress: 0,
      status: 'uploading'
    });

    try {
      const formData = new FormData();
      selectedFiles.forEach(({ file }) => {
        formData.append('files', file);
      });

      // Simulate progress updates
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 10;
        if (progress <= 90) {
          setUploadBatch(prev => prev ? { ...prev, progress } : null);
        }
      }, 300);

      const response = await apiCall("/report/upload", 'POST', formData, "multipart/form-data");
      clearInterval(progressInterval);

      // Update to success
      setUploadBatch(prev => prev ? { ...prev, progress: 100, status: 'success' } : null);
      
      toast.success(`Successfully uploaded ${selectedFiles.length} file(s)`);
      
      // Clear selected files
      selectedFiles.forEach(({ preview }) => {
        if (preview) URL.revokeObjectURL(preview);
      });
      setSelectedFiles([]);
      
      // Refresh enqueued reports
      fetchEnqueuedReports();

      // Remove upload batch after 2 seconds
      setTimeout(() => {
        setUploadBatch(null);
      }, 2000);

    } catch (error) {
      setUploadBatch(prev => prev ? {
        ...prev,
        status: 'error',
        error: 'Upload failed. Please try again.'
      } : null);
      toast.error("Failed to upload files");
    }
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
                  Supported formats: JPG, PNG, PDF • Max size: 10MB per file
                </p>
                <p className="text-sm text-blue-400 mt-1">
                  Upload up to 10 files per report ({selectedFiles.length}/10 selected)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                Selected Files ({selectedFiles.length}/10)
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    selectedFiles.forEach(({ preview }) => {
                      if (preview) URL.revokeObjectURL(preview);
                    });
                    setSelectedFiles([]);
                  }}
                  className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors px-3 py-1 rounded-lg hover:bg-red-500/10"
                >
                  Clear All
                </button>
                <button
                  onClick={uploadAllFiles}
                  disabled={uploadBatch?.status === 'uploading'}
                  className="bg-linear-to-r from-blue-600 to-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadBatch?.status === 'uploading' ? 'Uploading...' : 'Upload All'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {selectedFiles.map((uploadFile, index) => (
                <div
                  key={index}
                  className="relative bg-gray-800/60 backdrop-blur-xl rounded-xl border border-gray-700 p-3 group"
                >
                  <button
                    onClick={() => removeSelectedFile(index)}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <X size={16} />
                  </button>

                  <div className="aspect-square bg-gray-900 rounded-lg overflow-hidden mb-2 flex items-center justify-center">
                    {uploadFile.preview ? (
                      <img 
                        src={uploadFile.preview} 
                        alt="" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <File className="text-gray-600" size={32} />
                    )}
                  </div>

                  <p className="text-white text-xs font-medium truncate mb-1">
                    {uploadFile.file.name}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {formatFileSize(uploadFile.file.size)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {uploadBatch && (
          <div className="bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center shrink-0">
                {uploadBatch.status === 'uploading' ? (
                  <Loader2 className="text-white animate-spin" size={24} />
                ) : uploadBatch.status === 'success' ? (
                  <CheckCircle2 className="text-white" size={24} />
                ) : (
                  <AlertCircle className="text-white" size={24} />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-1">
                  {uploadBatch.status === 'uploading' && `Uploading ${uploadBatch.files.length} file(s)...`}
                  {uploadBatch.status === 'success' && 'Upload Complete!'}
                  {uploadBatch.status === 'error' && 'Upload Failed'}
                </h3>
                {uploadBatch.status === 'uploading' && (
                  <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-linear-to-r from-blue-500 to-green-500 h-full transition-all duration-300"
                      style={{ width: `${uploadBatch.progress}%` }}
                    />
                  </div>
                )}
                {uploadBatch.status === 'error' && uploadBatch.error && (
                  <p className="text-red-400 text-sm">{uploadBatch.error}</p>
                )}
              </div>
            </div>
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
                    <div className="w-16 h-16 bg-gray-900 rounded-lg flex items-center justify-center shrink-0 overflow-hidden relative">
                      {report.reports_media.length > 0 && report.reports_media[0].url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                        <img 
                          src={report.reports_media[0].url} 
                          alt="Report preview" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <FileText className="text-gray-600" size={32} />
                      )}
                      {report.reports_media.length > 1 && (
                        <div className="absolute bottom-1 right-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded">
                          +{report.reports_media.length - 1}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <p className="text-white font-medium">Report #{report.id}</p>
                          {report.reports_media.length > 1 && (
                            <p className="text-xs text-gray-500">{report.reports_media.length} files</p>
                          )}
                        </div>
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
                You can upload up to 10 files per report (e.g., multiple pages of a blood test). 
                You'll be able to query your reports once processing is complete.
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