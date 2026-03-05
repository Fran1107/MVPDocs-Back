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

    // Optimistic Locking
    if (network.version !== version) {
      return res.status(409).json({ error: 'Conflicto: La red fue modificada por otro usuario' });
    }

    network.nodes = nodes;
    network.edges = edges;
    network.viewport = viewport;
    network.version += 1; 

    await network.save();
    res.json(network);
  };

  // POST /api/networks/generate-from-project
static generateFromProject = async (req: Request, res: Response) => {
  try {
    const { projectId, name } = req.body;

    // 1. Obtener tags del proyecto
    const tags = await Tag.find({ projectId });

    // 2. Crear nodos iniciales (Layout circular básico)
    const nodes = tags.map((tag, index) => {
      const radius = 300;
      const angle = (index / tags.length) * 2 * Math.PI;
      return {
        id: tag._id.toString(),
        type: 'tagNode', 
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

    // 3. Crear la red con el nombre proporcionado o uno por defecto
    const defaultName = `Red Automática - ${new Date().toLocaleDateString('es-AR')}`;

    const network = new Network({
      projectId,
      name: `${name || defaultName} - ${new Date().toLocaleDateString('es-AR')}`,
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

  // GET /api/networks/project/:projectId
    static getNetworksByProject = async (req, res) => {
        try {
            const { projectId } = req.params;
            const networks = await Network.find({ projectId }).sort({ updatedAt: -1 });
            
            // Mapeamos para enviar conteos listos para la card
            const formattedNetworks = networks.map(net => ({
                _id: net._id,
                name: net.name,
                projectId: net.projectId,
                nodesCount: net.nodes.length,
                edgesCount: net.edges.length,
                updatedAt: net.updatedAt
            }));

            res.json(formattedNetworks);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener las redes del proyecto' });
        }
    };

    // GET /api/networks/recent
    // Obtiene las últimas 6 redes modificadas globalmente
    static getRecentNetworks = async (req, res) => {
        try {
            const recent = await Network.find()
                .sort({ updatedAt: -1 })
                .limit(6)
                .populate('projectId', 'name');

            const formatted = recent.map(net => {
                // Solución al error ts(2339): Asertamos que projectId tiene 'name'
                const project = net.projectId as unknown as { name: string };
                
                return {
                    _id: net._id,
                    name: net.name,
                    projectId: net.projectId,
                    projectName: project?.name || 'Proyecto desconocido',
                    nodesCount: net.nodes?.length || 0,
                    edgesCount: net.edges?.length || 0,
                    updatedAt: net.updatedAt
                };
            });
            res.json(formatted);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener redes recientes' });
        }
    };

    // DELETE /api/networks/:id
    static deleteNetwork = async (req, res) => {
        try {
            const { id } = req.params;
            const network = await Network.findByIdAndDelete(id);
            
            if (!network) {
                return res.status(404).json({ error: 'Red no encontrada' });
            }

            res.json({ message: 'Red eliminada correctamente' });
        } catch (error) {
            res.status(500).json({ error: 'Error al eliminar la red' });
        }
    };
}