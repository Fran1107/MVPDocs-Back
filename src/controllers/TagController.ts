import { Request, Response } from "express";
import { Tag } from "../models/Tag.js";
import { Category } from '../models/Category.js';
import mongoose from "mongoose";

interface CreateTagRequest {
    name: string;
    color?: string;
    description?: string;
    categoryId?: string;
    projectId: string;
}

interface UpdateTagRequest {
    name?: string;
    color?: string;
    description?: string;
    categoryId?: string | null; // null para remover categoría
}


export class TagController {

    static async createTag(req: Request, res: Response) {
        try {
            const newTag: CreateTagRequest = req.body;

            const tag = await Tag.create(newTag);

            res.status(201).json(tag);
        } catch (error) {
            if (error.code === 11000) {
                res.status(409).json({
                    message: `Ya existe un tag con el nombre "${req.body.name}" en este proyecto`
                });
                return;
            }

            res.status(500).json({ message: 'Error creando tag' });
        }
    }

    static async getTagsByProjectId(req: Request, res: Response) {
        try {
            const { projectId, categoryId, search } = req.query;

            if (!projectId) {
                return res.status(400).json({ message: 'El ID del proyecto es requerido' });
            }

            if (typeof projectId !== 'string' || !mongoose.Types.ObjectId.isValid(projectId)) {
                return res.status(400).json({ message: 'El ID del proyecto es inválido' });
            }

            const filters: any = { projectId };

            if (categoryId) {
                if (categoryId === 'null' || categoryId === 'uncategorized') {
                    filters.categoryId = null;
                } else if (mongoose.Types.ObjectId.isValid(categoryId as string)) {
                    filters.categoryId = categoryId;
                }
            }

            if (search) {
                filters.name = { $regex: search, $options: 'i' };
            }

            // Query con población de categoría
            const tags = await Tag.find(filters)
                .populate({ path: 'categoryId', model: Category, select: 'name color' })
                .sort({ name: 1 })
                .lean();

            res.status(200).json(tags);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Error obteniendo tags' });
        }
    }

    static async getTagById(req: Request, res: Response) {
        try {
            const { tagId } = req.params;

            const tag = await Tag.findById(tagId)
                .populate({ path: 'categoryId', model: Category, select: 'name color' })
                .lean();

            if (!tag) {
                return res.status(404).json({ message: 'Tag no encontrado' });
            }

            res.status(200).json(tag);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Error obteniendo tag' });
        }
    }

    static async updateTag(req: Request, res: Response) {
        try {
            const { tagId } = req.params;
            const updatedTag: UpdateTagRequest = req.body;

            const tag = await Tag.findByIdAndUpdate(tagId, updatedTag, { new: true }).lean();

            if (!tag) {
                return res.status(404).json({ message: 'Tag no encontrado' });
            }

            res.status(200).json(tag);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Error actualizando tag' });
        }
    }

    static async deleteTag(req: Request, res: Response) {
        try {
            const { tagId } = req.params;
            const { force } = req.query;

            const tag = await Tag.findById(tagId);

            if (!tag) {
                return res.status(404).json({ message: 'Tag no encontrado' });
            }

            // Protección: no eliminar tags en uso
            if (tag.usageCount > 0 && force !== 'true') {
                res.status(409).json({
                    error: `Este tag está siendo usado en ${tag.usageCount} cita(s). Use force=true para eliminar de todas formas.`,
                    usageCount: tag.usageCount,
                });
                return;
            }

            // Si force=true, primero eliminar referencias en Quotes
            if (force === 'true') {
                // TODO: Implementar eliminación de referencias en Sprint 2
                // await Quote.updateMany(
                //   { tags: tag._id },
                //   { $pull: { tags: tag._id } }
                // );
            }

            await tag.deleteOne();

            res.status(200).json({ message: 'Tag eliminado correctamente' });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Error eliminando tag' });
        }
    }
}