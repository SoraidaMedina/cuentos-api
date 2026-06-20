// upload.js
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// URI de conexión
const uri = "mongodb+srv://soribaut_db_user:soraida1@cluster0.lf69dfk.mongodb.net/?retryWrites=true&w=majority";

async function uploadCuentos() {
    const client = new MongoClient(uri);
    
    try {
        await client.connect();
        console.log('✅ Conectado a MongoDB');
        
        const db = client.db('cuentos_magicos');
        const collection = db.collection('cuentos');
        
        // Leer el archivo JSON
        const cuentosPath = path.join(__dirname, 'cuentos.json');
        const cuentos = JSON.parse(fs.readFileSync(cuentosPath, 'utf8'));
        
        console.log(`📚 Leyendo ${cuentos.length} cuentos...`);
        
        // Limpiar colección (opcional)
        await collection.deleteMany({});
        console.log('🗑️ Colección limpiada');
        
        // Insertar cuentos
        const result = await collection.insertMany(cuentos);
        console.log(`✅ ${result.insertedCount} cuentos insertados`);
        
        // Verificar
        const count = await collection.countDocuments();
        console.log(`📊 Total en base de datos: ${count} cuentos`);
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.close();
    }
}

uploadCuentos();