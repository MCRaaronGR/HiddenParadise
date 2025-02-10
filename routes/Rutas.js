const express = require('express');
const router = express.Router();

router.get('/', (req, resp) => {
    resp.render('index');
});

router.get('/CreaUnViaje', (req, resp) => {
    resp.render('CreaUnViaje');
});

router.get('/InfoDestinos', (req, resp) => {
    resp.render('InfoDestinos');
});

router.get('/Comentarios', (req, resp) => {
    resp.render('Comentarios');
});

router.get('/HuellaCarbono', (req, resp) => {
    resp.render('HuellaCarbono');
});

router.get('/VuelosParaTodos', (req, resp) => {
    resp.render('VuelosParaTodos');
});

module.exports = router;