import { useState, useEffect, useRef } from "react";
import {
  User,
  Activity,
  Upload,
  MessageSquare,
  Search,
  Plus,
  Loader2,
  Calendar,
  ChevronRight,
  Users,
  X,
  FileText,
  UploadCloud, // Added for sub-tab icon
  List, // Added for sub-tab icon
} from "lucide-react";
import { apiCall } from "../lib/apiCall";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import ReportList, { type Report } from "../components/ReportList";

// Define the shape of our Patient data
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
  const [searchQuery, setSearchQuery] = useState("");

  // Upload specific state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch patients on component mount
  useEffect(() => {
    fetchPatients();
  }, []);

  // Reset files and sub-tabs when changing patients or main tabs
  useEffect(() => {
    setSelectedFiles([]);
    setUploadSubTab("upload"); // Reset to upload view when switching patients
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
      toast.error("Failed to load members.");
    } finally {
      setLoadingReports(false);
    }
  }

  useEffect(() => {
    if (uploadSubTab == "view") {
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

  // --- UPLOAD HANDLERS ---
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
      // Optionally switch to the 'view' tab to see the newly uploaded report
      setUploadSubTab("view");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong during upload.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col md:flex-row font-sans text-gray-100">
      {/* SIDEBAR */}
      <aside className="w-full md:w-80 lg:w-96 bg-gray-900 border-r border-gray-800 flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <User className="text-blue-400" size={24} />
              Family Members
            </h2>
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 transition-colors cursor-pointer"
              title="Add Member"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              size={18}
            />
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No members found.
            </div>
          ) : (
            filteredPatients.map((patient) => (
              <button
                key={patient.id}
                onClick={() => setSelectedPatient(patient)}
                className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 ${
                  selectedPatient?.id === patient.id
                    ? "bg-linear-to-r from-blue-900/40 to-gray-800 border-blue-500/50"
                    : "bg-gray-950/50 border-transparent hover:bg-gray-800"
                } border text-left cursor-pointer`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg ${
                      patient.gender === "M"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-pink-500/20 text-pink-400"
                    }`}
                  >
                    {patient.first_name[0]}
                    {patient.last_name[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-100">
                      {patient.first_name} {patient.last_name}
                    </h3>
                    <p className="text-sm text-gray-400 flex items-center gap-1">
                      <Calendar size={14} />
                      {calculateAge(patient.dob)} yrs •{" "}
                      {patient.gender === "M" ? "Male" : "Female"}
                    </p>
                  </div>
                </div>
                <ChevronRight
                  size={20}
                  className={
                    selectedPatient?.id === patient.id
                      ? "text-blue-400"
                      : "text-gray-600"
                  }
                />
              </button>
            ))
          )}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-950">
        {selectedPatient ? (
          <>
            <header className="bg-gray-900 border-b border-gray-800 px-8 py-6 flex-shrink-0">
              <div className="flex items-center gap-6">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-xl ${
                    selectedPatient.gender === "M"
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-pink-500/20 text-pink-400"
                  }`}
                >
                  {selectedPatient.first_name[0]}
                  {selectedPatient.last_name[0]}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">
                    {selectedPatient.first_name} {selectedPatient.last_name}
                  </h1>
                  <p className="text-gray-400">
                    Patient ID: #{selectedPatient.id} • DOB:{" "}
                    {selectedPatient.dob}
                  </p>
                </div>
              </div>

              {/* Main Tabs Navigation */}
              <div className="flex gap-8 mt-8 border-b border-gray-800">
                <button
                  onClick={() => setActiveTab("upload")}
                  className={`pb-4 text-sm font-medium transition-colors relative flex items-center gap-2 ${activeTab === "upload" ? "text-blue-400" : "text-gray-400 hover:text-gray-200"}`}
                >
                  <Upload size={18} /> Manage Reports
                  {activeTab === "upload" && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("trends")}
                  className={`pb-4 text-sm font-medium transition-colors relative flex items-center gap-2 ${activeTab === "trends" ? "text-blue-400" : "text-gray-400 hover:text-gray-200"}`}
                >
                  <Activity size={18} /> Analyze Trends
                  {activeTab === "trends" && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("ask")}
                  className={`pb-4 text-sm font-medium transition-colors relative flex items-center gap-2 ${activeTab === "ask" ? "text-blue-400" : "text-gray-400 hover:text-gray-200"}`}
                >
                  <MessageSquare size={18} /> Ask AI
                  {activeTab === "ask" && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full" />
                  )}
                </button>
              </div>
            </header>

            {/* Tab Content Area */}
            <div className="flex-1 overflow-y-auto p-8">
              {/* UPLOAD / VIEW REPORTS TAB */}
              {activeTab === "upload" && (
                <div className="animate-fade-in max-w-3xl">
                  {/* SUB-TABS (Pill Style) */}
                  <div className="flex gap-2 mb-8 bg-gray-900 p-1.5 rounded-xl w-fit border border-gray-800">
                    <button
                      onClick={() => setUploadSubTab("upload")}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                        uploadSubTab === "upload"
                          ? "bg-gray-800 text-white shadow-sm"
                          : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
                      }`}
                    >
                      <UploadCloud size={18} />
                      Upload New
                    </button>
                    <button
                      onClick={() => setUploadSubTab("view")}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                        uploadSubTab === "view"
                          ? "bg-gray-800 text-white shadow-sm"
                          : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
                      }`}
                    >
                      <List size={18} />
                      View Reports
                    </button>
                  </div>

                  {/* SUB-TAB CONTENT: Upload New */}
                  {uploadSubTab === "upload" && (
                    <div className="animate-fade-in">
                      {/* Hidden File Input */}
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      />

                      {/* Dropzone */}
                      <div className="border-2 border-dashed border-gray-700 hover:border-blue-500 rounded-2xl p-12 text-center bg-gray-900/50 transition-colors">
                        <Upload
                          className="mx-auto text-blue-400 mb-4"
                          size={48}
                        />
                        <h3 className="text-xl font-bold text-white mb-2">
                          Upload Medical Records
                        </h3>
                        <p className="text-gray-400 mb-6">
                          Drop your PDFs or images here to add them to{" "}
                          {selectedPatient.first_name}'s profile.
                        </p>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 px-6 py-2.5 rounded-lg font-medium transition-colors cursor-pointer"
                        >
                          Browse Files
                        </button>
                      </div>

                      {/* Selected Files List */}
                      {selectedFiles.length > 0 && (
                        <div className="mt-8">
                          <h4 className="text-lg font-semibold text-white mb-4">
                            Selected Files ({selectedFiles.length}/5)
                          </h4>
                          <div className="space-y-3 mb-6">
                            {selectedFiles.map((file, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between bg-gray-900 border border-gray-800 p-4 rounded-xl"
                              >
                                <div className="flex items-center gap-3 overflow-hidden">
                                  <FileText
                                    className="text-blue-400 flex-shrink-0"
                                    size={24}
                                  />
                                  <div className="truncate">
                                    <p className="text-sm font-medium text-gray-200 truncate">
                                      {file.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => removeFile(index)}
                                  className="text-gray-500 hover:text-red-400 transition-colors p-2 cursor-pointer"
                                >
                                  <X size={18} />
                                </button>
                              </div>
                            ))}
                          </div>

                          <button
                            onClick={handleUpload}
                            disabled={isUploading}
                            className="w-full bg-linear-to-r from-blue-600 to-green-600 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isUploading ? (
                              <>
                                <Loader2 className="animate-spin" size={20} />
                                Uploading securely...
                              </>
                            ) : (
                              <>
                                <Upload size={20} />
                                Confirm & Upload Files
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* SUB-TAB CONTENT: View Reports */}
                  {uploadSubTab === "view" && (
                    <div className="animate-fade-in">
                      {loadingReports ? (
                        <div className="flex justify-center py-12">
                          <Loader2
                            className="animate-spin text-blue-500"
                            size={32}
                          />
                        </div>
                      ) : (
                        <ReportList reports={patientReports} />
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ... Trends & Ask AI tabs remain unchanged ... */}
              {activeTab === "trends" && (
                <div className="animate-fade-in">
                  <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <Activity className="text-green-400" size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-white">
                        Health Biomarkers over Time
                      </h3>
                    </div>
                    <div className="h-64 flex items-center justify-center border border-gray-800 rounded-xl bg-gray-950 text-gray-500">
                      [ Interactive Line Charts will render here ]
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "ask" && (
                <div className="animate-fade-in h-full flex flex-col">
                  <div className="flex-1 bg-gray-900 rounded-2xl border border-gray-800 p-6 flex flex-col shadow-lg min-h-[400px]">
                    <div className="flex-1 flex flex-col items-center justify-center text-center px-4 mb-6">
                      <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4">
                        <MessageSquare className="text-blue-400" size={32} />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">
                        Chat with HealthScan AI
                      </h3>
                      <p className="text-gray-400 max-w-md">
                        Ask questions about {selectedPatient.first_name}'s
                        uploaded reports.
                      </p>
                    </div>
                    <div className="relative mt-auto">
                      <input
                        type="text"
                        placeholder={`Ask a question...`}
                        className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-4 pr-12 py-4 text-gray-200 focus:outline-none focus:border-blue-500"
                      />
                      <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors">
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center mb-6 shadow-xl border border-gray-800">
              <Users className="text-gray-500" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              No Member Selected
            </h2>
            <p className="text-gray-400 max-w-sm">
              Select a family member from the sidebar to view their reports,
              analyze health trends, and consult the AI.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
