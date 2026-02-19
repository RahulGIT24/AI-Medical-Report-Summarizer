import {
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
  Image as ImageIcon,
} from "lucide-react";
import { useNavigate } from "react-router";

export interface ReportMedia {
  id: number;
  report_id: number;
  url: string;
}

export interface Report {
  id: number;
  patient_id: number;
  created_at: string;
  updated_at: string;
  data_extracted: boolean;
  deleted: boolean;
  enqueued: boolean;
  error: boolean;
  errormsg: string;
  reports_media: ReportMedia[];
}

interface ReportListProps {
  reports: Report[];
}

export default function ReportList({ reports }: ReportListProps) {
  // Helper to format the ISO date string to a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const navigate = useNavigate()

  if (reports.length === 0) {
    return (
      <div className="p-12 border border-gray-800 rounded-2xl bg-gray-900/50 flex flex-col items-center justify-center text-center">
        <FileText className="text-gray-600 mb-4" size={48} />
        <h4 className="text-xl font-bold text-white mb-2">No Reports Found</h4>
        <p className="text-gray-400">Upload a report to see it listed here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <div
          key={report.id}
          onClick={()=>{navigate(`/report/${report.id}/${report.patient_id}`)}}
          className={`bg-gray-900 border rounded-xl p-5 transition-all duration-200 ${
            report.error
              ? "border-red-900/50 hover:border-red-500/50"
              : report.data_extracted
                ? "border-gray-800 hover:border-green-500/50"
                : "border-gray-800 hover:border-blue-500/50"
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            {/* Header & Status Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="text-blue-400" size={20} />
                  Report #{report.id}
                </h3>

                {/* Dynamic Status Badge */}
                {report.error ? (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                    <AlertCircle size={14} /> Failed
                  </span>
                ) : report.data_extracted ? (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
                    <CheckCircle size={14} /> Analyzed
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
                    <Clock size={14} className="animate-pulse" /> Processing OCR
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-400 mb-3">
                Uploaded on {formatDate(report.created_at)}
              </p>

              {/* Error Message Display */}
              {report.error && report.errormsg && (
                <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3 text-sm text-red-400/90 mb-4">
                  <strong>Error Details:</strong> {report.errormsg}
                </div>
              )}
            </div>

            {/* Media Thumbnails Section */}
            {report.reports_media && report.reports_media.length > 0 && (
              <div className="flex gap-2 flex-wrap md:justify-end">
                {report.reports_media.map((media) => {
                  const isImage =
                    media.url.match(/\.(jpeg|jpg|gif|png)$/i) != null;
                  return (
                    <a
                      key={media.id}
                      href={media.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative w-16 h-16 bg-gray-950 border border-gray-800 rounded-lg overflow-hidden flex items-center justify-center hover:border-blue-500 transition-colors"
                      title="View uploaded file"
                    >
                      {isImage ? (
                        <>
                          <img
                            src={media.url}
                            alt="Report scan"
                            className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <ExternalLink size={16} className="text-white" />
                          </div>
                        </>
                      ) : (
                        <ImageIcon
                          className="text-gray-600 group-hover:text-blue-400 transition-colors"
                          size={24}
                        />
                      )}
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
