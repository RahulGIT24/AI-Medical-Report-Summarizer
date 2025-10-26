import { useState, useEffect } from "react"
import { 
  FileText, 
  Download, 
  Eye, 
  Trash2, 
  ArrowLeft,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Calendar,
  Image as ImageIcon
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
}

const ReportsPage = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await apiCall("/user/reports");
      setReports(response);
    } catch (error) {
      toast.error("Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reportId: number) => {
    if (!confirm("Are you sure you want to delete this report?")) return;
    
    try {
      setDeleteLoading(reportId);
    //   await apiCall(`/reports/${reportId}`, { method: 'DELETE' });
      setReports(reports.filter(r => r.id !== reportId));
      toast.success("Report deleted successfully");
    } catch (error) {
      toast.error("Failed to delete report");
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleView = (report: Report) => {
    setSelectedReport(report);
  };

  const handleDownload = (url: string) => {
    window.open(url, '_blank');
  };

  const getStatusBadge = (report: Report) => {
    if (report.error) {
      return (
        <div className="flex items-center space-x-2 text-red-400">
          <XCircle size={16} />
          <span className="text-sm font-medium">Failed</span>
        </div>
      );
    }
    if (report.data_extracted) {
      return (
        <div className="flex items-center space-x-2 text-green-400">
          <CheckCircle2 size={16} />
          <span className="text-sm font-medium">Processed</span>
        </div>
      );
    }
    if (report.enqueued) {
      return (
        <div className="flex items-center space-x-2 text-yellow-400">
          <Clock size={16} />
          <span className="text-sm font-medium">Processing</span>
        </div>
      );
    }
    return (
      <div className="flex items-center space-x-2 text-gray-400">
        <AlertCircle size={16} />
        <span className="text-sm font-medium">Pending</span>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
                <h1 className="text-2xl font-bold text-white">My Health Reports</h1>
                <p className="text-sm text-gray-400">View and manage your uploaded reports</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-right">
                <p className="text-sm text-gray-400">Total Reports</p>
                <p className="text-2xl font-bold text-white">{reports.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="animate-spin text-blue-400" size={48} />
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <div className="w-24 h-24 bg-gray-800 rounded-2xl flex items-center justify-center mb-6">
              <FileText className="text-gray-600" size={48} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No Reports Yet</h3>
            <p className="text-gray-400 mb-6">Upload your first health report to get started</p>
            <button
              onClick={() => navigate('/upload')}
              className="bg-linear-to-r from-blue-600 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
            >
              Upload Report
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <div
                key={report.id}
                className={`bg-gray-800/60 backdrop-blur-xl rounded-2xl border transition-all duration-300 hover:shadow-xl overflow-hidden ${
                  report.error 
                    ? 'border-red-500/50 hover:border-red-500' 
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                {/* Report Preview */}
                <div className="relative h-48 bg-gray-900/50 flex items-center justify-center overflow-hidden group">
                  {report.url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                    <img 
                      src={report.url} 
                      alt="Report preview" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className="fallback-icon hidden">
                    <ImageIcon className="text-gray-600" size={64} />
                  </div>
                  
                  {/* Status Badge Overlay */}
                  <div className="absolute top-3 right-3">
                    <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg px-3 py-1.5">
                      {getStatusBadge(report)}
                    </div>
                  </div>

                  {/* Action Buttons Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                    <button
                      onClick={() => handleView(report)}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-colors"
                      title="View"
                    >
                      <Eye size={20} />
                    </button>
                    <button
                      onClick={() => handleDownload(report.url)}
                      className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(report.id)}
                      disabled={deleteLoading === report.id}
                      className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      {deleteLoading === report.id ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        <Trash2 size={20} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Report Info */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold text-lg">
                      Report #{report.id}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-2 text-gray-400 text-sm">
                    <Calendar size={16} />
                    <span>{formatDate(report.created_at)}</span>
                  </div>

                  {/* Error Message */}
                  {report.error && report.errormsg && (
                    <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <XCircle className="text-red-400 shrink-0 mt-0.5" size={16} />
                        <p className="text-red-400 text-sm leading-relaxed">{report.errormsg}</p>
                      </div>
                    </div>
                  )}

                  {/* Processing Info */}
                  {!report.error && report.enqueued && !report.data_extracted && (
                    <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="text-yellow-400 animate-spin shrink-0" size={16} />
                        <p className="text-yellow-400 text-sm">Processing your report...</p>
                      </div>
                    </div>
                  )}

                  {/* Success Info */}
                  {report.data_extracted && !report.error && (
                    <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="text-green-400 shrink-0" size={16} />
                        <p className="text-green-400 text-sm">Ready to query</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View Modal */}
      {selectedReport && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedReport(null)}
        >
          <div 
            className="bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Report #{selectedReport.id}</h3>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>
            <div className="p-6">
              <img 
                src={selectedReport.url} 
                alt="Report" 
                className="w-full rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = '';
                  e.currentTarget.alt = 'Failed to load image';
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReportsPage