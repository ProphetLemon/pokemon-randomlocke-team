const express = require("express");
const router = express.Router();
const Pokedex = require("pokeapi-js-wrapper");
const QuickChart = require("quickchart-js");
const P = new Pokedex.Pokedex({ cache: false });
const pokemonJson = require("../src/json/pokemon-json");
router.get("/", (req, res) => {
  res.render("team");
});

router.post("/buscar", async (req, res) => {
  var nombre = req.body.nombre;
  var pokemon = "";
  try {
    pokemon = await P.getPokemonByName(nombre);
  } catch (error) {
    return res.send(`<span class="pokemonError"><b>No se encontró el Pokemon</b></span>`);
  }
  var type1, type2;
  try {
    type1 = await P.getTypeByName(pokemon.types[0].type.name);
    type2 = pokemon.types.length == 2 ? await P.getTypeByName(pokemon.types[1].type.name) : "";
  } catch (err) {
    return res.send(`<span class="pokemonError"><b>Error cargando los tipos</b></span>`);
  }
  var debilidades = getDebilidades(type1, type2);
  var debilidadesTexto = "";
  for (let [key, value] of debilidades) {
    debilidadesTexto += `${key}:${value},`;
  }
  var statsTexto = "";
  for (let stat of pokemon.stats) {
    statsTexto += `${stat.base_stat},`;
  }
  statsTexto = statsTexto.substring(0, statsTexto.length - 1);
  debilidadesTexto = debilidadesTexto.substring(0, debilidadesTexto.length - 1);

  var aQuienPego = "";
  for (let dato of type1.damage_relations.double_damage_to) {
    aQuienPego += `${dato.name}:2,`;
  }
  if (type2 != "") {
    for (let dato of type2.damage_relations.double_damage_to) {
      aQuienPego += `${dato.name}:2,`;
    }
  }
  aQuienPego = aQuienPego.substring(0, aQuienPego.length - 1);

  var defaultImage = "";
  var imagen = pokemon.sprites.front_default ? pokemon.sprites.front_default : "/img/missingno.png";
  var shiny = pokemon.sprites.front_shiny ? pokemon.sprites.front_shiny : "/img/missingnoshiny.png";
  if (pokemon.sprites.front_default && pokemon.sprites.front_shiny) {
    defaultImage = Math.floor(Math.random() * 10 + 1) == 10 ? pokemon.sprites.front_shiny : pokemon.sprites.front_default;
  } else {
    defaultImage = imagen;
  }
  var especie = await P.getPokemonSpeciesByName(pokemon.species.name);
  var evoluciones = await cargarEvoluciones(especie, pokemon.name);
  res.send(`<img class="pokemonIcon" src="${defaultImage}" default="${imagen}" shiny="${shiny}"/>
        ${getIcon(type1.name)}
        ${type2.name ? getIcon(type2.name) : ""}
        <br>
        <button type="button" onclick="cargarDetalle(this)" class="btn btn-link mb-1 detalle" data-bs-toggle="modal" data-bs-target="#detalleModal">
           Detalles
        </button>
        <br>
        <span>${evoluciones}</span>
    <span class="d-none debilidadesResult">${debilidadesTexto}</span>
    <span class="d-none statsResult">${statsTexto}</span>
    <span class="d-none eficaciasResult">${aQuienPego}</span>
    <script>
   $(".evolucion").click(function (e) {
        cambiarPokemon(e)
    })
    </script>`);
});

router.post("/random", async (req, res) => {
  var pokemonsRandom = [];
  var listaPokemon = Array.from(pokemonJson);
  for (let i = 0; i < req.body.cont; i++) {
    var posicion = Math.floor(Math.random() * listaPokemon.length);
    var pokemon = await P.getPokemonByName(listaPokemon[posicion].name);
    listaPokemon.splice(posicion, 1);
    var totalStats = 0;
    for (let stat of pokemon.stats) {
      totalStats += stat.base_stat;
    }
    if (pokemon.name.includes("-totem") || totalStats < 440 || pokemonsRandom.includes(pokemon.name)) {
      i--;
      continue;
    }
    pokemonsRandom.push(pokemon.name);
  }
  res.send(pokemonsRandom);
});

router.post("/recomendaciones", async (req, res) => {
  var tipos = req.body.datos.split(",");
  var recomendaciones = "";
  for (let tipo of tipos) {
    var type = await P.getTypeByName(tipo);
    var relaciones = type.damage_relations.half_damage_to.concat(type.damage_relations.no_damage_to);
    for (let recomendacion of relaciones) {
      if (!recomendaciones.includes(getIcon(recomendacion.name))) {
        recomendaciones += getIcon(recomendacion.name);
      }
    }
  }
  res.send(recomendaciones);
});

