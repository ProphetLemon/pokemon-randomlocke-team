const express = require('express');
const app = express();
const path = require('path');
require('dotenv').config();
const methodOverride = require('method-override');
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'src')));
//https://github.com/PokeAPI/pokeapi-js-wrapper
const Pokedex = require("pokeapi-js-wrapper");
const P = new Pokedex.Pokedex({ cache: false })
const QuickChart = require('quickchart-js');
const pokemonJson = require('./src/json/pokemon-json')
const tabletypesRouter = require("./routers/tabletypesRouter")
const teamRouter = require("./routers/teamRouter")
app.use('/team', teamRouter)
app.use('/tabletypes', tabletypesRouter)
app.get('/', (req, res) => {
    res.render('index');
});

app.post('/buscar', (req, res) => {
    var nombre = req.body.nombre
    var resultados = []
    for (let pokemon of pokemonJson) {
        if (pokemon.name.toLowerCase().startsWith(nombre)) {
            resultados.push(`<option value="${pokemon.name}">`)
            if (resultados.length == 10) break;
        }
    }
    resultados.sort(function (a, b) {
        return a > b ? 1 : a < b ? -1 : 0
    })
    res.send(resultados.join(""))
})

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
    var abilities = "<ul>"
    for (let ability of pokemon.abilities) {
        let abilityInfo = await P.getAbilityByName(ability.ability.name)
        abilities += `<li><b>${abilityInfo.names[5].name}${ability.is_hidden ? " (hab. oculta)" : ""}: </b>`
        for (flavor of abilityInfo.flavor_text_entries) {
            if (flavor.language.name == "es") {
                abilities += `${flavor.flavor_text} </li>`
                break;
            }
        }

    }
    abilities += "</ul>"
    var imagen = pokemon.sprites.front_default ? `<img class="pokemonIcon" src="${pokemon.sprites.front_default}" />` : '<img class="pokemonIco" src="/img/missingno.png" />'
    var shiny = pokemon.sprites.front_shiny ? `<img class="pokemonIcon" src="${pokemon.sprites.front_shiny}" />` : '<img class="pokemonIco" src="/img/missingnoshiny.png" />'
    var legendario = especie.is_legendary
    var mitico = especie.is_mythical
    var base_stats = 0
    for (let stat of pokemon.stats) {
        base_stats += stat.base_stat
    }
    var type1 = await P.getTypeByName(pokemon.types[0].type.name)
    var type2 = pokemon.types.length == 2 ? await P.getTypeByName(pokemon.types[1].type.name) : "";
    var debilidades = getDebilidades(type1, type2)
    var evoluciones = await cargarEvoluciones(especie, pokemon.name)
    var texto = crearTexto(debilidades)
    const myChart = new QuickChart();
    myChart.setConfig({
        type: 'horizontalBar',
        data: {
            labels: ['PS', 'ATQ', 'DEF', 'AT. ESP', 'DEF. ESP', 'VEL'],
            datasets: [{
                label: 'Stats',
                data: [
                    pokemon.stats[0].base_stat,
                    pokemon.stats[1].base_stat,
                    pokemon.stats[2].base_stat,
                    pokemon.stats[3].base_stat,
                    pokemon.stats[4].base_stat,
                    pokemon.stats[5].base_stat
                ],
                backgroundColor: [
                    "rgb(83,205,91)",
                    "rgb(246,222,82)",
                    "rgb(237,127,15)",
                    "rgb(86,176,241)",
                    "rgb(173,98,246)",
                    "rgb(240,106,206)"
                ]
            }]
        },
        options: {
            legend: {
                display: false
            },
            scales: {
                xAxes: [{
                    ticks: {
                        beginAtZero: true,
                        max: 255,
                        stepSize: 85,
                        fontColor: '#000000'
                    }
                }],
                yAxes: [{
                    ticks: {
                        fontColor: '#000000'
                    }
                }]
            },
            plugins: {
                datalabels: {
                    formatter: (val) => {
                        return val.toLocaleString();
                    },
                    color: (context) => '#000',
                    anchor: (context) => context.dataset.data[context.dataIndex] > 15 ? 'center' : 'end',
                    align: (context) => context.dataset.data[context.dataIndex] > 15 ? 'center' : 'right',
                }
            }
        }
    });
    myChart.setFormat("png")
    myChart.setBackgroundColor("#ffffff00")
    const url = await myChart.getShortUrl();
    res.send(`
        <table id="resultado" class="rounded-top mt-3 mb-3 col-10">
        <tr><td class="border border-secondary rounded-top" colspan="2">${imagen}${shiny}</td></tr>
        <tr><td id="evoluciones" class="border border-secondary" colspan="2">${evoluciones}</td></tr>
        <tr><td class="border border-secondary">${legendario ? "<b>LEGENDARIO</b>" : mitico ? "<b>MÍTICO</b>" : "Común"}</td><td class="border border-secondary">Nº ${especie.pokedex_numbers[0].entry_number}${especie.pokedex_numbers[0].pokedex.name == 'national' ? '' : ` - ${especie.pokedex_numbers[0].pokedex.name}`}</td></tr>
        <tr><td colspan="2" class="border border-secondary text-start">${abilities}</td></tr>
        <tr><td class="border border-secondary" colspan="2"><b>TIPOS</b></td></tr>
        <tr><td class="border border-secondary"><b>${type1.names[5].name}</b>${getIcon(type1.name)}</td><td class="border border-secondary">${type2 != "" ? `<b>${type2.names[5].name + "</b>" + getIcon(type2.name)}` : ""}</td></tr>
        <tr><td class="border border-secondary" colspan="2"><b>RELACIÓN DE DAÑO</b></td></tr>
        <tr><td class="border border-secondary"><img src="/img/x4.png" /></td><td class="border border-secondary">${texto["4"]}</td></tr>        
        <tr><td class="border border-secondary"><img src="/img/x2.png" /></td><td class="border border-secondary">${texto["2"]}</td></tr>        
        <tr><td class="border border-secondary"><img src="/img/x1.png" /></td><td class="border border-secondary">${texto["1"]}</td></tr>        
        <tr><td class="border border-secondary"><img src="/img/medio.png" /></td><td class="border border-secondary">${texto["1/2"]}</td></tr>        
        <tr><td class="border border-secondary"><img src="/img/cuarto.png" /></td><td class="border border-secondary">${texto["1/4"]}</td></tr>
        <tr><td class="border border-secondary"><img src="/img/nulo.png" /></td><td class="border border-secondary">${texto["0"]}</td></tr>        
        <tr><td class="border border-secondary" colspan="2"><b>STATS BASE:</b> ${base_stats >= 500 ? "<b>" + base_stats + "</b>" : base_stats}<br><img id="grafico" src="${url}" /></td></tr>
        </table>
        `)
})

