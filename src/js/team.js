function init() {
    //CARGO LOS VALORES EN LA TABLA
    for (let i = 0; i < 2; i++) {
        $("#teamtable").append(`<tr id="row${i}"></tr>`)
        for (let j = 0; j < 3; j++) {
            $(`#row${i}`).append(`<td id="pokemon${(i * 3) + (j + 1)}" class="me-2"><b>POKEMON ${(i * 3) + (j + 1)}</b><br><input list="pokemonList${(i * 3) + (j + 1)}" type="text" class="form-control buscador"><datalist id="pokemonList${(i * 3) + (j + 1)}"></datalist></td>`)
        }
    }
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
    var td = e.parent().attr("id")
    $(`#${td} .pokemonIcon,#${td} .pokemonError, #${td} .debilidadesResult`).remove()
    if (nombre) {
        e.parent().append(`<div id="cargando" class="rounded mt-2 cuadrado"><b>Cargando...</b></div>`)
        $.post("/team/buscar", { nombre: nombre }, function (result) {
            $("#cargando").remove()
            e.parent().append(result)
            calcularDamage()
            cargarShiny()
        })
    } else {
        calcularDamage()
        $(`#${e.attr("list")}`)[0].innerHTML = ''
    }
}


function cargarShiny() {
    $(".pokemonIcon").click(function () {
        if ($(this).attr("shiny") != "null") {
            var link = $(this).attr("src")
            $(this).attr("src", link.split("shiny").length == 2 ? $(this).attr("default") : $(this).attr("shiny"))
        }

    })
}

function calcularDamage() {
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
    var texto = "<b>Tu equipo es débil contra:</b><br><br>"
    for (let [key, value] of debilidadesMap) {
        texto += value >= 1 ? `<b>${getIcon(key)}</b>` : ""
    }
    if (texto == "<b>Tu equipo es débil contra:</b><br><br>") {
        texto += "<b>Nada</b>"
    }
    $("#debilidadesTexto").remove()
    $("#teamBuilder").after(`<div id="debilidadesTexto" class="container cuadrado">${texto}</div>`)
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
