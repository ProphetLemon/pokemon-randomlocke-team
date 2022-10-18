function buscar() {
    var nombre = $("#nombrePokemon")[0].value
    if (nombre) {
        nombre = nombre.toLowerCase().trimLeft().trimRight()
        $("#imagen")[0].innerHTML = `<div class="rounded p-2 mt-2 cuadrado"><b>Cargando...</b></div>`
        $.post("/pokemon", { nombre: nombre }, function (result) {
            $("#imagen")[0].innerHTML = result
            $(".evolucion").click(function (e) {
                if ($("#nombrePokemon")[0].value.trim() == $(this)[0].innerText.trim()) {
                    return;
                }
                $("#nombrePokemon")[0].value = $(this)[0].innerText
                buscar()
            })
        })
    } else {
        $("#imagen")[0].innerHTML = `<div class="rounded p-2 mt-2 cuadrado" ><b>Escribe el nombre de un pokemon</b></div>`
    }
}

$("#nombrePokemon").change(function () {
    $(this).blur()
    buscar()
})

$('#nombrePokemon').keyup(delay(function (e) {
    var nombre = $(this)[0].value
    if (nombre && nombre.trim() != "") {
        nombre = nombre.toLowerCase().trimLeft().trimRight()
        $.post("/buscar", { nombre: nombre }, function (result) {
            $("#listaPokemon")[0].innerHTML = result
        })
    } else {
        $("#listaPokemon")[0].innerHTML = ''
    }
}, 500));

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

$("#tablatipos .clickable").click(function (e) {
    if ($("#tipo1")[0].innerHTML == '') {
        $("#tipo1")[0].innerHTML = `${$(this)[0].innerHTML}`
    } else if ($("#tipo2")[0].innerHTML == '') {
        if ($("#tipo1")[0].innerHTML == `${$(this)[0].innerHTML}`) {
            return
        }
        $("#tipo2")[0].innerHTML = `${$(this)[0].innerHTML}`
    } else {
        return
    }
    calcularDebilidades()
})

function rellenarCeldas(texto) {
    $("#critico")[0].innerHTML = texto
    $("#efectivo")[0].innerHTML = texto
    $("#neutro")[0].innerHTML = texto
    $("#ineficaz")[0].innerHTML = texto
    $("#resistente")[0].innerHTML = texto
    $("#invulnerable")[0].innerHTML = texto
}

var ajaxActual = ""

function calcularDebilidades() {
    var tipo1 = ""
    var tipo2 = ""
    if ($("#tipo1")[0].innerHTML != '') {
        tipo1 = $("#tipo1 img").attr("title")
    }
    if ($("#tipo2")[0].innerHTML != '') {
        tipo2 = $("#tipo2 img").attr("title")
    }
    if (tipo1 == "" && tipo2 == "") {
        rellenarCeldas('')
    } else {
        rellenarCeldas('<b>Cargando...</b>')
        if (ajaxActual != "") {
            ajaxActual.abort()
        }
        ajaxActual = $.post('/debilidades', { tipo1: tipo1, tipo2: tipo2 }, function (result) {
            ajaxActual = ""
            rellenarCeldas('')
            if (result["4"]) {
                $("#critico")[0].innerHTML = result["4"]
            }
            if (result["2"]) {
                $("#efectivo")[0].innerHTML = result["2"]
            }
            if (result["1"]) {
                $("#neutro")[0].innerHTML = result["1"]
            }
            if (result["1/2"]) {
                $("#ineficaz")[0].innerHTML = result["1/2"]
            }
            if (result["1/4"]) {
                $("#resistente")[0].innerHTML = result["1/4"]
            }
            if (result["0"]) {
                $("#invulnerable")[0].innerHTML = result["0"]
            }
        })
    }
}



$("#tipo1,#tipo2").click(function (e) {
    if ($(this)[0].innerHTML == '') return
    $(this)[0].innerHTML = ''
    if ($(this)[0].id == "tipo1" && $("#tipo2")[0].innerHTML != '') {
        $(this)[0].innerHTML = $("#tipo2")[0].innerHTML
        $("#tipo2")[0].innerHTML = ''
    }
    calcularDebilidades()
})

var input = document.getElementById("nombrePokemon");

input.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        buscar()
    }
});