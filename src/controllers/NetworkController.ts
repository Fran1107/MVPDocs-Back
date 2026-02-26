import { Request, Response } from 'express';
import { Network } from '../models/Network.js';
import { Tag } from '../models/Tag.js';
import { Quote } from '../models/Quote.js';

export class NetworkController {
  
  // POST /api/networks/generate-from-project
  static generateInitialNetwork = async (req: Request, res: Response) => {
    try {
      const { projectId } = req.body;

      // 1. Obtener todos los tags del proyecto
      const tags = await Tag.find({ projectId });
      
      // 2. Crear nodos iniciales (en círculo o grilla)
      const nodes = tags.map((tag, index) => ({
        id: tag._id.toString(),
        type: 'tag',
        position: { x: Math.cos(index) * 200, y: Math.sin(index) * 200 },
        data: { label: tag.name, color: tag.color, tagId: tag._id }
      }));

      // 3. Lógica de Edges Sugeridos (Co-ocurrencia)
      // Buscamos quotes que tengan más de un tag
      const quotesWithMultipleTags = await Quote.find({ 
        projectId, 
        'tags.1': { $exists: true } 
      });

      const edges: any[] = [];
      // (Aquí podrías añadir lógica para crear conexiones si dos tags comparten una quote)

      const newNetwork = new Network({
        projectId,
        name: "Red Inicial Automática",
        nodes,
        edges,
        version: 1
      });

      await newNetwork.save();
      res.status(201).json(newNetwork);
    } catch (error) {
      res.status(500).json({ error: 'Error al generar la red' });
    }
  };

  // PATCH /api/networks/:id (Guardado con Versión)
  static updateNetwork = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nodes, edges, viewport, version } = req.body;

    const network = await Network.findById(id);
    if (!network) return res.status(404).json({ error: 'No existe' });

    // US-02: Optimistic Locking
    if (network.version !== version) {
      return res.status(409).json({ error: 'Conflicto: La red fue modificada por otro usuario' });
    }

    network.nodes = nodes;
    network.edges = edges;
    network.viewport = viewport;
    network.version += 1; // Incrementamos la versión

    await network.save();
    res.json(network);
  };

  // POST /api/networks/generate-from-project
static generateFromProject = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.body;

    // 1. Obtener tags del proyecto
    const tags = await Tag.find({ projectId });

    // 2. Crear nodos iniciales (Layout circular básico)
    const nodes = tags.map((tag, index) => {
      const radius = 300;
      const angle = (index / tags.length) * 2 * Math.PI;
      return {
        id: tag._id.toString(),
        type: 'tagNode', // Debe coincidir con el nombre definido en el front
        position: { 
          x: Math.cos(angle) * radius, 
          y: Math.sin(angle) * radius 
        },
        data: { 
          tagId: tag._id, 
          label: tag.name, 
          color: tag.color,
          quoteCount: tag.usageCount || 0 
        }
      };
    });

    const network = new Network({
      projectId,
      name: `Red Automática - ${new Date().toLocaleDateString()}`,
      nodes,
      edges: [],
      version: 1
    });

    await network.save();
    res.status(201).json(network);
  } catch (error) {
    res.status(500).json({ error: 'Error al generar la red inicial' });
  }
};

// GET /api/networks/:id 
  static getNetworkById = async (req: Request, res: Response) => {
    try {
      const network = await Network.findById(req.params.id);
      if (!network) return res.status(404).json({ error: 'Red no encontrada' });
      res.json(network);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener la red' });
    }
  };
}