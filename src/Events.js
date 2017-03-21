import $ from 'jquery'


export function initEvents() {
    // disable right click
    $('body').on('contextmenu', '#drawingArea', (e) => { return false; });
}