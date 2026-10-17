import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Minus,
  Code,
  Undo,
  Redo,
  Code2,
  Eye,
  FileCode,
} from 'lucide-react';

export default function RichTextEditor({ value = '', onChange, placeholder = 'Write your article content here...' }) {
  const editorRef = useRef(null);
  const [isRawHtml, setIsRawHtml] = useState(false);
  const [rawHtmlContent, setRawHtmlContent] = useState(value || '');
  const [activeFormats, setActiveFormats] = useState({});

  const { wordCount, readTimeMinutes } = useMemo(() => {
    const text = (value || '').replace(/<[^>]*>/g, ' ');
    const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
    return {
      wordCount: words,
      readTimeMinutes: Math.max(1, Math.ceil(words / 200)),
    };
  }, [value]);

  // Sync incoming value to visual editor when switching modes or initial load
  useEffect(() => {
    if (!isRawHtml && editorRef.current) {
      if (document.activeElement !== editorRef.current && editorRef.current.innerHTML !== (value || '')) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value, isRawHtml]);

  const handleInput = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    setRawHtmlContent(html);
    onChange(html);
  };

  const checkActiveFormats = useCallback(() => {
    if (!editorRef.current || document.activeElement !== editorRef.current) return;
    try {
      setActiveFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        insertUnorderedList: document.queryCommandState('insertUnorderedList'),
        insertOrderedList: document.queryCommandState('insertOrderedList'),
      });
    } catch {
      // Ignored if queryCommandState is unavailable
    }
  }, []);

  const exec = (command, val = null) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, val);
    handleInput();
    checkActiveFormats();
  };

  const handleFormatBlock = (tag) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand('formatBlock', false, tag);

    // Strip masking inline font styles from the formatted block
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const parentNode = selection.anchorNode?.nodeType === Node.ELEMENT_NODE
        ? selection.anchorNode
        : selection.anchorNode?.parentElement;
      if (parentNode) {
        const blockEl = parentNode.closest('h1, h2, h3, p, blockquote');
        if (blockEl) {
          blockEl.querySelectorAll('span[style]').forEach(s => {
            s.style.removeProperty('font-size');
            s.style.removeProperty('font-family');
            s.style.removeProperty('font-weight');
            if (!s.getAttribute('style')) s.removeAttribute('style');
          });
        }
      }
    }
    handleInput();
    checkActiveFormats();
  };

  const handlePaste = (e) => {
    const clipboardData = e.clipboardData;
    if (!clipboardData) return;

    const html = clipboardData.getData('text/html');
    if (!html) {
      // Default plain text handling
      return;
    }

    e.preventDefault();

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // 1. Demote or convert accidental <h1> tags in pasted HTML
      // If text is long (>100 chars or sentences), convert to paragraph <p>.
      // If it is a section title, convert to <h2>.
      doc.querySelectorAll('h1').forEach((h1) => {
        const text = h1.textContent.trim();
        if (text.length > 100 || text.includes('. ') || text.includes('.\n')) {
          const p = doc.createElement('p');
          p.innerHTML = h1.innerHTML;
          h1.parentNode.replaceChild(p, h1);
        } else {
          const h2 = doc.createElement('h2');
          h2.innerHTML = h1.innerHTML;
          h1.parentNode.replaceChild(h2, h1);
        }
      });

      // 2. Strip misleading inline font-size, font-family, font-weight from spans
      doc.querySelectorAll('span[style]').forEach((span) => {
        span.style.removeProperty('font-size');
        span.style.removeProperty('font-family');
        span.style.removeProperty('font-weight');
        if (!span.getAttribute('style')) {
          span.removeAttribute('style');
        }
      });

      // 3. Remove external metadata and container attributes
      doc.querySelectorAll('*').forEach((el) => {
        el.removeAttribute('data-start');
        el.removeAttribute('data-end');
        el.removeAttribute('data-section-id');
        el.removeAttribute('dir');
        if (el.className && typeof el.className === 'string' && el.className.includes('selectionAnchor')) {
          el.removeAttribute('class');
        }
      });

      const cleanHtml = doc.body.innerHTML;
      document.execCommand('insertHTML', false, cleanHtml);
      handleInput();
    } catch {
      const text = clipboardData.getData('text/plain');
      document.execCommand('insertText', false, text);
      handleInput();
    }
  };

  const handleLink = () => {
    const url = window.prompt('Enter destination URL (e.g., https://example.com or /blog/article):', '');
    if (url) {
      const trimmed = url.trim();
      if (/^(javascript|data|vbscript):/i.test(trimmed)) {
        alert('Security error: JavaScript and data URI links are forbidden.');
        return;
      }
      const validUrl = trimmed.startsWith('/') || /^https?:\/\//i.test(trimmed)
        ? trimmed
        : `https://${trimmed}`;
      exec('createLink', validUrl);
    }
  };

  const toggleRawHtml = () => {
    if (isRawHtml) {
      // Returning to visual WYSIWYG
      onChange(rawHtmlContent);
      setIsRawHtml(false);
    } else {
      // Switching to Raw HTML code mode
      const currentHtml = editorRef.current ? editorRef.current.innerHTML : (value || '');
      setRawHtmlContent(currentHtml);
      setIsRawHtml(true);
    }
  };

  const handleRawHtmlChange = (e) => {
    const newHtml = e.target.value;
    setRawHtmlContent(newHtml);
    onChange(newHtml);
  };

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm transition-all focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-1 p-2 bg-slate-50 border-b border-slate-200 text-slate-700">
        <div className="flex flex-wrap items-center gap-0.5">
          {/* History */}
          <button
            type="button"
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 transition-colors"
            onClick={() => exec('undo')}
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 transition-colors"
            onClick={() => exec('redo')}
            title="Redo (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
          </button>

          <span className="w-px h-4 bg-slate-300 mx-1" />

          {/* Inline Formats */}
          <button
            type="button"
            className={`p-1.5 rounded-lg transition-colors ${
              activeFormats.bold ? 'bg-indigo-100 text-indigo-700 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
            }`}
            onClick={() => exec('bold')}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            className={`p-1.5 rounded-lg transition-colors ${
              activeFormats.italic ? 'bg-indigo-100 text-indigo-700 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
            }`}
            onClick={() => exec('italic')}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            className={`p-1.5 rounded-lg transition-colors ${
              activeFormats.underline ? 'bg-indigo-100 text-indigo-700 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
            }`}
            onClick={() => exec('underline')}
            title="Underline (Ctrl+U)"
          >
            <Underline className="w-4 h-4" />
          </button>

          <span className="w-px h-4 bg-slate-300 mx-1" />

          {/* Heading Blocks */}
          <button
            type="button"
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 transition-colors font-bold text-xs"
            onClick={() => handleFormatBlock('<h2>')}
            title="Heading 2 (Auto TOC Entry)"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 transition-colors font-bold text-xs"
            onClick={() => handleFormatBlock('<h3>')}
            title="Heading 3 (Sub-section)"
          >
            <Heading3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="px-2 py-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 transition-colors text-xs font-semibold"
            onClick={() => handleFormatBlock('<p>')}
            title="Paragraph Text"
          >
            Paragraph
          </button>

          <span className="w-px h-4 bg-slate-300 mx-1" />

          {/* Lists & Quotes */}
          <button
            type="button"
            className={`p-1.5 rounded-lg transition-colors ${
              activeFormats.insertUnorderedList ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
            }`}
            onClick={() => exec('insertUnorderedList')}
            title="Bulleted List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            className={`p-1.5 rounded-lg transition-colors ${
              activeFormats.insertOrderedList ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
            }`}
            onClick={() => exec('insertOrderedList')}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 transition-colors"
            onClick={() => handleFormatBlock('<blockquote>')}
            title="Callout Blockquote"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 transition-colors"
            onClick={() => handleFormatBlock('<pre>')}
            title="Code Block"
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 transition-colors"
            onClick={() => exec('insertHorizontalRule')}
            title="Horizontal Divider Line"
          >
            <Minus className="w-4 h-4" />
          </button>

          <span className="w-px h-4 bg-slate-300 mx-1" />

          {/* Hyperlink */}
          <button
            type="button"
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 transition-colors"
            onClick={handleLink}
            title="Insert Secure Hyperlink"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* View Mode Toggle: Visual vs Raw HTML */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleRawHtml}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              isRawHtml
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
            title={isRawHtml ? 'Switch to Visual WYSIWYG Editor' : 'Switch to Raw HTML Mode'}
          >
            {isRawHtml ? <Eye className="w-3.5 h-3.5 text-amber-600" /> : <FileCode className="w-3.5 h-3.5 text-indigo-600" />}
            <span>{isRawHtml ? 'Visual Mode' : 'Raw HTML'}</span>
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      {isRawHtml ? (
        <textarea
          value={rawHtmlContent}
          onChange={handleRawHtmlChange}
          rows={16}
          placeholder="<h1>Title</h1><p>Edit raw HTML code directly...</p>"
          className="w-full p-4 font-mono text-xs text-slate-800 bg-slate-50 focus:bg-white outline-none resize-y min-h-[360px] leading-relaxed"
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onPaste={handlePaste}
          onKeyUp={checkActiveFormats}
          onMouseUp={checkActiveFormats}
          data-placeholder={placeholder}
          className="rte-editor-content w-full min-h-[420px] outline-none overflow-y-auto focus:outline-none"
          style={{ minHeight: '420px' }}
        />
      )}

      {/* Word Count & Readability Footer Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 font-medium">
        <div className="flex items-center gap-3">
          <span>{wordCount} words</span>
          <span>•</span>
          <span>~{readTimeMinutes} min read</span>
          <span>•</span>
          <span className="text-[11px] text-slate-400">H2/H3 tags dynamically generate Table of Contents</span>
        </div>
        <div className="text-[11px] text-slate-400 font-mono">
          {isRawHtml ? 'RAW_HTML_MODE' : 'VISUAL_WYSIWYG'}
        </div>
      </div>
    </div>
  );
}
