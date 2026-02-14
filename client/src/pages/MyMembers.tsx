import { useState, useEffect } from "react";
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
  Users
} from "lucide-react";
import { apiCall } from "../lib/apiCall";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";

// Define the shape of our Patient data
interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  dob: string;
  gender: string;
}

type TabType = "upload" | "trends" | "ask";

export default function MembersDashboard() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("upload");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch patients on component mount
  useEffect(() => {
    fetchPatients();
  }, []);

  async function fetchPatients() {
    try {
      setLoading(true);
      // Assuming you have this endpoint to get all patients for the user
      const res = await apiCall("/patients"); 
      setPatients(res.data || res); // Adjust based on your actual API response structure
      
      // Auto-select the first patient if the list isn't empty
      if (res && res.length > 0) {
        setSelectedPatient(res[0]);
      }
    } catch (e) {
      toast.error("Failed to load members.");
    } finally {
      setLoading(false);
    }
  }

  // Calculate age dynamically from DOB
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
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col md:flex-row font-sans text-gray-100">
      
      {/* SIDEBAR: Members List */}
      <aside className="w-full md:w-80 lg:w-96 bg-gray-900 border-r border-gray-800 flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <User className="text-blue-400" size={24} />
              Family Members
            </h2>
            <button 
              onClick={() => navigate("/dashboard")} // Route back to dashboard to use the modal, or add modal here
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 transition-colors"
              title="Add Member"
            >
              <Plus size={20} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Patient List */}
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
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg ${
                    patient.gender === "M" ? "bg-blue-500/20 text-blue-400" : "bg-pink-500/20 text-pink-400"
                  }`}>
                    {patient.first_name[0]}{patient.last_name[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-100">
                      {patient.first_name} {patient.last_name}
                    </h3>
                    <p className="text-sm text-gray-400 flex items-center gap-1">
                      <Calendar size={14} /> 
                      {calculateAge(patient.dob)} yrs • {patient.gender === "M" ? "Male" : "Female"}
                    </p>
                  </div>
                </div>
                <ChevronRight 
                  size={20} 
                  className={selectedPatient?.id === patient.id ? "text-blue-400" : "text-gray-600"} 
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
            {/* Header for Selected Patient */}
            <header className="bg-gray-900 border-b border-gray-800 px-8 py-6 flex-shrink-0">
              <div className="flex items-center gap-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-xl ${
                    selectedPatient.gender === "M" ? "bg-blue-500/20 text-blue-400" : "bg-pink-500/20 text-pink-400"
                  }`}>
                    {selectedPatient.first_name[0]}{selectedPatient.last_name[0]}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">
                    {selectedPatient.first_name} {selectedPatient.last_name}
                  </h1>
                  <p className="text-gray-400">
                    Patient ID: #{selectedPatient.id} • DOB: {selectedPatient.dob}
                  </p>
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="flex gap-8 mt-8 border-b border-gray-800">
                <button
                  onClick={() => setActiveTab("upload")}
                  className={`pb-4 text-sm font-medium transition-colors relative flex items-center gap-2 ${
                    activeTab === "upload" ? "text-blue-400" : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  <Upload size={18} />
                  Upload Report
                  {activeTab === "upload" && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("trends")}
                  className={`pb-4 text-sm font-medium transition-colors relative flex items-center gap-2 ${
                    activeTab === "trends" ? "text-blue-400" : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  <Activity size={18} />
                  Analyze Trends
                  {activeTab === "trends" && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("ask")}
                  className={`pb-4 text-sm font-medium transition-colors relative flex items-center gap-2 ${
                    activeTab === "ask" ? "text-blue-400" : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  <MessageSquare size={18} />
                  Ask AI
                  {activeTab === "ask" && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full" />
                  )}
                </button>
              </div>
            </header>

            {/* Tab Content Area */}
            <div className="flex-1 overflow-y-auto p-8">
              {activeTab === "upload" && (
                <div className="animate-fade-in">
                  {/* Placeholder for your actual Upload Component */}
                  <div className="border-2 border-dashed border-gray-800 rounded-2xl p-12 text-center bg-gray-900/50">
                    <Upload className="mx-auto text-gray-500 mb-4" size={48} />
                    <h3 className="text-xl font-bold text-white mb-2">Upload Medical Records</h3>
                    <p className="text-gray-400 mb-6">Drop your PDFs, images, or lab results here to add them to {selectedPatient.first_name}'s profile.</p>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors cursor-pointer">
                      Select Files
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "trends" && (
                <div className="animate-fade-in">
                  {/* Placeholder for Charts Component */}
                  <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <Activity className="text-green-400" size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-white">Health Biomarkers over Time</h3>
                    </div>
                    <div className="h-64 flex items-center justify-center border border-gray-800 rounded-xl bg-gray-950 text-gray-500">
                      [ Interactive Line Charts will render here ]
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "ask" && (
                <div className="animate-fade-in h-full flex flex-col">
                  {/* Placeholder for Chat Interface */}
                  <div className="flex-1 bg-gray-900 rounded-2xl border border-gray-800 p-6 flex flex-col shadow-lg min-h-[400px]">
                    <div className="flex-1 flex flex-col items-center justify-center text-center px-4 mb-6">
                      <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4">
                        <MessageSquare className="text-blue-400" size={32} />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">Chat with HealthScan AI</h3>
                      <p className="text-gray-400 max-w-md">
                        Ask questions about {selectedPatient.first_name}'s uploaded reports. Try asking "What does the recent lipid panel indicate?"
                      </p>
                    </div>
                    {/* Fake Input */}
                    <div className="relative mt-auto">
                      <input 
                        type="text" 
                        placeholder={`Ask a question about ${selectedPatient.first_name}'s health...`} 
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
          /* Empty State: No Patient Selected */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center mb-6 shadow-xl border border-gray-800">
              <Users className="text-gray-500" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">No Member Selected</h2>
            <p className="text-gray-400 max-w-sm">
              Select a family member from the sidebar to view their reports, analyze health trends, and consult the AI.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}