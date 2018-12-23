$(function () {
    $('[data-api-link]').each(function () {
        $(this).html(location.origin + $(this).attr('data-api-link'))
        $(this).attr('href', location.origin + $(this).attr('data-api-link'))
    })
});