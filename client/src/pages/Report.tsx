import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Download,
  User,
  FileText,
  Beaker,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Loader2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MoveUpRight,
} from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { apiCall } from "../lib/apiCall";
import { toast } from "react-toastify";
import { Typewriter } from "../components/TypeWriter";
import { motion, AnimatePresence } from "framer-motion";

interface ReportMetaData {
  patient_name?: string;
  patient_age?: string;
  patient_gender?: string;
  report_type?: string;
  accession_number?: string;
  collection_date?: string;
  received_date?: string;
  report_date?: string;
  lab_name?: string;
  lab_director?: string;
  sample_type?: string;
  notes?: string;
}

interface TestResult {
  test_name: string;
  test_category?: string;
  outcome?: string;
  result_value?: string;
  unit?: string;
  cutoff_value?: string;
  reference_range?: string;
  detection_window?: string;
  is_abnormal?: boolean;
  is_critical?: boolean;
}

interface SpecimenValidity {
  specific_gravity?: number;
  specific_gravity_status?: string;
  ph_status?: string;
  ph_level?: number;
  creatinine_status?: string;
  oxidants?: string;
  oxidants_status?: string;
  is_valid?: boolean;
  creatinine?: number;
}

interface ScreeningTest {
  test_name: string;
  outcome?: string;
  result_value?: string;
  cutoff_value?: string;
}

interface ConfirmationTest {
  test_name: string;
  method?: string;
  outcome?: string;
  result_value?: string;
  result_numeric?: number;
  unit?: string;
  cutoff_value?: string;
  detection_window?: string;
}

interface ReportedMedication {
  medication_name: string;
  is_tested?: boolean;
}

interface ReportsMedia {
  url: string;
}

interface Report {
  id: number;
  data_extracted: boolean;
  enqueued: boolean;
  error: boolean;
  errormsg: string;
  created_at: string;
  updated_at: string;
  report_metadata?: ReportMetaData;
  test_results?: TestResult[];
  specimen_validity?: SpecimenValidity;
  reports_media?: ReportsMedia[];
  screening_tests?: ScreeningTest[];
  confirmation_tests?: ConfirmationTest[];
  medications?: ReportedMedication[];
}

