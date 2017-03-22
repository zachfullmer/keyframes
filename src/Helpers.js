export function dist(a, b) {
    let diff = [b[0] - a[0], b[1] - a[1]];
    return Math.sqrt(Math.pow(diff[0], 2) + Math.pow(diff[1], 2));
}

export function polarToCart(polar) {
    let cart = [0, 0];
    cart[0] = Math.cos(polar[1]) * polar[0];
    cart[1] = Math.sin(polar[1]) * polar[0];
    return cart;
}

export function cartToPolar(cart) {
    let polar = [0, 0];
    polar[0] = Math.sqrt(Math.pow(cart[0], 2) + Math.pow(cart[1], 2));
    polar[1] = Math.atan2(cart[1], cart[0]);
    return polar;
}

export function inter(a, b, t) {
    return ((b - a) * t) + a;
}

export function interList(a, b, t, interFunc) {
    let r = [];
    for (let i = 0; i < a.length; i++) {
        r.push(interFunc(a[i], b[i], t));
    }
    return r;
}

export function opList(list1, list2, func) {
    let finalList = [];
    for (let i = 0; i < list1.length; i++) {
        finalList.push(func(list1[i], list2[i]));
    }
    return finalList;
}