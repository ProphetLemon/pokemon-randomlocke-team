function init() {
    //CARGO LOS VALORES EN LA TABLA
    for (let i = 0; i < 2; i++) {
        $("#teamtable").append(`<tr id="row${i}"></tr>`)
        for (let j = 0; j < 3; j++) {
            $(`#row${i}`).append(`<td id="pokemon${(i * 3) + (j + 1)}" class="me-2">POKEMON ${(i * 3) + (j + 1)}<br><input list="pokemonList${(i * 3) + (j + 1)}" type="text" class="form-control buscador"><datalist id="pokemonList${(i * 3) + (j + 1)}"></datalist></td>`)
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

    $('.buscador').keypress(function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            $(this).blur()
            buscar($(this))
        }
    });

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
        })
    } else {
        calcularDamage()
        $(`#${e.attr("list")}`)[0].innerHTML = ''
    }
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
    var texto = "Tu equipo es debil contra:<br>"
    for (let [key, value] of debilidadesMap) {
        texto += value >= 1 ? `${key}<br>` : ""
    }
    if (texto == "Tu equipo es debil contra:<br>") {
        texto += "Nada"
    }
    $("#teamBuilder").after(`<div class="container cuadrado">${texto}</div>`)
}


init()
