/**
 * Helper to resolve reliable, cross-origin file URLs for viewing/previewing resumes and documents.
 */
const RAW_API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export function getDocumentViewUrl(docOrUrl, docId) {
  if (docId) {
    return `${RAW_API_URL}/api/v1/documents/${docId}/file`;
  }
  if (!docOrUrl) return '#';

  let targetUrl = '';
  if (typeof docOrUrl === 'object') {
    if (docOrUrl.id) {
      return `${RAW_API_URL}/api/v1/documents/${docOrUrl.id}/file`;
    }
    targetUrl = docOrUrl.file_path || docOrUrl.resume_url || '';
  } else if (typeof docOrUrl === 'string') {
    targetUrl = docOrUrl;
  }

  if (!targetUrl) return '#';

  if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
    return targetUrl;
  }

  if (targetUrl.startsWith('/uploads') || targetUrl.startsWith('/api')) {
    return `${RAW_API_URL}${targetUrl}`;
  }

  return `${RAW_API_URL}/uploads/${targetUrl.replace(/^\/+/, '')}`;
}
