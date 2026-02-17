// backend/src/scripts/seedDatabase.ts
import mongoose from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

import { fileURLToPath } from 'url';
// Esto es necesario para recrear __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config();

// Importar modelos
import { Project } from '../models/Project.js';
import { Category } from '../models/Category.js';
import { Tag } from '../models/Tag.js';
import { Document } from '../models/Document.js';
import { Quote } from '../models/Quote.js';

class DatabaseSeeder {
    private dataPath: string;

    constructor(dataPath: string = './seed-data') {
        this.dataPath = dataPath;
    }

    /**
     * Conectar a MongoDB
     */
    async connect(): Promise<void> {
        try {
            const mongoUri = process.env.DATABASE_URL;

            if (!mongoUri) {
                throw new Error('❌ DATABASE_URL no está definido en el archivo .env');
            }

            await mongoose.connect(mongoUri);

            console.log('✅ Conectado a MongoDB');
            console.log(`   Base de datos: ${mongoose.connection.name}`);
        } catch (error) {
            console.error('❌ Error conectando a MongoDB:', error);
            throw error;
        }
    }

    /**
     * Limpiar todas las colecciones
     */
    async clearDatabase(): Promise<void> {
        console.log('\n🧹 Limpiando base de datos...');

        try {
            await Project.deleteMany({});
            console.log('   ✓ Projects eliminados');

            await Category.deleteMany({});
            console.log('   ✓ Categories eliminadas');

            await Tag.deleteMany({});
            console.log('   ✓ Tags eliminados');

            await Document.deleteMany({});
            console.log('   ✓ Documents eliminados');

            await Quote.deleteMany({});
            console.log('   ✓ Quotes eliminadas');

            console.log('✅ Base de datos limpiada\n');
        } catch (error) {
            console.error('❌ Error limpiando base de datos:', error);
            throw error;
        }
    }

    /**
     * Cargar archivo JSON
     */
    private loadJsonFile(filename: string): any {
        const filePath = path.join(this.dataPath, filename);

        if (!fs.existsSync(filePath)) {
            console.warn(`⚠️  Archivo no encontrado: ${filePath}`);
            return null;
        }

        try {
            const rawData = fs.readFileSync(filePath, 'utf-8');
            return JSON.parse(rawData);
        } catch (error) {
            console.error(`❌ Error parseando ${filename}:`, error);
            return null;
        }
    }

    /**
     * Seed de proyectos
     */
    async seedProjects(): Promise<void> {
        console.log('📁 Seeding Projects...');

        const data = this.loadJsonFile('projects.json');
        if (!data || !data.projects) {
            console.log('   ⏭️  No hay datos de proyectos');
            return;
        }

        try {
            const projects = await Project.insertMany(data.projects);
            console.log(`   ✅ ${projects.length} proyectos creados`);
        } catch (error) {
            console.error('   ❌ Error creando proyectos:', error);
            throw error;
        }
    }

    /**
     * Seed de categorías
     */
    async seedCategories(): Promise<void> {
        console.log('📂 Seeding Categories...');

        const data = this.loadJsonFile('categories.json');
        if (!data || !data.categories) {
            console.log('   ⏭️  No hay datos de categorías');
            return;
        }

        try {
            const categories = await Category.insertMany(data.categories);
            console.log(`   ✅ ${categories.length} categorías creadas`);
        } catch (error) {
            console.error('   ❌ Error creando categorías:', error);
            throw error;
        }
    }

    /**
     * Seed de tags
     */
    async seedTags(): Promise<void> {
        console.log('🏷️  Seeding Tags...');

        const data = this.loadJsonFile('tags.json');
        if (!data || !data.tags) {
            console.log('   ⏭️  No hay datos de tags');
            return;
        }

        try {
            const tags = await Tag.insertMany(data.tags);
            console.log(`   ✅ ${tags.length} tags creados`);
        } catch (error) {
            console.error('   ❌ Error creando tags:', error);
            throw error;
        }
    }

