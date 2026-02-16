
import React from 'react';
import { ARCHITECTURE_DOCUMENT_CONTENT } from '../constants';

const ArchitectureDocument: React.FC = () => {
  return (
    <div
      className="prose max-w-none text-gray-800" // Tailwind 'prose' plugin styles HTML content.
      dangerouslySetInnerHTML={{ __html: ARCHITECTURE_DOCUMENT_CONTENT }}
    />
  );
};

export default ArchitectureDocument;
