import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Filter,
  CheckCircle2,
  Scan,
  Brain,
  Sparkles,
} from 'lucide-react';
import reportService from '../services/reportService';
import { showToast } from '../utils/toast';
import { SkeletonLoader } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import Button from '../components/Button';
import Card from '../components/Card';
import Badge from '../components/Badge';
import ReportPreview from '../components/ReportPreview';

// ── Upload Progress Banner ──────────────────────────────────────────────────
const UPLOAD_STAGES = [
  { key: 'uploading', label: 'Uploading file…', icon: Upload, color: 'text-blue-600' },
  { key: 'ocr', label: 'Extracting text with OCR…', icon: Scan, color: 'text-blue-600' },
  { key: 'ai', label: 'Analyzing with Gemini AI…', icon: Brain, color: 'text-violet-600' },
  { key: 'done', label: 'Analysis complete!', icon: Sparkles, color: 'text-emerald-600' },
];

const UploadProgressBanner = ({ stage }) => {
  if (!stage) return null;

  const currentStage = UPLOAD_STAGES.find((s) => s.key === stage);
  if (!currentStage) return null;

  const StageIcon = currentStage.icon;
  const isDone = stage === 'done';

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-300
        ${isDone
          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
          : 'bg-blue-50 border-blue-200 text-blue-700'
        }`}
    >
      {isDone ? (
        <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
      ) : (
        <Loader2 size={16} className="animate-spin flex-shrink-0 text-blue-500" />
      )}
      <span>{currentStage.label}</span>

      {/* Step dots */}
      <div className="flex gap-1.5 ml-auto">
        {UPLOAD_STAGES.map((s, i) => {
          const currentIdx = UPLOAD_STAGES.findIndex((st) => st.key === stage);
          const isActive = i === currentIdx;
          const isPast = i < currentIdx;
          return (
            <div
              key={s.key}
              className={`w-1.5 h-1.5 rounded-full transition-all
                ${isPast ? 'bg-emerald-400' : isActive ? 'bg-blue-500 animate-pulse' : 'bg-gray-200'}`}
            />
          );
        })}
      </div>
    </div>
  );
};

// ── Processing Status Micro-Badge (shown on report cards) ──────────────────
const ProcessingBadge = ({ processingStatus }) => {
  if (!processingStatus || processingStatus === 'completed') return null;

  const config = {
    pending: { label: 'Queued', variant: 'secondary' },
    ocr_processing: { label: 'OCR…', variant: 'info' },
    ai_processing: { label: 'AI…', variant: 'info' },
    failed: { label: 'Failed', variant: 'danger' },
  };

  const c = config[processingStatus];
  if (!c) return null;

  return (
    <Badge variant={c.variant} className="text-[9px] py-0 flex items-center gap-1">
      {['ocr_processing', 'ai_processing', 'pending'].includes(processingStatus) && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse inline-block" />
      )}
      {c.label}
    </Badge>
  );
};

// ── Main Reports Component ──────────────────────────────────────────────────
const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [offlineMode, setOfflineMode] = useState(false);
  const [uploadStage, setUploadStage] = useState(null); // null | 'uploading' | 'ocr' | 'ai' | 'done'

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
  // Track active polling cleanups keyed by report _id
  const pollingCleanups = useRef({});

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
      date: new Date().toISOString(),
      processingStatus: 'completed',
      ocrStatus: 'success',
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
      date: new Date(Date.now() - 24 * 60 * 60 * 1000 * 5).toISOString(),
      processingStatus: 'completed',
      ocrStatus: 'success',
    },
    {
      _id: 'mock3',
      title: 'Polio Booster Certificate',
      patientName: 'Leo Doe',
      category: 'Vaccine Certificate',
      doctor: 'State Clinic',
      fileUrl: 'dummy.pdf',
      cloudinaryId: 'm3',
      notes: 'Immunization complete.',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000 * 20).toISOString(),
      processingStatus: 'pending',
      ocrStatus: 'pending',
    },
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
    // Cleanup all polls on unmount
    return () => {
      Object.values(pollingCleanups.current).forEach((cleanup) => {
        if (typeof cleanup === 'function') cleanup();
      });
    };
  }, []);

  // ── Start background polling for a freshly uploaded report ────────────────
  const startPollingForReport = useCallback((reportId) => {
    if (pollingCleanups.current[reportId]) return; // Already polling

    const cleanup = reportService.pollReport(
      reportId,
      (updatedReport) => {
        // Update reports list
        setReports((prev) =>
          prev.map((r) => (r._id === updatedReport._id ? updatedReport : r))
        );
        // Update open preview if it's this report
        setPreviewReport((prev) =>
          prev?._id === updatedReport._id ? updatedReport : prev
        );

        // Update upload stage banner
        if (updatedReport.processingStatus === 'ocr_processing') {
          setUploadStage('ocr');
        } else if (updatedReport.processingStatus === 'ai_processing') {
          setUploadStage('ai');
        } else if (updatedReport.processingStatus === 'completed') {
          setUploadStage('done');
          setTimeout(() => setUploadStage(null), 3000);
          delete pollingCleanups.current[reportId];
        } else if (updatedReport.processingStatus === 'failed') {
          setUploadStage(null);
          delete pollingCleanups.current[reportId];
        }
      },
      3000
    );

    pollingCleanups.current[reportId] = cleanup;
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
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

    if (!title) {
      const baseName = selectedFile.name.replace(/\.[^/.]+$/, '');
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
    setUploadStage('uploading');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('patientName', patientName || 'Self');
    formData.append('category', category);
    formData.append('doctor', doctor);
    formData.append('notes', notes);

    try {
      if (offlineMode) {
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
          date: new Date().toISOString(),
          processingStatus: 'pending',
          ocrStatus: 'pending',
        };

        setReports([newReport, ...reports]);
        showToast.success(`Report "${title}" uploaded successfully!`);
        setUploadStage(null);
        resetForm();
      } else {
        const uploadedReport = await reportService.uploadReport(formData);
        setReports((prev) => [uploadedReport, ...prev]);
        showToast.success(`Report "${title}" uploaded! AI analysis is running in the background.`);
        resetForm();

        // Start background polling for this new report
        startPollingForReport(uploadedReport._id);
      }
    } catch (err) {
      const errorMsg = err.message || 'File upload failed';
      setFormValidationError(errorMsg);
      showToast.error(errorMsg);
      setUploadStage(null);
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
      // Stop polling if active
      if (pollingCleanups.current[id]) {
        pollingCleanups.current[id]();
        delete pollingCleanups.current[id];
      }

      if (id.startsWith('mock') || id.startsWith('local_')) {
        setReports(reports.filter((r) => r._id !== id));
      } else {
        await reportService.deleteReport(id);
        setReports(reports.filter((r) => r._id !== id));
      }
      showToast.success('Report deleted.');
    } catch (err) {
      console.error('Failed to delete report:', err);
      showToast.error('Failed to delete report.');
    }
  };

  const handleOpenPreview = (report) => {
    setPreviewReport(report);
    setIsPreviewOpen(true);
  };

  // Callback to sync report updates from the preview modal back to the list
  const handleReportUpdate = useCallback((updatedReport) => {
    setReports((prev) =>
      prev.map((r) => (r._id === updatedReport._id ? updatedReport : r))
    );
  }, []);

  const filteredReports = reports.filter((report) => {
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
      <div className="animate-fade-in space-y-6">
        <div className="page-header">
          <div className="w-48 h-7 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="w-72 h-4 bg-gray-100 rounded animate-pulse" />
        </div>
        <SkeletonLoader type="card" count={3} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <h2 className="page-title text-gray-900 font-bold">
          Medical Reports & Prescriptions
        </h2>
        <p className="page-subtitle text-gray-500">
          Securely store, organize, and AI-analyze your family clinical records
        </p>
      </div>

      {/* Offline Alert */}
      {error && (
        <div className="flex items-center gap-2 bg-gray-100 border border-gray-200 text-gray-700 px-3.5 py-2.5 rounded-lg text-caption font-medium">
          <AlertCircle size={16} className="text-gray-900" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Stage Progress Banner */}
      <UploadProgressBanner stage={uploadStage} />

      {/* Primary Layout Area */}
      <div className="grid-dashboard">

        {/* Left Side: Upload Form Panel */}
        <Card className="space-y-4">
          <h3 className="text-subtitle font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Upload size={18} className="text-gray-900" />
            Upload Document
          </h3>

          {/* AI Feature Callout */}
          <div className="flex items-start gap-2.5 bg-gradient-to-r from-blue-50 to-violet-50 border border-blue-100 rounded-xl p-3">
            <Sparkles size={14} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-700 leading-snug font-medium">
              After upload, AI will automatically extract medicine names, dosages, test results, and generate a plain-language summary.
            </p>
          </div>

          <form onSubmit={handleUploadSubmit} className="space-y-3.5">
            {/* Drag & Drop zone */}
            <div
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-150 flex flex-col items-center justify-center min-h-[130px]
                ${dragActive ? 'border-black bg-gray-100' : 'border-gray-300 hover:border-gray-400 bg-gray-50/70'}
                ${file ? 'border-black bg-gray-100/50' : ''}`}
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
                <div className="space-y-1.5">
                  {file.type.includes('pdf') ? (
                    <FileText size={32} className="text-gray-900 mx-auto" />
                  ) : (
                    <FileImage size={32} className="text-gray-900 mx-auto" />
                  )}
                  <p className="text-gray-900 text-caption font-bold truncate max-w-[200px]">
                    {file.name}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="space-y-1 text-gray-500">
                  <Upload size={24} className="mx-auto text-gray-400" />
                  <p className="text-caption font-bold text-gray-900">Drag & drop your file here</p>
                  <p className="text-[10px] text-gray-500">Supports PDF, PNG, JPG, JPEG (Max 5MB)</p>
                </div>
              )}
            </div>

            {/* Validation errors */}
            {formValidationError && (
              <div className="flex items-center gap-1.5 text-red-700 text-caption bg-red-50 border border-red-200 p-2.5 rounded-lg">
                <AlertCircle size={14} className="flex-shrink-0" />
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
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={resetForm}
                  className="w-1/3"
                  disabled={submitting}
                >
                  Clear
                </Button>
              )}
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={submitting}
                disabled={submitting || !file}
                className={file ? 'w-2/3' : 'w-full'}
              >
                Upload & Analyze
              </Button>
            </div>
          </form>
        </Card>

        {/* Right Side: Reports Grid & Filters */}
        <div className="space-y-5">

          {/* Filters Row */}
          <Card className="p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3" hoverable={false}>
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input
                type="text"
                className="form-input pl-9 py-2 text-caption"
                placeholder="Search reports by title, doctor, patient..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <Filter size={14} className="text-gray-400" />
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all
                    ${selectedCategory === cat
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`}
                >
                  {cat === 'All' ? 'All categories' : cat}
                </button>
              ))}
            </div>
          </Card>

          {/* Grid display */}
          {filteredReports.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No documents match search filters"
              description="Try adjusting your search terms or upload a new prescription or laboratory report."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredReports.map((report) => (
                <Card key={report._id} className="flex flex-col justify-between group animate-fade-in">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge variant="secondary" className="text-[9px] py-0.5">
                            {report.category}
                          </Badge>
                          {/* AI Processing status micro-badge */}
                          <ProcessingBadge processingStatus={report.processingStatus} />
                          {/* AI Complete indicator */}
                          {report.processingStatus === 'completed' && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md">
                              <Sparkles size={9} />
                              AI
                            </span>
                          )}
                        </div>
                        <h4 className="text-body font-bold text-gray-900 leading-snug line-clamp-2">
                          {report.title}
                        </h4>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleOpenPreview(report)}
                          className="w-7 h-7 rounded-md hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
                          title="Preview & AI Analysis"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteReport(report._id)}
                          className="w-7 h-7 rounded-md hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete Document"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Metadata details */}
                    <div className="space-y-1 pt-3 border-t border-gray-200 text-caption text-gray-600">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Patient:</span>
                        <span className="text-gray-900 font-semibold">{report.patientName}</span>
                      </div>
                      {report.doctor && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Physician:</span>
                          <span className="text-gray-900 font-semibold">Dr. {report.doctor}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-500">Date:</span>
                        <span className="text-gray-900 font-semibold">
                          {new Date(report.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    {/* Notes */}
                    {report.notes && (
                      <p className="text-caption text-gray-600 italic bg-gray-50 p-2.5 rounded-lg border border-gray-100 leading-snug">
                        "{report.notes}"
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI-enhanced Report Preview Modal */}
      <ReportPreview
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        report={previewReport}
        onReportUpdate={handleReportUpdate}
      />
    </div>
  );
};

export default Reports;
