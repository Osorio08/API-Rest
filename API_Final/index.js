import express from 'express';
import jsonwebtoken from 'jsonwebtoken';
import swaggerUI from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';

const app = express();
const PORT = process.env.PORT || 8081; 
const CLAVE_SECRETA = 'claveSecreta';

app.use(express.json());

let componentes = [
    { id: 1, nombre: "Procesador AMD Ryzen 5", precio: 3500 },
    { id: 2, nombre: "Memoria RAM 16GB Corsair", precio: 1200 }
];

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API REST - Parcial 2',
            version: '1.0.0',
            description: 'API protegida con JWT - Control de Componentes'
        },
        tags: [
            { name: 'Autenticación', description: 'Endpoints de seguridad y acceso' },
            { name: 'Componentes', description: 'Gestión del inventario (Protegidos por JWT)' }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                }
            }
        }
    },
    apis: ['./index.js'], 
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));


function verificarToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (typeof authHeader === 'undefined') {
        return res.status(401).json({ Error: "Token No enviado" });
    }
    const token = authHeader.substring(7, authHeader.length);
    jsonwebtoken.verify(token, CLAVE_SECRETA, (err, decoded) => {
        if (err) {
            return res.status(403).json({ Error: "Acceso no concedido" });
        }
        next();
    });
}


/**
 * @swagger
 * /login:
 *   post:
 *     tags: [Autenticación]
 *     summary: Iniciar sesión y obtener token
 *     description: Recibe datos de usuario y devuelve un JWT firmado.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               usuario:
 *                 type: string
 *                 example: Carlos
 *     responses:
 *       200:
 *         description: Token generado exitosamente
 */
app.post('/login', (req, res) => {
    const token = jsonwebtoken.sign(req.body, CLAVE_SECRETA);
    res.json({ token });
});

/**
 * @swagger
 * /componentes:
 *   get:
 *     tags: [Componentes]
 *     summary: Obtener todos los componentes
 *     description: Retorna la lista completa del inventario (Ruta pública).
 *     responses:
 *       200:
 *         description: Lista de componentes obtenida correctamente
 */
app.get('/componentes', (req, res) => {
    res.status(200).json(componentes);
});

/**
 * @swagger
 * /componentes:
 *   post:
 *     tags: [Componentes]
 *     summary: Agregar un nuevo componente
 *     description: Añade un elemento al arreglo. Requiere token JWT.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 3
 *               nombre:
 *                 type: string
 *                 example: Tarjeta Madre ASUS
 *               precio:
 *                 type: number
 *                 example: 2500
 *     responses:
 *       201:
 *         description: Componente creado exitosamente
 *       401:
 *         description: Token no enviado
 */
app.post('/componentes', verificarToken, (req, res) => {
    const nuevoComponente = req.body;
    componentes.push(nuevoComponente);
    res.status(201).json({ mensaje: "Componente agregado", datos: nuevoComponente });
});

/**
 * @swagger
 * /componentes/{id}:
 *   put:
 *     tags: [Componentes]
 *     summary: Modificar un componente existente
 *     description: Actualiza los datos de un elemento buscando por su ID. Requiere token JWT.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID numérico del componente a editar
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Tarjeta Madre ASUS ROG
 *               precio:
 *                 type: number
 *                 example: 2800
 *     responses:
 *       200:
 *         description: Componente actualizado
 *       404:
 *         description: Componente no encontrado
 */
app.put('/componentes/:id', verificarToken, (req, res) => {
    const idParam = parseInt(req.params.id);
    const index = componentes.findIndex(c => c.id === idParam);

    if (index === -1) {
        return res.status(404).json({ Error: "Componente no encontrado" });
    }

    componentes[index] = { id: idParam, ...req.body };
    res.status(200).json({ mensaje: "Componente modificado", datos: componentes[index] });
});

app.use((req, res, next) => {
    res.status(404).json({ Error: "Recurso no encontrado" });
});

app.use((err, req, res, next) => {
    res.status(500).json({ Error: "Algo salió mal en el servidor" });
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
    console.log(`Documentación disponible en http://localhost:${PORT}/api-docs`);
});