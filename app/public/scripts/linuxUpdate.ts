declare const _url: string
$( document ).ready (() => {
    $('#downloadClick').attr( 'href', _url )
    view.showVersionUpdata ( false )
    view.documentReady ( true )
})
