import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { api } from "../../utils/api";
import { Users, Mail, Phone, BookOpen, BarChart3, Eye, MessageCircle } from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorDisplay from "../../components/ErrorDisplay";

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [classProgress, setClassProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => { if (user) fetchStudents(); }, [user]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const [studentsRes, progressRes] = await Promise.all([api.get(`/teachers/${user._id}/students`), api.get(`/progress/class`)]);
      setStudents(studentsRes.data || []);
      setClassProgress(progressRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const sendMessageToStudent = async (studentId, studentName) => {
    const message = prompt(`Enter message for ${studentName}:`);
    if (message) {
      try {
        await api.post('/messages', { receiverId: studentId, subject: 'Message from Teacher', message });
        alert(`Message sent to ${studentName}!`);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to send message");
      }
    }
  };

  const viewStudentDetails = async (student) => {
    try {
      const response = await api.get(`/users/${student._id}`);
      setSelectedStudent({ ...student, details: response.data });
      setShowStudentDetails(true);
    } catch (err) {
      setError("Failed to load student details");
    }
  };

  const getStudentProgress = (studentId) => {
    const prog = classProgress.find(p => p.student && p.student._id === studentId);
    return prog ? { quizScore: prog.progress?.averageScore || 0, resourcesCompleted: prog.completedResources || 0, attendance: prog.progress?.overall || 0 } : { quizScore: 0, resourcesCompleted: 0, attendance: 0 };
  };

  if (loading) return <LoadingSpinner text="Loading students..." />;

  const filteredStudents = students.filter(s => { const prog = getStudentProgress(s._id); if(activeTab==="active") return prog.attendance > 80; if(activeTab==="needsAttention") return prog.quizScore < 60; return true; });
  const classStats = { totalStudents: students.length, passingQuizzes: students.filter(s=>getStudentProgress(s._id).quizScore>=60).length, avgAttendance: students.length ? Math.round(students.reduce((a,s)=>a+getStudentProgress(s._id).attendance,0)/students.length) : 0, activeLearners: students.filter(s=>getStudentProgress(s._id).resourcesCompleted>5).length };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between"><div><h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Student Management</h2><p className="text-cyan-300">Manage and monitor student progress</p></div><div className="text-right"><p className="text-cyan-300 text-sm">Total Students</p><p className="text-2xl font-bold text-white">{students.length}</p></div></div>
      {error && <ErrorDisplay error={error} onRetry={fetchStudents} />}
      <div className="border-b border-cyan-500/30"><nav className="flex space-x-8">{["all","active","needsAttention"].map(tab=>(<button key={tab} onClick={()=>setActiveTab(tab)} className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab===tab ? "border-cyan-400 text-cyan-300" : "border-transparent text-gray-400 hover:text-gray-300"}`}>{tab==="all"?"All Students":tab==="active"?"Active":"Needs Attention"}<span className="text-xs bg-gray-700 px-2 py-0.5 rounded-full">{tab==="all"?students.length:tab==="active"?students.filter(s=>getStudentProgress(s._id).attendance>80).length:students.filter(s=>getStudentProgress(s._id).quizScore<60).length}</span></button>))}</nav></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{filteredStudents.map(s=>{const prog=getStudentProgress(s._id); return (<div key={s._id} className="border border-cyan-500/20 rounded-lg p-4 hover:shadow-neon-cyan transition"><div className="flex items-center gap-3 mb-3"><div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold">{s.firstName[0]}{s.lastName[0]}</div><div><h4 className="font-semibold text-white">{s.firstName} {s.lastName}</h4><p className="text-sm text-cyan-300">Grade {s.grade}</p></div></div><div className="grid grid-cols-3 gap-2 mb-4 text-center"><div><BookOpen className="h-4 w-4 mx-auto text-blue-400" /><div className="text-xs text-gray-400">Quiz Score</div><div className={`text-sm font-bold ${prog.quizScore>=60?"text-green-400":"text-red-400"}`}>{prog.quizScore}%</div></div><div><BarChart3 className="h-4 w-4 mx-auto text-green-400" /><div className="text-xs text-gray-400">Resources</div><div className="text-sm font-bold text-white">{prog.resourcesCompleted}</div></div><div><Users className="h-4 w-4 mx-auto text-purple-400" /><div className="text-xs text-gray-400">Progress</div><div className={`text-sm font-bold ${prog.attendance>=80?"text-green-400":"text-yellow-400"}`}>{prog.attendance}%</div></div></div><div className="flex gap-2"><button onClick={()=>sendMessageToStudent(s._id,`${s.firstName} ${s.lastName}`)} className="btn btn-outline text-sm flex-1 flex items-center justify-center gap-1"><MessageCircle className="h-4 w-4" /> Message</button><button onClick={()=>viewStudentDetails(s)} className="btn btn-primary text-sm flex-1 flex items-center justify-center gap-1"><Eye className="h-4 w-4" /> Details</button></div></div>)} )}{filteredStudents.length===0 && <div className="col-span-full text-center py-12 text-gray-400"><Users className="h-16 w-16 mx-auto mb-3 opacity-50" /><p>No students match filter</p></div>}</div>
      {showStudentDetails && selectedStudent && (<div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50"><div className="bg-black/90 rounded-2xl border border-cyan-500/30 p-6 max-w-md w-full"><div className="flex justify-between"><h3 className="text-xl font-semibold text-cyan-300">Student Details</h3><button onClick={()=>setShowStudentDetails(false)} className="text-gray-400 hover:text-white"><X className="h-6 w-6" /></button></div><div className="space-y-4 mt-4"><div className="flex items-center gap-4"><div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">{selectedStudent.firstName[0]}{selectedStudent.lastName[0]}</div><div><h4 className="text-white font-semibold">{selectedStudent.firstName} {selectedStudent.lastName}</h4><p className="text-cyan-300">Grade {selectedStudent.grade}</p><p className="text-gray-400 text-sm">{selectedStudent.details?.email}</p></div></div><div className="grid grid-cols-2 gap-4"><div className="text-center p-3 bg-blue-500/20 rounded"><div className="text-xl font-bold text-blue-300">{getStudentProgress(selectedStudent._id).quizScore}%</div><div className="text-sm">Quiz Score</div></div><div className="text-center p-3 bg-green-500/20 rounded"><div className="text-xl font-bold text-green-300">{getStudentProgress(selectedStudent._id).resourcesCompleted}</div><div className="text-sm">Completed</div></div></div><button onClick={()=>{setShowStudentDetails(false); sendMessageToStudent(selectedStudent._id, `${selectedStudent.firstName} ${selectedStudent.lastName}`);}} className="btn btn-primary w-full flex items-center justify-center gap-2"><MessageCircle className="h-4 w-4" /> Send Message</button></div></div></div>)}
      {students.length>0 && (<div className="bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-5"><h3 className="text-lg font-semibold text-cyan-300 mb-4">Class Summary</h3><div className="grid grid-cols-4 gap-4"><div className="text-center p-3 bg-blue-500/20 rounded"><div className="text-2xl font-bold text-blue-300">{classStats.totalStudents}</div><div className="text-sm">Total Students</div></div><div className="text-center p-3 bg-green-500/20 rounded"><div className="text-2xl font-bold text-green-300">{classStats.passingQuizzes}</div><div className="text-sm">Passing Quizzes</div></div><div className="text-center p-3 bg-yellow-500/20 rounded"><div className="text-2xl font-bold text-yellow-300">{classStats.avgAttendance}%</div><div className="text-sm">Avg Progress</div></div><div className="text-center p-3 bg-purple-500/20 rounded"><div className="text-2xl font-bold text-purple-300">{classStats.activeLearners}</div><div className="text-sm">Active Learners</div></div></div></div>)}
    </div>
  );
};

export default StudentManagement;