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

$("#tablatipos td").click(function (e) {
    if ($(this)[0].id != '') return
    if ($("#tipo1")[0].innerHTML == '') {
        $("#tipo1")[0].innerHTML = `<b>TIPO 1</b><br>${$(this)[0].innerHTML}`
    } else if ($("#tipo2")[0].innerHTML == '') {
        if ($("#tipo1")[0].innerHTML == `<b>TIPO 1</b><br>${$(this)[0].innerHTML}`) {
            return
        }
        $("#tipo2")[0].innerHTML = `<b>TIPO 2</b><br>${$(this)[0].innerHTML}`
    } else {
        return
    }
    $("#debilidades")[0].innerHTML = `<b>CARGANDO...</b>`
    calcularDebilidades()
})

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
        $("#debilidades")[0].innerHTML = ``
    } else {
        $.post('/debilidades', { tipo1: tipo1, tipo2: tipo2 }, function (result) {
            $("#debilidades")[0].innerHTML = `
           ${result["4"] ? `<b>x4</b>${result["4"]}<br>` : ``}
           ${result["2"] ? `<b>x2</b>${result["2"]}<br>` : ``}
           ${result["1"] ? `<b>x1</b>${result["1"]}<br>` : ``}
           ${result["1/2"] ? `<b>x1/2</b>${result["1/2"]}<br>` : ``}
           ${result["1/4"] ? `<b>x1/4</b>${result["1/4"]}<br>` : ``}
           ${result["0"] ? `<b>x0</b>${result["0"]}<br>` : ``}
            `
        })
    }

}

$("#tipo1,#tipo2").click(function (e) {
    $(this)[0].innerHTML = ''
    if ($(this)[0].id == "tipo1" && $("#tipo2")[0].innerHTML != '') {
        $(this)[0].innerHTML = $("#tipo2")[0].innerHTML.split("TIPO 2").join("TIPO 1")
        $("#tipo2")[0].innerHTML = ''
    }
    $("#debilidades")[0].innerHTML = `<b>CARGANDO...</b>`
    calcularDebilidades()
})

var input = document.getElementById("nombrePokemon");

input.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        buscar()
    }
});