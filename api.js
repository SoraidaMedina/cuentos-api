// api.js
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// CONFIGURACIÓN - Tu URI de MongoDB
const uri = "mongodb+srv://sorisbaut_db_user:Soraida123@cluster0.lf69dfk.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);

let db;
let cuentosCollection;

// Conectar a MongoDB
async function connectDB() {
    try {
        await client.connect();
        db = client.db('cuentos_magicos');
        cuentosCollection = db.collection('cuentos');
        console.log('✅ Conectado a MongoDB');
    } catch (error) {
        console.error('❌ Error conectando:', error);
        process.exit(1);
    }
}

// ─── ENDPOINTS ──────────────────────────────────────────────

// 1. Obtener todos los cuentos
app.get('/api/cuentos', async (req, res) => {
    try {
        const cuentos = await cuentosCollection.find({}).toArray();
        res.json(cuentos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Obtener cuentos por categoría
app.get('/api/cuentos/categoria/:categoria', async (req, res) => {
    try {
        const { categoria } = req.params;
        const cuentos = await cuentosCollection
            .find({ categoria: categoria })
            .toArray();
        res.json(cuentos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Obtener cuentos por duración
app.get('/api/cuentos/duracion/:duracion', async (req, res) => {
    try {
        const { duracion } = req.params;
        console.log(`🔍 Buscando cuentos con duración: "${duracion}"`);
        const cuentos = await cuentosCollection
            .find({ duracion: duracion })
            .toArray();
        console.log(`✅ Encontrados ${cuentos.length} cuentos`);
        res.json(cuentos);
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 4. Obtener cuentos por categoría Y duración
app.get('/api/cuentos/filtrar', async (req, res) => {
    try {
        const { categoria, duracion } = req.query;
        const filtro = {};
        if (categoria) filtro.categoria = categoria;
        if (duracion) filtro.duracion = duracion;
        console.log('🔍 Filtro:', filtro);
        const cuentos = await cuentosCollection.find(filtro).toArray();
        res.json(cuentos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. Obtener cuento aleatorio (DEBE ESTAR ANTES DE /:id)
app.get('/api/cuentos/aleatorio', async (req, res) => {
    try {
        console.log('🎲 Buscando cuento aleatorio...');
        const count = await cuentosCollection.countDocuments();
        console.log(`📚 Total de cuentos: ${count}`);

        if (count === 0) {
            return res.status(404).json({ error: 'No hay cuentos disponibles' });
        }

        const random = Math.floor(Math.random() * count);
        const cuento = await cuentosCollection
            .find({})
            .skip(random)
            .limit(1)
            .next();

        if (!cuento) {
            return res.status(404).json({ error: 'No se encontró ningún cuento' });
        }

        console.log(`✅ Cuento aleatorio: ${cuento.titulo}`);
        res.json(cuento);
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 6. Obtener un cuento por ID (DEBE ESTAR DESPUÉS DE /aleatorio)
app.get('/api/cuentos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🔍 Buscando cuento por ID: ${id}`);
        const cuento = await cuentosCollection.findOne({ id: id });
        if (!cuento) {
            return res.status(404).json({ error: 'Cuento no encontrado' });
        }
        res.json(cuento);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 7. Obtener categorías disponibles
app.get('/api/categorias', async (req, res) => {
    try {
        const categorias = await cuentosCollection.distinct('categoria');
        res.json(categorias);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 8. Obtener duraciones disponibles
app.get('/api/duraciones', async (req, res) => {
    try {
        const duraciones = await cuentosCollection.distinct('duracion');
        res.json(duraciones);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 9. Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── INICIAR SERVIDOR ─────────────────────────────────────

connectDB().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 API corriendo en http://0.0.0.0:${PORT}`);
        console.log(`📚 Endpoints disponibles:`);
        console.log(`   GET  /api/cuentos`);
        console.log(`   GET  /api/cuentos/categoria/:categoria`);
        console.log(`   GET  /api/cuentos/duracion/:duracion`);
        console.log(`   GET  /api/cuentos/filtrar?categoria=X&duracion=Y`);
        console.log(`   GET  /api/cuentos/aleatorio ⭐`);
        console.log(`   GET  /api/cuentos/:id`);
        console.log(`   GET  /api/categorias`);
        console.log(`   GET  /api/duraciones`);
        console.log(`   GET  /health`);
    });
});