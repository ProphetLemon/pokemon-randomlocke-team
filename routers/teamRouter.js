const express = require("express")
const router = express.Router()
const Pokedex = require("pokeapi-js-wrapper");
const QuickChart = require('quickchart-js');
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
    var statsTexto = ""
    for (stat of pokemon.stats) {
        statsTexto += `${stat.base_stat},`
    }
    statsTexto = statsTexto.substring(0, statsTexto.length - 1)
    debilidadesTexto = debilidadesTexto.substring(0, debilidadesTexto.length - 1)

    var aQuienPego = ""
    for (dato of type1.damage_relations.double_damage_to) {
        aQuienPego += `${dato.name}:2,`
    }
    if (type2 != "") {
        for (dato of type2.damage_relations.double_damage_to) {
            aQuienPego += `${dato.name}:2,`
        }
    }
    aQuienPego = aQuienPego.substring(0, aQuienPego.length - 1)

    res.send(`<img class="pokemonIcon" src="${pokemon.sprites.front_default}" default="${pokemon.sprites.front_default}" shiny="${pokemon.sprites.front_shiny}"/>
    <span class="d-none debilidadesResult">${debilidadesTexto}</span>
    <span class="d-none statsResult">${statsTexto}</span>
    <span class="d-none eficaciasResult">${aQuienPego}</span>`)
})

router.post("/grafica", async (req, res) => {
    const myChart = new QuickChart();
    myChart.setConfig({
        type: 'horizontalBar',
        data: {
            labels: ['PS', 'ATQ', 'DEF', 'AT. ESP', 'DEF. ESP', 'VEL'],
            datasets: [{
                label: 'Stats',
                data: [
                    req.body["datos[]"][0],
                    req.body["datos[]"][1],
                    req.body["datos[]"][2],
                    req.body["datos[]"][3],
                    req.body["datos[]"][4],
                    req.body["datos[]"][5],
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
    res.send(url)
})

module.exports = router