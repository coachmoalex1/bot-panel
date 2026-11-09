/* qr.js — مولّد QR بدون مكتبات خارجية (وضع bytes، تصحيح M، نسخ 1-10 = لحد ~210 حرف).
   الاستخدام: QR.matrix(text) → مصفوفة true/false ، QR.canvas(text,px) → <canvas> ، QR.show(url,title) → نافذة فيها تنزيل/مشاركة. */
(function (g) {
  'use strict';
  // [إجمالي الكلمات, كلمات التصحيح لكل بلوك, [عدد بلوكات, كلمات بيانات]...] لمستوى M
  var T = [null,
    [26, 10, [1, 16]], [44, 16, [1, 28]], [70, 26, [1, 44]], [100, 18, [2, 32]], [134, 24, [2, 43]],
    [172, 16, [4, 27]], [196, 18, [4, 31]], [242, 22, [2, 38], [2, 39]], [292, 22, [3, 36], [2, 37]], [346, 26, [4, 43], [1, 44]]];
  var AL = [null, [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50]];
  var EXP = [], LOG = [];
  (function () { var x = 1; for (var i = 0; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 256) x ^= 0x11d; } for (i = 255; i < 512; i++) EXP[i] = EXP[i - 255]; })();
  function mul(a, b) { return a && b ? EXP[LOG[a] + LOG[b]] : 0; }
  function rsGen(n) { var p = [1]; for (var i = 0; i < n; i++) { var q = new Array(p.length + 1).fill(0); for (var j = 0; j < p.length; j++) { q[j] ^= p[j]; q[j + 1] ^= mul(p[j], EXP[i]); } p = q; } return p; }
  function rsEnc(data, n) { var gen = rsGen(n), r = new Array(n).fill(0); data.forEach(function (d) { var f = d ^ r.shift(); r.push(0); for (var i = 0; i < n; i++) r[i] ^= mul(gen[i + 1], f); }); return r; }
  function utf8(s) { return Array.prototype.slice.call(new TextEncoder().encode(s)); }
  function dataCap(v) { var t = T[v], c = 0; for (var i = 2; i < t.length; i++) c += t[i][0] * t[i][1]; return c; }
  function encode(text) {
    var bytes = utf8(text), v;
    for (v = 1; v <= 10; v++) { var need = 4 + (v < 10 ? 8 : 16) + bytes.length * 8; if (need <= dataCap(v) * 8) break; }
    if (v > 10) throw new Error('النص طويل على الـQR');
    var bits = []; function put(val, len) { for (var i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1); }
    put(4, 4); put(bytes.length, v < 10 ? 8 : 16); bytes.forEach(function (b) { put(b, 8); });
    var cap = dataCap(v) * 8; put(0, Math.min(4, cap - bits.length)); while (bits.length % 8) bits.push(0);
    for (var pad = 0xEC; bits.length < cap; pad ^= 0xEC ^ 0x11) put(pad, 8);
    var cw = []; for (var i = 0; i < bits.length; i += 8) { var b = 0; for (var k = 0; k < 8; k++) b = (b << 1) | bits[i + k]; cw.push(b); }
    var t = T[v], ec = t[1], blocks = [], pos = 0;
    for (var gi = 2; gi < t.length; gi++) for (var n = 0; n < t[gi][0]; n++) { var d = cw.slice(pos, pos + t[gi][1]); pos += t[gi][1]; blocks.push({ d: d, e: rsEnc(d, ec) }); }
    var out = [], maxD = Math.max.apply(null, blocks.map(function (b) { return b.d.length; }));
    for (i = 0; i < maxD; i++) blocks.forEach(function (b) { if (i < b.d.length) out.push(b.d[i]); });
    for (i = 0; i < ec; i++) blocks.forEach(function (b) { out.push(b.e[i]); });
    return { v: v, cw: out };
  }
  function build(v, cw, mask) {
    var n = 17 + 4 * v, M = [], F = [];
    for (var i = 0; i < n; i++) { M.push(new Array(n).fill(false)); F.push(new Array(n).fill(false)); }
    function set(r, c, val) { M[r][c] = val; F[r][c] = true; }
    function finder(r0, c0) { for (var dr = -1; dr <= 7; dr++) for (var dc = -1; dc <= 7; dc++) { var r = r0 + dr, c = c0 + dc; if (r < 0 || c < 0 || r >= n || c >= n) continue; var d = Math.max(Math.abs(dr - 3), Math.abs(dc - 3)); set(r, c, d !== 2 && d !== 4); } }
    finder(0, 0); finder(0, n - 7); finder(n - 7, 0);
    for (i = 8; i < n - 8; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
    var a = AL[v];
    a.forEach(function (r) { a.forEach(function (c) { if ((r === 6 && c === 6) || (r === 6 && c === a[a.length - 1]) || (c === 6 && r === a[a.length - 1])) return; for (var dr = -2; dr <= 2; dr++) for (var dc = -2; dc <= 2; dc++) set(r + dr, c + dc, Math.max(Math.abs(dr), Math.abs(dc)) !== 1); }); });
    function bch(val, poly, len) { var x = val << len; var top = 31 - Math.clz32(poly); for (var k = 31 - Math.clz32(x); k >= top; k--) if ((x >>> k) & 1) x ^= poly << (k - top); return (val << len) | x; }
    var fmt = bch((0 << 3) | mask, 0x537, 10) ^ 0x5412; // مستوى M = 00
    for (i = 0; i < 15; i++) {
      var bit = ((fmt >>> i) & 1) === 1;
      if (i < 6) set(i, 8, bit); else if (i < 8) set(i + 1, 8, bit); else set(n - 15 + i, 8, bit);
      if (i < 8) set(8, n - 1 - i, bit); else if (i < 9) set(8, 15 - i, bit); else set(8, 14 - i, bit);
    }
    set(n - 8, 8, true);
    if (v >= 7) { var ver = bch(v, 0x1f25, 12); for (i = 0; i < 18; i++) { var b2 = ((ver >>> i) & 1) === 1, rr = Math.floor(i / 3), cc = i % 3 + n - 11; set(rr, cc, b2); set(cc, rr, b2); } }
    var bi = 0, total = cw.length * 8;
    for (var right = n - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (var vert = 0; vert < n; vert++) for (var j = 0; j < 2; j++) {
        var c = right - j, up = ((right + 1) & 2) === 0, r = up ? n - 1 - vert : vert;
        if (F[r][c]) continue;
        var dark = bi < total ? ((cw[bi >>> 3] >>> (7 - (bi & 7))) & 1) === 1 : false; bi++;
        var inv = [(r + c) % 2 === 0, r % 2 === 0, c % 3 === 0, (r + c) % 3 === 0, (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0, (r * c) % 2 + (r * c) % 3 === 0, ((r * c) % 2 + (r * c) % 3) % 2 === 0, ((r + c) % 2 + (r * c) % 3) % 2 === 0][mask];
        M[r][c] = dark !== inv;
      }
    }
    return M;
  }
  function penalty(M) {
    var n = M.length, p = 0, i, j;
    function run(line) { var s = 0, k = 0; while (k < n) { var e = k; while (e < n && line[e] === line[k]) e++; if (e - k >= 5) s += 3 + (e - k - 5); k = e; } return s; }
    for (i = 0; i < n; i++) { p += run(M[i]); p += run(M.map(function (r) { return r[i]; })); }
    for (i = 0; i < n - 1; i++) for (j = 0; j < n - 1; j++) { var c = M[i][j]; if (c === M[i][j + 1] && c === M[i + 1][j] && c === M[i + 1][j + 1]) p += 3; }
    var pat = [true, false, true, true, true, false, true, false, false, false, false], rev = pat.slice().reverse();
    function m(line, k, q) { for (var x = 0; x < 11; x++) if (line[k + x] !== q[x]) return false; return true; }
    for (i = 0; i < n; i++) { var col = M.map(function (r) { return r[i]; }); for (j = 0; j <= n - 11; j++) { if (m(M[i], j, pat) || m(M[i], j, rev)) p += 40; if (m(col, j, pat) || m(col, j, rev)) p += 40; } }
    var dark = 0; M.forEach(function (r) { r.forEach(function (x) { if (x) dark++; }); });
    p += Math.floor(Math.abs(dark * 20 - n * n * 10) / (n * n)) * 10;
    return p;
  }
  function matrix(text) { var e = encode(String(text)), best = null, bp = 1e9; for (var m = 0; m < 8; m++) { var M = build(e.v, e.cw, m), p = penalty(M); if (p < bp) { bp = p; best = M; } } return best; }
  function canvas(text, px) { var M = matrix(text), n = M.length, q = 4, s = Math.max(2, Math.floor((px || 320) / (n + 2 * q))), c = document.createElement('canvas'); c.width = c.height = (n + 2 * q) * s; var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.fillStyle = '#000'; for (var r = 0; r < n; r++) for (var k = 0; k < n; k++) if (M[r][k]) x.fillRect((k + q) * s, (r + q) * s, s, s); return c; }
  function show(url, title) {
    var old = document.getElementById('qrov'); if (old) old.remove();
    var ov = document.createElement('div'); ov.id = 'qrov';
    ov.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.72);display:flex;align-items:center;justify-content:center;padding:18px;direction:rtl;font-family:inherit';
    var box = document.createElement('div'); box.style.cssText = 'background:#fff;color:#0a1424;border-radius:20px;padding:18px;max-width:340px;width:100%;text-align:center;box-shadow:0 10px 40px rgba(0,0,0,.5)';
    var h = document.createElement('div'); h.style.cssText = 'font-weight:800;font-size:18px;margin-bottom:4px'; h.textContent = title || 'QR المتجر';
    var s = document.createElement('div'); s.style.cssText = 'font-size:13px;color:#475569;margin-bottom:10px'; s.textContent = 'اطبعه وحطه في المحل، أو انزّله وانشره: الزبون يصوّره ويطلب.';
    var cv; try { cv = canvas(url, 640); } catch (e) { cv = document.createElement('div'); cv.textContent = 'الرابط طويل على الـQR'; }
    cv.style.cssText = 'width:100%;max-width:280px;height:auto;image-rendering:pixelated;border:1px solid #e2e8f0;border-radius:12px'; if (cv.tagName === 'DIV') cv.style.cssText = '';
    var row = document.createElement('div'); row.style.cssText = 'display:flex;gap:8px;margin-top:12px';
    function btn(txt, bg, fg, fn) { var b = document.createElement('button'); b.textContent = txt; b.style.cssText = 'flex:1;padding:12px 8px;border-radius:12px;border:1px solid ' + bg + ';background:' + bg + ';color:' + fg + ';font:inherit;font-weight:700;cursor:pointer'; b.onclick = fn; return b; }
    function blob(cb) { cv.toBlob(cb, 'image/png'); }
    row.appendChild(btn('⬇️ تنزيل', '#2b8cff', '#fff', function () { blob(function (b) { var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'store-qr.png'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000); }); }));
    row.appendChild(btn('📤 مشاركة', '#e2e8f0', '#0a1424', function () { blob(function (b) { try { var f = new File([b], 'store-qr.png', { type: 'image/png' }); if (navigator.canShare && navigator.canShare({ files: [f] })) navigator.share({ files: [f], title: title || 'QR' }).catch(function () {}); else if (navigator.share) navigator.share({ title: title || 'QR', url: url }).catch(function () {}); else alert('المشاركة مش متاحة هنا، استخدم «تنزيل»'); } catch (e) { alert('المشاركة مش متاحة هنا، استخدم «تنزيل»'); } }); }));
    var cl = btn('إغلاق', 'transparent', '#475569', function () { ov.remove(); }); cl.style.marginTop = '8px'; cl.style.width = '100%'; cl.style.flex = 'none'; cl.style.border = '0';
    box.appendChild(h); box.appendChild(s); box.appendChild(cv); box.appendChild(row); box.appendChild(cl); ov.appendChild(box);
    ov.onclick = function (e) { if (e.target === ov) ov.remove(); }; document.body.appendChild(ov);
  }
  g.QR = { matrix: matrix, canvas: canvas, show: show };
  if (typeof module !== 'undefined') module.exports = g.QR;
})(typeof window !== 'undefined' ? window : globalThis);
