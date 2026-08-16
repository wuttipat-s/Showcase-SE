'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Project } from '@/components/ProjectShowcase';
import { Trash2, Plus, ArrowLeft, Pencil, X } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const initialFormState = {
    title: '',
    short_description: '',
    full_description: '',
    logo_url: '',
    figma_url: '',
    doc_url: '',
    presentation_url: '',
    display_order: 0,
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchProjects = async () => {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('display_order', { ascending: true });
    if (data) setProjects(data as Project[]);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleResetForm = () => {
    setFormData({
      ...initialFormState,
      display_order: projects.length + 1,
    });
    setEditingId(null);
  };

  const handleEditSelect = (project: Project) => {
    setEditingId(project.id);
    setFormData({
      title: project.title || '',
      short_description: project.short_description || '',
      full_description: project.full_description || '',
      logo_url: project.logo_url || '',
      figma_url: project.figma_url || '',
      doc_url: project.doc_url || '',
      presentation_url: project.presentation_url || '',
      display_order: project.display_order ?? 0,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = { ...formData };

    if (editingId) {
      const { error } = await supabase
        .from('projects')
        .update(payload)
        .eq('id', editingId);

      setLoading(false);

      if (error) {
        alert('เกิดข้อผิดพลาดในการแก้ไข: ' + error.message);
      } else {
        handleResetForm();
        fetchProjects();
      }
    } else {
      const { error } = await supabase.from('projects').insert([payload]);
      setLoading(false);

      if (error) {
        alert('เกิดข้อผิดพลาดในการบันทึก: ' + error.message);
      } else {
        handleResetForm();
        fetchProjects();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันการลบโปรเจกต์นี้?')) return;
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) {
      alert('เกิดข้อผิดพลาดในการลบ: ' + error.message);
    } else {
      if (editingId === id) handleResetForm();
      fetchProjects();
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50/60 text-neutral-900 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center pb-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900">
              Admin Project Dashboard
            </h1>
            <p className="text-neutral-500 text-sm mt-1">
              จัดการข้อมูลโปรเจกต์ เพิ่ม แก้ไข และลบข้อมูล
            </p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200/80 rounded-full text-xs font-medium transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> ดูหน้าแรก
          </Link>
        </div>

        {/* ฟอร์มเพิ่ม/แก้ไขโปรเจกต์ */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-neutral-200/80 p-6 md:p-8 rounded-3xl shadow-sm space-y-5"
        >
          <div className="flex justify-between items-center border-b border-neutral-100 pb-4">
            <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
              {editingId ? (
                <>
                  <Pencil className="w-4 h-4 text-neutral-700" /> แก้ไขโปรเจกต์
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-neutral-700" /> เพิ่มโปรเจกต์ใหม่
                </>
              )}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={handleResetForm}
                className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-800 bg-neutral-100 px-3 py-1.5 rounded-full transition"
              >
                <X className="w-3.5 h-3.5" /> ยกเลิกการแก้ไข
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1.5">
                ชื่อโปรเจกต์ *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 transition"
                placeholder="เช่น E-Commerce Mobile App"
              />
            </div>

            {/* ส่วนระบุ Image URL */}
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1.5">
                URL โลโก้ / ภาพประกอบ
              </label>
              <div className="flex items-center gap-3">
                {formData.logo_url && (
                  <div className="relative w-10 h-10 shrink-0 rounded-xl border border-neutral-200 p-1 bg-white">
                    <img
                      src={formData.logo_url}
                      alt="Preview"
                      className="w-full h-full object-contain rounded-lg"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, logo_url: '' })}
                      className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-0.5 hover:bg-rose-600 transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <input
                  type="text"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 transition"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">
              คำอธิบายสั้นๆ (แสดงหน้าแรก)
            </label>
            <input
              type="text"
              value={formData.short_description}
              onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 transition"
              placeholder="คำอธิบายสรุปโปรเจกต์สั้นๆ 1-2 ประโยค"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">
              คำอธิบายแบบรายละเอียด (แสดงเมื่อเลื่อนลง)
            </label>
            <textarea
              rows={4}
              value={formData.full_description}
              onChange={(e) => setFormData({ ...formData, full_description: e.target.value })}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 transition resize-none"
              placeholder="รายละเอียดเชิงลึก ฟีเจอร์หลัก เครื่องมือที่ใช้ ฯลฯ"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1.5">
                Figma URL
              </label>
              <input
                type="url"
                value={formData.figma_url}
                onChange={(e) => setFormData({ ...formData, figma_url: e.target.value })}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 transition"
                placeholder="https://figma.com/..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1.5">
                Document URL
              </label>
              <input
                type="url"
                value={formData.doc_url}
                onChange={(e) => setFormData({ ...formData, doc_url: e.target.value })}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 transition"
                placeholder="https://docs.google.com/..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1.5">
                Presentation URL
              </label>
              <input
                type="url"
                value={formData.presentation_url}
                onChange={(e) => setFormData({ ...formData, presentation_url: e.target.value })}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 transition"
                placeholder="https://canva.com/..."
              />
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-medium rounded-full text-sm transition shadow-sm disabled:opacity-50"
            >
              {loading
                ? 'กำลังบันทึก...'
                : editingId
                ? 'บันทึกการแก้ไข'
                : 'เพิ่มโปรเจกต์'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleResetForm}
                className="px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium rounded-full text-sm transition"
              >
                ยกเลิก
              </button>
            )}
          </div>
        </form>

        {/* รายการโปรเจกต์ */}
        <div className="bg-white border border-neutral-200/80 p-6 md:p-8 rounded-3xl shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900 border-b border-neutral-100 pb-3">
            รายการโปรเจกต์ทั้งหมด ({projects.length})
          </h2>

          {projects.length === 0 ? (
            <p className="text-neutral-400 text-sm py-4 text-center">ยังไม่มีโปรเจกต์ในระบบ</p>
          ) : (
            <div className="space-y-3 pt-1">
              {projects.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition ${
                    editingId === item.id
                      ? 'bg-neutral-100/80 border-neutral-400'
                      : 'bg-neutral-50/50 border-neutral-200/70 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0 pr-4">
                    {item.logo_url ? (
                      <img
                        src={item.logo_url}
                        alt=""
                        className="w-10 h-10 object-contain rounded-xl bg-white border border-neutral-200 shrink-0 p-1"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-neutral-200/60 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <h3 className="font-medium text-sm text-neutral-900 truncate">
                        {item.title}
                      </h3>
                      <p className="text-xs text-neutral-500 truncate mt-0.5">
                        {item.short_description || 'ไม่มีคำอธิบายสั้น'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleEditSelect(item)}
                      className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-white rounded-xl transition border border-transparent hover:border-neutral-200"
                      title="แก้ไขโปรเจกต์"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                      title="ลบโปรเจกต์"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}