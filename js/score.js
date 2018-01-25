$(document).ready(function() {
    $("#score tr:first-child").remove();
    $("#total tr:last-child").remove();
    $('td>font').attr('data-owo', $(this).html())
});