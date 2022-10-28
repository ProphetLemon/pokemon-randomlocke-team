function init() {
    //CARGO LOS VALORES EN LA TABLA
    for (let i = 0; i < 2; i++) {
        $("#teamtable").append(`<tr id="row${i}"></tr>`)
        for (let j = 0; j < 3; j++) {
            $(`#row${i}`).append(`<td id="pokemon${(i * 3) + (j + 1)}" class="me-2 p-3"><b>POKEMON ${(i * 3) + (j + 1)}</b>
            <br>
            <div class="input-group">
                <input list="pokemonList${(i * 3) + (j + 1)}" type="text" class="buscador form-control mb-2">           
                <button type="button" class="btn bg-transparent borrar" style="margin-left: -40px; z-index: 100; margin-bottom:10px;">
                    <i class="fa fa-times"></i>
                </button>
            </div>            
            <datalist id="pokemonList${(i * 3) + (j + 1)}"></datalist>
            </td>`)
        }
    }
    //CARGO LOS BOTONES DE BORRAR
    $(".borrar").click(function (e) {
        $(this).parent().children("input").val("")
        buscar($(this).parent().children("input"))
    })

    //CARGO LOS BUSCADORES DE LA TABLA
    $(".buscador").change(function () {
        $(this).blur()
        buscar($(this))
    })

    $('.buscador').keyup(delay(function (e) {
        var nombre = $(this)[0].value
        var datalist = $("#" + $(this).attr("list"))[0]
        if (nombre && nombre.trim() != "") {
            nombre = nombre.toLowerCase().trimLeft().trimRight()
            $.post("/buscar", { nombre: nombre }, function (result) {
                datalist.innerHTML = result
            })
        } else {
            datalist.innerHTML.innerHTML = ''
        }
    }, 500));

}

function delay(callback, ms) {
    var timer = 0;
    return function () {
        var context = this, args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
            callback.apply(context, args);
        }, ms || 0);
    };
}

function buscar(e) {
    var nombre = e.val().trim()
    var td = e.parent().parent().attr("id")
    $(`#${td} .pokemonIcon,#${td} .pokemonError, #${td} .debilidadesResult,#${td} .statsResult,#${td} .typesResult, #${td} .eficaciasResult,
    #cuadradosColores`).remove()
    if (nombre) {
        e.parent().append(`<div id="cargando" class="rounded mt-2 cuadrado"><b>Cargando...</b></div>`)
        $.post("/team/buscar", { nombre: nombre }, function (result) {
            $("#cargando").remove()
            e.parent().parent().append(result)
            calcularDamage()
            cargarShiny(e.parent().parent().children("img"))
            cargarGrafica()
        })
    } else {
        calcularDamage()
        cargarGrafica()
        $(`#${e.attr("list")}`)[0].innerHTML = ''
    }
}

function cargarGrafica() {
    var statsTeam = $(".statsResult")
    if (statsTeam.length == 0) {
        return
    }
    function recorrerStats(statsTeam, attr) {
        var stat = 0
        $(statsTeam).each(function (index, element) {
            stat += Number(element.innerText.split(",")[attr])
        })
        return Math.floor(stat / statsTeam.length)
    }
    var hp = recorrerStats(statsTeam, 0)
    var atq = recorrerStats(statsTeam, 1)
    var def = recorrerStats(statsTeam, 2)
    var satq = recorrerStats(statsTeam, 3)
    var sdef = recorrerStats(statsTeam, 4)
    var speed = recorrerStats(statsTeam, 5)
    var datos = [hp, atq, def, satq, sdef, speed]
    $.post("/team/grafica", { datos: datos }, function (result) {
        $(".row").last().after(`<div id="graficaDiv" class="cuadrado mt-2"><b>STATS MEDIA</b><br> <img class="grafica" src="${result}" /></div>`)
    })
}



function cargarShiny(e) {
    $(e).click(function () {
        if ($(this).attr("shiny") != "null") {
            var link = $(this).attr("src")
            $(this).attr("src", link.split("shiny").length == 2 ? $(this).attr("default") : $(this).attr("shiny"))
        }

    })
}

var hover = undefined

