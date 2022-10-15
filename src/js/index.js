function buscar() {
    var nombre = $("#nombrePokemon")[0].value
    if (nombre) {
        nombre = nombre.toLowerCase().trimLeft().trimRight()
        $("#imagen")[0].innerHTML = "<b>Cargando...</b>"
        $.post("/pokemon", { nombre: nombre }, function (result) {
            $("#imagen")[0].innerHTML = result
            $(".evolucion").click(function (e) {
                $("#nombrePokemon")[0].value = e.currentTarget.outerText
                buscar()
            })
        })
    } else {
        $("#imagen")[0].innerHTML = "<b>Escribe el nombre de un pokemon</b>"
    }
}

$("#nombrePokemon").change(function () {
    $(this).blur()
    buscar()
})

$('#nombrePokemon').keyup(delay(function (e) {
    var nombre = $(this)[0].value
    if (nombre) {
        nombre = nombre.toLowerCase().trimLeft().trimRight()
        $.post("/buscar", { nombre: nombre }, function (result) {
            $("#listaPokemon")[0].innerHTML = result
        })
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