    /**
     * Seed de documentos
     */
    async seedDocuments(): Promise<void> {
        console.log('📄 Seeding Documents...');

        const data = this.loadJsonFile('documents.json');
        if (!data || !data.documents) {
            console.log('   ⏭️  No hay datos de documentos');
            return;
        }

        try {
            const documents = await Document.insertMany(data.documents);
            console.log(`   ✅ ${documents.length} documentos creados`);
        } catch (error) {
            console.error('   ❌ Error creando documentos:', error);
            throw error;
        }
    }

    /**
     * Seed de quotes
     */
    async seedQuotes(): Promise<void> {
        console.log('💬 Seeding Quotes...');

        const data = this.loadJsonFile('quotes.json');
        if (!data || !data.quotes) {
            console.log('   ⏭️  No hay datos de quotes');
            return;
        }

        try {
            const quotes = await Quote.insertMany(data.quotes);
            console.log(`   ✅ ${quotes.length} quotes creadas`);
        } catch (error) {
            console.error('   ❌ Error creando quotes:', error);
            throw error;
        }
    }

    /**
     * Validar integridad referencial
     */
    async validateIntegrity(): Promise<void> {
        console.log('\n🔍 Validando integridad referencial...');

        try {
            // Validar que todos los tags tengan projectId válido
            const validProjectIds = await Project.distinct('_id');
            const tagsWithInvalidProject = await Tag.countDocuments({
                projectId: { $nin: validProjectIds }
            });

            if (tagsWithInvalidProject > 0) {
                console.warn(`   ⚠️  ${tagsWithInvalidProject} tags con projectId inválido`);
            } else {
                console.log('   ✅ Todos los tags tienen projectId válido');
            }

            // Validar que todos los documents tengan projectId válido
            const docsWithInvalidProject = await Document.countDocuments({
                projectId: { $nin: validProjectIds }
            });

            if (docsWithInvalidProject > 0) {
                console.warn(`   ⚠️  ${docsWithInvalidProject} documentos con projectId inválido`);
            } else {
                console.log('   ✅ Todos los documentos tienen projectId válido');
            }

            // Validar que todos los quotes tengan documentId válido
            const validDocIds = await Document.distinct('_id');
            const quotesWithInvalidDoc = await Quote.countDocuments({
                documentId: { $nin: validDocIds }
            });

            if (quotesWithInvalidDoc > 0) {
                console.warn(`   ⚠️  ${quotesWithInvalidDoc} quotes con documentId inválido`);
            } else {
                console.log('   ✅ Todas las quotes tienen documentId válido');
            }

            // Validar que todos los quotes tengan tags válidos
            const allQuotes = await Quote.find({}).lean();
            let invalidTagReferences = 0;
            const validTagIds = await Tag.distinct('_id');
            const validTagIdsStr = validTagIds.map(id => id.toString());

            for (const quote of allQuotes) {
                for (const tagId of quote.tags) {
                    if (!validTagIdsStr.includes(tagId.toString())) {
                        invalidTagReferences++;
                    }
                }
            }

            if (invalidTagReferences > 0) {
                console.warn(`   ⚠️  ${invalidTagReferences} referencias a tags inválidos en quotes`);
            } else {
                console.log('   ✅ Todas las referencias a tags son válidas');
            }

            // Validar que las categorías tengan projectId válido
            const catsWithInvalidProject = await Category.countDocuments({
                projectId: { $nin: validProjectIds }
            });

            if (catsWithInvalidProject > 0) {
                console.warn(`   ⚠️  ${catsWithInvalidProject} categorías con projectId inválido`);
            } else {
                console.log('   ✅ Todas las categorías tienen projectId válido');
            }

        } catch (error) {
            console.error('   ❌ Error validando integridad:', error);
        }
    }

