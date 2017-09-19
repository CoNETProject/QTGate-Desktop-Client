const _socket = io();
_socket.on('connect', () => {
    $('.text').text('connect');
});
let CallBack = false;
$(() => {
    $.getJSON('https://api.github.com/repos/QTGate/QTGate/releases/latest', data => {
        $('.text').text('getJSON callback');
        CallBack = true;
        _socket.emit('checkUpdateBack', data);
    });
    setTimeout(() => {
        if (!CallBack) {
            $('.text').text('setTimeout');
            return _socket.emit('checkUpdateBack');
        }
    }, 30000);
});
