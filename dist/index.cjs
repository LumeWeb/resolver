var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, copyDefault, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && (copyDefault || key !== "default"))
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toESM = (module2, isNodeMode) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", !isNodeMode && module2 && module2.__esModule ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};
var __toCommonJS = /* @__PURE__ */ ((cache) => {
  return (module2, temp) => {
    return cache && cache.get(module2) || (temp = __reExport(__markAsModule({}), module2, 1), cache && cache.set(module2, temp), temp);
  };
})(typeof WeakMap !== "undefined" ? /* @__PURE__ */ new WeakMap() : 0);

// node_modules/tsup/assets/cjs_shims.js
var init_cjs_shims = __esm({
  "node_modules/tsup/assets/cjs_shims.js"() {
  }
});

// node_modules/bsert/lib/assert.js
var require_assert = __commonJS({
  "node_modules/bsert/lib/assert.js"(exports, module2) {
    "use strict";
    init_cjs_shims();
    var AssertionError = class extends Error {
      constructor(options) {
        if (typeof options === "string")
          options = { message: options };
        if (options === null || typeof options !== "object")
          options = {};
        let message = null;
        let operator = "fail";
        let generatedMessage = Boolean(options.generatedMessage);
        if (options.message != null)
          message = toString(options.message);
        if (typeof options.operator === "string")
          operator = options.operator;
        if (message == null) {
          if (operator === "fail") {
            message = "Assertion failed.";
          } else {
            const a = stringify(options.actual);
            const b = stringify(options.expected);
            message = `${a} ${operator} ${b}`;
          }
          generatedMessage = true;
        }
        super(message);
        let start = this.constructor;
        if (typeof options.stackStartFunction === "function")
          start = options.stackStartFunction;
        else if (typeof options.stackStartFn === "function")
          start = options.stackStartFn;
        this.type = "AssertionError";
        this.name = "AssertionError [ERR_ASSERTION]";
        this.code = "ERR_ASSERTION";
        this.generatedMessage = generatedMessage;
        this.actual = options.actual;
        this.expected = options.expected;
        this.operator = operator;
        if (Error.captureStackTrace)
          Error.captureStackTrace(this, start);
      }
    };
    function assert2(value, message) {
      if (!value) {
        let generatedMessage = false;
        if (arguments.length === 0) {
          message = "No value argument passed to `assert()`.";
          generatedMessage = true;
        } else if (message == null) {
          message = "Assertion failed.";
          generatedMessage = true;
        } else if (isError(message)) {
          throw message;
        }
        throw new AssertionError({
          message,
          actual: value,
          expected: true,
          operator: "==",
          generatedMessage,
          stackStartFn: assert2
        });
      }
    }
    function equal(actual, expected, message) {
      if (!Object.is(actual, expected)) {
        if (isError(message))
          throw message;
        throw new AssertionError({
          message,
          actual,
          expected,
          operator: "strictEqual",
          stackStartFn: equal
        });
      }
    }
    function notEqual(actual, expected, message) {
      if (Object.is(actual, expected)) {
        if (isError(message))
          throw message;
        throw new AssertionError({
          message,
          actual,
          expected,
          operator: "notStrictEqual",
          stackStartFn: notEqual
        });
      }
    }
    function fail(message) {
      let generatedMessage = false;
      if (isError(message))
        throw message;
      if (message == null) {
        message = "Assertion failed.";
        generatedMessage = true;
      }
      throw new AssertionError({
        message,
        actual: false,
        expected: true,
        operator: "fail",
        generatedMessage,
        stackStartFn: fail
      });
    }
    function throws(func, expected, message) {
      if (typeof expected === "string") {
        message = expected;
        expected = void 0;
      }
      let thrown = false;
      let err = null;
      enforce(typeof func === "function", "func", "function");
      try {
        func();
      } catch (e) {
        thrown = true;
        err = e;
      }
      if (!thrown) {
        let generatedMessage = false;
        if (message == null) {
          message = "Missing expected exception.";
          generatedMessage = true;
        }
        throw new AssertionError({
          message,
          actual: void 0,
          expected,
          operator: "throws",
          generatedMessage,
          stackStartFn: throws
        });
      }
      if (!testError(err, expected, message, throws))
        throw err;
    }
    function doesNotThrow(func, expected, message) {
      if (typeof expected === "string") {
        message = expected;
        expected = void 0;
      }
      let thrown = false;
      let err = null;
      enforce(typeof func === "function", "func", "function");
      try {
        func();
      } catch (e) {
        thrown = true;
        err = e;
      }
      if (!thrown)
        return;
      if (testError(err, expected, message, doesNotThrow)) {
        let generatedMessage = false;
        if (message == null) {
          message = "Got unwanted exception.";
          generatedMessage = true;
        }
        throw new AssertionError({
          message,
          actual: err,
          expected,
          operator: "doesNotThrow",
          generatedMessage,
          stackStartFn: doesNotThrow
        });
      }
      throw err;
    }
    async function rejects(func, expected, message) {
      if (typeof expected === "string") {
        message = expected;
        expected = void 0;
      }
      let thrown = false;
      let err = null;
      if (typeof func !== "function")
        enforce(isPromise(func), "func", "promise");
      try {
        if (isPromise(func))
          await func;
        else
          await func();
      } catch (e) {
        thrown = true;
        err = e;
      }
      if (!thrown) {
        let generatedMessage = false;
        if (message == null) {
          message = "Missing expected rejection.";
          generatedMessage = true;
        }
        throw new AssertionError({
          message,
          actual: void 0,
          expected,
          operator: "rejects",
          generatedMessage,
          stackStartFn: rejects
        });
      }
      if (!testError(err, expected, message, rejects))
        throw err;
    }
    async function doesNotReject(func, expected, message) {
      if (typeof expected === "string") {
        message = expected;
        expected = void 0;
      }
      let thrown = false;
      let err = null;
      if (typeof func !== "function")
        enforce(isPromise(func), "func", "promise");
      try {
        if (isPromise(func))
          await func;
        else
          await func();
      } catch (e) {
        thrown = true;
        err = e;
      }
      if (!thrown)
        return;
      if (testError(err, expected, message, doesNotReject)) {
        let generatedMessage = false;
        if (message == null) {
          message = "Got unwanted rejection.";
          generatedMessage = true;
        }
        throw new AssertionError({
          message,
          actual: void 0,
          expected,
          operator: "doesNotReject",
          generatedMessage,
          stackStartFn: doesNotReject
        });
      }
      throw err;
    }
    function ifError(err) {
      if (err != null) {
        let message = "ifError got unwanted exception: ";
        if (typeof err === "object" && typeof err.message === "string") {
          if (err.message.length === 0 && err.constructor)
            message += err.constructor.name;
          else
            message += err.message;
        } else {
          message += stringify(err);
        }
        throw new AssertionError({
          message,
          actual: err,
          expected: null,
          operator: "ifError",
          generatedMessage: true,
          stackStartFn: ifError
        });
      }
    }
    function deepEqual(actual, expected, message) {
      if (!isDeepEqual(actual, expected, false)) {
        if (isError(message))
          throw message;
        throw new AssertionError({
          message,
          actual,
          expected,
          operator: "deepStrictEqual",
          stackStartFn: deepEqual
        });
      }
    }
    function notDeepEqual(actual, expected, message) {
      if (isDeepEqual(actual, expected, true)) {
        if (isError(message))
          throw message;
        throw new AssertionError({
          message,
          actual,
          expected,
          operator: "notDeepStrictEqual",
          stackStartFn: notDeepEqual
        });
      }
    }
    function bufferEqual(actual, expected, enc, message) {
      if (!isEncoding(enc)) {
        message = enc;
        enc = null;
      }
      if (enc == null)
        enc = "hex";
      expected = bufferize(actual, expected, enc);
      enforce(isBuffer(actual), "actual", "buffer");
      enforce(isBuffer(expected), "expected", "buffer");
      if (actual !== expected && !actual.equals(expected)) {
        if (isError(message))
          throw message;
        throw new AssertionError({
          message,
          actual: actual.toString(enc),
          expected: expected.toString(enc),
          operator: "bufferEqual",
          stackStartFn: bufferEqual
        });
      }
    }
    function notBufferEqual(actual, expected, enc, message) {
      if (!isEncoding(enc)) {
        message = enc;
        enc = null;
      }
      if (enc == null)
        enc = "hex";
      expected = bufferize(actual, expected, enc);
      enforce(isBuffer(actual), "actual", "buffer");
      enforce(isBuffer(expected), "expected", "buffer");
      if (actual === expected || actual.equals(expected)) {
        if (isError(message))
          throw message;
        throw new AssertionError({
          message,
          actual: actual.toString(enc),
          expected: expected.toString(enc),
          operator: "notBufferEqual",
          stackStartFn: notBufferEqual
        });
      }
    }
    function enforce(value, name, type) {
      if (!value) {
        let msg;
        if (name == null) {
          msg = "Invalid type for parameter.";
        } else {
          if (type == null)
            msg = `Invalid type for "${name}".`;
          else
            msg = `"${name}" must be a(n) ${type}.`;
        }
        const err = new TypeError(msg);
        if (Error.captureStackTrace)
          Error.captureStackTrace(err, enforce);
        throw err;
      }
    }
    function range(value, name) {
      if (!value) {
        const msg = name != null ? `"${name}" is out of range.` : "Parameter is out of range.";
        const err = new RangeError(msg);
        if (Error.captureStackTrace)
          Error.captureStackTrace(err, range);
        throw err;
      }
    }
    function stringify(value) {
      switch (typeof value) {
        case "undefined":
          return "undefined";
        case "object":
          if (value === null)
            return "null";
          return `[${objectName(value)}]`;
        case "boolean":
          return `${value}`;
        case "number":
          return `${value}`;
        case "string":
          if (value.length > 80)
            value = `${value.substring(0, 77)}...`;
          return JSON.stringify(value);
        case "symbol":
          return tryString(value);
        case "function":
          return `[${funcName(value)}]`;
        case "bigint":
          return `${value}n`;
        default:
          return `[${typeof value}]`;
      }
    }
    function toString(value) {
      if (typeof value === "string")
        return value;
      if (isError(value))
        return tryString(value);
      return stringify(value);
    }
    function tryString(value) {
      try {
        return String(value);
      } catch (e) {
        return "Object";
      }
    }
    function testError(err, expected, message, func) {
      if (expected == null)
        return true;
      if (isRegExp(expected))
        return expected.test(err);
      if (typeof expected !== "function") {
        if (func === doesNotThrow || func === doesNotReject)
          throw new TypeError('"expected" must not be an object.');
        if (typeof expected !== "object")
          throw new TypeError('"expected" must be an object.');
        let generatedMessage = false;
        if (message == null) {
          const name = func === rejects ? "rejection" : "exception";
          message = `Missing expected ${name}.`;
          generatedMessage = true;
        }
        if (err == null || typeof err !== "object") {
          throw new AssertionError({
            actual: err,
            expected,
            message,
            operator: func.name,
            generatedMessage,
            stackStartFn: func
          });
        }
        const keys = Object.keys(expected);
        if (isError(expected))
          keys.push("name", "message");
        if (keys.length === 0)
          throw new TypeError('"expected" may not be an empty object.');
        for (const key of keys) {
          const expect = expected[key];
          const value = err[key];
          if (typeof value === "string" && isRegExp(expect) && expect.test(value)) {
            continue;
          }
          if (key in err && isDeepEqual(value, expect, false))
            continue;
          throw new AssertionError({
            actual: err,
            expected,
            message,
            operator: func.name,
            generatedMessage,
            stackStartFn: func
          });
        }
        return true;
      }
      if (expected.prototype !== void 0 && err instanceof expected)
        return true;
      if (Error.isPrototypeOf(expected))
        return false;
      return expected.call({}, err) === true;
    }
    function isDeepEqual(x, y, fail2) {
      try {
        return compare(x, y, null);
      } catch (e) {
        return fail2;
      }
    }
    function compare(a, b, cache) {
      if (Object.is(a, b))
        return true;
      if (!isObject(a) || !isObject(b))
        return false;
      if (objectString(a) !== objectString(b))
        return false;
      if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b))
        return false;
      if (isBuffer(a) && isBuffer(b))
        return a.equals(b);
      if (isDate(a))
        return Object.is(a.getTime(), b.getTime());
      if (isRegExp(a)) {
        return a.source === b.source && a.global === b.global && a.multiline === b.multiline && a.lastIndex === b.lastIndex && a.ignoreCase === b.ignoreCase;
      }
      if (isError(a)) {
        if (a.message !== b.message)
          return false;
      }
      if (isArrayBuffer(a)) {
        a = new Uint8Array(a);
        b = new Uint8Array(b);
      }
      if (isView(a) && !isBuffer(a)) {
        if (isBuffer(b))
          return false;
        const x = new Uint8Array(a.buffer);
        const y = new Uint8Array(b.buffer);
        if (x.length !== y.length)
          return false;
        for (let i = 0; i < x.length; i++) {
          if (x[i] !== y[i])
            return false;
        }
        return true;
      }
      if (isSet(a)) {
        if (a.size !== b.size)
          return false;
        const keys = /* @__PURE__ */ new Set([...a, ...b]);
        return keys.size === a.size;
      }
      if (!cache) {
        cache = {
          a: /* @__PURE__ */ new Map(),
          b: /* @__PURE__ */ new Map(),
          p: 0
        };
      } else {
        const aa = cache.a.get(a);
        if (aa != null) {
          const bb = cache.b.get(b);
          if (bb != null)
            return aa === bb;
        }
        cache.p += 1;
      }
      cache.a.set(a, cache.p);
      cache.b.set(b, cache.p);
      const ret = recurse(a, b, cache);
      cache.a.delete(a);
      cache.b.delete(b);
      return ret;
    }
    function recurse(a, b, cache) {
      if (isMap(a)) {
        if (a.size !== b.size)
          return false;
        const keys2 = /* @__PURE__ */ new Set([...a.keys(), ...b.keys()]);
        if (keys2.size !== a.size)
          return false;
        for (const key of keys2) {
          if (!compare(a.get(key), b.get(key), cache))
            return false;
        }
        return true;
      }
      if (isArray(a)) {
        if (a.length !== b.length)
          return false;
        for (let i = 0; i < a.length; i++) {
          if (!compare(a[i], b[i], cache))
            return false;
        }
        return true;
      }
      const ak = ownKeys(a);
      const bk = ownKeys(b);
      if (ak.length !== bk.length)
        return false;
      const keys = /* @__PURE__ */ new Set([...ak, ...bk]);
      if (keys.size !== ak.length)
        return false;
      for (const key of keys) {
        if (!compare(a[key], b[key], cache))
          return false;
      }
      return true;
    }
    function ownKeys(obj) {
      const keys = Object.keys(obj);
      if (!Object.getOwnPropertySymbols)
        return keys;
      if (!Object.getOwnPropertyDescriptor)
        return keys;
      const symbols = Object.getOwnPropertySymbols(obj);
      for (const symbol of symbols) {
        const desc = Object.getOwnPropertyDescriptor(obj, symbol);
        if (desc && desc.enumerable)
          keys.push(symbol);
      }
      return keys;
    }
    function objectString(obj) {
      if (obj === void 0)
        return "[object Undefined]";
      if (obj === null)
        return "[object Null]";
      try {
        return Object.prototype.toString.call(obj);
      } catch (e) {
        return "[object Object]";
      }
    }
    function objectType(obj) {
      return objectString(obj).slice(8, -1);
    }
    function objectName(obj) {
      const type = objectType(obj);
      if (obj == null)
        return type;
      if (type !== "Object" && type !== "Error")
        return type;
      let ctor, name;
      try {
        ctor = obj.constructor;
      } catch (e) {
        ;
      }
      if (ctor == null)
        return type;
      try {
        name = ctor.name;
      } catch (e) {
        return type;
      }
      if (typeof name !== "string" || name.length === 0)
        return type;
      return name;
    }
    function funcName(func) {
      let name;
      try {
        name = func.name;
      } catch (e) {
        ;
      }
      if (typeof name !== "string" || name.length === 0)
        return "Function";
      return `Function: ${name}`;
    }
    function isArray(obj) {
      return Array.isArray(obj);
    }
    function isArrayBuffer(obj) {
      return obj instanceof ArrayBuffer;
    }
    function isBuffer(obj) {
      return isObject(obj) && typeof obj.writeUInt32LE === "function" && typeof obj.equals === "function";
    }
    function isDate(obj) {
      return obj instanceof Date;
    }
    function isError(obj) {
      return obj instanceof Error;
    }
    function isMap(obj) {
      return obj instanceof Map;
    }
    function isObject(obj) {
      return obj && typeof obj === "object";
    }
    function isPromise(obj) {
      return obj instanceof Promise;
    }
    function isRegExp(obj) {
      return obj instanceof RegExp;
    }
    function isSet(obj) {
      return obj instanceof Set;
    }
    function isView(obj) {
      return ArrayBuffer.isView(obj);
    }
    function isEncoding(enc) {
      if (typeof enc !== "string")
        return false;
      switch (enc) {
        case "ascii":
        case "binary":
        case "base64":
        case "hex":
        case "latin1":
        case "ucs2":
        case "utf8":
        case "utf16le":
          return true;
      }
      return false;
    }
    function bufferize(actual, expected, enc) {
      if (typeof expected === "string") {
        if (!isBuffer(actual))
          return null;
        const { constructor } = actual;
        if (!constructor || typeof constructor.from !== "function")
          return null;
        if (!isEncoding(enc))
          return null;
        if (enc === "hex" && expected.length & 1)
          return null;
        const raw = constructor.from(expected, enc);
        if (enc === "hex" && raw.length !== expected.length >>> 1)
          return null;
        return raw;
      }
      return expected;
    }
    assert2.AssertionError = AssertionError;
    assert2.assert = assert2;
    assert2.strict = assert2;
    assert2.ok = assert2;
    assert2.equal = equal;
    assert2.notEqual = notEqual;
    assert2.strictEqual = equal;
    assert2.notStrictEqual = notEqual;
    assert2.fail = fail;
    assert2.throws = throws;
    assert2.doesNotThrow = doesNotThrow;
    assert2.rejects = rejects;
    assert2.doesNotReject = doesNotReject;
    assert2.ifError = ifError;
    assert2.deepEqual = deepEqual;
    assert2.notDeepEqual = notDeepEqual;
    assert2.deepStrictEqual = deepEqual;
    assert2.notDeepStrictEqual = notDeepEqual;
    assert2.bufferEqual = bufferEqual;
    assert2.notBufferEqual = notBufferEqual;
    assert2.enforce = enforce;
    assert2.range = range;
    module2.exports = assert2;
  }
});

