const express = require("express")
const router = express.Router()
const Pokedex = require("pokeapi-js-wrapper");
const P = new Pokedex.Pokedex({ cache: false })
router.get("/", (req, res) => {
    res.render("team")
})

router.post("/buscar", async (req, res) => {
    var nombre = req.body.nombre
    var pokemon = ""
    try {
        pokemon = await P.getPokemonByName(nombre)
    } catch (error) {
        return res.send(`<span class="pokemonError"><b>No se encontró el Pokemon</b></span>`)
    }
    var type1, type2
    try {
        type1 = await P.getTypeByName(pokemon.types[0].type.name)
        type2 = pokemon.types.length == 2 ? await P.getTypeByName(pokemon.types[1].type.name) : "";
    } catch (err) {
        return res.send(`<span class="pokemonError"><b>Error cargando los tipos</b></span>`)
    }
    var debilidades = getDebilidades(type1, type2)
    var debilidadesTexto = ""
    for (let [key, value] of debilidades) {
        debilidadesTexto += `${key}:${value},`
    }
    debilidadesTexto = debilidadesTexto.substring(0, debilidadesTexto.length - 1)
    res.send(`<img class="pokemonIcon" src="${pokemon.sprites.front_default}" default="${pokemon.sprites.front_default}" shiny="${pokemon.sprites.front_shiny}"/>
    <span class="d-none debilidadesResult">${debilidadesTexto}</span>`)
})

module.exports = router