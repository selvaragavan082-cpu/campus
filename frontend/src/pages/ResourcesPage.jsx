import React, { useState, useEffect } from 'react';
import { resourceService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ResourceUploadModal from '../components/ResourceUploadModal';
import {
  FolderDown,
  Search,
  Plus,
  Download,
  FileText,
  Trash2,
  Filter,
  GraduationCap,
  Building,
  Sparkles,
} from 'lucide-react';

const DEPARTMENTS = ['All', 'Computer Science', 'Information Technology', 'AI & Data Science', 'Electronics & Comm', 'Mechanical', 'Civil', 'Electrical', 'General'];
const TYPES = ['All', 'Notes', 'Syllabus', 'Question Paper', 'Lab Manual', 'Assignment'];
const SEMESTERS = ['All', '1', '2', '3', '4', '5', '6', '7', '8'];

const ResourcesPage = () => {
  const { user, isAdmin, isStaff } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [type, setType] = useState('All');
  const [semester, setSemester] = useState(user?.role === 'student' ? String(user.semester || 4) : 'All');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await resourceService.getAll({
        department: department === 'All' ? undefined : department,
        type: type === 'All' ? undefined : type,
        semester: semester === 'All' ? undefined : semester,
      });
      if (res.data?.success) {
        setResources(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [department, type, semester]);

  const handleDownload = async (id, fileUrl) => {
    try {
      await resourceService.trackDownload(id);
      window.open(fileUrl, '_blank');
      // Update local download count
      setResources((prev) =>
        prev.map((r) => (r._id === id ? { ...r, downloadCount: (r.downloadCount || 0) + 1 } : r))
      );
    } catch (err) {
      window.open(fileUrl, '_blank');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      await resourceService.delete(id);
      fetchResources();
    }
  };

  const filteredResources = resources.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.subjectName.toLowerCase().includes(q) ||
      item.subjectCode.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <FolderDown className="w-6 h-6 text-teal-600" /> Academic Resources Repository
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Download lecture notes, official course syllabi, lab manuals, and previous year solved question papers
          </p>
        </div>

        {(isAdmin || isStaff) && (
          <button
            onClick={() => setUploadModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-500/20 flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" /> Upload Material
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by subject name, code (e.g. CS301), topic or keyword..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-slate-100">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Semester</label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {SEMESTERS.map((s) => (
                <option key={s} value={s}>
                  {s === 'All' ? 'All Semesters' : `Semester ${s}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Resource Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full text-center py-12 text-slate-400 text-sm">Loading materials...</div>
        ) : filteredResources.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-400 text-sm">
            No study resources found matching the selected filters.
          </div>
        ) : (
          filteredResources.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between hover:border-teal-300 hover:shadow-md transition group"
            >
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    item.type === 'Notes' ? 'bg-teal-100 text-teal-800' :
                    item.type === 'Question Paper' ? 'bg-purple-100 text-purple-800' :
                    item.type === 'Syllabus' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'
                  }`}>
                    {item.type}
                  </span>
                  <span className="text-[11px] font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    Sem {item.semester}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition">
                    {item.title}
                  </h3>
                  <p className="text-xs font-semibold text-teal-600 mt-0.5">
                    {item.subjectName} ({item.subjectCode})
                  </p>
                </div>

                {item.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                )}

                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Uploaded by: <strong className="text-slate-700">{item.uploaderName}</strong></span>
                    <span>{item.fileSize}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{item.department}</span>
                    <span>📥 {item.downloadCount || 0} downloads</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleDownload(item._id, item.fileUrl)}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" /> Download File
                </button>

                {(isAdmin || (isStaff && item.uploadedBy?._id === user?._id)) && (
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete Resource"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <ResourceUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={fetchResources}
      />
    </div>
  );
};

export default ResourcesPage;
