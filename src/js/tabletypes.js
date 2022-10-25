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
        ajaxActual = $.post('/tabletypes/debilidades', { tipo1: tipo1, tipo2: tipo2 }, function (result) {
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