// node_modules/brq/lib/mime.js
var require_mime = __commonJS({
  "node_modules/brq/lib/mime.js"(exports) {
    "use strict";
    init_cjs_shims();
    var assert2 = require_assert();
    var types = {
      "atom": ["application/atom+xml", true],
      "bin": ["application/octet-stream", false],
      "bmp": ["image/bmp", false],
      "cjs": ["application/javascript", true],
      "css": ["text/css", true],
      "dat": ["application/octet-stream", false],
      "form": ["application/x-www-form-urlencoded", true],
      "gif": ["image/gif", false],
      "gz": ["application/x-gzip", false],
      "htc": ["text/x-component", true],
      "html": ["text/html", true],
      "ico": ["image/x-icon", false],
      "jpg": ["image/jpeg", false],
      "jpeg": ["image/jpeg", false],
      "js": ["application/javascript", true],
      "json": ["application/json", true],
      "log": ["text/plain", true],
      "manifest": ["text/cache-manifest", false],
      "mathml": ["application/mathml+xml", true],
      "md": ["text/plain", true],
      "mjs": ["application/javascript", true],
      "mkv": ["video/x-matroska", false],
      "mml": ["application/mathml+xml", true],
      "mp3": ["audio/mpeg", false],
      "mp4": ["video/mp4", false],
      "mpeg": ["video/mpeg", false],
      "mpg": ["video/mpeg", false],
      "oga": ["audio/ogg", false],
      "ogg": ["application/ogg", false],
      "ogv": ["video/ogg", false],
      "otf": ["font/otf", false],
      "pdf": ["application/pdf", false],
      "png": ["image/png", false],
      "rdf": ["application/rdf+xml", true],
      "rss": ["application/rss+xml", true],
      "svg": ["image/svg+xml", false],
      "swf": ["application/x-shockwave-flash", false],
      "tar": ["application/x-tar", false],
      "torrent": ["application/x-bittorrent", false],
      "txt": ["text/plain", true],
      "ttf": ["font/ttf", false],
      "wav": ["audio/wav", false],
      "webm": ["video/webm", false],
      "woff": ["font/x-woff", false],
      "xhtml": ["application/xhtml+xml", true],
      "xbl": ["application/xml", true],
      "xml": ["application/xml", true],
      "xsl": ["application/xml", true],
      "xslt": ["application/xslt+xml", true],
      "zip": ["application/zip", false]
    };
    var extensions = {
      "application/atom+xml": "atom",
      "application/octet-stream": "bin",
      "image/bmp": "bmp",
      "text/css": "css",
      "application/x-www-form-urlencoded": "form",
      "image/gif": "gif",
      "application/x-gzip": "gz",
      "text/x-component": "htc",
      "text/html": "html",
      "text/xml": "xml",
      "image/x-icon": "ico",
      "image/jpeg": "jpeg",
      "text/javascript": "js",
      "application/javascript": "js",
      "text/x-json": "json",
      "application/json": "json",
      "text/json": "json",
      "text/plain": "txt",
      "text/cache-manifest": "manifest",
      "application/mathml+xml": "mml",
      "video/x-matroska": "mkv",
      "audio/x-matroska": "mkv",
      "audio/mpeg": "mp3",
      "audio/mpa": "mp3",
      "video/mp4": "mp4",
      "video/mpeg": "mpg",
      "audio/ogg": "oga",
      "application/ogg": "ogg",
      "video/ogg": "ogv",
      "font/otf": "otf",
      "application/pdf": "pdf",
      "application/x-pdf": "pdf",
      "image/png": "png",
      "application/rdf+xml": "rdf",
      "application/rss+xml": "rss",
      "image/svg+xml": "svg",
      "application/x-shockwave-flash": "swf",
      "application/x-tar": "tar",
      "application/x-bittorrent": "torrent",
      "font/ttf": "ttf",
      "audio/wav": "wav",
      "audio/wave": "wav",
      "video/webm": "webm",
      "audio/webm": "webm",
      "font/x-woff": "woff",
      "application/xhtml+xml": "xhtml",
      "application/xml": "xsl",
      "application/xslt+xml": "xslt",
      "application/zip": "zip"
    };
    exports.file = function file(path) {
      assert2(typeof path === "string");
      const name = path.split("/").pop();
      const parts = name.split(".");
      if (parts.length < 2)
        return "bin";
      if (parts.length === 2 && parts[0] === "")
        return "txt";
      const ext = parts[parts.length - 1];
      if (types[ext])
        return ext;
      return "bin";
    };
    exports.textual = function textual(ext) {
      const value = types[ext];
      if (!value)
        return false;
      return value[1];
    };
    exports.type = function type(ext) {
      assert2(typeof ext === "string");
      if (ext.indexOf("/") !== -1)
        return ext;
      const value = types[ext];
      if (!value)
        return "application/octet-stream";
      let [name, text] = value;
      if (text)
        name += "; charset=utf-8";
      return name;
    };
    exports.ext = function ext(type) {
      if (type == null)
        return "bin";
      assert2(typeof type === "string");
      [type] = type.split(";");
      type = type.toLowerCase();
      type = type.trim();
      return extensions[type] || "bin";
    };
  }
});

