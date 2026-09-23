/**
 * Helper to resolve reliable, cross-origin file URLs for viewing/previewing resumes and documents.
 */
export function getDocumentViewUrl(docOrUrl, docId) {
  if (docId) {
    return `/api/v1/documents/${docId}/file`;
  }
  if (!docOrUrl) return '#';

  let targetUrl = '';
  if (typeof docOrUrl === 'object') {
    if (docOrUrl.id) {
      return `/api/v1/documents/${docOrUrl.id}/file`;
    }
    targetUrl = docOrUrl.file_path || docOrUrl.resume_url || '';
  } else if (typeof docOrUrl === 'string') {
    targetUrl = docOrUrl;
  }

  if (!targetUrl) return '#';

  if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
    return targetUrl;
  }

  if (targetUrl.startsWith('/uploads')) {
    return targetUrl;
  }

  if (targetUrl.startsWith('/api')) {
    return targetUrl;
  }

  return `/uploads/${targetUrl.replace(/^\/+/, '')}`;
}

