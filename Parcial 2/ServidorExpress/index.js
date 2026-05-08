const express = require('express');
const app = express();
const PORT = 3000;

// ! EJERCICIO 1: Servidor Express
app.get('/productos', (req, res) => {
    res.status(200).json({
        mensaje: "Lista de productos obtenida con éxito",
        datos: [
            { id: 1, nombre: "Teclado Mecánico", precio: 850 },
            { id: 2, nombre: "Monitor 144hz", precio: 3500 }
        ]
    });
});


// ! EJERCICIO 2: Manejo de Errores 
app.use((req, res, next) => {
    res.status(404).send('Recurso no encontrado en la Tech Store');
});

app.use((err, req, res, next) => {
    console.log("Error interno detectado");
    res.status(500).send('Algo no ha ido bien en el servidor');
});

app.listen(PORT, () => {
    console.log(`Servidor de la materia API Rest corriendo en http://localhost:${PORT}`);
});