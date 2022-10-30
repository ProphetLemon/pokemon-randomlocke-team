function buscar() {
    var nombre = $("#nombrePokemon")[0].value
    if (nombre) {
        nombre = nombre.toLowerCase().trimLeft().trimRight()
        $("#imagen")[0].innerHTML = `<div class="rounded mt-2 cuadrado"><b>Cargando...</b></div>`
        $.post("/pokemon", { nombre: nombre }, function (result) {
            $("#imagen")[0].innerHTML = result
            $(".evolucion").click(function (e) {
                if (nombre.trim() == $(this)[0].innerText.trim()) {
                    return;
                }
                $("#nombrePokemon")[0].value = $(this)[0].innerText
                buscar()
            })
        })
    } else {
        $("#imagen")[0].innerHTML = `<div class="rounded mt-2 cuadrado" ><b>Escribe el nombre de un pokemon</b></div>`
    }
}


function getPokemon() {
    var pokemon = getUrlParameter("pokemon")
    if (!pokemon) {
        return
    }
    $("#nombrePokemon").val(pokemon)
    buscar()
}
getPokemon()

function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
    return false;
};
$("#nombrePokemon").change(function () {
    $(this).blur()
    buscar()
})

$('#nombrePokemon').keyup(delay(function (e) {
    var nombre = $(this)[0].value
    var datalist = $("#listaPokemon")[0]
    if (nombre && nombre.trim() != "") {
        nombre = nombre.toLowerCase().trimLeft().trimRight()
        $.post("/buscar", { nombre: nombre }, function (result) {
            datalist.innerHTML = result
        })
    } else {
        datalist.innerHTML = ''
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


var input = document.getElementById("nombrePokemon");

input.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        buscar()
    }
});