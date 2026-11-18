/**
 * Bridge google.script.run -> Google Apps Script Web App (/exec)
 * Memungkinkan Index.html / Admin.html / Proktor.html versi Apps Script
 * berjalan langsung dari GitHub Pages (https://username.github.io/repo/)
 * sambil tetap memakai Backend Code.gs + Google Spreadsheet sebagai database.
 */
(function () {
  if (typeof window === 'undefined') return;
  if (window.google && window.google.script && window.google.script.run) {
    return; // Sudah berjalan di dalam Google Apps Script secara native
  }

  var DEFAULT_URL = 'https://script.google.com/macros/s/AKfycbzAQ1YpzQ-QkbPM2DS7tX_ik2mlM9IPt3qTPg6MorKSXnSESslldX0k8ECjdqwD_p0PMw/exec';

  function getExecUrl() {
    try {
      var params = new URLSearchParams(window.location.search);
      var qUrl = (params.get('gasUrl') || params.get('scriptUrl') || '').trim();
      if (/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec/i.test(qUrl)) {
        localStorage.setItem('cbt_gas_exec_url', qUrl);
        return qUrl;
      }
    } catch (e) {}
    if (window.CBT_GAS_EXEC_URL && /^https:\/\/script\.google\.com\/macros\/s\/.+/i.test(String(window.CBT_GAS_EXEC_URL))) {
      return String(window.CBT_GAS_EXEC_URL).trim();
    }
    try {
      var saved = (localStorage.getItem('cbt_gas_exec_url') || '').trim();
      if (/^https:\/\/script\.google\.com\/macros\/s\/.+/i.test(saved)) return saved;
    } catch (e) {}
    return DEFAULT_URL;
  }

  var bannerShown = false;
  function showBridgeNotice(message) {
    if (bannerShown || typeof document === 'undefined') return;
    bannerShown = true;
    var mount = function () {
      var div = document.createElement('div');
      div.id = 'cbt-gas-bridge-notice';
      div.style.cssText = 'position:fixed;bottom:14px;right:14px;z-index:99999;max-width:380px;background:#0f172a;color:#f8fafc;border:2px solid #f59e0b;border-radius:14px;padding:12px 14px;font-family:sans-serif;font-size:12px;line-height:1.5;box-shadow:0 12px 30px rgba(0,0,0,0.35);';
      div.innerHTML =
        '<div style="font-weight:700;color:#fbbf24;margin-bottom:4px;">Koneksi GitHub &rarr; Apps Script</div>' +
        '<div style="color:#e2e8f0;">' + message + '</div>' +
        '<div style="margin-top:8px;display:flex;gap:8px;justify-content:flex-end;">' +
        '<button type="button" id="cbt-gas-set-url" style="background:#f59e0b;color:#0f172a;border:none;border-radius:8px;padding:4px 10px;font-weight:700;cursor:pointer;">Ganti URL /exec</button>' +
        '<button type="button" id="cbt-gas-close-notice" style="background:#334155;color:#fff;border:none;border-radius:8px;padding:4px 10px;cursor:pointer;">Tutup</button>' +
        '</div>';
      document.body.appendChild(div);
      var closeBtn = document.getElementById('cbt-gas-close-notice');
      if (closeBtn) closeBtn.onclick = function () { div.remove(); };
      var setBtn = document.getElementById('cbt-gas-set-url');
      if (setBtn) {
        setBtn.onclick = function () {
          var current = getExecUrl();
          var next = window.prompt('Tempel URL Web App Google Apps Script (.../exec):', current);
          if (next && /^https:\/\/script\.google\.com\/macros\/s\/.+/i.test(next.trim())) {
            localStorage.setItem('cbt_gas_exec_url', next.trim());
            window.CBT_GAS_EXEC_URL = next.trim();
            window.location.reload();
          }
        };
      }
    };
    if (document.body) mount();
    else window.addEventListener('DOMContentLoaded', mount);
  }

  function invokeJsonp(execUrl, fnName, args) {
    return new Promise(function (resolve, reject) {
      var cbName = '__cbtGasCb_' + Date.now() + '_' + Math.floor(Math.random() * 100000);
      var script = document.createElement('script');
      var done = false;
      var timer = setTimeout(function () {
        if (done) return;
        done = true;
        cleanup();
        reject(new Error('Timeout menghubungi Apps Script (JSONP).'));
      }, 25000);

      function cleanup() {
        clearTimeout(timer);
        try { delete window[cbName]; } catch (e) { window[cbName] = undefined; }
        if (script.parentNode) script.parentNode.removeChild(script);
      }

      window[cbName] = function (data) {
        if (done) return;
        done = true;
        cleanup();
        resolve(data);
      };

      script.onerror = function () {
        if (done) return;
        done = true;
        cleanup();
        reject(new Error('Gagal memuat respon JSONP Apps Script.'));
      };

      var sep = execUrl.indexOf('?') === -1 ? '?' : '&';
      var src = execUrl + sep + 'api=1&fn=' + encodeURIComponent(fnName) +
        '&args=' + encodeURIComponent(JSON.stringify(args || [])) +
        '&callback=' + encodeURIComponent(cbName);
      script.src = src;
      document.head.appendChild(script);
    });
  }

  async function invokeRpc(fnName, args, successHandler, failureHandler) {
    var execUrl = getExecUrl();
    if (!execUrl) {
      var noUrlErr = new Error('URL Apps Script (/exec) belum diisi di gas-config.js');
      if (typeof failureHandler === 'function') failureHandler(noUrlErr);
      return;
    }

    try {
      var response = await fetch(execUrl, {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ fn: fnName, args: args || [] })
      });

      var rawText = await response.text();
      if (!rawText || rawText.trim().charAt(0) === '<') {
        if (/doPost|Script function not found/i.test(rawText)) {
          showBridgeNotice('<b>Code.gs di Apps Script masih versi lama</b> (belum ada fungsi <code>doPost</code>). Copy-paste <code>Code.gs</code> terbaru (terhubung ke Spreadsheet <code>15hhPU3rRpCgodxhmqgDdc0STJigGnu1vRZH25clvh3w</code>) di akun <b>avifzein@gmail.com</b>, lalu klik <b>Deploy &gt; Kelola Deployment &gt; Edit &gt; Versi Baru &gt; Terapkan</b>.');
        } else if (/ServiceLogin|accounts\.google\.com/i.test(rawText)) {
          showBridgeNotice('Web App Apps Script belum disetel ke publik. Di editor Apps Script (akun <b>avifzein@gmail.com</b>) pilih <b>Deploy &gt; Yang memiliki akses: Siapa saja (Anyone)</b>.');
        }
        throw new Error('Respon Apps Script bukan JSON valid. Pastikan Code.gs terbaru sudah di-Deploy oleh avifzein@gmail.com dengan akses "Siapa saja".');
      }

      var payload = JSON.parse(rawText);
      if (!payload || payload.ok === false) {
        throw new Error((payload && payload.error) ? payload.error : 'Gagal menjalankan fungsi ' + fnName);
      }
      if (typeof successHandler === 'function') {
        successHandler(payload.result);
      }
    } catch (postErr) {
      // Fallback ke JSONP GET untuk payload ringkas bila fetch diblokir ekstensi/jaringan
      var serializedArgs = '';
      try { serializedArgs = JSON.stringify(args || []); } catch (e) {}
      if (serializedArgs.length > 0 && serializedArgs.length < 1500) {
        try {
          var jsonpRes = await invokeJsonp(execUrl, fnName, args);
          if (jsonpRes && jsonpRes.ok !== false) {
            if (typeof successHandler === 'function') successHandler(jsonpRes.result);
            return;
          }
        } catch (jsonpErr) {}
      }
      if (typeof failureHandler === 'function') {
        failureHandler(postErr);
      }
    }
  }

  function createRunner(successHandler, failureHandler) {
    return new Proxy({}, {
      get: function (_target, prop) {
        if (prop === 'withSuccessHandler') {
          return function (fn) { return createRunner(fn, failureHandler); };
        }
        if (prop === 'withFailureHandler') {
          return function (fn) { return createRunner(successHandler, fn); };
        }
        if (prop === 'withUserObject') {
          return function () { return createRunner(successHandler, failureHandler); };
        }
        if (typeof prop !== 'string') return undefined;
        return function () {
          var args = Array.prototype.slice.call(arguments);
          invokeRpc(prop, args, successHandler, failureHandler);
        };
      }
    });
  }

  window.google = window.google || {};
  window.google.script = window.google.script || {};
  window.google.script.run = createRunner(null, null);
})();
