import React, { useState, useEffect } from 'react';
import { announcementService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AnnouncementModal from '../components/AnnouncementModal';
import {
  Megaphone,
  Search,
  Plus,
  Pin,
  Calendar,
  Tag,
  Trash2,
  Edit2,
  Users,
  Shield,
} from 'lucide-react';

const CATEGORIES = ['All', 'General', 'Academic', 'Exam', 'Placement', 'Sports', 'Event', 'Urgent', 'Holiday'];

const AnnouncementsPage = () => {
  const { user, isAdmin, isStaff } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await announcementService.getAll({
        category: selectedCategory,
      });
      if (res.data?.success) {
        setAnnouncements(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [selectedCategory]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      await announcementService.delete(id);
      fetchAnnouncements();
    }
  };

  const filteredAnnouncements = announcements.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <Megaphone className="w-6 h-6 text-purple-600" /> Campus Bulletin & Circulars
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Official announcements, academic updates, exam schedules, and urgent notifications
          </p>
        </div>

        {(isAdmin || isStaff) && (
          <button
            onClick={() => {
              setEditingItem(null);
              setModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-500/20 flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" /> Publish Announcement
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search circulars by keyword..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm">Loading announcements...</div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-400 text-sm">
            No announcements found matching your criteria.
          </div>
        ) : (
          filteredAnnouncements.map((item) => (
            <div
              key={item._id}
              className={`p-5 sm:p-6 rounded-3xl bg-white border transition shadow-2xs space-y-3 ${
                item.isPinned ? 'border-purple-300 ring-1 ring-purple-100' : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    {item.isPinned && (
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-extrabold flex items-center gap-1">
                        <Pin className="w-3 h-3 text-purple-600" /> Pinned
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                      {item.category}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        item.priority === 'urgent'
                          ? 'bg-rose-100 text-rose-800'
                          : item.priority === 'high'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-50 text-blue-800'
                      }`}
                    >
                      {item.priority} Priority
                    </span>
                    <span className="text-xs text-slate-400">
                      Audience: <strong className="capitalize">{item.targetAudience}</strong>
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900">{item.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
                  </span>

                  {(isAdmin || (isStaff && item.author?._id === user?._id)) && (
                    <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setModalOpen(true);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {item.description}
              </p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Posted by: <strong>{item.authorName || item.author?.name || 'Administrative Office'}</strong>
                </span>
                <span className="text-slate-400 text-[11px]">{item.department || 'All Departments'}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <AnnouncementModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchAnnouncements}
        initialData={editingItem}
      />
    </div>
  );
};

export default AnnouncementsPage;