// node_modules/brq/lib/request.js
var require_request = __commonJS({
  "node_modules/brq/lib/request.js"(exports, module2) {
    "use strict";
    init_cjs_shims();
    var assert2 = require_assert();
    var { Stream } = require("stream");
    var mime = require_mime();
    var URL3 = null;
    var qs = null;
    var http = null;
    var https = null;
    var StringDecoder = null;
    var RequestOptions = class {
      constructor(options, buffer) {
        this.method = "GET";
        this.ssl = false;
        this.host = "localhost";
        this.port = 80;
        this.path = "/";
        this.query = "";
        this.strictSSL = true;
        this.pool = false;
        this.agent = "brq";
        this.lookup = null;
        this.type = null;
        this.expect = null;
        this.body = null;
        this.username = "";
        this.password = "";
        this.limit = 20 << 20;
        this.maxRedirects = 5;
        this.timeout = 5e3;
        this.buffer = buffer || false;
        this.headers = /* @__PURE__ */ Object.create(null);
        ensureRequires();
        if (options)
          this.fromOptions(options);
      }
      fromOptions(options) {
        if (typeof options === "string")
          options = { url: options };
        if (options.method != null) {
          assert2(typeof options.method === "string");
          this.method = options.method.toUpperCase();
        }
        if (options.uri != null)
          this.navigate(options.uri);
        if (options.url != null)
          this.navigate(options.url);
        if (options.ssl != null) {
          assert2(typeof options.ssl === "boolean");
          this.ssl = options.ssl;
          this.port = 443;
        }
        if (options.host != null) {
          assert2(typeof options.host === "string");
          this.host = options.host;
        }
        if (options.port != null) {
          assert2((options.port & 65535) === options.port);
          assert2(options.port !== 0);
          this.port = options.port;
        }
        if (options.path != null) {
          assert2(typeof options.path === "string");
          this.path = options.path;
        }
        if (options.query != null) {
          if (typeof options.query === "string") {
            this.query = options.query;
          } else {
            assert2(typeof options.query === "object");
            this.query = qs.stringify(options.query);
          }
        }
        if (options.username != null) {
          assert2(typeof options.username === "string");
          this.username = options.username;
        }
        if (options.password != null) {
          assert2(typeof options.password === "string");
          this.password = options.password;
        }
        if (options.strictSSL != null) {
          assert2(typeof options.strictSSL === "boolean");
          this.strictSSL = options.strictSSL;
        }
        if (options.pool != null) {
          assert2(typeof options.pool === "boolean");
          this.pool = options.pool;
        }
        if (options.agent != null) {
          assert2(typeof options.agent === "string");
          this.agent = options.agent;
        }
        if (options.json != null) {
          assert2(typeof options.json === "object");
          this.body = Buffer.from(JSON.stringify(options.json), "utf8");
          this.type = "json";
        }
        if (options.form != null) {
          assert2(typeof options.form === "object");
          this.body = Buffer.from(qs.stringify(options.form), "utf8");
          this.type = "form";
        }
        if (options.type != null) {
          assert2(typeof options.type === "string");
          this.type = options.type;
        }
        if (options.expect != null) {
          assert2(typeof options.expect === "string");
          this.expect = options.expect;
        }
        if (options.body != null) {
          if (typeof options.body === "string") {
            this.body = Buffer.from(options.body, "utf8");
          } else {
            assert2(Buffer.isBuffer(options.body));
            this.body = options.body;
          }
        }
        if (options.timeout != null) {
          assert2(typeof options.timeout === "number");
          this.timeout = options.timeout;
        }
        if (options.limit != null) {
          assert2(typeof options.limit === "number");
          this.limit = options.limit;
        }
        if (options.maxRedirects != null) {
          assert2(typeof options.maxRedirects === "number");
          this.maxRedirects = options.maxRedirects;
        }
        if (options.headers != null) {
          assert2(typeof options.headers === "object");
          this.headers = options.headers;
        }
        if (options.lookup != null) {
          assert2(typeof options.lookup === "function");
          this.lookup = options.lookup;
        }
        return this;
      }
      navigate(url) {
        assert2(typeof url === "string");
        if (url.indexOf("://") === -1)
          url = "http://" + url;
        const data = URL3.parse(url);
        if (data.protocol !== "http:" && data.protocol !== "https:") {
          throw new Error("Malformed URL.");
        }
        if (!data.hostname)
          throw new Error("Malformed URL.");
        this.ssl = data.protocol === "https:";
        this.host = data.hostname;
        this.port = this.ssl ? 443 : 80;
        if (data.port != null) {
          const port = parseInt(data.port, 10);
          assert2((port & 65535) === port);
          this.port = port;
        }
        this.path = data.pathname;
        this.query = data.query;
        if (data.auth) {
          const parts = data.auth.split(":");
          this.username = parts.shift();
          this.password = parts.join(":");
        }
        return this;
      }
      isExpected(type) {
        assert2(typeof type === "string");
        if (!this.expect)
          return true;
        return this.expect === type;
      }
      isOverflow(hdr) {
        if (hdr == null)
          return false;
        assert2(typeof hdr === "string");
        if (!this.buffer)
          return false;
        hdr = hdr.trim();
        if (!/^\d+$/.test(hdr))
          return false;
        hdr = hdr.replace(/^0+/g, "");
        if (hdr.length === 0)
          hdr = "0";
        if (hdr.length > 15)
          return false;
        const length = parseInt(hdr, 10);
        if (!Number.isSafeInteger(length))
          return true;
        return length > this.limit;
      }
      getBackend() {
        ensureRequires(this.ssl);
        return this.ssl ? https : http;
      }
      getHeaders() {
        const headers = /* @__PURE__ */ Object.create(null);
        headers["User-Agent"] = this.agent;
        if (this.type)
          headers["Content-Type"] = mime.type(this.type);
        if (this.body)
          headers["Content-Length"] = this.body.length.toString(10);
        if (this.username || this.password) {
          const auth = `${this.username}:${this.password}`;
          const data = Buffer.from(auth, "utf8");
          headers["Authorization"] = `Basic ${data.toString("base64")}`;
        }
        Object.assign(headers, this.headers);
        return headers;
      }
      redirect(location) {
        assert2(typeof location === "string");
        let url = "";
        if (this.ssl)
          url += "https://";
        else
          url += "http://";
        if (this.host.indexOf(":") !== -1)
          url += `[${this.host}]`;
        else
          url += this.host;
        url += ":" + this.port;
        url += this.path;
        if (this.query)
          url += "?" + this.query;
        this.navigate(URL3.resolve(url, location));
        return this;
      }
      toHTTP() {
        let query = "";
        if (this.query)
          query = "?" + this.query;
        return {
          method: this.method,
          host: this.host,
          port: this.port,
          path: this.path + query,
          headers: this.getHeaders(),
          agent: this.pool ? null : false,
          lookup: this.lookup || void 0,
          rejectUnauthorized: this.strictSSL
        };
      }
    };
    var Request = class extends Stream {
      constructor(options, buffer) {
        super();
        this.options = new RequestOptions(options, buffer);
        this.req = null;
        this.res = null;
        this.statusCode = 0;
        this.headers = /* @__PURE__ */ Object.create(null);
        this.type = "bin";
        this.redirects = 0;
        this.timeout = null;
        this.finished = false;
        this.onResponse = this.handleResponse.bind(this);
        this.onData = this.handleData.bind(this);
        this.onEnd = this.handleEnd.bind(this);
        this.total = 0;
        this.decoder = null;
        this.buf = [];
        this.str = "";
      }
      startTimeout() {
        if (!this.options.timeout)
          return;
        this.timeout = setTimeout(() => {
          this.finish(new Error("Request timed out."));
        }, this.options.timeout);
      }
      stopTimeout() {
        if (this.timeout != null) {
          clearTimeout(this.timeout);
          this.timeout = null;
        }
      }
      cleanup() {
        this.stopTimeout();
        if (this.req) {
          this.req.removeListener("response", this.onResponse);
          this.req.removeListener("error", this.onEnd);
          this.req.addListener("error", () => {
          });
        }
        if (this.res) {
          this.res.removeListener("data", this.onData);
          this.res.removeListener("error", this.onEnd);
          this.res.removeListener("end", this.onEnd);
          this.res.addListener("error", () => {
          });
        }
      }
      close() {
        if (this.req) {
          try {
            this.req.abort();
          } catch (e) {
            ;
          }
        }
        if (this.res) {
          try {
            this.res.destroy();
          } catch (e) {
            ;
          }
        }
        this.cleanup();
        this.req = null;
        this.res = null;
      }
      destroy() {
        this.close();
      }
      start() {
        const http2 = this.options.getBackend();
        const options = this.options.toHTTP();
        this.startTimeout();
        this.req = http2.request(options);
        this.res = null;
        if (this.options.body)
          this.req.write(this.options.body);
        this.req.on("response", this.onResponse);
        this.req.on("error", this.onEnd);
      }
      write(data) {
        return this.req.write(data);
      }
      end() {
        return this.req.end();
      }
      finish(err) {
        if (this.finished)
          return;
        this.finished = true;
        if (err) {
          this.destroy();
          this.emit("error", err);
          return;
        }
        this.cleanup();
        this.emit("end");
        this.emit("close");
      }
      handleResponse(res) {
        const { headers } = res;
        const location = headers["location"];
        if (location) {
          if (this.redirects >= this.options.maxRedirects) {
            this.finish(new Error("Too many redirects."));
            return;
          }
          this.redirects += 1;
          this.close();
          try {
            this.options.redirect(location);
          } catch (e) {
            this.finish(e);
            return;
          }
          this.start();
          this.end();
          return;
        }
        const type = mime.ext(headers["content-type"]);
        if (!this.options.isExpected(type)) {
          this.finish(new Error("Wrong content-type for response."));
          return;
        }
        const length = headers["content-length"];
        if (this.options.isOverflow(length)) {
          this.finish(new Error("Response exceeded limit."));
          return;
        }
        this.res = res;
        this.statusCode = res.statusCode;
        this.headers = headers;
        this.type = type;
        this.res.on("data", this.onData);
        this.res.on("error", this.onEnd);
        this.res.on("end", this.onEnd);
        this.emit("headers", headers);
        this.emit("type", type);
        this.emit("response", res);
        if (this.options.buffer) {
          if (mime.textual(this.type)) {
            this.decoder = new StringDecoder("utf8");
            this.str = "";
          } else {
            this.buf = [];
          }
        }
      }
      handleData(data) {
        this.total += data.length;
        this.emit("data", data);
        if (this.options.buffer) {
          if (this.options.limit) {
            if (this.total > this.options.limit) {
              this.finish(new Error("Response exceeded limit."));
              return;
            }
          }
          if (this.decoder) {
            this.str += this.decoder.write(data);
            return;
          }
          this.buf.push(data);
        }
      }
      handleEnd(err) {
        this.finish(err);
      }
      text() {
        if (this.decoder)
          return this.str;
        return this.buffer().toString("utf8");
      }
      buffer() {
        if (this.decoder)
          return Buffer.from(this.str, "utf8");
        return Buffer.concat(this.buf);
      }
      json() {
        const text = this.text().trim();
        if (text.length === 0)
          return /* @__PURE__ */ Object.create(null);
        const body = JSON.parse(text);
        if (!body || typeof body !== "object")
          throw new Error("JSON body is a non-object.");
        return body;
      }
      form() {
        return qs.parse(this.text());
      }
    };
    function request(options) {
      if (typeof options === "string")
        options = { url: options };
      return new Promise((resolve, reject) => {
        const req = new Request(options, true);
        req.on("error", (err) => reject(err));
        req.on("end", () => resolve(req));
        req.start();
        req.end();
      });
    }
    request.stream = function stream(options) {
      const req = new Request(options, false);
      req.start();
      return req;
    };
    function ensureRequires(ssl) {
      if (!URL3)
        URL3 = require("url");
      if (!qs)
        qs = require("querystring");
      if (!http)
        http = require("http");
      if (ssl && !https)
        https = require("https");
      if (!StringDecoder)
        StringDecoder = require("string_decoder").StringDecoder;
    }
    module2.exports = request;
  }
});