global.getDebilidades = function (type1, type2) {
    var tiposJSON = {
        normal: 1,
        water: 1,
        grass: 1,
        electric: 1,
        fire: 1,
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

async function cargarEvoluciones(especie, name) {
    function ordenAlfabetico(evolucionstring) {
        if (evolucionstring != "") {
            evolucionstring.substring(0, evolucionstring.length - 2)
            evolucionstring = evolucionstring.split(" / ")
            evolucionstring.sort(function (a, b) {
                return a > b ? 1 : a < b ? -1 : 0
            })
            evolucionstring = ` > ${evolucionstring.join(" / ")}`
            evolucionstring = ` >${evolucionstring.substring(5, evolucionstring.length)}`
        }
        return evolucionstring
    }
    var pokemonSpecies = especie
    if (pokemonSpecies.evolution_chain && pokemonSpecies.evolution_chain.url) {
        var pokemonEvolutionChain = await P.resource(pokemonSpecies.evolution_chain.url)
        var primeraEvolucion = `<span class="evolucion">${pokemonEvolutionChain.chain.species.name}</span>`
        var segundaEvolucion = ""
        for (let i = 0; i < pokemonEvolutionChain.chain.evolves_to.length; i++) {
            let evolution = pokemonEvolutionChain.chain.evolves_to[i]
            segundaEvolucion += `<span class="evolucion">${evolution.species.name}</span> / `
        }
        segundaEvolucion = ordenAlfabetico(segundaEvolucion)
        var terceraEvolucion = ""
        for (let i = 0; i < pokemonEvolutionChain.chain.evolves_to.length; i++) {
            let evolution = pokemonEvolutionChain.chain.evolves_to[i]
            if (evolution.evolves_to.length > 0) {
                for (let j = 0; j < evolution.evolves_to.length; j++) {
                    terceraEvolucion += `<span class="evolucion">${evolution.evolves_to[j].species.name}</span> / `
                }
            }
        }
        terceraEvolucion = ordenAlfabetico(terceraEvolucion)
        var evoluciones = primeraEvolucion + segundaEvolucion + terceraEvolucion
        evoluciones = evoluciones.split(`>${name}<`).join(`><b>${name}</b><`)
        return evoluciones
    } else {
        return "No se han encotrado datos"
    }

}

/**
 * 
 * @param {Map<String,Number>} debilidades 
 */
global.crearTexto = function (debilidades) {
    var json = {
        "0": "",
        "1/4": "",
        "1/2": "",
        "1": "",
        "2": "",
        "4": ""
    }
    for (let [key, value] of debilidades) {
        key = getIcon(key)
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

global.getIcon = function (key) {
    switch (key) {
        case 'steel':
            return `<img src="https://static.wikia.nocookie.net/pokemongo_es_gamepedia/images/2/2c/Type_Acero.png/" title="Acero"/>`
        case 'water':
            return `<img src="https://static.wikia.nocookie.net/pokemongo_es_gamepedia/images/b/b7/Type_Agua.png/" title="Agua"/>`
        case 'bug':
            return `<img src="https://static.wikia.nocookie.net/pokemongo_es_gamepedia/images/9/91/Type_Bicho.png/" title="Bicho"/>`
        case 'dragon':
            return `<img src="https://static.wikia.nocookie.net/pokemongo_es_gamepedia/images/d/d4/Type_Drag%C3%B3n.png" title="Dragón"/>`
        case 'electric':
            return `<img src="https://static.wikia.nocookie.net/pokemongo_es_gamepedia/images/c/c7/Type_El%C3%A9ctrico.png/" title="Electrico"/>`
        case 'ghost':
            return `<img src="https://static.wikia.nocookie.net/pokemongo_es_gamepedia/images/1/11/Type_Fantasma.png" title="Fantasma"/>`
        case 'fire':
            return `<img src="https://static.wikia.nocookie.net/pokemongo_es_gamepedia/images/3/38/Type_Fuego.png/" title="Fuego"/>`
        case 'fairy':
            return `<img src="https://static.wikia.nocookie.net/pokemongo_es_gamepedia/images/4/49/Type_Hada.png/" title="Hada"/>`
        case 'ice':
            return `<img src="https://static.wikia.nocookie.net/pokemongo_es_gamepedia/images/3/35/Type_Hielo.png/" title="Hielo"/>`
        case 'fighting':
            return `<img src="https://static.wikia.nocookie.net/pokemongo_es_gamepedia/images/6/66/Type_Lucha.png/" title="Lucha"/>`
        case 'normal':
            return `<img src="https://static.wikia.nocookie.net/pokemongo_es_gamepedia/images/2/23/Type_Normal.png/" title="Normal"/>`
        case 'grass':
            return `<img src="https://static.wikia.nocookie.net/pokemongo_es_gamepedia/images/6/60/Type_Planta.png/" title="Planta"/>`
        case 'psychic':
            return `<img src="https://static.wikia.nocookie.net/pokemongo_es_gamepedia/images/7/72/Type_Ps%C3%ADquico.png/" title="Psiquico"/>`
        case 'rock':
            return `<img src="https://static.wikia.nocookie.net/pokemongo_es_gamepedia/images/b/b3/Type_Roca.png/" title="Roca"/>`
        case 'dark':
            return `<img src="https://static.wikia.nocookie.net/pokemongo_es_gamepedia/images/3/39/Type_Siniestro.png/" title="Siniestro"/>`
        case 'ground':
            return `<img src="https://static.wikia.nocookie.net/pokemongo_es_gamepedia/images/4/49/Type_Tierra.png/" title="Tierra"/>`
        case 'poison':
            return `<img src="https://static.wikia.nocookie.net/pokemongo_es_gamepedia/images/f/f1/Type_Veneno.png/" title="Veneno"/>`
        case 'flying':
            return `<img src="https://static.wikia.nocookie.net/pokemongo_es_gamepedia/images/8/80/Type_Volador.png/" title="Volador"/>`
        default:
            return key
    }
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

console.log("Encendido")