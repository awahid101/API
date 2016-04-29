module.exports = function (r) {
    function n(r, n) {
        var t = (65535 & r) + (65535 & n),
            o = (r >> 16) + (n >> 16) + (t >> 16);
        return o << 16 | 65535 & t
    } function t(r, n) {
        return r >>> n | r << 32 - n
    } function o(r, n) {
        return r >>> n
    } function e(r, n, t) {
        return r & n ^ ~r & t
    } function u(r, n, t) {
        return r & n ^ r & t ^ n & t
    } function f(r) {
        return t(r, 2) ^ t(r, 13) ^ t(r, 22)
    } function a(r) {
        return t(r, 6) ^ t(r, 11) ^ t(r, 25)
    } function c(r) {
        return t(r, 7) ^ t(r, 18) ^ o(r, 3)
    } function i(r) {
        return t(r, 17) ^ t(r, 19) ^ o(r, 10)
    } function h(r, t) {
        var o,            h,            C,
            g,            d,            v,
            A,            S,            l,
            m,            y,            w,
            b = [
                1116352408 , 1899447441 , 3049323471 , 3921009573 ,
                961987163  ,  1508970993, 2453635748 , 2870763221 ,
                3624381080 , 310598401  , 607225278  , 1426881987 ,
                1925078388 , 2162078206 , 2614888103 , 3248222580 ,
                3835390401 , 4022224774 , 264347078  , 604807628  ,
                770255983  ,  1249150122, 1555081692 , 1996064986 ,
                2554220882 , 2821834349 , 2952996808 , 3210313671 ,
                3336571891 , 3584528711 , 113926993  , 338241895  ,
                666307205  ,  773529912 , 1294757372 , 1396182291 ,
                1695183700 , 1986661051 , 2177026350 , 2456956037 ,
                2730485921 , 2820302411 , 3259730800 , 3345764771 ,
                3516065817 , 3600352804 , 4094571909 , 275423344  ,
                430227734  ,  506948616 , 659060556  , 883997877  ,
                958139571  ,  1322822218, 1537002063 , 1747873779 ,
                1955562222 , 2024104815 , 2227730452 , 2361852424 ,
                2428436474 , 2756734187 , 3204031479 , 3329325298],
            p = [1779033703, 3144134277 , 1013904242 , 2773480762 ,
                1359893119 , 2600822924 , 528734635  , 1541459225],
            B = new Array(64);
        r[t >> 5] |= 128 << 24 - t % 32,
        r[(t + 64 >> 9 << 4) + 15] = t;
        for (var l = 0; l < r.length; l += 16) {
            o = p[0],
            h = p[1],
            C = p[2],
            g = p[3],
            d = p[4],
            v = p[5],
            A = p[6],
            S = p[7];
            for (var m = 0; 64 > m; m++)
                16 > m ? B[m] = r[m + l] : B[m] = n(n(n(i(B[m - 2]), B[m - 7]), c(B[m - 15])), B[m - 16]),
                    y = n(n(n(n(S, a(d)), e(d, v, A)), b[m]), B[m]), w = n(f(o), u(o, h, C)),
                    S = A,
                    A = v,
                    v = d,
                    d = n(g, y),
                    g = C,
                    C = h,
                    h = o,
                    o = n(y, w);
            p[0] = n(o, p[0]),
            p[1] = n(h, p[1]),
            p[2] = n(C, p[2]),
            p[3] = n(g, p[3]),
            p[4] = n(d, p[4]),
            p[5] = n(v, p[5]),
            p[6] = n(A, p[6]),
            p[7] = n(S, p[7])
        } return p
    } function C(r) {
        for (var n = Array(), t = (1 << v) - 1, o = 0; o < r.length * v; o += v)
            n[o >> 5] |= (r.charCodeAt(o / v) & t) << 24 - o % 32;
        return n
    } function g(r) {
        r = r.replace(/\r\n/g, "\n");
        for (var n = "", t = 0; t < r.length; t++) {
            var o = r.charCodeAt(t);
            128 > o ? n += String.fromCharCode(o) : o > 127 && 2048 > o ? (n += String.fromCharCode(o >> 6 | 192), n += String.fromCharCode(63 & o | 128)) :
                (n += String.fromCharCode(o >> 12 | 224),
            n += String.fromCharCode(o >> 6 & 63 | 128),
            n += String.fromCharCode(63 & o | 128))
        } return n;
    } function d(r) {
        for (var n = A ? "0123456789ABCDEF" : "0123456789abcdef", t = "", o = 0; o < 4 * r.length; o++)
            t += n.charAt(r[o >> 2] >> 8 * (3 - o % 4) + 4 & 15) + n.charAt(r[o >> 2] >> 8 * (3 - o % 4) & 15);
        return t;
    }
    var v = 8,
        A = 0;
    return r = g(r), d(h(C(r), r.length * v));
};