// node_modules/brq/lib/brq.js
var require_brq = __commonJS({
  "node_modules/brq/lib/brq.js"(exports, module2) {
    "use strict";
    init_cjs_shims();
    module2.exports = require_request();
  }
});

// src/index.ts
var src_exports = {};
__export(src_exports, {
  Resolver: () => Resolver,
  default: () => src_default
});
init_cjs_shims();

// src/Resolver.ts
init_cjs_shims();
var Resolver = class {
  _resolvers = [];
  _portals = [];
  async resolve(input, params = []) {
    for (let resolver2 of this._resolvers) {
      let result = await resolver2.resolve(input, params);
      if (result) {
        return result;
      }
    }
    return false;
  }
  registerResolver(resolver2) {
    this._resolvers.push(resolver2);
  }
  registerPortal(hostname) {
    this._portals.push(hostname);
  }
  set portals(value) {
    this._portals = value;
  }
  getPortal() {
    return this._portals[Math.floor(Math.random() * (1 + this._portals.length - 1))];
  }
};

// src/resolvers/handshake.ts
init_cjs_shims();

// src/lib/util.ts
init_cjs_shims();
function isIp(ip) {
  return /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip);
}
function isDomain(domain) {
  return /(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/.test(domain);
}
var startsWithSkylinkRegExp = /^(sia:\/\/)?([a-zA-Z0-9_-]{46})/;
var registryEntryRegExp = /^skyns:\/\/(?<publickey>[a-zA-Z0-9%]+)\/(?<datakey>[a-zA-Z0-9%]+)$/;

// src/resolvers/handshake/HnsClient.ts
init_cjs_shims();
var import_path = require("path");
var import_brq = __toESM(require_brq(), 1);
var import_assert = __toESM(require("assert"), 1);
var import_hs_client = require("@lumeweb/hs-client");
var HnsClient = class extends import_hs_client.NodeClient {
  constructor(options) {
    super(options);
  }
  async execute(name, params) {
    var _a;
    (0, import_assert.default)(typeof name === "string");
    (0, import_assert.default)(Array.isArray(params));
    this.sequence += 1;
    const res = await (0, import_brq.default)({
      method: "POST",
      ssl: true,
      strictSSL: this.strictSSL,
      host: this.host,
      port: this.port,
      path: import_path.posix.join(this.path, "/rpc"),
      username: this.username,
      password: this.password,
      headers: this.headers,
      timeout: this.timeout,
      limit: this.limit,
      pool: true,
      query: {
        chain: (_a = this.headers["X-Chain"]) != null ? _a : "hns"
      },
      json: {
        jsonrpc: "2.0",
        method: name,
        params,
        chain: "hns",
        id: this.sequence
      }
    });
    if (res.statusCode === 401) {
      throw new RPCError("Unauthorized (bad API key).", -1);
    }
    if (res.type !== "json") {
      throw new Error("Bad response (wrong content-type).");
    }
    const json = res.json();
    if (!json) {
      throw new Error("No body for JSON-RPC response.");
    }
    if (json.error) {
      const { message, code } = json.error;
      throw new RPCError(message, code);
    }
    if (res.statusCode !== 200) {
      throw new Error(`Status code: ${res.statusCode}.`);
    }
    return json;
  }
};
var RPCError = class extends Error {
  constructor(msg, code) {
    super();
    this.type = "RPCError";
    this.message = String(msg);
    this.code = code >> 0;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RPCError);
    }
  }
};

