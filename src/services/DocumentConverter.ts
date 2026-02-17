import mammoth from 'mammoth';
import TurndownService from 'turndown';
import crypto from 'crypto';

const turndownService = new TurndownService();

export const convertToMarkdown = async (
  buffer: Buffer, 
  extension: string
): Promise<{ markdown: string; hash: string }> => {
  let markdown = '';

  if (extension === 'docx') {
    // Convierte DOCX a HTML y luego a MD 
    const { value: html } = await mammoth.convertToHtml({ buffer });
    markdown = turndownService.turndown(html);
  } else if (extension === 'txt' || extension === 'md') {
    markdown = buffer.toString('utf-8');
  } else {
    throw new Error('Formato no soportado');
  }

  // Generar hash para integridad [cite: 25, 57]
  const hash = crypto.createHash('sha256').update(markdown).digest('hex');

  return { markdown, hash };
};