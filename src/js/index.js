$('#nombrePokemon').keyup(delay(function (e) {
    var nombre = $(this)[0].value
    if (nombre) {
        nombre = nombre.toLowerCase()
        $("#imagen")[0].innerHTML = "<b>Cargando...</b>"
        $.post("/pokemon", { nombre: nombre }, function (result) {
            $("#imagen")[0].innerHTML = result
        })
    } else {
        $("#imagen")[0].innerHTML = "<b>Escribe el nombre de un pokemon</b>"
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