    /**
     * Mostrar estadísticas
     */
    async showStats(): Promise<void> {
        console.log('\n📊 Estadísticas de la base de datos:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        try {
            const projectCount = await Project.countDocuments();
            const categoryCount = await Category.countDocuments();
            const tagCount = await Tag.countDocuments();
            const documentCount = await Document.countDocuments();
            const quoteCount = await Quote.countDocuments();

            console.log(`   📁 Proyectos:   ${projectCount}`);
            console.log(`   📂 Categorías:  ${categoryCount}`);
            console.log(`   🏷️  Tags:        ${tagCount}`);
            console.log(`   📄 Documentos:  ${documentCount}`);
            console.log(`   💬 Quotes:      ${quoteCount}`);

            // Estadísticas adicionales por proyecto
            const projects = await Project.find().lean();

            console.log('\n   📊 Desglose por proyecto:');
            console.log('   ────────────────────────────────────────');

            for (const project of projects) {
                const projectTagCount = await Tag.countDocuments({ projectId: project._id });
                const projectCatCount = await Category.countDocuments({ projectId: project._id });
                const projectDocCount = await Document.countDocuments({ projectId: project._id });

                console.log(`\n   📁 ${project.name}`);
                console.log(`      ├─ Tags: ${projectTagCount}`);
                console.log(`      ├─ Categorías: ${projectCatCount}`);
                console.log(`      └─ Documentos: ${projectDocCount}`);
            }

            // Quotes por documento
            console.log('\n   💬 Quotes por documento:');
            console.log('   ────────────────────────────────────────');

            const documents = await Document.find().lean();
            for (const doc of documents) {
                const docQuoteCount = await Quote.countDocuments({ documentId: doc._id });
                console.log(`      ${doc.title}: ${docQuoteCount} quotes`);
            }

            // Tags más usados
            console.log('\n   🔥 Top 5 Tags más usados:');
            console.log('   ────────────────────────────────────────');

            const topTags = await Tag.find()
                .sort({ usageCount: -1 })
                .limit(5)
                .lean();

            topTags.forEach((tag, index) => {
                console.log(`      ${index + 1}. ${tag.name}: ${tag.usageCount} usos`);
            });

        } catch (error) {
            console.error('   ❌ Error obteniendo estadísticas:', error);
        }
    }

    /**
     * Ejecutar seed completo
     */
    async seed(options: { clear?: boolean } = {}): Promise<void> {
        const startTime = Date.now();

        try {
            console.log('\n');
            console.log('🌱 ════════════════════════════════════════════════════════');
            console.log('🌱  INICIANDO SEED DE BASE DE DATOS - MVP SIN USUARIOS');
            console.log('🌱 ════════════════════════════════════════════════════════');
            console.log('');

            // Conectar
            await this.connect();

            // Limpiar si se especifica
            if (options.clear) {
                await this.clearDatabase();
            }

            // Seed en orden correcto (respetando dependencias)
            await this.seedProjects();
            await this.seedCategories();
            await this.seedTags();
            await this.seedDocuments();
            await this.seedQuotes();

            // Validar integridad
            await this.validateIntegrity();

            // Mostrar estadísticas
            await this.showStats();

            const duration = ((Date.now() - startTime) / 1000).toFixed(2);

            console.log('\n');
            console.log('✅ ════════════════════════════════════════════════════════');
            console.log(`✅  SEED COMPLETADO EXITOSAMENTE (${duration}s)`);
            console.log('✅ ════════════════════════════════════════════════════════');
            console.log('');

        } catch (error) {
            console.error('\n❌ ════════════════════════════════════════════════════════');
            console.error('❌  ERROR DURANTE EL SEED:');
            console.error('❌ ════════════════════════════════════════════════════════');
            console.error(error);
            console.error('');
            process.exit(1);
        } finally {
            await mongoose.connection.close();
            console.log('🔌 Conexión cerrada\n');
        }
    }
}

// Ejecutar seed si es llamado directamente
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const args = process.argv.slice(2);
    const clear = args.includes('--clear') || args.includes('-c');
    const help = args.includes('--help') || args.includes('-h');

    if (help) {
        console.log(`
🌱 Script de Seed para MVP de Análisis Cualitativo

USO:
  npm run seed           - Añade datos sin limpiar
  npm run seed:clear     - Limpia y añade datos (recomendado)
  npm run seed:dev       - Alias de seed:clear

OPCIONES:
  --clear, -c  : Limpia la base de datos antes de insertar
  --help, -h   : Muestra esta ayuda

EJEMPLO:
  npm run seed:clear

NOTA: Asegúrate de tener el archivo .env configurado con MONGODB_URI
    `);
        process.exit(0);
    }

    const dataPath = path.join(__dirname, 'seed-data'); // Ahora __dirname ya funcionará
    const seeder = new DatabaseSeeder(dataPath);

    seeder.seed({ clear })
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

export { DatabaseSeeder };