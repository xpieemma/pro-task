import { useState } from 'react';
import api from '../services/api';
import { Attachment } from '../types';
import toast from 'react-hot-toast';

interface Props {
  projectId: string;
  taskId: string;
  attachments: Attachment[];
  onAttachmentChange: () => void; // refreshes parent state
}

const AttachmentList = ({ projectId, taskId, attachments, onAttachmentChange }: Props) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    
    setUploading(true);
    try {
      await api.post(`/projects/${projectId}/tasks/${taskId}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('File uploaded');
      onAttachmentChange(); // Refresh the task list from server
    } catch (error) {
      toast.error('Upload failed. File might be too large.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (attachmentId: string) => {
    if (confirm('Delete this attachment?')) {
      try {
        await api.delete(`/projects/${projectId}/tasks/${taskId}/attachments/${attachmentId}`);
        toast.success('Attachment deleted');
        onAttachmentChange(); // Refresh the task list from server
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return '📄';
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType === 'application/pdf') return '📑';
    if (mimeType.includes('word')) return '📝';
    if (mimeType === 'text/plain') return '📃';
    return '📎';
  };

  return (
    <div className="mt-2 border-t border-gray-100 pt-2">
      <div className="flex items-center gap-2 mb-2">
        <label className="cursor-pointer bg-gray-100 text-gray-600 text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded hover:bg-gray-200 transition-colors">
          {uploading ? 'Uploading...' : '+ Add File'}
          <input type="file" onChange={handleUpload} disabled={uploading} className="hidden" />
        </label>
      </div>
      
      {attachments && attachments.length > 0 && (
        <div className="space-y-1 mt-2">
          {attachments.map((att) => (
            <div key={att._id} className="flex justify-between items-center text-xs pb-1 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="shrink-0">{getFileIcon(att.mimeType)}</span>
                <a 
                  href={att.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline truncate"
                >
                  {att.name}
                </a>
                {att.size && (
                  <span className="text-gray-400 text-[10px] shrink-0">
                    ({(att.size / 1024).toFixed(1)} KB)
                  </span>
                )}
              </div>
              <button 
                onClick={() => handleDelete(att._id!)} 
                className="text-gray-400 hover:text-red-500 text-xs ml-2 shrink-0 transition-colors"
                title="Delete file"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AttachmentList;