//https://quickchart.io/sandbox#%7B%0A%20%20type%3A%20%27bar%27%2C%0A%20%20data%3A%20%7B%0A%20%20%20%20labels%3A%20%5B%27January%27%2C%20%27February%27%2C%20%27March%27%2C%20%27April%27%2C%20%27May%27%2C%20%27June%27%2C%20%27July%27%5D%2C%0A%20%20%20%20datasets%3A%20%5B%0A%20%20%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20label%3A%20%27Dataset%201%27%2C%0A%20%20%20%20%20%20%20%20backgroundColor%3A%20%27rgb(255%2C%2099%2C%20132)%27%2C%0A%20%20%20%20%20%20%20%20stack%3A%20%27Stack%200%27%2C%0A%20%20%20%20%20%20%20%20data%3A%20%5B3%2C%20-12%2C%20-31%2C%2082%2C%20-33%2C%2012%2C%20-67%5D%2C%0A%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20label%3A%20%27Dataset%202%27%2C%0A%20%20%20%20%20%20%20%20backgroundColor%3A%20%27rgb(54%2C%20162%2C%20235)%27%2C%0A%20%20%20%20%20%20%20%20stack%3A%20%27Stack%200%27%2C%0A%20%20%20%20%20%20%20%20data%3A%20%5B79%2C%2083%2C%2039%2C%207%2C%2065%2C%2083%2C%2034%5D%2C%0A%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20label%3A%20%27Dataset%203%27%2C%0A%20%20%20%20%20%20%20%20backgroundColor%3A%20%27rgb(75%2C%20192%2C%20192)%27%2C%0A%20%20%20%20%20%20%20%20stack%3A%20%27Stack%201%27%2C%0A%20%20%20%20%20%20%20%20data%3A%20%5B40%2C%20-51%2C%2045%2C%2093%2C%20-80%2C%20-79%2C%20-93%5D%2C%0A%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%5D%2C%0A%20%20%7D%2C%0A%20%20options%3A%20%7B%0A%20%20%20%20title%3A%20%7B%0A%20%20%20%20%20%20display%3A%20true%2C%0A%20%20%20%20%20%20text%3A%20%27Chart.js%20Bar%20Chart%20-%20Stacked%27%2C%0A%20%20%20%20%7D%2C%0A%20%20%20%20tooltips%3A%20%7B%0A%20%20%20%20%20%20mode%3A%20%27index%27%2C%0A%20%20%20%20%20%20intersect%3A%20false%2C%0A%20%20%20%20%7D%2C%0A%20%20%20%20responsive%3A%20true%2C%0A%20%20%20%20scales%3A%20%7B%0A%20%20%20%20%20%20xAxes%3A%20%5B%0A%20%20%20%20%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%20%20stacked%3A%20true%2C%0A%20%20%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20%5D%2C%0A%20%20%20%20%20%20yAxes%3A%20%5B%0A%20%20%20%20%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%20%20stacked%3A%20true%2C%0A%20%20%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20%5D%2C%0A%20%20%20%20%7D%2C%0A%20%20%7D%2C%0A%7D%0A
router.post("/grafica", async (req, res) => {
  const myChart = new QuickChart();
  var config = {
    type: "horizontalBar",
    data: {
      labels: ["PS", "ATQ", "DEF", "AT. ESP", "DEF. ESP", "VEL"],
    },
    options: {
      legend: {
        display: true,
      },
      scales: {
        xAxes: [
          {
            ticks: {
              beginAtZero: true,
              stacked: true,
              // max: 255,
              //stepSize: 85,hol
              fontColor: "#000000",
            },
          },
        ],
        yAxes: [
          {
            ticks: {
              stacked: true,
              fontColor: "#000000",
            },
          },
        ],
      },
      plugins: {
        datalabels: {
          formatter: (val) => {
            return val.toLocaleString();
          },
          color: (context) => "#000",
          anchor: (context) => (context.dataset.data[context.dataIndex] > 15 ? "center" : "end"),
          align: (context) => (context.dataset.data[context.dataIndex] > 15 ? "center" : "right"),
        },
      },
    },
  };
  var datasets = [];
  var datosRaw = JSON.parse(req.body["datos"]);
  for (let datosPokemon of datosRaw) {
    var json = {};
    json.label = datosPokemon[0];
    json.data = datosPokemon.splice(1, datosPokemon.length);
    json.stack = "Stack 0";
    datasets.push(json);
  }
  config.data.datasets = datasets;
  myChart.setConfig(config);
  myChart.setFormat("png");
  myChart.setBackgroundColor("#ffffff00");
  const url = await myChart.getShortUrl();
  res.send(url);
});

module.exports = router;
