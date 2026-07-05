import React from 'react';
import { Calendar, User, FileText, Trash2, Heart } from 'lucide-react';

const RecordCard = ({ record, onDelete }) => {
  const getBadgeStyle = (type) => {
    switch (type) {
      case 'Prescription':
        return { background: 'rgba(99, 102, 241, 0.15)', color: 'hsl(222, 89%, 65%)' };
      case 'Lab Report':
        return { background: 'rgba(16, 185, 129, 0.15)', color: 'hsl(160, 84%, 45%)' };
      case 'Vaccine Certificate':
        return { background: 'rgba(245, 158, 11, 0.15)', color: 'rgb(245, 158, 11)' };
      default:
        return { background: 'rgba(107, 114, 128, 0.15)', color: 'var(--text-secondary)' };
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span 
          style={{ 
            padding: '0.25rem 0.75rem', 
            borderRadius: 'var(--radius-full)', 
            fontSize: '0.75rem', 
            fontWeight: '600',
            ...getBadgeStyle(record.recordType)
          }}
        >
          {record.recordType}
        </span>
        
        {onDelete && (
          <button 
            onClick={() => onDelete(record._id)} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--text-muted)', 
              cursor: 'pointer',
              transition: 'color var(--transition-fast)'
            }}
            onMouseEnter={(e) => e.target.style.color = '#ef4444'}
            onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div>
        <h4 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{record.title}</h4>
        {record.doctor && (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Heart size={12} style={{ color: 'var(--primary)' }} />
            Dr. {record.doctor}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={14} />
          <span>Patient: <strong>{record.patientName}</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={14} />
          <span>Date: {new Date(record.dateOfRecord).toLocaleDateString()}</span>
        </div>
      </div>

      {record.notes && (
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', background: 'rgba(0,0,0,0.15)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
          "{record.notes}"
        </p>
      )}
    </div>
  );
};

export default RecordCard;
