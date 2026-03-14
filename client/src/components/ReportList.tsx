import {
  FileText,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Image as ImageIcon,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";

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
  const navigate = useNavigate();

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

  if (reports.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-12 border border-gray-800 rounded-4xl bg-gray-900/40 backdrop-blur-sm flex flex-col items-center justify-center text-center shadow-inner"
      >
        <div className="w-20 h-20 bg-gray-950 border border-gray-800 rounded-2xl flex items-center justify-center mb-5 shadow-lg">
          <FileText className="text-gray-500" size={36} />
        </div>
        <h4 className="text-2xl font-bold text-white mb-2 tracking-tight">
          No Reports Found
        </h4>
        <p className="text-gray-400 max-w-sm">
          Upload a medical record or lab result to see it listed here for AI
          analysis.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {reports.map((report, index) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            onClick={() =>
              navigate(`/report/${report.id}/${report.patient_id}`)
            }
            className={`group bg-gray-900/80 backdrop-blur-xl border rounded-3xl p-5 sm:p-6 transition-all duration-300 cursor-pointer shadow-md hover:shadow-xl relative overflow-hidden ${
              report.error
                ? "border-red-500/30 hover:border-red-500/60 shadow-red-500/5"
                : report.data_extracted
                  ? "border-gray-800 hover:border-blue-500/50 shadow-blue-500/5"
                  : "border-gray-800 hover:border-yellow-500/50"
            }`}
          >
            {/* Subtle Hover Gradient */}
            <div className="absolute inset-0 bg-linear-to-r from-white/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
              {/* Header & Status Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gray-950 border border-gray-800 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="text-blue-400" size={18} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2 group-hover:text-blue-400 transition-colors">
                      Report #{report.id}
                    </h3>
                    <p className="text-xs text-gray-400 font-medium">
                      Uploaded on {formatDate(report.created_at)}
                    </p>
                  </div>
                </div>

                {/* Dynamic Status Badge */}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {report.error ? (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider">
                      <AlertCircle size={14} /> Failed
                    </span>
                  ) : report.data_extracted ? (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-wider">
                      <CheckCircle size={14} /> Analyzed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold uppercase tracking-wider">
                      <Loader2 size={14} className="animate-spin" /> Processing
                    </span>
                  )}
                </div>

                {/* Error Message Display */}
                {report.error && report.errormsg && (
                  <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-300 font-medium leading-relaxed">
                    <strong className="text-red-400">Error Details:</strong>{" "}
                    {report.errormsg}
                  </div>
                )}
              </div>

              {/* Media Thumbnails Section */}
              <div className="flex items-center justify-between md:justify-end gap-4 md:w-auto w-full">
                {report.reports_media && report.reports_media.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {report.reports_media.slice(0, 3).map((media) => {
                      const isImage =
                        media.url.match(/\.(jpeg|jpg|gif|png)$/i) != null;
                      return (
                        <a
                          key={media.id}
                          href={media.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()} // Prevents navigating to the report detail page when clicking the thumbnail
                          className="group/thumb relative w-14 h-14 sm:w-16 sm:h-16 bg-gray-950 border border-gray-800 rounded-xl overflow-hidden flex items-center justify-center hover:border-blue-500 transition-all shadow-md"
                          title="View original file"
                        >
                          {isImage ? (
                            <>
                              <img
                                src={media.url}
                                alt="Report scan"
                                className="w-full h-full object-cover opacity-70 group-hover/thumb:opacity-100 group-hover/thumb:scale-110 transition-all duration-500"
                              />
                              <div className="absolute inset-0 bg-gray-900/40 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity backdrop-blur-sm">
                                <ExternalLink
                                  size={16}
                                  className="text-white drop-shadow-md"
                                />
                              </div>
                            </>
                          ) : (
                            <ImageIcon
                              className="text-gray-600 group-hover/thumb:text-blue-400 transition-colors"
                              size={24}
                            />
                          )}
                        </a>
                      );
                    })}
                    {report.reports_media.length > 3 && (
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-950 border border-gray-800 rounded-xl flex items-center justify-center text-gray-400 text-xs font-bold">
                        +{report.reports_media.length - 3}
                      </div>
                    )}
                  </div>
                )}

                {/* Arrow indicator for navigation affordance */}
                <div className="hidden md:flex w-10 h-10 rounded-full bg-gray-800/50 items-center justify-center group-hover:bg-blue-600 transition-colors shrink-0">
                  <ChevronRight
                    size={20}
                    className="text-gray-400 group-hover:text-white transition-colors"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