// src/resolvers/handshake.ts
var import_skynet_js = require("skynet-js");
var Handshake = class {
  async resolve(input, params = {}) {
    let tld = input;
    if (isIp(input)) {
      return false;
    }
    if (input.endsWith(".eth")) {
      return false;
    }
    if (input.includes(".")) {
      tld = input.split(".")[input.split(".").length - 1];
    }
    let records = await Handshake.query(tld);
    if (!records) {
      return false;
    }
    let result = false;
    for (let record of records.reverse()) {
      switch (record.type) {
        case "NS": {
          result = await Handshake.processNs(input, record, records);
          break;
        }
        case "TXT": {
          result = await Handshake.processTxt(record);
          break;
        }
        default: {
          break;
        }
      }
      if (result) {
        break;
      }
    }
    return result;
  }
  static async processNs(domain, record, records) {
    let glue = records.slice().find((item) => ["GLUE4", "GLUE6"].includes(item.type) && item.ns === record.ns);
    if (glue) {
      return src_default.resolve(glue.address, { subquery: true, domain });
    }
    if (isDomain(record.ns)) {
      return src_default.resolve(record.ns, { subquery: true });
    }
    let result = await src_default.resolve(record.ns, { domain });
    return result || record.ns;
  }
  static async query(tld) {
    var _a;
    const portal = src_default.getPortal();
    const clientOptions = {
      ssl: true,
      network: "main",
      host: portal,
      port: 443,
      headers: {
        "X-Chain": "hns"
      }
    };
    const client = new HnsClient(clientOptions);
    let resp;
    try {
      resp = await client.execute("getnameresource", [tld]);
    } catch (e) {
      console.error(e);
      return false;
    }
    return ((_a = resp == null ? void 0 : resp.result) == null ? void 0 : _a.records) || [];
  }
  static async processTxt(record) {
    var _a;
    let matches;
    if (matches = record.txt.slice().pop().match(startsWithSkylinkRegExp)) {
      return decodeURIComponent(matches[2]);
    }
    if (matches = record.txt.slice().pop().match(registryEntryRegExp)) {
      const client = new import_skynet_js.SkynetClient(`https://${src_default.getPortal()}`);
      let pubKey = decodeURIComponent(matches.groups.publickey).replace("ed25519:", "");
      let entry = await client.registry.getEntry(pubKey, matches.groups.datakey, { hashedDataKeyHex: true });
      return Buffer.from((_a = entry.entry) == null ? void 0 : _a.data).toString();
    }
    return false;
  }
};

