import { useState, useEffect, useRef } from "react";
import {
  Activity,
  Upload,
  Search,
  Loader2,
  Calendar,
  ChevronRight,
  Users,
  X,
  FileText,
  UploadCloud,
  List,
  ArrowLeft,
} from "lucide-react";
import { apiCall } from "../lib/apiCall";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import ReportList, { type Report } from "../components/ReportList";
import HealthTrendChart from "../components/HealthTrendChart";
import { motion, AnimatePresence } from "framer-motion";

interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  dob: string;
  gender: string;
}

type TabType = "upload" | "trends" | "ask";
type UploadSubTabType = "upload" | "view";

export default function MembersDashboard() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientReports, setPatientReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

  // Tab states
  const [activeTab, setActiveTab] = useState<TabType>("upload");
  const [uploadSubTab, setUploadSubTab] = useState<UploadSubTabType>("upload");
  const [test_names, set_test_names] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSelectedTrend, setCurrentSelectedTrend] = useState<
    string | null
  >(null);

  // Upload specific state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    setSelectedFiles([]);
    setUploadSubTab("upload");
  }, [selectedPatient, activeTab]);

  async function fetchPatients() {
    try {
      setLoading(true);
      const res = await apiCall("/patients");
      setPatients(res.data || res);

      if (res && res.length > 0) {
        setSelectedPatient(res[0]);
      }
    } catch (e) {
      toast.error("Failed to load members.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchPatientReports() {
    try {
      if (!selectedPatient) return;
      setLoadingReports(true);
      const res = await apiCall(
        "/patients/reports?patient_id=" + selectedPatient.id,
      );
      setPatientReports(res);
    } catch (e) {
      toast.error("Failed to load reports.");
    } finally {
      setLoadingReports(false);
    }
  }

  useEffect(() => {
    if (uploadSubTab === "view") {
      fetchPatientReports();
    }
  }, [selectedPatient, uploadSubTab]);

  const calculateAge = (dobString: string) => {
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const filteredPatients = patients.filter((p) =>
    `${p.first_name} ${p.last_name}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (selectedFiles.length + newFiles.length > 5) {
        toast.error("You can only upload up to 5 files at a time.");
        return;
      }
      setSelectedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (indexToRemove: number) => {
    setSelectedFiles((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || !selectedPatient) return;

    setIsUploading(true);
    const formData = new FormData();

    formData.append("patient_id", selectedPatient.id.toString());
    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      await apiCall("/report/upload", "POST", formData, "multipart/form-data");
      toast.success("Reports uploaded successfully!");
      setSelectedFiles([]);
      setUploadSubTab("view");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong during upload.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    setCurrentSelectedTrend(null);
  }, [selectedPatient]);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col md:flex-row font-sans text-gray-100 selection:bg-blue-500/30 overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-full md:w-80 lg:w-96 bg-gray-900/80 backdrop-blur-xl border-r border-gray-800 flex flex-col h-screen sticky top-0 z-20 shadow-2xl">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 tracking-tight">
              <motion.button
                whileHover={{
                  scale: 1.05,
                  backgroundColor: "rgba(31, 41, 55, 1)",
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/dashboard`)}
                className="text-gray-400 hover:text-white transition-colors p-2 rounded-xl border border-transparent hover:border-gray-700"
              >
                <ArrowLeft size={22} />
              </motion.button>
              <Users className="text-blue-400" size={24} />
              Family Members
            </h2>
          </div>

          <div className="relative">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
              size={18}
            />
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
          ) : filteredPatients.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-10 text-gray-500 text-sm"
            >
              No members found.
            </motion.div>
          ) : (
            <AnimatePresence>
              {filteredPatients.map((patient, index) => (
                <motion.button
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  key={patient.id}
                  onClick={() => {
                    setCurrentSelectedTrend(null);
                    set_test_names([]);
                    setSelectedPatient(patient);
                  }}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 border text-left group ${
                    selectedPatient?.id === patient.id
                      ? "bg-linear-to-r from-blue-900/30 to-gray-800/50 border-blue-500/40 shadow-lg shadow-blue-500/5"
                      : "bg-gray-950/30 border-transparent hover:bg-gray-800/50 hover:border-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-inner border ${
                        patient.gender === "M"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          : "bg-pink-500/10 text-pink-400 border-pink-500/20"
                      }`}
                    >
                      {patient.first_name[0]}
                      {patient.last_name[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-100 tracking-tight">
                        {patient.first_name} {patient.last_name}
                      </h3>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5 font-medium">
                        <Calendar size={12} />
                        {calculateAge(patient.dob)} yrs •{" "}
                        {patient.gender === "M" ? "Male" : "Female"}
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    size={20}
                    className={`transition-transform duration-300 ${
                      selectedPatient?.id === patient.id
                        ? "text-blue-400 translate-x-1"
                        : "text-gray-600 group-hover:text-gray-400"
                    }`}
                  />
                </motion.button>
              ))}
            </AnimatePresence>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-green-600/5 blur-[120px] rounded-full pointer-events-none" />

        <AnimatePresence mode="wait">
          {selectedPatient ? (
            <motion.div
              key="content"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col h-full z-10"
            >
              <header className="bg-gray-900/50 backdrop-blur-md border-b border-gray-800 px-8 py-8 shrink-0">
                <div className="flex items-center gap-6">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`w-20 h-20 rounded-4xl flex items-center justify-center font-bold text-3xl shadow-xl border ${
                      selectedPatient.gender === "M"
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        : "bg-pink-500/10 text-pink-400 border-pink-500/20"
                    }`}
                  >
                    {selectedPatient.first_name[0]}
                    {selectedPatient.last_name[0]}
                  </motion.div>
                  <div>
                    <motion.h1
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight"
                    >
                      {selectedPatient.first_name} {selectedPatient.last_name}
                    </motion.h1>
                    <motion.p
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="text-sm text-gray-400 font-medium bg-gray-800/50 w-fit px-3 py-1 rounded-full border border-gray-700/50"
                    >
                      Patient ID: #{selectedPatient.id} • DOB:{" "}
                      {selectedPatient.dob}
                    </motion.p>
                  </div>
                </div>

                {/* Main Tabs Navigation */}
                <div className="flex gap-8 mt-10 border-b border-gray-800/80">
                  {(
                    [
                      { id: "upload", label: "Manage Reports", icon: Upload },
                      { id: "trends", label: "Analyze Trends", icon: Activity },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`pb-4 text-sm font-semibold transition-colors relative flex items-center gap-2 ${
                        activeTab === tab.id
                          ? "text-white"
                          : "text-gray-400 hover:text-gray-200"
                      }`}
                    >
                      <tab.icon
                        size={18}
                        className={activeTab === tab.id ? "text-blue-400" : ""}
                      />
                      {tab.label}
                      {activeTab === tab.id && (
                        <motion.div
                          layoutId="mainTabIndicator"
                          className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full shadow-[0_-2px_8px_rgba(59,130,246,0.5)]"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </header>

              {/* Tab Content Area */}
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <AnimatePresence mode="wait">
                  {/* UPLOAD / VIEW REPORTS TAB */}
                  {activeTab === "upload" && (
                    <motion.div
                      key="upload-tab"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="max-w-4xl mx-auto w-full"
                    >
                      {/* SUB-TABS (Pill Style) */}
                      <div className="flex gap-2 mb-8 bg-gray-900/80 p-1.5 rounded-xl w-fit border border-gray-800 backdrop-blur-sm relative">
                        {(["upload", "view"] as const).map((subTab) => (
                          <button
                            key={subTab}
                            onClick={() => setUploadSubTab(subTab)}
                            className={`relative flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors z-10 ${
                              uploadSubTab === subTab
                                ? "text-white"
                                : "text-gray-400 hover:text-gray-200"
                            }`}
                          >
                            {uploadSubTab === subTab && (
                              <motion.div
                                layoutId="subTabIndicator"
                                className="absolute inset-0 bg-gray-800 rounded-lg border border-gray-700 shadow-sm z-[-1]"
                              />
                            )}
                            {subTab === "upload" ? (
                              <UploadCloud size={18} />
                            ) : (
                              <List size={18} />
                            )}
                            {subTab === "upload"
                              ? "Upload New"
                              : "View Reports"}
                          </button>
                        ))}
                      </div>

                      {/* SUB-TAB CONTENT */}
                      <AnimatePresence mode="wait">
                        {uploadSubTab === "upload" ? (
                          <motion.div
                            key="upload-content"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                          >
                            <input
                              type="file"
                              multiple
                              className="hidden"
                              ref={fileInputRef}
                              onChange={handleFileSelect}
                              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            />

                            <motion.div
                              whileHover={{
                                scale: 1.01,
                                borderColor: "rgba(59, 130, 246, 0.5)",
                              }}
                              className="border-2 border-dashed border-gray-800 rounded-4xl p-16 text-center bg-gray-900/40 backdrop-blur-sm transition-colors cursor-pointer group"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-500/20 transition-colors">
                                <Upload className="text-blue-400" size={36} />
                              </div>
                              <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">
                                Upload Medical Records
                              </h3>
                              <p className="text-gray-400 mb-8 max-w-sm mx-auto">
                                Click or drop PDFs and images here to securely
                                add them to {selectedPatient.first_name}'s
                                encrypted profile.
                              </p>
                              <button className="bg-white text-gray-950 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-lg">
                                Browse Files
                              </button>
                            </motion.div>

                            {/* Selected Files List */}
                            <AnimatePresence>
                              {selectedFiles.length > 0 && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-8 overflow-hidden"
                                >
                                  <h4 className="text-lg font-bold text-white mb-4">
                                    Selected Files ({selectedFiles.length}/5)
                                  </h4>
                                  <div className="space-y-3 mb-8">
                                    {selectedFiles.map((file, index) => (
                                      <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        key={index}
                                        className="flex items-center justify-between bg-gray-900/80 border border-gray-800 p-4 rounded-xl backdrop-blur-sm"
                                      >
                                        <div className="flex items-center gap-4 overflow-hidden">
                                          <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0">
                                            <FileText
                                              className="text-blue-400"
                                              size={20}
                                            />
                                          </div>
                                          <div className="truncate">
                                            <p className="text-sm font-semibold text-gray-200 truncate">
                                              {file.name}
                                            </p>
                                            <p className="text-xs text-gray-500 font-medium">
                                              {(
                                                file.size /
                                                1024 /
                                                1024
                                              ).toFixed(2)}{" "}
                                              MB
                                            </p>
                                          </div>
                                        </div>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            removeFile(index);
                                          }}
                                          className="text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors p-2 rounded-lg"
                                        >
                                          <X size={18} />
                                        </button>
                                      </motion.div>
                                    ))}
                                  </div>

                                  <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleUpload}
                                    disabled={isUploading}
                                    className="w-full bg-linear-to-r from-blue-600 to-green-600 text-white py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/25 transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                                  >
                                    {isUploading ? (
                                      <>
                                        <Loader2
                                          className="animate-spin"
                                          size={22}
                                        />{" "}
                                        Uploading securely...
                                      </>
                                    ) : (
                                      <>
                                        <UploadCloud size={22} /> Confirm &
                                        Upload {selectedFiles.length} Files
                                      </>
                                    )}
                                  </motion.button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="view-content"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                          >
                            {loadingReports ? (
                              <div className="flex justify-center py-20">
                                <Loader2
                                  className="animate-spin text-blue-500"
                                  size={40}
                                />
                              </div>
                            ) : (
                              <ReportList reports={patientReports} />
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}

                  {activeTab === "trends" && (
                    <motion.div
                      key="trends-tab"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="h-full"
                    >
                      <HealthTrendChart
                        patientId={selectedPatient.id}
                        setCurrentSelectedTrend={setCurrentSelectedTrend}
                        currentSelectedTrend={currentSelectedTrend}
                        test_names={test_names}
                        set_test_names={set_test_names}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center p-8 text-center z-10"
            >
              <div className="w-28 h-28 bg-gray-900/80 backdrop-blur-xl rounded-4xl flex items-center justify-center mb-6 shadow-2xl border border-gray-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 to-transparent" />
                <Users className="text-gray-400 relative z-10" size={48} />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">
                No Member Selected
              </h2>
              <p className="text-gray-400 max-w-md text-lg leading-relaxed">
                Select a family member from the sidebar to securely view their
                reports, analyze health trends, and consult the AI.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Global CSS for Custom Scrollbar (Add to your global CSS if not present) */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
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
}
