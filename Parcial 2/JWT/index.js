const express = require('express');
const jsonwebtoken = require('jsonwebtoken');

const app = express();
const PORT = 8081;
const CLAVE_SECRETA = 'claveSecreta'; 

app.use(express.json());

app.post('/login', (req, res) => {
    const token = jsonwebtoken.sign(req.body, CLAVE_SECRETA);
    
    console.log("Token: ", token);
    res.json({ token });
});

app.get('/sistema', verificarToken, (req, res) => {
    res.json({ 
        mensaje: "Acceso concedido a la ruta del sistema" 
    });
});

function verificarToken(req, res, next) {
    const authHeader = req.headers.authorization;
    
    console.log("Encabezado de autorización recibido:", authHeader);

    if (typeof authHeader === 'undefined') {
        return res.status(401).json({ 
            Error: "Token No enviado" 
        });
    }

    const token = authHeader.substring(7, authHeader.length);

    jsonwebtoken.verify(token, CLAVE_SECRETA, (err, decoded) => {
        if (err) {
            return res.status(403).json({ 
                Error: "Acceso no concedido a ruta sistema" 
            });
        }
        
        console.log("Datos decodificados del token:", decoded);
        next();
    });
}


app.listen(PORT, () => {
    console.log(`Servidor Express con JWT escuchando en el puerto ${PORT}`);
});