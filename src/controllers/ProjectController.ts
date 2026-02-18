import type { Request, Response } from 'express'
import { Project } from '../models/Project.js'
import { Document } from '../models/Document.js'

export class ProjectController {
  // Crear un nuevo proyecto 
  static createProject = async (req: Request, res: Response) => {
    try {
      const project = new Project(req.body);
      await project.save();
      res.status(201).json(project);
    } catch (error) {
      res.status(500).json({ error: 'Error al crear el proyecto' });
    }
  }

  // Obtener todos los proyectos 
  static getAllProjects = async (req: Request, res: Response) => {
    try {
      const projects = await Project.find().lean(); // .lean() mejora el rendimiento para lectura

      // Usamos Promise.all para buscar los documentos de todos los proyectos en paralelo
      const projectsWithDocs = await Promise.all(
        projects.map(async (project) => {
          // Buscamos los documentos que pertenecen a este proyecto
          const documents = await Document.find({ projectId: project._id })
            .select('title') // Solo traemos el título para que la respuesta sea ligera
            .lean();

          return {
            ...project,
            documents: documents.map(doc => ({
              id: doc._id,
              title: doc.title
            }))
          }
        })
      )

      res.json(projectsWithDocs);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener los proyectos y sus documentos' });
    }
  }

  // Obtener un proyecto por ID con sus documentos embebidos
  static getProjectById = async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      const project = await Project.findById(projectId).lean();
      if (!project) {
        return res.status(404).json({ error: 'Proyecto no encontrado' });
      }

      const documents = await Document.find({ projectId: project._id })
        .select('title createdAt')
        .lean();

      res.json({
        ...project,
        documents: documents.map(doc => ({
          id: doc._id,
          title: doc.title,
          createdAt: doc.createdAt,
        }))
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener el proyecto' });
    }
  }
}