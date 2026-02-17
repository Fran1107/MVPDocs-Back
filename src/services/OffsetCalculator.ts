import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';

export function calculateRawOffsets(
  markdown: string,
  plainStart: number,
  plainEnd: number
) {
  const tree = unified().use(remarkParse).parse(markdown);
  
  let currentPlainPosition = 0;
  let rawStart = -1;
  let rawEnd = -1;

  // Recorremos el árbol de sintaxis (AST) [cite: 50, 51]
  visit(tree, 'text', (node: any) => {
    const nodeText = node.value;
    const nodeLength = nodeText.length;
    const nodeOffset = node.position.start.offset;

    // Verificar si el inicio de la selección está en este nodo
    if (rawStart === -1 && 
        currentPlainPosition <= plainStart && 
        plainStart < currentPlainPosition + nodeLength) {
      rawStart = nodeOffset + (plainStart - currentPlainPosition);
    }

    // Verificar si el fin de la selección está en este nodo
    if (rawEnd === -1 && 
        currentPlainPosition <= plainEnd && 
        plainEnd <= currentPlainPosition + nodeLength) {
      rawEnd = nodeOffset + (plainEnd - currentPlainPosition);
    }

    currentPlainPosition += nodeLength;
  });

  return { rawStart, rawEnd };
}