import React from 'react';

/**
 * A lightweight, safe Markdown to React component renderer
 * handles: Headers, Tables, Lists, Bold, Italic, Code blocks, Horizontal lines, Links.
 */
export function MarkdownRenderer({ content, className = '' }) {
  if (!content) return null;

  const renderFormattedText = (text) => {
    if (!text) return null;

    // Replace `<br>` with line breaks
    let processed = text.replace(/<br\s*\/?>/gi, '\n');

    // Split by lines for blocks
    const lines = processed.split('\n');
    const elements = [];
    let inTable = false;
    let tableRows = [];
    let inList = false;
    let listItems = [];
    let listType = 'ul'; // 'ul' or 'ol'

    const flushTable = (key) => {
      if (tableRows.length === 0) return;

      const headerRow = tableRows[0];
      const bodyRows = tableRows.slice(1).filter(r => !r.every(c => /^[:\-\s]+$/.test(c))); // filter out separator row |---|---|

      elements.push(
        <div key={`table-${key}`} style={{ overflowX: 'auto', margin: '12px 0' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '12.5px',
            backgroundColor: '#FFFFFF',
            borderRadius: '6px',
            overflow: 'hidden',
            border: '1px solid #E2E8F0'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '2px solid #CBD5E1' }}>
                {headerRow.map((col, cIdx) => (
                  <th key={cIdx} style={{
                    padding: '8px 10px',
                    textAlign: 'left',
                    fontWeight: 600,
                    color: '#1E293B',
                    borderRight: '1px solid #E2E8F0'
                  }}>
                    {parseInline(col.trim())}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bodyRows.map((row, rIdx) => (
                <tr key={rIdx} style={{
                  backgroundColor: rIdx % 2 === 0 ? '#FFFFFF' : '#F8FAFC',
                  borderBottom: '1px solid #E2E8F0'
                }}>
                  {row.map((col, cIdx) => (
                    <td key={cIdx} style={{
                      padding: '7px 10px',
                      color: '#334155',
                      borderRight: '1px solid #E2E8F0',
                      verticalAlign: 'top'
                    }}>
                      {parseInline(col.trim())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    };

    const flushList = (key) => {
      if (listItems.length === 0) return;
      if (listType === 'ol') {
        elements.push(
          <ol key={`ol-${key}`} style={{ paddingLeft: '20px', margin: '8px 0', fontSize: '13px', lineHeight: '1.6' }}>
            {listItems.map((it, i) => <li key={i}>{parseInline(it)}</li>)}
          </ol>
        );
      } else {
        elements.push(
          <ul key={`ul-${key}`} style={{ paddingLeft: '18px', margin: '8px 0', fontSize: '13px', lineHeight: '1.6' }}>
            {listItems.map((it, i) => <li key={i}>{parseInline(it)}</li>)}
          </ul>
        );
      }
      listItems = [];
      inList = false;
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      // Check for table row
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        if (inList) flushList(idx);
        inTable = true;
        const cols = trimmed.slice(1, -1).split('|');
        tableRows.push(cols);
        return;
      } else if (inTable) {
        flushTable(idx);
      }

      // Check for unordered list
      if (/^[-*•]\s+/.test(trimmed)) {
        if (inList && listType !== 'ul') flushList(idx);
        inList = true;
        listType = 'ul';
        listItems.push(trimmed.replace(/^[-*•]\s+/, ''));
        return;
      }

      // Check for ordered list
      if (/^\d+\.\s+/.test(trimmed)) {
        if (inList && listType !== 'ol') flushList(idx);
        inList = true;
        listType = 'ol';
        listItems.push(trimmed.replace(/^\d+\.\s+/, ''));
        return;
      }

      if (inList) {
        flushList(idx);
      }

      // Horizontal Rule
      if (/^---+$/.test(trimmed) || /^===+$/.test(trimmed)) {
        elements.push(<hr key={idx} style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: '14px 0' }} />);
        return;
      }

      // Headings
      if (trimmed.startsWith('# ')) {
        elements.push(<h2 key={idx} style={{ fontSize: '18px', fontWeight: 700, color: '#1E2A44', margin: '14px 0 6px' }}>{parseInline(trimmed.slice(2))}</h2>);
        return;
      }
      if (trimmed.startsWith('## ')) {
        elements.push(<h3 key={idx} style={{ fontSize: '16px', fontWeight: 700, color: '#1E2A44', margin: '12px 0 6px' }}>{parseInline(trimmed.slice(3))}</h3>);
        return;
      }
      if (trimmed.startsWith('### ')) {
        elements.push(<h4 key={idx} style={{ fontSize: '14.5px', fontWeight: 600, color: '#334155', margin: '10px 0 4px' }}>{parseInline(trimmed.slice(4))}</h4>);
        return;
      }
      if (trimmed.startsWith('#### ')) {
        elements.push(<h5 key={idx} style={{ fontSize: '13.5px', fontWeight: 600, color: '#475569', margin: '8px 0 4px' }}>{parseInline(trimmed.slice(5))}</h5>);
        return;
      }

      // Empty line
      if (!trimmed) {
        elements.push(<div key={idx} style={{ height: '6px' }} />);
        return;
      }

      // Standard Paragraph
      elements.push(
        <p key={idx} style={{ margin: '4px 0', fontSize: '13px', lineHeight: '1.55', color: '#1E293B' }}>
          {parseInline(trimmed)}
        </p>
      );
    });

    if (inTable) flushTable('end');
    if (inList) flushList('end');

    return elements;
  };

  // Helper to parse bold, italic, inline code, and links
  const parseInline = (text) => {
    if (!text) return text;

    // Tokenize parts
    const parts = [];
    let cursor = 0;
    const regex = /(\*\*(.*?)\*\*|\*(.*?)\*|`([^`]+)`|\[(.*?)\]\((.*?)\))/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > cursor) {
        parts.push(text.substring(cursor, match.index));
      }

      if (match[2] !== undefined) {
        // Bold **text**
        parts.push(<strong key={match.index} style={{ fontWeight: 600, color: '#0F172A' }}>{match[2]}</strong>);
      } else if (match[3] !== undefined) {
        // Italic *text*
        parts.push(<em key={match.index} style={{ fontStyle: 'italic' }}>{match[3]}</em>);
      } else if (match[4] !== undefined) {
        // Inline code `code`
        parts.push(
          <code key={match.index} style={{
            backgroundColor: '#F1F5F9',
            color: '#0F172A',
            padding: '1px 5px',
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: 'monospace'
          }}>
            {match[4]}
          </code>
        );
      } else if (match[5] !== undefined && match[6] !== undefined) {
        // Link [text](url)
        parts.push(
          <a key={match.index} href={match[6]} target="_blank" rel="noreferrer" style={{ color: '#3B5BDB', textDecoration: 'underline' }}>
            {match[5]}
          </a>
        );
      }

      cursor = regex.lastIndex;
    }

    if (cursor < text.length) {
      parts.push(text.substring(cursor));
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <div className={`markdown-content ${className}`} style={{ wordBreak: 'break-word' }}>
      {renderFormattedText(content)}
    </div>
  );
}
