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
  Pill,
  ChevronDown,
  ChevronUp,
  Loader2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { apiCall } from "../lib/apiCall";
import { toast } from "react-toastify";
import { Typewriter } from "../components/TypeWriter";

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

const ReportDetailPage = () => {
  const navigate = useNavigate();
  const { id, patient_id } = useParams();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["metadata", "test-results", "summary"]),
  );
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState("");

  const handleSummarize = async () => {
    try {
      setSummarizing(true);
      const response = await apiCall(`/report/summarise/${id}/${patient_id}`);
      setGeneratedSummary(response.summary);
    } catch (error) {
      toast.error("Error occured while summarising report");
    } finally {
      setSummarizing(false);
    }
  };

  useEffect(() => {
    fetchReport();
    fetchSummary();
  }, [id, patient_id]);

  const fetchReport = async () => {
    try {
      if (!id || !patient_id) navigate("/dashboard");
      setLoading(true);
      const response = await apiCall(`/report/${id}/${patient_id}`);
      setReport(response);
    } catch (error) {
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };
  const fetchSummary = async () => {
    try {
      setLoading(true);
      const response = await apiCall(`/report/aisummary/${id}/${patient_id}`);
      setGeneratedSummary(response.aisummary);
    } catch (error) {
    } finally {
      setLoading(false);
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
    toast.success("Downloading all files");
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

  const getOutcomeColor = (
    outcome?: string,
    isAbnormal?: boolean,
    isCritical?: boolean,
  ) => {
    if (isCritical) return "text-red-400 bg-red-500/10 border-red-500/50";
    if (isAbnormal)
      return "text-yellow-400 bg-yellow-500/10 border-yellow-500/50";
    if (outcome?.toLowerCase().includes("positive"))
      return "text-red-400 bg-red-500/10 border-red-500/50";
    if (outcome?.toLowerCase().includes("negative"))
      return "text-green-400 bg-green-500/10 border-green-500/50";
    return "text-gray-400 bg-gray-500/10 border-gray-500/50";
  };

  const navigateMedia = (direction: "next" | "prev") => {
    if (!report?.reports_media) return;

    if (direction === "next") {
      setSelectedMediaIndex((prev) =>
        prev < report.reports_media!.length - 1 ? prev + 1 : prev,
      );
    } else {
      setSelectedMediaIndex((prev) => (prev > 0 ? prev - 1 : prev));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-400" size={48} />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 text-red-400" size={64} />
          <h2 className="text-2xl font-bold text-white mb-2">
            Report Not Found
          </h2>
          <button
            onClick={() => navigate("/reports")}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Back to Reports
          </button>
        </div>
      </div>
    );
  }

  const Section = ({ title, icon: Icon, children, sectionKey }: any) => {
    const isExpanded = expandedSections.has(sectionKey);
    return (
      <div className="bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-700 overflow-hidden">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full p-6 flex items-center justify-between hover:bg-gray-700/30 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
              <Icon className="text-white" size={20} />
            </div>
            <h2 className="text-xl font-bold text-white">{title}</h2>
          </div>
          {isExpanded ? (
            <ChevronUp className="text-gray-400" size={24} />
          ) : (
            <ChevronDown className="text-gray-400" size={24} />
          )}
        </button>
        {isExpanded && <div className="px-6 pb-6">{children}</div>}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-slate-900 to-gray-900">
      {/* Header */}
      <div className="bg-gray-800/60 backdrop-blur-xl border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/reports")}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Report #{report.id}
                </h1>
                <p className="text-sm text-gray-400">
                  {report.report_metadata?.report_type || "Health Report"} •{" "}
                  {formatDate(report.created_at)}
                </p>
              </div>
            </div>
            <button
              onClick={downloadAllMedia}
              className="bg-linear-to-r from-blue-600 to-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 flex items-center space-x-2"
            >
              <Download size={20} />
              <span>Download All</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Status Banner */}
        {report.error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-4 flex items-start space-x-3">
            <XCircle className="text-red-400 shrink-0 mt-0.5" size={24} />
            <div>
              <h3 className="text-red-400 font-semibold mb-1">
                Error Processing Report
              </h3>
              <p className="text-red-300 text-sm">{report.errormsg}</p>
            </div>
          </div>
        )}

        {/* Report Media */}
        {report.reports_media && report.reports_media.length > 0 && (
          <Section title="Report Files" icon={FileText} sectionKey="media">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {report.reports_media.map((media, index) => (
                <div
                  key={index}
                  className="group relative aspect-square bg-gray-900 rounded-xl overflow-hidden border border-gray-700 hover:border-blue-500 transition-all cursor-pointer"
                  onClick={() => {
                    setSelectedMediaIndex(index);
                    setShowMediaModal(true);
                  }}
                >
                  <img
                    src={media.url}
                    alt={`Report page ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Eye className="text-white" size={32} />
                  </div>
                  <div className="absolute bottom-2 left-2 bg-gray-900/90 px-2 py-1 rounded text-xs text-white">
                    Page {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}
        {report.reports_media && report.reports_media.length > 0 && (
          <Section
            title="AI Report Summary"
            icon={FileText}
            sectionKey="summary"
          >
            <div className="flex flex-col gap-3">
              <p className="text-gray-300">
                {generatedSummary
                  ? "AI Generated summary of report"
                  : "Summarize Report using AI"}
              </p>
              {!summarizing && !generatedSummary && (
                <button
                  onClick={() => {
                    handleSummarize();
                  }}
                  className="px-4 py-2 rounded-xl bg-gray-800/70 border border-gray-700 
                                    text-white font-medium backdrop-blur-sm hover:bg-gray-700 
                                    active:scale-95 transition-all duration-150"
                >
                  <div className="flex justify-center items-center gap-x-1.5">
                    Generate Summary <Sparkles size={22} />
                  </div>
                </button>
              )}
              {summarizing && (
                <div className="flex justify-center items-center">
                  {" "}
                  <p
                    className="px-4 py-2 rounded-xl bg-gray-800/70 border border-gray-700 
                                    text-white font-medium backdrop-blur-sm hover:bg-gray-700 
                                    active:scale-95 transition-all duration-150"
                  >
                    Summarizing Report Please Wait.......
                  </p>
                </div>
              )}
              {generatedSummary && (
                <div
                  className={`px-4 py-3 rounded-xl bg-gray-800/70 border border-gray-700 
                                        text-white font-medium backdrop-blur-sm transition-all duration-300
                                        ${generatedSummary ? "animate-fadeIn" : "hidden"}`}
                >
                  <Typewriter text={generatedSummary} />
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Patient & Report Metadata */}
        {report.report_metadata && (
          <Section
            title="Patient & Report Information"
            icon={User}
            sectionKey="metadata"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {report.report_metadata.patient_name && (
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Patient Name</p>
                  <p className="text-white font-semibold">
                    {report.report_metadata.patient_name}
                  </p>
                </div>
              )}
              {report.report_metadata.patient_age && (
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Age</p>
                  <p className="text-white font-semibold">
                    {report.report_metadata.patient_age}
                  </p>
                </div>
              )}
              {report.report_metadata.patient_gender && (
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Gender</p>
                  <p className="text-white font-semibold">
                    {report.report_metadata.patient_gender}
                  </p>
                </div>
              )}
              {report.report_metadata.accession_number && (
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Accession Number</p>
                  <p className="text-white font-semibold">
                    {report.report_metadata.accession_number}
                  </p>
                </div>
              )}
              {report.report_metadata.sample_type && (
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Sample Type</p>
                  <p className="text-white font-semibold">
                    {report.report_metadata.sample_type}
                  </p>
                </div>
              )}
              {report.report_metadata.collection_date && (
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Collection Date</p>
                  <p className="text-white font-semibold">
                    {formatDate(report.report_metadata.collection_date)}
                  </p>
                </div>
              )}
              {report.report_metadata.report_date && (
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Report Date</p>
                  <p className="text-white font-semibold">
                    {formatDate(report.report_metadata.report_date)}
                  </p>
                </div>
              )}
              {report.report_metadata.lab_name && (
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Lab Name</p>
                  <p className="text-white font-semibold">
                    {report.report_metadata.lab_name}
                  </p>
                </div>
              )}
              {report.report_metadata.lab_director && (
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Lab Director</p>
                  <p className="text-white font-semibold">
                    {report.report_metadata.lab_director}
                  </p>
                </div>
              )}
            </div>
            {report.report_metadata.notes && (
              <div className="mt-4 bg-gray-900/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-2">Notes</p>
                <p className="text-white leading-relaxed">
                  {report.report_metadata.notes}
                </p>
              </div>
            )}
          </Section>
        )}

        {/* Test Results */}
        {report.test_results && report.test_results.length > 0 && (
          <Section title="Test Results" icon={Beaker} sectionKey="test-results">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm">
                      Test Name
                    </th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm">
                      Result
                    </th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm">
                      Reference Range
                    </th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {report.test_results.map((test, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-800 hover:bg-gray-900/50"
                    >
                      <td className="py-4 px-4">
                        <p className="text-white font-medium">
                          {test.test_name}
                        </p>
                        {test.test_category && (
                          <p className="text-gray-500 text-sm">
                            {test.test_category}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-white">
                          {test.result_value}{" "}
                          {test.unit && (
                            <span className="text-gray-400">{test.unit}</span>
                          )}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-gray-400">
                        {test.reference_range || test.cutoff_value || "N/A"}
                      </td>
                      <td className="py-4 px-4">
                        {test.outcome && (
                          <span
                            className={`inline-flex items-center space-x-1 px-3 py-1 rounded-lg border text-sm font-medium ${getOutcomeColor(test.outcome, test.is_abnormal, test.is_critical)}`}
                          >
                            {test.is_critical && <AlertCircle size={14} />}
                            {test.is_abnormal && !test.is_critical && (
                              <AlertCircle size={14} />
                            )}
                            {!test.is_abnormal && !test.is_critical && (
                              <CheckCircle2 size={14} />
                            )}
                            <span>{test.outcome}</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        )}

        {/* Specimen Validity */}
        {report.specimen_validity && (
          <Section
            title="Specimen Validity"
            icon={CheckCircle2}
            sectionKey="specimen"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {report.specimen_validity.is_valid !== undefined && (
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Overall Status</p>
                  <div className="flex items-center space-x-2">
                    {report.specimen_validity.is_valid ? (
                      <CheckCircle2 className="text-green-400" size={20} />
                    ) : (
                      <XCircle className="text-red-400" size={20} />
                    )}
                    <p className="text-white font-semibold">
                      {report.specimen_validity.is_valid ? "Valid" : "Invalid"}
                    </p>
                  </div>
                </div>
              )}
              {report.specimen_validity.specific_gravity !== undefined && (
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Specific Gravity</p>
                  <p className="text-white font-semibold">
                    {report.specimen_validity.specific_gravity}
                  </p>
                  {report.specimen_validity.specific_gravity_status && (
                    <p className="text-gray-500 text-sm">
                      {report.specimen_validity.specific_gravity_status}
                    </p>
                  )}
                </div>
              )}
              {report.specimen_validity.ph_level !== undefined && (
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">pH Level</p>
                  <p className="text-white font-semibold">
                    {report.specimen_validity.ph_level}
                  </p>
                  {report.specimen_validity.ph_status && (
                    <p className="text-gray-500 text-sm">
                      {report.specimen_validity.ph_status}
                    </p>
                  )}
                </div>
              )}
              {report.specimen_validity.creatinine !== undefined && (
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Creatinine</p>
                  <p className="text-white font-semibold">
                    {report.specimen_validity.creatinine}
                  </p>
                  {report.specimen_validity.creatinine_status && (
                    <p className="text-gray-500 text-sm">
                      {report.specimen_validity.creatinine_status}
                    </p>
                  )}
                </div>
              )}
              {report.specimen_validity.oxidants && (
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Oxidants</p>
                  <p className="text-white font-semibold">
                    {report.specimen_validity.oxidants}
                  </p>
                  {report.specimen_validity.oxidants_status && (
                    <p className="text-gray-500 text-sm">
                      {report.specimen_validity.oxidants_status}
                    </p>
                  )}
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Screening Tests */}
        {report.screening_tests && report.screening_tests.length > 0 && (
          <Section title="Screening Tests" icon={Beaker} sectionKey="screening">
            <div className="space-y-3">
              {report.screening_tests.map((test, index) => (
                <div
                  key={index}
                  className="bg-gray-900/50 rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-white font-medium">{test.test_name}</p>
                    {test.result_value && (
                      <p className="text-gray-400 text-sm">
                        Value: {test.result_value}
                      </p>
                    )}
                    {test.cutoff_value && (
                      <p className="text-gray-500 text-sm">
                        Cutoff: {test.cutoff_value}
                      </p>
                    )}
                  </div>
                  {test.outcome && (
                    <span
                      className={`px-3 py-1 rounded-lg border text-sm font-medium ${getOutcomeColor(test.outcome)}`}
                    >
                      {test.outcome}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Confirmation Tests */}
        {report.confirmation_tests && report.confirmation_tests.length > 0 && (
          <Section
            title="Confirmation Tests"
            icon={Beaker}
            sectionKey="confirmation"
          >
            <div className="space-y-3">
              {report.confirmation_tests.map((test, index) => (
                <div key={index} className="bg-gray-900/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white font-medium">{test.test_name}</p>
                    {test.outcome && (
                      <span
                        className={`px-3 py-1 rounded-lg border text-sm font-medium ${getOutcomeColor(test.outcome)}`}
                      >
                        {test.outcome}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    {test.method && (
                      <div>
                        <p className="text-gray-500">Method</p>
                        <p className="text-gray-300">{test.method}</p>
                      </div>
                    )}
                    {test.result_value && (
                      <div>
                        <p className="text-gray-500">Result</p>
                        <p className="text-gray-300">
                          {test.result_value} {test.unit}
                        </p>
                      </div>
                    )}
                    {test.cutoff_value && (
                      <div>
                        <p className="text-gray-500">Cutoff</p>
                        <p className="text-gray-300">{test.cutoff_value}</p>
                      </div>
                    )}
                    {test.detection_window && (
                      <div>
                        <p className="text-gray-500">Detection Window</p>
                        <p className="text-gray-300">{test.detection_window}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Medications */}
        {report.medications && report.medications.length > 0 && (
          <Section
            title="Reported Medications"
            icon={Pill}
            sectionKey="medications"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {report.medications.map((med, index) => (
                <div
                  key={index}
                  className="bg-gray-900/50 rounded-lg p-3 flex items-center justify-between"
                >
                  <p className="text-white">{med.medication_name}</p>
                  {med.is_tested !== undefined && (
                    <span
                      className={`px-2 py-1 rounded text-xs ${med.is_tested ? "bg-blue-500/20 text-blue-400" : "bg-gray-500/20 text-gray-400"}`}
                    >
                      {med.is_tested ? "Tested" : "Not Tested"}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>

      {/* Media Modal */}
      {showMediaModal && report.reports_media && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowMediaModal(false)}
        >
          <div
            className="bg-gray-800 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-auto border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between z-10">
              <div>
                <h3 className="text-xl font-bold text-white">Report Files</h3>
                <p className="text-sm text-gray-400">
                  Viewing {selectedMediaIndex + 1} of{" "}
                  {report.reports_media.length}
                </p>
              </div>
              <button
                onClick={() => setShowMediaModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="p-6 relative">
              <img
                src={report.reports_media[selectedMediaIndex].url}
                alt={`Report page ${selectedMediaIndex + 1}`}
                className="w-full rounded-lg"
              />

              {report.reports_media.length > 1 && (
                <>
                  <button
                    onClick={() => navigateMedia("prev")}
                    disabled={selectedMediaIndex === 0}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-gray-900/90 hover:bg-gray-900 text-white p-3 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={() => navigateMedia("next")}
                    disabled={
                      selectedMediaIndex === report.reports_media.length - 1
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-900/90 hover:bg-gray-900 text-white p-3 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>

            {report.reports_media.length > 1 && (
              <div className="border-t border-gray-700 p-4">
                <div className="flex space-x-2 overflow-x-auto">
                  {report.reports_media.map((media, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedMediaIndex(index)}
                      className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        index === selectedMediaIndex
                          ? "border-blue-500 scale-105"
                          : "border-gray-600 hover:border-gray-500"
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
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportDetailPage;