function calcularDamage() {
    if ($(".debilidadesResult").length == 0) {
        return
    }
    var debilidadesMap = new Map()
    $(".debilidadesResult").each(function (index, element) {
        var debilidades = element.innerText.split(",")
        for (debilidad of debilidades) {
            var dmg = Number(debilidad.split(":")[1])
            var type = debilidad.split(":")[0]
            if (dmg > 1) {
                var valorActual = debilidadesMap.get(type) ? debilidadesMap.get(type) : 0
                debilidadesMap.set(type, valorActual + 1)
            } else if (dmg < 1) {
                var valorActual = debilidadesMap.get(type) ? debilidadesMap.get(type) : 0
                debilidadesMap.set(type, valorActual - 1)
            }
        }
    })

    $("#cuadradosColores").remove()
    var imagenes = ""
    $(".eficaciasResult").each(function (index, element) {
        var debilidades = $(element)[0].innerText.split(",")
        for (debilidad of debilidades) {
            if (!imagenes.includes(getIcon(debilidad.split(":")[0]))) {
                imagenes += `${getIcon(debilidad.split(":")[0])}`
            }
        }
    })
    $("#teamBuilder").after(`
    <div id="cuadradosColores" class="container">
        <div class="row">
            <div id="eficaciasTexto" class="container col-6 seleccionado-eficaz">
                <b>Tu equipo presenta eficacias contra:</b><br><br>
                ${imagenes}
            </div>
        </div>
    </div>`)
    cargarSeleccionados("#eficaciasTexto", 1, "seleccionado-eficaz", "eficaciasResult")
    imagenes = ""
    $(".debilidadesResult").each(function (index, element) {
        var debilidades = $(element)[0].innerText.split(",")
        for (debilidad of debilidades) {
            var name = debilidad.split(":")[0]
            var dmg = Number(debilidad.split(":")[1])
            if (dmg < 1 && dmg != 0) {
                if (!imagenes.includes(getIcon(name))) {
                    imagenes += getIcon(name)
                }
            }
        }
    })
    $("#eficaciasTexto").after(`<div id="coberturaTexto" class="container col-6 seleccionado-safe">
    <b>Tu equipo presenta resistencias a:</b><br><br>
    ${imagenes}
    </div>`)
    cargarSeleccionados("#coberturaTexto", -1, "seleccionado-safe", "debilidadesResult")
    imagenes = ""
    $(".debilidadesResult").each(function (index, element) {
        var debilidades = $(element)[0].innerText.split(",")
        for (debilidad of debilidades) {
            var name = debilidad.split(":")[0]
            var dmg = Number(debilidad.split(":")[1])
            if (dmg == 0) {
                if (!imagenes.includes(getIcon(name))) {
                    imagenes += getIcon(name)
                }
            }
        }
    })
    $("#coberturaTexto").parent().after(`
    <div class="row">
        <div id="inmunidadTexto" class="container col-6 seleccionado-inmune">
            <b>Tu equipo presenta inmunidad a:</b><br><br>
            ${imagenes != "" ? imagenes : "<b>Nada</b>"}
        </div>
    </div>`)
    cargarSeleccionados("#inmunidadTexto", 0, "seleccionado-inmune", "debilidadesResult")
    imagenes = ""
    for (let [key, value] of debilidadesMap) {
        if (value > 1) {
            imagenes += `${getIcon(key)}`
        }
    }
    $("#inmunidadTexto").after(`
            <div id="debilidadesTexto" class="container col-6 seleccionado-danger">
                <b>Tu equipo es especialmente debil a:</b><br><br>
                ${imagenes != "" ? imagenes : "<b>Nada</b>"}
            </div>
        `)
    cargarSeleccionados("#debilidadesTexto", 1, "seleccionado-danger", "debilidadesResult")
}

function cargarSeleccionados(div, trigger, claseSeleccion, claseTarget) {
    $(`${div} img`).hover(function (elementImg) {
        hover = elementImg.currentTarget
        $(hover).addClass("sombreado")
        $(`.${claseTarget}`).each(function (index, element) {
            var debilidades = $(element)[0].innerText.split(",")
            for (debilidad of debilidades) {
                var name = debilidad.split(":")[0]
                var dmg = Number(debilidad.split(":")[1])
                if ((trigger == 1 ? dmg > 1 : trigger == -1 ? dmg < 1 : dmg == 0) && getTraduccion(name) == $(hover).attr("title")) {
                    return $(element).parent().addClass(claseSeleccion)
                }
            }
        })
    }, function () {
        $(hover).removeClass("sombreado")
        hover = undefined
        $(`#teamBuilder .${claseSeleccion}`).removeClass(claseSeleccion);
    })
}

function getIcon(key) {
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
            return `<img src="https://static.wikia.nocookie.net/pokemongo_es_gamepedia/images/c/c7/Type_El%C3%A9ctrico.png/" title="Eléctrico"/>`
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
            return `<img src="https://static.wikia.nocookie.net/pokemongo_es_gamepedia/images/7/72/Type_Ps%C3%ADquico.png/" title="Psíquico"/>`
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
function getTraduccion(key) {
    switch (key) {
        case "fighting":
            return "Lucha"
        case "bug":
            return "Bicho"
        case "psychic":
            return "Psíquico"
        case "steel":
            return "Acero"
        case "water":
            return "Agua"
        case "fire":
            return "Fuego"
        case "dark":
            return "Siniestro"
        case "normal":
            return "Normal"
        case "ghost":
            return "Fantasma"
        case "grass":
            return "Planta"
        case "ground":
            return "Tierra"
        case "rock":
            return "Roca"
        case "ice":
            return "Hielo"
        case "fairy":
            return "Hada"
        case "dragon":
            return "Dragón"
        case "electric":
            return "Eléctrico"
        case "poison":
            return "Veneno"
        case "flying":
            return "Volador"
    }
}


init()
