const express = require('express');
const app = express();
var path = require('path');
require('dotenv').config();
const methodOverride = require('method-override');
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'src')));
//https://github.com/PokeAPI/pokeapi-js-wrapper
const Pokedex = require("pokeapi-js-wrapper");
const P = new Pokedex.Pokedex({ cache: false })

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/pokemon', async (req, res) => {
    var nombre = req.body.nombre
    var pokemon = ""
    var especie = ""
    try {
        pokemon = await P.getPokemonByName(nombre)
        especie = await P.getPokemonSpeciesByName(pokemon.species.name)
    } catch (error) {
        try {
            especie = await P.getPokemonSpeciesByName(nombre)
            for (let variety of especie.varieties) {
                if (variety.is_default) {
                    pokemon = await P.getPokemonByName(variety.pokemon.name)
                    break
                }
            }
        } catch (error2) {
            return res.send("<b>No encontré el pokemon</b>")
        }
    }
    var imagen = `<img src="${pokemon.sprites.front_default}" />`
    var legendario = especie.is_legendary
    var base_stats = 0
    for (let stat of pokemon.stats) {
        base_stats += stat.base_stat
    }
    var type1 = await P.getTypeByName(pokemon.types[0].type.name)
    var type2 = pokemon.types.length == 2 ? await P.getTypeByName(pokemon.types[1].type.name) : "";
    var debilidades = getDebilidades(type1, type2)
    var evolution_chain = await P.getEvolutionChainById(especie.evolution_chain.url.split("/")[especie.evolution_chain.url.split("/").length - 2])
    var evoluciones = ""
    evoluciones = cargarEvoluciones(evolution_chain.chain, evoluciones)
    evoluciones = evoluciones.substring(0, evoluciones.length - 3).split(pokemon.name).join(`<b>${pokemon.name}</b>`)
    var texto = await crearTexto(debilidades)
    res.send(`
        <table class="mt-3 col-10">
        <tr><td colspan="2">${imagen}</td></tr>
        <tr><td colspan="2">${evoluciones}</td></tr>
        <tr><td>${legendario ? "<b>ES LEGENDARIO</b>" : "No es legendario"}</td><td>${base_stats >= 500 ? "<b>" + base_stats + "</b>" : base_stats}</td></tr>
        <tr><td><b>${type1.names[5].name.toUpperCase()}</b></td><td><b>${type2 != "" ? type2.names[5].name.toUpperCase() : ""}</b></td></tr>
        <tr><td colspan="2"><b>Relación de daño</b></td></tr>
        <tr><td>x0</td><td>${texto["0"]}</td></tr>
        <tr><td>x1/4</td><td>${texto["1/4"]}</td></tr>
        <tr><td>x1/2</td><td>${texto["1/2"]}</td></tr>
        <tr><td>x1</td><td>${texto["1"]}</td></tr>
        <tr><td>x2</td><td>${texto["2"]}</td></tr>
        <tr><td>x4</td><td>${texto["4"]}</td></tr>
        </table>
        `)
})

function getDebilidades(type1, type2) {
    var tiposJSON = {
        normal: 1,
        water: 1,
        grass: 1,
        electric: 1,
        ice: 1,
        fighting: 1,
        poison: 1,
        ground: 1,
        flying: 1,
        psychic: 1,
        bug: 1,
        rock: 1,
        ghost: 1,
        dark: 1,
        dragon: 1,
        steel: 1,
        fairy: 1
    }
    var debilidades = new Map(Object.entries(tiposJSON))
    recorrerDebilidades(debilidades, type1)
    if (type2 != "") {
        recorrerDebilidades(debilidades, type2)
    }
    return debilidades
}

function cargarEvoluciones(pokemon, evoluciones) {
    evoluciones += `${pokemon.species.name} ->`
    if (pokemon.evolves_to.length > 0) {
        return cargarEvoluciones(pokemon.evolves_to[0], evoluciones)
    }
    return evoluciones
}

/**
 * 
 * @param {Map<String,Number>} debilidades 
 */
async function crearTexto(debilidades) {
    var json = {
        "0": "",
        "1/4": "",
        "1/2": "",
        "1": "",
        "2": "",
        "4": ""
    }
    for (let [key, value] of debilidades) {
        key = await P.getTypeByName(key)
        key = key.names[5].name.toUpperCase()
        switch (value) {
            case 0:
                json["0"] += `${key} `
                break;
            case 1 / 4:
                json["1/4"] += `${key} `
                break;
            case 1 / 2:
                json["1/2"] += `${key} `
                break;
            case 1:
                json["1"] += `${key} `
                break;
            case 2:
                json["2"] += `${key} `
                break;
            case 4:
                json["4"] += `${key} `
                break;
        }
    }
    return json
}

/**
 * 
 * @param {Map<String,Number>} map 
 * @param {*} type 
 */
function recorrerDebilidades(map, type) {
    if (type.damage_relations["double_damage_from"]) {
        rellenarMap(map, type.damage_relations["double_damage_from"], 2)
    }
    if (type.damage_relations["half_damage_from"]) {
        rellenarMap(map, type.damage_relations["half_damage_from"], 1 / 2)
    }
    if (type.damage_relations["no_damage_from"]) {
        rellenarMap(map, type.damage_relations["no_damage_from"], 0)
    }
}

function rellenarMap(map, damages, relDamage) {
    for (let damage of damages) {
        map.set(damage.name, map.get(damage.name) * relDamage)
    }
}

app.listen(process.env.PORT || 5000);