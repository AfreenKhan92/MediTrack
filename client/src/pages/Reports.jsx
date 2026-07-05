import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  Search, 
  Trash2, 
  Eye, 
  X, 
  AlertCircle, 
  FileImage,
  Loader2, 
  Filter
} from 'lucide-react';
import reportService from '../services/reportService';

// File Preview Modal Component
const PreviewModal = ({ isOpen, onClose, report }) => {
  if (!isOpen || !report) return null;

  const isPDF = report.fileUrl.toLowerCase().endsWith('.pdf') || report.title.toLowerCase().endsWith('.pdf');

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="glass-panel w-full max-w-4xl max-h-[85vh] flex flex-col p-6 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-dark-border pb-4 mb-4">
          <div>
            <h3 className="text-title text-white font-bold">{report.title}</h3>
            <p className="text-caption text-gray-400 mt-0.5">Patient: {report.patientName} • Category: {report.category}</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-auto flex items-center justify-center bg-black/40 rounded-xl min-h-[300px]">
          {isPDF ? (
            <div className="text-center p-8 space-y-4">
              <FileText size={64} className="text-primary-400 mx-auto animate-pulse" />
              <p className="text-white font-medium">PDF Document Preview</p>
              <p className="text-caption text-gray-500 max-w-sm mx-auto">
                Direct browser PDF rendering is dependent on client compatibility. You can view or download the file directly:
              </p>
              <a 
                href={report.fileUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-primary btn-sm inline-flex items-center gap-1.5"
              >
                <Eye size={14} />
                Open PDF in New Tab
              </a>
            </div>
          ) : (
            <img 
              src={report.fileUrl} 
              alt={report.title} 
              className="max-w-full max-h-[60vh] object-contain rounded-lg"
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Main Reports Component
const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [offlineMode, setOfflineMode] = useState(false);

  // Search & Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Preview Modal State
  const [previewReport, setPreviewReport] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Form State
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [patientName, setPatientName] = useState('');
  const [category, setCategory] = useState('Prescription');
  const [doctor, setDoctor] = useState('');
  const [notes, setNotes] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [formValidationError, setFormValidationError] = useState('');

  const fileInputRef = useRef(null);

  // Mock data fallbacks for offline demo mode
  const mockReports = [
    {
      _id: 'mock1',
      title: 'Blood Cholesterol Profile',
      patientName: 'John Doe',
      category: 'Lab Test',
      doctor: 'Sarah Jenkins',
      fileUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80',
      cloudinaryId: 'm1',
      notes: 'Total cholesterol levels are within range. HDL is optimal.',
      date: new Date().toISOString()
    },
    {
      _id: 'mock2',
      title: 'Amoxicillin Prescription',
      patientName: 'Leo Doe',
      category: 'Prescription',
      doctor: 'Robert Vance',
      fileUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
      cloudinaryId: 'm2',
      notes: 'Take 3 times daily for throat infection.',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000 * 5).toISOString()
    },
    {
      _id: 'mock3',
      title: 'Polio Booster Certificate',
      patientName: 'Leo Doe',
      category: 'Vaccine Certificate',
      doctor: 'State Clinic',
      fileUrl: 'dummy.pdf', // Triggers PDF preview UI
      cloudinaryId: 'm3',
      notes: 'Immunization complete.',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000 * 20).toISOString()
    }
  ];

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await reportService.getReports();
      setReports(data);
      setOfflineMode(false);
      setError(null);
    } catch (err) {
      console.warn('Backend server not connected. Falling back to local offline mock reports.');
      setReports(mockReports);
      setOfflineMode(true);
      setError('Database server not connected. Operating in offline demonstration mode.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Drag & Drop Handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (selectedFile) => {
    const fileType = selectedFile.type;
    const isAllowed = /pdf|png|jpeg|jpg/i.test(fileType) || /pdf|png|jpeg|jpg/i.test(selectedFile.name);
    
    if (!isAllowed) {
      setFormValidationError('Only PDF, PNG, JPG, and JPEG file types are supported.');
      setFile(null);
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setFormValidationError('File exceeds the maximum size limit of 5MB.');
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setFormValidationError('');
    
    // Auto-populate title if empty
    if (!title) {
      const baseName = selectedFile.name.replace(/\.[^/.]+$/, "");
      setTitle(baseName);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setFormValidationError('');

    if (!file) {
      setFormValidationError('Please select or drop a file to upload');
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('patientName', patientName || 'Self');
    formData.append('category', category);
    formData.append('doctor', doctor);
    formData.append('notes', notes);

    try {
      if (offlineMode) {
        // Local simulation for demonstration
        const localMockUrl = file.type.includes('pdf') 
          ? 'sample_document.pdf'
          : URL.createObjectURL(file);

        const newReport = {
          _id: 'local_' + Date.now(),
          title,
          patientName: patientName || 'Self',
          category,
          doctor,
          notes,
          fileUrl: localMockUrl,
          date: new Date().toISOString()
        };

        setReports([newReport, ...reports]);
        resetForm();
      } else {
        const uploadedReport = await reportService.uploadReport(formData);
        setReports([uploadedReport, ...reports]);
        resetForm();
      }
    } catch (err) {
      setFormValidationError(err.message || 'File upload failed');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setTitle('');
    setPatientName('');
    setCategory('Prescription');
    setDoctor('');
    setNotes('');
    setFormValidationError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteReport = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this report?')) {
      return;
    }

    try {
      if (id.startsWith('mock') || id.startsWith('local_')) {
        setReports(reports.filter(r => r._id !== id));
      } else {
        await reportService.deleteReport(id);
        setReports(reports.filter(r => r._id !== id));
      }
    } catch (err) {
      console.error('Failed to delete report:', err);
    }
  };

  const handleOpenPreview = (report) => {
    setPreviewReport(report);
    setIsPreviewOpen(true);
  };

  // Search & filter calculation
  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (report.doctor && report.doctor.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesCategory = selectedCategory === 'All' || report.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Prescription', 'Lab Test', 'Vaccine Certificate', 'Other'];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-primary-500 mb-4" />
        <p className="text-gray-400 text-sm">Loading medical reports repository...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      {/* Page Header */}
      <div className="page-header">
        <h2 className="page-title text-gradient bg-gradient-to-r from-primary-400 to-secondary-400">
          Medical Reports & Prescriptions
        </h2>
        <p className="page-subtitle">Securely store, organize, and preview your family clinical records</p>
      </div>

      {/* Offline Alert */}
      {error && (
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-2.5 rounded-xl text-sm animate-scale-in">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Primary Layout Area */}
      <div className="grid-dashboard">
        
        {/* Left Side: Upload Form Panel */}
        <div className="glass-card">
          <h3 className="text-title text-white mb-5 flex items-center gap-2">
            <Upload size={18} className="text-primary-400" />
            Upload Document
          </h3>

          <form onSubmit={handleUploadSubmit} className="space-y-4">
            {/* Drag & Drop zone */}
            <div 
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[140px]
                ${dragActive ? 'border-primary-500 bg-primary-500/10' : 'border-white/10 hover:border-white/20 bg-black/10'}
                ${file ? 'border-secondary-500 bg-secondary-500/5' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                onChange={handleFileInputChange}
                accept=".pdf,.png,.jpg,.jpeg"
              />

              {file ? (
                <div className="space-y-2">
                  {file.type.includes('pdf') ? (
                    <FileText size={36} className="text-secondary-400 mx-auto" />
                  ) : (
                    <FileImage size={36} className="text-secondary-400 mx-auto" />
                  )}
                  <p className="text-white text-xs font-semibold truncate max-w-[200px]">
                    {file.name}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="space-y-2 text-gray-400">
                  <Upload size={28} className="mx-auto text-gray-500" />
                  <p className="text-xs font-semibold text-white">Drag & drop your file here</p>
                  <p className="text-[10px] text-gray-500">Supports PDF, PNG, JPG, JPEG (Max 5MB)</p>
                </div>
              )}
            </div>

            {/* Validation errors inside form */}
            {formValidationError && (
              <div className="flex items-center gap-1.5 text-red-400 text-[11px] bg-red-500/15 border border-red-500/10 p-2.5 rounded-lg">
                <AlertCircle size={12} className="flex-shrink-0" />
                <span>{formValidationError}</span>
              </div>
            )}

            {/* Title field */}
            <div className="form-group mb-0">
              <label className="form-label">Document Title</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Chest X-Ray Report"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={submitting}
                required
              />
            </div>

            {/* Patient Name field */}
            <div className="form-group mb-0">
              <label className="form-label">Patient Name</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Self, Leo Doe"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                disabled={submitting}
                required
              />
            </div>

            {/* Category Select */}
            <div className="form-group mb-0">
              <label className="form-label">Category</label>
              <select 
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={submitting}
              >
                <option value="Prescription">Prescription</option>
                <option value="Lab Test">Lab Test</option>
                <option value="Vaccine Certificate">Vaccine Certificate</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Doctor field */}
            <div className="form-group mb-0">
              <label className="form-label">Doctor / Clinic (Optional)</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Dr. Sarah Jenkins"
                value={doctor}
                onChange={(e) => setDoctor(e.target.value)}
                disabled={submitting}
              />
            </div>

            {/* Notes field */}
            <div className="form-group mb-0">
              <label className="form-label">Notes (Optional)</label>
              <textarea 
                className="form-textarea" 
                placeholder="Additional details, instructions, results..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={submitting}
                rows="2"
              />
            </div>

            {/* Form Actions */}
            <div className="flex gap-2 pt-2">
              {file && (
                <button 
                  type="button" 
                  onClick={resetForm} 
                  className="btn btn-outline py-2 px-3 text-xs w-1/3"
                  disabled={submitting}
                >
                  Clear
                </button>
              )}
              <button 
                type="submit" 
                className={`btn btn-primary py-2 px-4 text-xs flex items-center justify-center gap-1.5 ${file ? 'w-2/3' : 'w-full'}`}
                disabled={submitting || !file}
              >
                {submitting && <Loader2 size={12} className="animate-spin" />}
                <span>{submitting ? 'Uploading...' : 'Upload File'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: Reports Grid & Filters */}
        <div className="space-y-6">
          
          {/* Filters Row */}
          <div className="glass-panel p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input 
                type="text" 
                className="form-input pl-10 py-2 text-xs" 
                placeholder="Search reports by title, doctor, patient..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter size={14} className="text-gray-500" />
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all duration-200
                    ${selectedCategory === cat 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}
                >
                  {cat === 'All' ? 'All categories' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid display */}
          {filteredReports.length === 0 ? (
            <div className="empty-state py-20">
              <FileText size={48} className="mx-auto mb-4 text-gray-600 animate-pulse" />
              <h3 className="text-title text-gray-300 mb-2">No documents match search filters</h3>
              <p className="text-body text-gray-500 max-w-sm mx-auto">
                Try adjusting your search terms or upload a new prescription or laboratory report.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredReports.map(report => (
                <div key={report._id} className="glass-card flex flex-col justify-between group animate-fade-in">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 flex-1">
                        <span className={`badge text-[9px] py-0.5
                          ${report.category === 'Prescription' ? 'badge-primary' : ''}
                          ${report.category === 'Lab Test' ? 'badge-info' : ''}
                          ${report.category === 'Vaccine Certificate' ? 'badge-success' : ''}
                          ${report.category === 'Other' ? 'badge-warning' : ''}
                        `}>
                          {report.category}
                        </span>
                        <h4 className="text-body font-bold text-white leading-snug line-clamp-2">
                          {report.title}
                        </h4>
                      </div>

                      {/* Hover Actions */}
                      <div className="flex gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
                        <button 
                          onClick={() => handleOpenPreview(report)}
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
                          title="Preview Document"
                        >
                          <Eye size={12} />
                        </button>
                        <button 
                          onClick={() => handleDeleteReport(report._id)}
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/10 flex items-center justify-center text-gray-400 hover:text-red-400 transition-all duration-200"
                          title="Delete Document"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Metadata details */}
                    <div className="space-y-1.5 pt-3.5 border-t border-dark-border text-caption text-gray-400">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Patient:</span>
                        <span className="text-white font-medium">{report.patientName}</span>
                      </div>
                      {report.doctor && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Physician:</span>
                          <span className="text-white font-medium">Dr. {report.doctor}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-500">Date:</span>
                        <span className="text-white font-medium">
                          {new Date(report.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    {/* Notes */}
                    {report.notes && (
                      <p className="text-caption text-gray-500 italic bg-black/25 p-2.5 rounded-lg leading-snug">
                        "{report.notes}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Global Preview Modal */}
      <PreviewModal 
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        report={previewReport}
      />
    </div>
  );
};

export default Reports;
