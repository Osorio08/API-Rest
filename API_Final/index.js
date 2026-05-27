import express from 'express';
import jsonwebtoken from 'jsonwebtoken';
import swaggerUI from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';

const app = express();

const PORT = process.env.PORT || 8081; 
const CLAVE_SECRETA = 'claveSecreta';

app.use(express.json());

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API REST - API FINAL',
            version: '1.0.0',
            description: 'API protegida con JWT y documentada con Swagger'
        },
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


// ! --- RUTAS DOCUMENTADAS ---

/**
 * @swagger
 * /login:
 *   post:
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
 * /sistema:
 *   get:
 *     summary: Ruta protegida del sistema
 *     description: Requiere un token JWT válido en el encabezado Authorization.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Acceso concedido
 *       401:
 *         description: Token no enviado
 *       403:
 *         description: Firma inválida o acceso denegado
 */
app.get('/sistema', verificarToken, (req, res) => {
    res.json({ mensaje: "Acceso concedido a ruta sistema" });
});


// ! --- MIDDLEWARES ---

function verificarToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (typeof authHeader === 'undefined') {
        return res.status(401).json({ Error: "Token No enviado" });
    }
    const token = authHeader.substring(7, authHeader.length);
    jsonwebtoken.verify(token, CLAVE_SECRETA, (err, decoded) => {
        if (err) {
            return res.status(403).json({ Error: "Acceso no concedido a ruta sistema" });
        }
        next();
    });
}

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