// src/resolvers/icann.ts
init_cjs_shims();
var import_hs_client2 = require("@lumeweb/hs-client");
var Icann = class {
  async resolve(input, params = {}) {
    if (!params || !("subquery" in params) || !params.subquery) {
      return false;
    }
    if (!isDomain(input)) {
      return false;
    }
    const portal = src_default.getPortal();
    const clientOptions = {
      ssl: true,
      host: portal,
      port: 443,
      path: "/pocketdns",
      headers: {
        "X-Chain": "icann"
      }
    };
    const client = new import_hs_client2.NodeClient(clientOptions);
    let resp = false;
    try {
      let rpcParams = {};
      rpcParams.domain = params.domain || input;
      rpcParams.nameserver = !params.domain ? null : input;
      resp = await client.execute("dnslookup", rpcParams);
    } catch (e) {
      console.error(e);
      return false;
    }
    return resp.result;
  }
};

// src/resolvers/eip137.ts
init_cjs_shims();
var import_ensjs = __toESM(require("@lumeweb/ensjs"), 1);
var import_ethers = require("ethers");
var URL2 = __toESM(require("url"), 1);
var ENS = import_ensjs.default.default;
var Eip137 = class {
  async resolve(input, params = {}) {
    if (input.endsWith(".eth")) {
      return await this.resolveEns(input);
    }
    let hip5Data = input.split(".");
    if (2 <= hip5Data.length && "domain" in params) {
      if (import_ethers.ethers.utils.isAddress(hip5Data[0])) {
        return await this.resolveHip5(params.domain, hip5Data);
      }
    }
    return false;
  }
  async resolveEns(input) {
    let data = [(0, import_ensjs.getEnsAddress)("1"), "eth-mainnet"];
    return this.resolveHip5(input, data);
  }
  async resolveHip5(domain, data) {
    let connection = this.getConnection(data[1].replace("_", ""));
    const ens = new ENS({ provider: connection, ensAddress: data[0] });
    try {
      let name = await ens.name(domain);
      let contentResult = await name.getContent();
      let url = await name.getText("url");
      let content;
      if (typeof contentResult === "string" && Number(contentResult) === 0) {
        content = false;
      }
      if (typeof contentResult === "object" && contentResult.contentType === "contenthash") {
        content = contentResult.value;
      }
      return content || url || false;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
  getConnection(chain) {
    let apiUrl = URL2.parse(`https://${src_default.getPortal()}/pocketdns`);
    if (URL2.URLSearchParams) {
      let params = new URL2.URLSearchParams();
      params.set("chain", chain);
      apiUrl.search = params.toString();
    } else {
      apiUrl.search = `?chain=${chain}`;
    }
    return new import_ethers.ethers.providers.StaticJsonRpcProvider({
      url: apiUrl.format()
    });
  }
};

// src/index.ts
var resolver = new Resolver();
resolver.registerResolver(new Icann());
resolver.registerResolver(new Eip137());
resolver.registerResolver(new Handshake());
var src_default = resolver;
module.exports = __toCommonJS(src_exports);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Resolver
});
/*!
 * assert.js - assertions for javascript
 * Copyright (c) 2018, Christopher Jeffrey (MIT License).
 * https://github.com/chjj/bsert
 */
/*!
 * brq.js - simple request module
 * Copyright (c) 2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/brq
 */
/*!
 * mime.js - mime types for brq
 * Copyright (c) 2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/brq
 */
/*!
 * request.js - http request for brq
 * Copyright (c) 2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/brq
 */
//# sourceMappingURL=index.cjs.map