// Polished Reusable Section Component with Framer Motion
const Section = ({ title, icon: Icon, children, isExpanded, onToggle, delay = 0 }: any) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      className="bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-gray-800 overflow-hidden shadow-lg shadow-black/20"
    >
      <button
        onClick={onToggle}
        className="w-full p-5 sm:p-6 flex items-center justify-between hover:bg-gray-800/50 transition-colors group"
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gray-800 border border-gray-700 rounded-xl flex items-center justify-center shadow-inner group-hover:bg-gray-700 transition-colors">
            <Icon className="text-blue-400" size={24} />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
        </div>
        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
          <ChevronDown className="text-gray-500 group-hover:text-gray-300" size={24} />
        </motion.div>
      </button>
      
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-5 sm:px-6 pb-6 pt-2">
              <div className="border-t border-gray-800/50 pt-6">
                {children}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ReportDetailPage = () => {
  const navigate = useNavigate();
  const { id, patient_id } = useParams();
  const [report, setReport] = useState<Report | null>(null);
  const [loadingReport, setLoadingReport] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["metadata", "test-results", "summary"])
  );
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [summary, setSummary] = useState<null | string>(null);

  const handleSummarize = async () => {
    if (summary) return;
    try {
      setLoadingSummary(true);
      const response = await apiCall(`/report/summarise/${id}/${patient_id}`);
      setSummary(response.summary);
    } catch (error) {
      toast.error("Error occurred while summarising report");
    } finally {
      setLoadingSummary(false);
    }
  };

  useEffect(() => {
    fetchReport();
    fetchSummary();
  }, [id, patient_id]);

  const fetchReport = async () => {
    try {
      if (!id || !patient_id) navigate("/dashboard");
      setLoadingReport(true);
      const response = await apiCall(`/report/${id}/${patient_id}`);
      setReport(response);
    } catch (error) {
      navigate("/dashboard");
    } finally {
      setLoadingReport(false);
    }
  };

  const fetchSummary = async () => {
    try {
      setLoadingSummary(true);
      const response = await apiCall(`/report/aisummary/${id}/${patient_id}`);
      setSummary(response.aisummary);
    } catch (error) {
    } finally {
      setLoadingSummary(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const downloadAllMedia = () => {
    if (!report?.reports_media) return;
    report.reports_media.forEach((media, index) => {
      setTimeout(() => {
        window.open(media.url, "_blank");
      }, index * 100);
    });
    toast.success("Downloading all files...");
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getOutcomeColor = (outcome?: string, isAbnormal?: boolean, isCritical?: boolean) => {
    if (isCritical) return "text-red-400 bg-red-500/10 border-red-500/20";
    if (isAbnormal) return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
    if (outcome?.toLowerCase().includes("positive")) return "text-red-400 bg-red-500/10 border-red-500/20";
    if (outcome?.toLowerCase().includes("negative")) return "text-green-400 bg-green-500/10 border-green-500/20";
    return "text-gray-300 bg-gray-800 border-gray-700";
  };

  const navigateMedia = (direction: "next" | "prev", e: React.MouseEvent) => {
    e.stopPropagation();
    if (!report?.reports_media) return;

    if (direction === "next") {
      setSelectedMediaIndex((prev) =>
        prev < report.reports_media!.length - 1 ? prev + 1 : prev
      );
    } else {
      setSelectedMediaIndex((prev) => (prev > 0 ? prev - 1 : prev));
    }
  };

  if (loadingReport) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center font-sans">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
        <p className="text-gray-400 font-medium tracking-wide">Loading report data...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center font-sans">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center bg-gray-900/80 p-10 rounded-4xl border border-gray-800">
          <AlertCircle className="mx-auto mb-6 text-red-400" size={64} />
          <h2 className="text-3xl font-bold text-white mb-3">Report Not Found</h2>
          <p className="text-gray-400 mb-8 max-w-sm">We couldn't locate the requested report. It may have been deleted or you lack permissions.</p>
          <button
            onClick={() => navigate("/members")}
            className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white px-6 py-3 rounded-xl transition-colors font-medium"
          >
            Back to Reports
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 font-sans text-gray-100 selection:bg-blue-500/30 relative overflow-hidden">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-[40%] left-0 w-[500px] h-[500px] bg-green-600/5 blur-[150px] rounded-full pointer-events-none" />

      {/* Header */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/60 sticky top-0 z-30"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/members")}
                className="text-gray-400 hover:text-white transition-colors p-2.5 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl shadow-sm"
              >
                <ArrowLeft size={22} />
              </motion.button>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Report #{report.id}</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm font-medium text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                    {report.report_metadata?.report_type || "Health Report"}
                  </span>
                  <span className="text-sm text-gray-400">• {formatDate(report.created_at)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={downloadAllMedia}
                className="bg-gray-900 hover:bg-gray-800 border border-gray-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center space-x-2 shadow-sm"
              >
                <Download size={18} />
                <span className="hidden sm:inline">Download</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/chat/${report.id}/${patient_id}`)}
                className="bg-linear-to-r from-blue-600 to-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 flex items-center space-x-2"
              >
                <MoveUpRight size={18} />
                <span>Chat with AI</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 relative z-10 pb-20">
        
        {/* Status Banner */}
        <AnimatePresence>
          {report.error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 flex items-start space-x-4 backdrop-blur-sm shadow-lg shadow-red-500/5">
              <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center shrink-0">
                <XCircle className="text-red-400" size={24} />
              </div>
              <div>
                <h3 className="text-red-400 font-bold mb-1">Error Processing Report</h3>
                <p className="text-red-300/80 text-sm leading-relaxed">{report.errormsg}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Summary Section */}
        {report.reports_media && report.reports_media.length > 0 && (
          <Section
            title="AI Report Summary"
            icon={Sparkles}
            isExpanded={expandedSections.has("summary")}
            onToggle={() => toggleSection("summary")}
            delay={0.1}
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="text-gray-400 text-sm">
                  {summary ? "AI-generated executive summary of the findings below." : "Generate a quick, understandable summary of this report."}
                </p>
                {!loadingSummary && !summary && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSummarize}
                    className="px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 font-semibold hover:bg-blue-500/20 transition-all text-sm flex items-center gap-2"
                  >
                    Generate Summary <Sparkles size={16} />
                  </motion.button>
                )}
              </div>

              {loadingSummary && (
                <div className="flex items-center gap-3 p-4 bg-gray-950 rounded-xl border border-gray-800 text-gray-400">
                  <Loader2 className="animate-spin text-blue-500" size={20} />
                  <span className="text-sm font-medium">Analyzing document and generating summary...</span>
                </div>
              )}

              {summary && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-xl bg-gray-950 border border-gray-800 text-gray-200 text-sm leading-relaxed shadow-inner">
                  <Typewriter text={summary} />
                </motion.div>
              )}
            </div>
          </Section>
        )}

        {/* Patient & Report Metadata */}
        {report.report_metadata && (
          <Section
            title="Patient & Document Info"
            icon={User}
            isExpanded={expandedSections.has("metadata")}
            onToggle={() => toggleSection("metadata")}
            delay={0.2}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Patient Name", value: report.report_metadata.patient_name },
                { label: "Age", value: report.report_metadata.patient_age },
                { label: "Gender", value: report.report_metadata.patient_gender },
                { label: "Sample Type", value: report.report_metadata.sample_type },
                { label: "Accession Number", value: report.report_metadata.accession_number },
                { label: "Collection Date", value: report.report_metadata.collection_date ? formatDate(report.report_metadata.collection_date) : null },
                { label: "Report Date", value: report.report_metadata.report_date ? formatDate(report.report_metadata.report_date) : null },
                { label: "Lab Name", value: report.report_metadata.lab_name },
              ].map((item, i) => item.value && (
                <div key={i} className="bg-gray-950 rounded-xl p-4 border border-gray-800 hover:border-gray-700 transition-colors">
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">{item.label}</p>
                  <p className="text-white font-medium">{item.value}</p>
                </div>
              ))}
            </div>
            {report.report_metadata.notes && (
              <div className="mt-4 bg-gray-950 rounded-xl p-4 border border-gray-800">
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Clinical Notes</p>
                <p className="text-gray-300 text-sm leading-relaxed">{report.report_metadata.notes}</p>
              </div>
            )}
          </Section>
        )}

        {/* Test Results */}
        {report.test_results && report.test_results.length > 0 && (
          <Section
            title="Test Results"
            icon={Beaker}
            isExpanded={expandedSections.has("test-results")}
            onToggle={() => toggleSection("test-results")}
            delay={0.3}
          >
            <div className="rounded-xl border border-gray-800 overflow-hidden bg-gray-950">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-900 border-b border-gray-800">
                      <th className="py-4 px-5 text-gray-400 font-semibold text-xs uppercase tracking-wider">Test Name</th>
                      <th className="py-4 px-5 text-gray-400 font-semibold text-xs uppercase tracking-wider">Result</th>
                      <th className="py-4 px-5 text-gray-400 font-semibold text-xs uppercase tracking-wider hidden sm:table-cell">Reference</th>
                      <th className="py-4 px-5 text-gray-400 font-semibold text-xs uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50">
                    {report.test_results.map((test, index) => (
                      <tr key={index} className="hover:bg-gray-800/30 transition-colors">
                        <td className="py-4 px-5">
                          <p className="text-white font-medium text-sm">{test.test_name}</p>
                          {test.test_category && <p className="text-gray-500 text-xs mt-0.5">{test.test_category}</p>}
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex items-baseline gap-1.5">
                            <span className={`font-semibold ${test.is_abnormal || test.is_critical ? "text-yellow-400" : "text-white"}`}>
                              {test.result_value || "—"}
                            </span>
                            {test.unit && <span className="text-gray-500 text-xs">{test.unit}</span>}
                          </div>
                        </td>
                        <td className="py-4 px-5 text-gray-400 text-sm hidden sm:table-cell">
                          {test.reference_range || test.cutoff_value || "N/A"}
                        </td>
                        <td className="py-4 px-5">
                          {test.outcome && (
                            <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold uppercase tracking-wider ${getOutcomeColor(test.outcome, test.is_abnormal, test.is_critical)}`}>
                              {test.is_critical ? <AlertCircle size={12} /> : test.is_abnormal ? <AlertCircle size={12} /> : <CheckCircle2 size={12} />}
                              <span>{test.outcome}</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Section>
        )}

        {/* Specimen Validity */}
        {report.specimen_validity && (
          <Section
            title="Specimen Validity"
            icon={CheckCircle2}
            isExpanded={expandedSections.has("specimen")}
            onToggle={() => toggleSection("specimen")}
            delay={0.4}
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {report.specimen_validity.is_valid !== undefined && (
                <div className="bg-gray-950 rounded-xl p-4 border border-gray-800">
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Overall Status</p>
                  <div className="flex items-center space-x-2">
                    {report.specimen_validity.is_valid ? <CheckCircle2 className="text-green-400" size={20} /> : <XCircle className="text-red-400" size={20} />}
                    <p className={`font-bold ${report.specimen_validity.is_valid ? "text-green-400" : "text-red-400"}`}>
                      {report.specimen_validity.is_valid ? "Valid Specimen" : "Invalid Specimen"}
                    </p>
                  </div>
                </div>
              )}
              {report.specimen_validity.specific_gravity !== undefined && (
                <div className="bg-gray-950 rounded-xl p-4 border border-gray-800">
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Specific Gravity</p>
                  <p className="text-white font-semibold text-lg">{report.specimen_validity.specific_gravity}</p>
                  {report.specimen_validity.specific_gravity_status && <p className="text-gray-500 text-xs mt-1">{report.specimen_validity.specific_gravity_status}</p>}
                </div>
              )}
              {report.specimen_validity.ph_level !== undefined && (
                <div className="bg-gray-950 rounded-xl p-4 border border-gray-800">
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">pH Level</p>
                  <p className="text-white font-semibold text-lg">{report.specimen_validity.ph_level}</p>
                  {report.specimen_validity.ph_status && <p className="text-gray-500 text-xs mt-1">{report.specimen_validity.ph_status}</p>}
                </div>
              )}
              {report.specimen_validity.creatinine !== undefined && (
                <div className="bg-gray-950 rounded-xl p-4 border border-gray-800">
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Creatinine</p>
                  <p className="text-white font-semibold text-lg">{report.specimen_validity.creatinine}</p>
                  {report.specimen_validity.creatinine_status && <p className="text-gray-500 text-xs mt-1">{report.specimen_validity.creatinine_status}</p>}
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Screening Tests */}
        {report.screening_tests && report.screening_tests.length > 0 && (
          <Section
            title="Screening Tests"
            icon={Beaker}
            isExpanded={expandedSections.has("screening")}
            onToggle={() => toggleSection("screening")}
            delay={0.5}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.screening_tests.map((test, index) => (
                <div key={index} className="bg-gray-950 rounded-xl p-4 border border-gray-800 flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold text-sm">{test.test_name}</p>
                    <div className="flex gap-3 mt-1">
                      {test.result_value && <p className="text-gray-400 text-xs">Result: <span className="text-gray-300">{test.result_value}</span></p>}
                      {test.cutoff_value && <p className="text-gray-500 text-xs">Cutoff: {test.cutoff_value}</p>}
                    </div>
                  </div>
                  {test.outcome && (
                    <span className={`px-2.5 py-1 rounded-md border text-xs font-bold uppercase tracking-wider ${getOutcomeColor(test.outcome)}`}>
                      {test.outcome}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Report Media Gallery */}
        {report.reports_media && report.reports_media.length > 0 && (
          <Section
            title="Scanned Documents"
            icon={FileText}
            isExpanded={expandedSections.has("media")}
            onToggle={() => toggleSection("media")}
            delay={0.6}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {report.reports_media.map((media, index) => (
                <motion.div
                  whileHover={{ y: -5 }}
                  key={index}
                  className="group relative aspect-3/4 bg-gray-950 rounded-xl overflow-hidden border border-gray-800 hover:border-blue-500/50 transition-all cursor-pointer shadow-md"
                  onClick={() => {
                    setSelectedMediaIndex(index);
                    setShowMediaModal(true);
                  }}
                >
                  <img
                    src={media.url}
                    alt={`Report page ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gray-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-blue-600 text-white p-3 rounded-full shadow-lg">
                      <Eye size={20} />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 w-full bg-linear-to-t from-gray-950 to-transparent p-3 pt-8">
                    <p className="text-xs font-medium text-white shadow-sm">Page {index + 1}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Section>
        )}
      </div>

      {/* Media Viewer Modal */}
      <AnimatePresence>
        {showMediaModal && report.reports_media && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6"
            onClick={() => setShowMediaModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="bg-gray-900 rounded-4xl max-w-5xl w-full max-h-[95vh] flex flex-col overflow-hidden shadow-2xl shadow-black/50 border border-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gray-900 border-b border-gray-800 p-5 flex items-center justify-between z-10 shrink-0">
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Document Viewer</h3>
                  <p className="text-sm text-gray-400 font-medium">
                    Page {selectedMediaIndex + 1} of {report.reports_media.length}
                  </p>
                </div>
                <button
                  onClick={() => setShowMediaModal(false)}
                  className="text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 p-2 rounded-full transition-colors border border-gray-700"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="p-4 sm:p-8 flex-1 overflow-y-auto bg-gray-950 flex items-center justify-center relative min-h-[300px]">
                <img
                  src={report.reports_media[selectedMediaIndex].url}
                  alt={`Report page ${selectedMediaIndex + 1}`}
                  className="max-w-full max-h-[60vh] object-contain rounded-xl shadow-lg border border-gray-800"
                />

                {report.reports_media.length > 1 && (
                  <>
                    <button
                      onClick={(e) => navigateMedia("prev", e)}
                      disabled={selectedMediaIndex === 0}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-gray-900/80 backdrop-blur-sm border border-gray-700 hover:bg-gray-800 text-white p-3 rounded-full transition-all disabled:opacity-0 disabled:cursor-not-allowed shadow-xl"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={(e) => navigateMedia("next", e)}
                      disabled={selectedMediaIndex === report.reports_media.length - 1}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-gray-900/80 backdrop-blur-sm border border-gray-700 hover:bg-gray-800 text-white p-3 rounded-full transition-all disabled:opacity-0 disabled:cursor-not-allowed shadow-xl"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
              </div>

              {report.reports_media.length > 1 && (
                <div className="bg-gray-900 border-t border-gray-800 p-4 shrink-0">
                  <div className="flex space-x-3 overflow-x-auto pb-2 custom-scrollbar">
                    {report.reports_media.map((media, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedMediaIndex(index)}
                        className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                          index === selectedMediaIndex
                            ? "border-blue-500 scale-105 shadow-lg shadow-blue-500/20"
                            : "border-gray-800 hover:border-gray-600 opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={media.url}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #374151;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #4b5563;
        }
      `}</style>
    </div>
  );
};

export default ReportDetailPage;