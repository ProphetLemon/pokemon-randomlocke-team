const express = require("express")
const router = express.Router()
const Pokedex = require("pokeapi-js-wrapper");
const P = new Pokedex.Pokedex({ cache: false })

router.get("/", (req, res) => {
    res.render("tabletypes")
})

router.post('/debilidades', async (req, res) => {
    var type1 = req.body.tipo1 ? await P.getTypeByName(req.body.tipo1) : await P.getTypeByName(req.body.tipo2);
    var type2 = req.body.tipo2 ? await P.getTypeByName(req.body.tipo2) : "";
    var debilidades = getDebilidades(type1, type2)
    var texto = crearTexto(debilidades)
    res.send(texto)
})

module.exports = router