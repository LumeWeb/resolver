"use strict";
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined")
      return require.apply(this, arguments);
    throw new Error('Dynamic require of "' + x + '" is not supported');
  });
  var __commonJS = (cb, mod) => function __require2() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target2) => (target2 = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    isNodeMode || !mod || !mod.__esModule ? __defProp(target2, "default", { value: mod, enumerable: true }) : target2,
    mod
  ));

  // node_modules/node-gyp-build-optional-packages/index.js
  var require_node_gyp_build_optional_packages = __commonJS({
    "node_modules/node-gyp-build-optional-packages/index.js"(exports, module) {
      var fs = __require("fs");
      var path = __require("path");
      var runtimeRequire = typeof __webpack_require__ === "function" ? __non_webpack_require__ : __require;
      var vars = process.config && process.config.variables || {};
      var prebuildsOnly = !!process.env.PREBUILDS_ONLY;
      var abi = process.versions.modules;
      var runtime = isElectron() ? "electron" : "node";
      var arch = process.arch;
      var platform = process.platform;
      var libc = process.env.LIBC || (isAlpine(platform) ? "musl" : "glibc");
      var armv = process.env.ARM_VERSION || (arch === "arm64" ? "8" : vars.arm_version) || "";
      var uv = (process.versions.uv || "").split(".")[0];
      module.exports = load;
      function load(dir) {
        return runtimeRequire(load.path(dir));
      }
      load.path = function(dir) {
        dir = path.resolve(dir || ".");
        var packageName;
        try {
          packageName = runtimeRequire(path.join(dir, "package.json")).name;
          var varName = packageName.toUpperCase().replace(/-/g, "_") + "_PREBUILD";
          if (process.env[varName])
            dir = process.env[varName];
        } catch (err) {
        }
        if (!prebuildsOnly) {
          var release = getFirst(path.join(dir, "build/Release"), matchBuild);
          if (release)
            return release;
          var debug = getFirst(path.join(dir, "build/Debug"), matchBuild);
          if (debug)
            return debug;
        }
        var prebuild = resolve(dir);
        if (prebuild)
          return prebuild;
        var nearby = resolve(path.dirname(process.execPath));
        if (nearby)
          return nearby;
        var platformPackage = (packageName[0] == "@" ? "" : "@" + packageName + "/") + packageName + "-" + platform + "-" + arch;
        try {
          var prebuildPackage = path.dirname(__require("module").createRequire(path.join(dir, "package.json")).resolve(platformPackage));
          return resolveFile(prebuildPackage);
        } catch (error) {
        }
        var target2 = [
          "platform=" + platform,
          "arch=" + arch,
          "runtime=" + runtime,
          "abi=" + abi,
          "uv=" + uv,
          armv ? "armv=" + armv : "",
          "libc=" + libc,
          "node=" + process.versions.node,
          process.versions.electron ? "electron=" + process.versions.electron : "",
          typeof __webpack_require__ === "function" ? "webpack=true" : ""
        ].filter(Boolean).join(" ");
        throw new Error("No native build was found for " + target2 + "\n    loaded from: " + dir + " and package: " + platformPackage + "\n");
        function resolve(dir2) {
          var tuples = readdirSync(path.join(dir2, "prebuilds")).map(parseTuple);
          var tuple = tuples.filter(matchTuple(platform, arch)).sort(compareTuples)[0];
          if (!tuple)
            return;
          return resolveFile(path.join(dir2, "prebuilds", tuple.name));
        }
        function resolveFile(prebuilds) {
          var parsed = readdirSync(prebuilds).map(parseTags);
          var candidates = parsed.filter(matchTags(runtime, abi));
          var winner = candidates.sort(compareTags(runtime))[0];
          if (winner)
            return path.join(prebuilds, winner.file);
        }
      };
      function readdirSync(dir) {
        try {
          return fs.readdirSync(dir);
        } catch (err) {
          return [];
        }
      }
      function getFirst(dir, filter) {
        var files = readdirSync(dir).filter(filter);
        return files[0] && path.join(dir, files[0]);
      }
      function matchBuild(name) {
        return /\.node$/.test(name);
      }
      function parseTuple(name) {
        var arr = name.split("-");
        if (arr.length !== 2)
          return;
        var platform2 = arr[0];
        var architectures = arr[1].split("+");
        if (!platform2)
          return;
        if (!architectures.length)
          return;
        if (!architectures.every(Boolean))
          return;
        return { name, platform: platform2, architectures };
      }
      function matchTuple(platform2, arch2) {
        return function(tuple) {
          if (tuple == null)
            return false;
          if (tuple.platform !== platform2)
            return false;
          return tuple.architectures.includes(arch2);
        };
      }
      function compareTuples(a, b) {
        return a.architectures.length - b.architectures.length;
      }
      function parseTags(file) {
        var arr = file.split(".");
        var extension = arr.pop();
        var tags = { file, specificity: 0 };
        if (extension !== "node")
          return;
        for (var i = 0; i < arr.length; i++) {
          var tag = arr[i];
          if (tag === "node" || tag === "electron" || tag === "node-webkit") {
            tags.runtime = tag;
          } else if (tag === "napi") {
            tags.napi = true;
          } else if (tag.slice(0, 3) === "abi") {
            tags.abi = tag.slice(3);
          } else if (tag.slice(0, 2) === "uv") {
            tags.uv = tag.slice(2);
          } else if (tag.slice(0, 4) === "armv") {
            tags.armv = tag.slice(4);
          } else if (tag === "glibc" || tag === "musl") {
            tags.libc = tag;
          } else {
            continue;
          }
          tags.specificity++;
        }
        return tags;
      }
      function matchTags(runtime2, abi2) {
        return function(tags) {
          if (tags == null)
            return false;
          if (tags.runtime !== runtime2 && !runtimeAgnostic(tags))
            return false;
          if (tags.abi !== abi2 && !tags.napi)
            return false;
          if (tags.uv && tags.uv !== uv)
            return false;
          if (tags.armv && tags.armv !== armv)
            return false;
          if (tags.libc && tags.libc !== libc)
            return false;
          return true;
        };
      }
      function runtimeAgnostic(tags) {
        return tags.runtime === "node" && tags.napi;
      }
      function compareTags(runtime2) {
        return function(a, b) {
          if (a.runtime !== b.runtime) {
            return a.runtime === runtime2 ? -1 : 1;
          } else if (a.abi !== b.abi) {
            return a.abi ? -1 : 1;
          } else if (a.specificity !== b.specificity) {
            return a.specificity > b.specificity ? -1 : 1;
          } else {
            return 0;
          }
        };
      }
      function isElectron() {
        if (process.versions && process.versions.electron)
          return true;
        if (process.env.ELECTRON_RUN_AS_NODE)
          return true;
        return typeof window !== "undefined" && window.process && window.process.type === "renderer";
      }
      function isAlpine(platform2) {
        return platform2 === "linux" && fs.existsSync("/etc/alpine-release");
      }
      load.parseTags = parseTags;
      load.matchTags = matchTags;
      load.compareTags = compareTags;
      load.parseTuple = parseTuple;
      load.matchTuple = matchTuple;
      load.compareTuples = compareTuples;
    }
  });

  // node_modules/msgpackr-extract/index.js
  var require_msgpackr_extract = __commonJS({
    "node_modules/msgpackr-extract/index.js"(exports, module) {
      module.exports = require_node_gyp_build_optional_packages()(__dirname);
    }
  });

  // node_modules/kademlia-routing-table/index.js
  var require_kademlia_routing_table = __commonJS({
    "node_modules/kademlia-routing-table/index.js"(exports, module) {
      var { EventEmitter } = __require("events");
      module.exports = class RoutingTable extends EventEmitter {
        constructor(id, opts) {
          if (!opts)
            opts = {};
          super();
          this.id = id;
          this.k = opts.k || 20;
          this.rows = new Array(id.length * 8);
        }
        add(node) {
          const i = this._diff(node.id);
          let row = this.rows[i];
          if (!row) {
            row = this.rows[i] = new Row(this, i);
            this.emit("row", row);
          }
          return row.add(node, this.k);
        }
        remove(id) {
          const i = this._diff(id);
          const row = this.rows[i];
          if (!row)
            return false;
          return row.remove(id);
        }
        get(id) {
          const i = this._diff(id);
          const row = this.rows[i];
          if (!row)
            return null;
          return row.get(id);
        }
        has(id) {
          return this.get(id) !== null;
        }
        random() {
          const offset = Math.random() * this.rows.length | 0;
          for (let i = 0; i < this.rows.length; i++) {
            const r = this.rows[(i + offset) % this.rows.length];
            if (r && r.nodes.length)
              return r.random();
          }
          return null;
        }
        closest(id, k) {
          if (!k)
            k = this.k;
          const result = [];
          const d = this._diff(id);
          for (let i = d; i >= 0 && result.length < k; i--)
            this._pushNodes(i, k, result);
          for (let i = d + 1; i < this.rows.length && result.length < k; i++)
            this._pushNodes(i, k, result);
          return result;
        }
        _pushNodes(i, k, result) {
          const row = this.rows[i];
          if (!row)
            return;
          const missing = Math.min(k - result.length, row.nodes.length);
          for (let j = 0; j < missing; j++)
            result.push(row.nodes[j]);
        }
        toArray() {
          return this.closest(this.id, Infinity);
        }
        _diff(id) {
          for (let i = 0; i < id.length; i++) {
            const a = id[i];
            const b = this.id[i];
            if (a !== b)
              return i * 8 + Math.clz32(a ^ b) - 24;
          }
          return this.rows.length - 1;
        }
      };
      var Row = class extends EventEmitter {
        constructor(table, index) {
          super();
          this.data = null;
          this.index = index;
          this.table = table;
          this.nodes = [];
        }
        add(node) {
          const id = node.id;
          let l = 0;
          let r = this.nodes.length - 1;
          while (l <= r) {
            const m = l + r >> 1;
            const c = this.compare(id, this.nodes[m].id);
            if (c === 0) {
              this.nodes[m] = node;
              return;
            }
            if (c < 0)
              r = m - 1;
            else
              l = m + 1;
          }
          if (this.nodes.length >= this.table.k) {
            this.emit("full", node);
            return false;
          }
          this.insert(l, node);
          return true;
        }
        remove(id) {
          let l = 0;
          let r = this.nodes.length - 1;
          while (l <= r) {
            const m = l + r >> 1;
            const c = this.compare(id, this.nodes[m].id);
            if (c === 0) {
              this.splice(m);
              return true;
            }
            if (c < 0)
              r = m - 1;
            else
              l = m + 1;
          }
          return false;
        }
        get(id) {
          let l = 0;
          let r = this.nodes.length - 1;
          while (l <= r) {
            const m = l + r >> 1;
            const node = this.nodes[m];
            const c = this.compare(id, node.id);
            if (c === 0)
              return node;
            if (c < 0)
              r = m - 1;
            else
              l = m + 1;
          }
          return null;
        }
        random() {
          return this.nodes.length ? this.nodes[Math.random() * this.nodes.length | 0] : null;
        }
        insert(i, node) {
          this.nodes.push(node);
          for (let j = this.nodes.length - 1; j > i; j--)
            this.nodes[j] = this.nodes[j - 1];
          this.nodes[i] = node;
          this.emit("add", node);
        }
        splice(i) {
          for (; i < this.nodes.length - 1; i++)
            this.nodes[i] = this.nodes[i + 1];
          this.emit("remove", this.nodes.pop());
        }
        compare(a, b) {
          for (let i = this.index; i < a.length; i++) {
            const ai = a[i];
            const bi = b[i];
            if (ai === bi)
              continue;
            return ai < bi ? -1 : 1;
          }
          return 0;
        }
      };
    }
  });

  // node_modules/time-ordered-set/index.js
  var require_time_ordered_set = __commonJS({
    "node_modules/time-ordered-set/index.js"(exports, module) {
      module.exports = TimeOrderedSet;
      function TimeOrderedSet() {
        if (!(this instanceof TimeOrderedSet))
          return new TimeOrderedSet();
        this.oldest = null;
        this.latest = null;
        this.length = 0;
      }
      TimeOrderedSet.prototype.has = function(node) {
        return !!(node.next || node.prev) || node === this.oldest;
      };
      TimeOrderedSet.prototype.add = function(node) {
        if (this.has(node))
          this.remove(node);
        if (!this.latest && !this.oldest) {
          this.latest = this.oldest = node;
          node.prev = node.next = null;
        } else {
          this.latest.next = node;
          node.prev = this.latest;
          node.next = null;
          this.latest = node;
        }
        this.length++;
        return node;
      };
      TimeOrderedSet.prototype.remove = function(node) {
        if (!this.has(node))
          return node;
        if (this.oldest !== node && this.latest !== node) {
          node.prev.next = node.next;
          node.next.prev = node.prev;
        } else {
          if (this.oldest === node) {
            this.oldest = node.next;
            if (this.oldest)
              this.oldest.prev = null;
          }
          if (this.latest === node) {
            this.latest = node.prev;
            if (this.latest)
              this.latest.next = null;
          }
        }
        node.next = node.prev = null;
        this.length--;
        return node;
      };
      TimeOrderedSet.prototype.toArray = function(pick) {
        if (!pick)
          pick = Infinity;
        var list = [];
        var node = this.oldest;
        while (node && pick--) {
          list.push(node);
          node = node.next;
        }
        return list;
      };
    }
  });

  // node_modules/b4a/index.js
  var require_b4a = __commonJS({
    "node_modules/b4a/index.js"(exports, module) {
      function isBuffer2(value) {
        return Buffer.isBuffer(value) || value instanceof Uint8Array;
      }
      function isEncoding(encoding) {
        return Buffer.isEncoding(encoding);
      }
      function alloc(size, fill2, encoding) {
        return Buffer.alloc(size, fill2, encoding);
      }
      function allocUnsafe(size) {
        return Buffer.allocUnsafe(size);
      }
      function allocUnsafeSlow(size) {
        return Buffer.allocUnsafeSlow(size);
      }
      function byteLength(string, encoding) {
        return Buffer.byteLength(string, encoding);
      }
      function compare(a, b) {
        return Buffer.compare(a, b);
      }
      function concat(buffers, totalLength) {
        return Buffer.concat(buffers, totalLength);
      }
      function copy(source, target2, targetStart, start, end) {
        return toBuffer(source).copy(target2, targetStart, start, end);
      }
      function equals(a, b) {
        return toBuffer(a).equals(b);
      }
      function fill(buffer, value, offset, end, encoding) {
        return toBuffer(buffer).fill(value, offset, end, encoding);
      }
      function from(value, encodingOrOffset, length) {
        return Buffer.from(value, encodingOrOffset, length);
      }
      function includes(buffer, value, byteOffset, encoding) {
        return toBuffer(buffer).includes(value, byteOffset, encoding);
      }
      function indexOf(buffer, value, byfeOffset, encoding) {
        return toBuffer(buffer).indexOf(value, byfeOffset, encoding);
      }
      function lastIndexOf(buffer, value, byteOffset, encoding) {
        return toBuffer(buffer).lastIndexOf(value, byteOffset, encoding);
      }
      function swap16(buffer) {
        return toBuffer(buffer).swap16();
      }
      function swap32(buffer) {
        return toBuffer(buffer).swap32();
      }
      function swap64(buffer) {
        return toBuffer(buffer).swap64();
      }
      function toBuffer(buffer) {
        if (Buffer.isBuffer(buffer))
          return buffer;
        return Buffer.from(buffer.buffer, buffer.byteOffset, buffer.byteLength);
      }
      function toString(buffer, encoding, start, end) {
        return toBuffer(buffer).toString(encoding, start, end);
      }
      function write(buffer, string, offset, length, encoding) {
        return toBuffer(buffer).write(string, offset, length, encoding);
      }
      function writeDoubleLE(buffer, value, offset) {
        return toBuffer(buffer).writeDoubleLE(value, offset);
      }
      function writeFloatLE(buffer, value, offset) {
        return toBuffer(buffer).writeFloatLE(value, offset);
      }
      function writeUInt32LE(buffer, value, offset) {
        return toBuffer(buffer).writeUInt32LE(value, offset);
      }
      function writeInt32LE(buffer, value, offset) {
        return toBuffer(buffer).writeInt32LE(value, offset);
      }
      function readDoubleLE(buffer, offset) {
        return toBuffer(buffer).readDoubleLE(offset);
      }
      function readFloatLE(buffer, offset) {
        return toBuffer(buffer).readFloatLE(offset);
      }
      function readUInt32LE(buffer, offset) {
        return toBuffer(buffer).readUInt32LE(offset);
      }
      function readInt32LE(buffer, offset) {
        return toBuffer(buffer).readInt32LE(offset);
      }
      module.exports = {
        isBuffer: isBuffer2,
        isEncoding,
        alloc,
        allocUnsafe,
        allocUnsafeSlow,
        byteLength,
        compare,
        concat,
        copy,
        equals,
        fill,
        from,
        includes,
        indexOf,
        lastIndexOf,
        swap16,
        swap32,
        swap64,
        toBuffer,
        toString,
        write,
        writeDoubleLE,
        writeFloatLE,
        writeUInt32LE,
        writeInt32LE,
        readDoubleLE,
        readFloatLE,
        readUInt32LE,
        readInt32LE
      };
    }
  });

  // node_modules/node-gyp-build/index.js
  var require_node_gyp_build = __commonJS({
    "node_modules/node-gyp-build/index.js"(exports, module) {
      var fs = __require("fs");
      var path = __require("path");
      var os = __require("os");
      var runtimeRequire = typeof __webpack_require__ === "function" ? __non_webpack_require__ : __require;
      var vars = process.config && process.config.variables || {};
      var prebuildsOnly = !!process.env.PREBUILDS_ONLY;
      var abi = process.versions.modules;
      var runtime = isElectron() ? "electron" : isNwjs() ? "node-webkit" : "node";
      var arch = process.env.npm_config_arch || os.arch();
      var platform = process.env.npm_config_platform || os.platform();
      var libc = process.env.LIBC || (isAlpine(platform) ? "musl" : "glibc");
      var armv = process.env.ARM_VERSION || (arch === "arm64" ? "8" : vars.arm_version) || "";
      var uv = (process.versions.uv || "").split(".")[0];
      module.exports = load;
      function load(dir) {
        return runtimeRequire(load.path(dir));
      }
      load.path = function(dir) {
        dir = path.resolve(dir || ".");
        try {
          var name = runtimeRequire(path.join(dir, "package.json")).name.toUpperCase().replace(/-/g, "_");
          if (process.env[name + "_PREBUILD"])
            dir = process.env[name + "_PREBUILD"];
        } catch (err) {
        }
        if (!prebuildsOnly) {
          var release = getFirst(path.join(dir, "build/Release"), matchBuild);
          if (release)
            return release;
          var debug = getFirst(path.join(dir, "build/Debug"), matchBuild);
          if (debug)
            return debug;
        }
        var prebuild = resolve(dir);
        if (prebuild)
          return prebuild;
        var nearby = resolve(path.dirname(process.execPath));
        if (nearby)
          return nearby;
        var target2 = [
          "platform=" + platform,
          "arch=" + arch,
          "runtime=" + runtime,
          "abi=" + abi,
          "uv=" + uv,
          armv ? "armv=" + armv : "",
          "libc=" + libc,
          "node=" + process.versions.node,
          process.versions.electron ? "electron=" + process.versions.electron : "",
          typeof __webpack_require__ === "function" ? "webpack=true" : ""
        ].filter(Boolean).join(" ");
        throw new Error("No native build was found for " + target2 + "\n    loaded from: " + dir + "\n");
        function resolve(dir2) {
          var tuples = readdirSync(path.join(dir2, "prebuilds")).map(parseTuple);
          var tuple = tuples.filter(matchTuple(platform, arch)).sort(compareTuples)[0];
          if (!tuple)
            return;
          var prebuilds = path.join(dir2, "prebuilds", tuple.name);
          var parsed = readdirSync(prebuilds).map(parseTags);
          var candidates = parsed.filter(matchTags(runtime, abi));
          var winner = candidates.sort(compareTags(runtime))[0];
          if (winner)
            return path.join(prebuilds, winner.file);
        }
      };
      function readdirSync(dir) {
        try {
          return fs.readdirSync(dir);
        } catch (err) {
          return [];
        }
      }
      function getFirst(dir, filter) {
        var files = readdirSync(dir).filter(filter);
        return files[0] && path.join(dir, files[0]);
      }
      function matchBuild(name) {
        return /\.node$/.test(name);
      }
      function parseTuple(name) {
        var arr = name.split("-");
        if (arr.length !== 2)
          return;
        var platform2 = arr[0];
        var architectures = arr[1].split("+");
        if (!platform2)
          return;
        if (!architectures.length)
          return;
        if (!architectures.every(Boolean))
          return;
        return { name, platform: platform2, architectures };
      }
      function matchTuple(platform2, arch2) {
        return function(tuple) {
          if (tuple == null)
            return false;
          if (tuple.platform !== platform2)
            return false;
          return tuple.architectures.includes(arch2);
        };
      }
      function compareTuples(a, b) {
        return a.architectures.length - b.architectures.length;
      }
      function parseTags(file) {
        var arr = file.split(".");
        var extension = arr.pop();
        var tags = { file, specificity: 0 };
        if (extension !== "node")
          return;
        for (var i = 0; i < arr.length; i++) {
          var tag = arr[i];
          if (tag === "node" || tag === "electron" || tag === "node-webkit") {
            tags.runtime = tag;
          } else if (tag === "napi") {
            tags.napi = true;
          } else if (tag.slice(0, 3) === "abi") {
            tags.abi = tag.slice(3);
          } else if (tag.slice(0, 2) === "uv") {
            tags.uv = tag.slice(2);
          } else if (tag.slice(0, 4) === "armv") {
            tags.armv = tag.slice(4);
          } else if (tag === "glibc" || tag === "musl") {
            tags.libc = tag;
          } else {
            continue;
          }
          tags.specificity++;
        }
        return tags;
      }
      function matchTags(runtime2, abi2) {
        return function(tags) {
          if (tags == null)
            return false;
          if (tags.runtime !== runtime2 && !runtimeAgnostic(tags))
            return false;
          if (tags.abi !== abi2 && !tags.napi)
            return false;
          if (tags.uv && tags.uv !== uv)
            return false;
          if (tags.armv && tags.armv !== armv)
            return false;
          if (tags.libc && tags.libc !== libc)
            return false;
          return true;
        };
      }
      function runtimeAgnostic(tags) {
        return tags.runtime === "node" && tags.napi;
      }
      function compareTags(runtime2) {
        return function(a, b) {
          if (a.runtime !== b.runtime) {
            return a.runtime === runtime2 ? -1 : 1;
          } else if (a.abi !== b.abi) {
            return a.abi ? -1 : 1;
          } else if (a.specificity !== b.specificity) {
            return a.specificity > b.specificity ? -1 : 1;
          } else {
            return 0;
          }
        };
      }
      function isNwjs() {
        return !!(process.versions && process.versions.nw);
      }
      function isElectron() {
        if (process.versions && process.versions.electron)
          return true;
        if (process.env.ELECTRON_RUN_AS_NODE)
          return true;
        return typeof window !== "undefined" && window.process && window.process.type === "renderer";
      }
      function isAlpine(platform2) {
        return platform2 === "linux" && fs.existsSync("/etc/alpine-release");
      }
      load.parseTags = parseTags;
      load.matchTags = matchTags;
      load.compareTags = compareTags;
      load.parseTuple = parseTuple;
      load.matchTuple = matchTuple;
      load.compareTuples = compareTuples;
    }
  });

  // node_modules/udx-native/lib/binding.js
  var require_binding = __commonJS({
    "node_modules/udx-native/lib/binding.js"(exports, module) {
      var path = __require("path");
      var load = require_node_gyp_build();
      module.exports = load(path.join(__dirname, ".."));
    }
  });

  // node_modules/udx-native/lib/ip.js
  var require_ip = __commonJS({
    "node_modules/udx-native/lib/ip.js"(exports) {
      var v4Seg = "(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])";
      var v4Str = `(${v4Seg}[.]){3}${v4Seg}`;
      var IPv4Pattern = new RegExp(`^${v4Str}$`);
      var v6Seg = "(?:[0-9a-fA-F]{1,4})";
      var IPv6Pattern = new RegExp(`^((?:${v6Seg}:){7}(?:${v6Seg}|:)|(?:${v6Seg}:){6}(?:${v4Str}|:${v6Seg}|:)|(?:${v6Seg}:){5}(?::${v4Str}|(:${v6Seg}){1,2}|:)|(?:${v6Seg}:){4}(?:(:${v6Seg}){0,1}:${v4Str}|(:${v6Seg}){1,3}|:)|(?:${v6Seg}:){3}(?:(:${v6Seg}){0,2}:${v4Str}|(:${v6Seg}){1,4}|:)|(?:${v6Seg}:){2}(?:(:${v6Seg}){0,3}:${v4Str}|(:${v6Seg}){1,5}|:)|(?:${v6Seg}:){1}(?:(:${v6Seg}){0,4}:${v4Str}|(:${v6Seg}){1,6}|:)|(?::((?::${v6Seg}){0,5}:${v4Str}|(?::${v6Seg}){1,7}|:)))(%[0-9a-zA-Z-.:]{1,})?$`);
      var isIPv4 = exports.isIPv4 = function isIPv42(host) {
        return IPv4Pattern.test(host);
      };
      var isIPv6 = exports.isIPv6 = function isIPv62(host) {
        return IPv6Pattern.test(host);
      };
      exports.isIP = function isIP(host) {
        if (isIPv4(host))
          return 4;
        if (isIPv6(host))
          return 6;
        return 0;
      };
    }
  });

  // node_modules/udx-native/lib/socket.js
  var require_socket = __commonJS({
    "node_modules/udx-native/lib/socket.js"(exports, module) {
      var events = __require("events");
      var b4a = require_b4a();
      var binding = require_binding();
      var ip = require_ip();
      module.exports = class UDXSocket extends events.EventEmitter {
        constructor(udx) {
          super();
          this.udx = udx;
          this._handle = b4a.allocUnsafe(binding.sizeof_udx_napi_socket_t);
          this._inited = false;
          this._host = null;
          this._family = 0;
          this._port = 0;
          this._reqs = [];
          this._free = [];
          this._closing = null;
          this._closed = false;
          this.streams = /* @__PURE__ */ new Set();
          this.userData = null;
        }
        static isIPv4(host) {
          return ip.isIPv4(host);
        }
        static isIPv6(host) {
          return ip.isIPv6(host);
        }
        static isIP(host) {
          return ip.isIP(host);
        }
        get bound() {
          return this._port !== 0;
        }
        get closing() {
          return this._closing !== null;
        }
        get idle() {
          return this.streams.size === 0;
        }
        get busy() {
          return this.streams.size > 0;
        }
        _init() {
          if (this._inited)
            return;
          binding.udx_napi_socket_init(
            this.udx._handle,
            this._handle,
            this,
            this._onsend,
            this._onmessage,
            this._onclose
          );
          this._inited = true;
        }
        _onsend(id, err) {
          const req = this._reqs[id];
          const onflush = req.onflush;
          req.buffer = null;
          req.onflush = null;
          this._free.push(id);
          onflush(err >= 0);
          if (this._free.length >= 16 && this._free.length === this._reqs.length) {
            this._free = [];
            this._reqs = [];
          }
        }
        _onmessage(buf, port, host, family) {
          this.emit("message", buf, { host, family, port });
        }
        _onclose() {
          this._handle = null;
          this.emit("close");
        }
        _onidle() {
          this.emit("idle");
        }
        _onbusy() {
          this.emit("busy");
        }
        _addStream(stream) {
          if (this.idle)
            this._onbusy();
          this.streams.add(stream);
        }
        _removeStream(stream) {
          this.streams.delete(stream);
          const closed = this._closeMaybe();
          if (this.idle && !closed)
            this._onidle();
        }
        address() {
          if (!this.bound)
            return null;
          return { host: this._host, family: this._family, port: this._port };
        }
        bind(port, host) {
          if (this.bound)
            throw new Error("Already bound");
          if (this.closing)
            throw new Error("Socket is closed");
          if (!port)
            port = 0;
          if (!host)
            host = "0.0.0.0";
          const family = ip.isIP(host);
          if (!family)
            throw new Error(`${host} is not a valid IP address`);
          if (!this._inited)
            this._init();
          this._port = binding.udx_napi_socket_bind(this._handle, port, host, family);
          this._host = host;
          this._family = family;
          this.emit("listening");
        }
        async close() {
          if (this._closing)
            return this._closing;
          this._closing = this._inited && this.idle ? events.once(this, "close") : Promise.resolve(true);
          this._closeMaybe();
          return this._closing;
        }
        _closeMaybe() {
          if (!this._closed && this._inited && this.closing && this.idle) {
            binding.udx_napi_socket_close(this._handle);
            this._closed = true;
          }
          return this._closed;
        }
        setTTL(ttl) {
          if (!this._inited)
            throw new Error("Socket not active");
          binding.udx_napi_socket_set_ttl(this._handle, ttl);
        }
        getRecvBufferSize() {
          if (!this._inited)
            throw new Error("Socket not active");
          return binding.udx_napi_socket_get_recv_buffer_size(this._handle);
        }
        setRecvBufferSize(size) {
          if (!this._inited)
            throw new Error("Socket not active");
          return binding.udx_napi_socket_set_recv_buffer_size(this._handle, size);
        }
        getSendBufferSize() {
          if (!this._inited)
            throw new Error("Socket not active");
          return binding.udx_napi_socket_get_send_buffer_size(this._handle);
        }
        setSendBufferSize(size) {
          if (!this._inited)
            throw new Error("Socket not active");
          return binding.udx_napi_socket_set_send_buffer_size(this._handle, size);
        }
        async send(buffer, port, host, ttl) {
          if (this.closing)
            return false;
          if (!host)
            host = "127.0.0.1";
          const family = ip.isIP(host);
          if (!family)
            throw new Error(`${host} is not a valid IP address`);
          if (!this.bound)
            this.bind(0);
          const id = this._allocSend();
          const req = this._reqs[id];
          req.buffer = buffer;
          const promise = new Promise((resolve) => {
            req.onflush = resolve;
          });
          binding.udx_napi_socket_send_ttl(this._handle, req.handle, id, buffer, port, host, family, ttl || 0);
          return promise;
        }
        trySend(buffer, port, host, ttl) {
          if (this.closing)
            return;
          if (!host)
            host = "127.0.0.1";
          const family = ip.isIP(host);
          if (!family)
            throw new Error(`${host} is not a valid IP address`);
          if (!this.bound)
            this.bind(0);
          const id = this._allocSend();
          const req = this._reqs[id];
          req.buffer = buffer;
          req.onflush = noop;
          binding.udx_napi_socket_send_ttl(this._handle, req.handle, id, buffer, port, host, family, ttl || 0);
        }
        _allocSend() {
          if (this._free.length > 0)
            return this._free.pop();
          const handle = b4a.allocUnsafe(binding.sizeof_udx_socket_send_t);
          return this._reqs.push({ handle, buffer: null, onflush: null }) - 1;
        }
      };
      function noop() {
      }
    }
  });

  // node_modules/queue-tick/process-next-tick.js
  var require_process_next_tick = __commonJS({
    "node_modules/queue-tick/process-next-tick.js"(exports, module) {
      module.exports = process.nextTick.bind(process);
    }
  });

  // node_modules/fast-fifo/fixed-size.js
  var require_fixed_size = __commonJS({
    "node_modules/fast-fifo/fixed-size.js"(exports, module) {
      module.exports = class FixedFIFO {
        constructor(hwm) {
          if (!(hwm > 0) || (hwm - 1 & hwm) !== 0)
            throw new Error("Max size for a FixedFIFO should be a power of two");
          this.buffer = new Array(hwm);
          this.mask = hwm - 1;
          this.top = 0;
          this.btm = 0;
          this.next = null;
        }
        push(data) {
          if (this.buffer[this.top] !== void 0)
            return false;
          this.buffer[this.top] = data;
          this.top = this.top + 1 & this.mask;
          return true;
        }
        shift() {
          const last = this.buffer[this.btm];
          if (last === void 0)
            return void 0;
          this.buffer[this.btm] = void 0;
          this.btm = this.btm + 1 & this.mask;
          return last;
        }
        peek() {
          return this.buffer[this.btm];
        }
        isEmpty() {
          return this.buffer[this.btm] === void 0;
        }
      };
    }
  });

  // node_modules/fast-fifo/index.js
  var require_fast_fifo = __commonJS({
    "node_modules/fast-fifo/index.js"(exports, module) {
      var FixedFIFO = require_fixed_size();
      module.exports = class FastFIFO {
        constructor(hwm) {
          this.hwm = hwm || 16;
          this.head = new FixedFIFO(this.hwm);
          this.tail = this.head;
        }
        push(val) {
          if (!this.head.push(val)) {
            const prev = this.head;
            this.head = prev.next = new FixedFIFO(2 * this.head.buffer.length);
            this.head.push(val);
          }
        }
        shift() {
          const val = this.tail.shift();
          if (val === void 0 && this.tail.next) {
            const next = this.tail.next;
            this.tail.next = null;
            this.tail = next;
            return this.tail.shift();
          }
          return val;
        }
        peek() {
          return this.tail.peek();
        }
        isEmpty() {
          return this.head.isEmpty();
        }
      };
    }
  });

  // node_modules/streamx/index.js
  var require_streamx = __commonJS({
    "node_modules/streamx/index.js"(exports, module) {
      var { EventEmitter } = __require("events");
      var STREAM_DESTROYED = new Error("Stream was destroyed");
      var PREMATURE_CLOSE = new Error("Premature close");
      var queueTick = require_process_next_tick();
      var FIFO = require_fast_fifo();
      var MAX = (1 << 25) - 1;
      var OPENING = 1;
      var DESTROYING = 2;
      var DESTROYED = 4;
      var NOT_OPENING = MAX ^ OPENING;
      var READ_ACTIVE = 1 << 3;
      var READ_PRIMARY = 2 << 3;
      var READ_SYNC = 4 << 3;
      var READ_QUEUED = 8 << 3;
      var READ_RESUMED = 16 << 3;
      var READ_PIPE_DRAINED = 32 << 3;
      var READ_ENDING = 64 << 3;
      var READ_EMIT_DATA = 128 << 3;
      var READ_EMIT_READABLE = 256 << 3;
      var READ_EMITTED_READABLE = 512 << 3;
      var READ_DONE = 1024 << 3;
      var READ_NEXT_TICK = 2049 << 3;
      var READ_NEEDS_PUSH = 4096 << 3;
      var READ_NOT_ACTIVE = MAX ^ READ_ACTIVE;
      var READ_NON_PRIMARY = MAX ^ READ_PRIMARY;
      var READ_NON_PRIMARY_AND_PUSHED = MAX ^ (READ_PRIMARY | READ_NEEDS_PUSH);
      var READ_NOT_SYNC = MAX ^ READ_SYNC;
      var READ_PUSHED = MAX ^ READ_NEEDS_PUSH;
      var READ_PAUSED = MAX ^ READ_RESUMED;
      var READ_NOT_QUEUED = MAX ^ (READ_QUEUED | READ_EMITTED_READABLE);
      var READ_NOT_ENDING = MAX ^ READ_ENDING;
      var READ_PIPE_NOT_DRAINED = MAX ^ (READ_RESUMED | READ_PIPE_DRAINED);
      var READ_NOT_NEXT_TICK = MAX ^ READ_NEXT_TICK;
      var WRITE_ACTIVE = 1 << 16;
      var WRITE_PRIMARY = 2 << 16;
      var WRITE_SYNC = 4 << 16;
      var WRITE_QUEUED = 8 << 16;
      var WRITE_UNDRAINED = 16 << 16;
      var WRITE_DONE = 32 << 16;
      var WRITE_EMIT_DRAIN = 64 << 16;
      var WRITE_NEXT_TICK = 129 << 16;
      var WRITE_FINISHING = 256 << 16;
      var WRITE_NOT_ACTIVE = MAX ^ WRITE_ACTIVE;
      var WRITE_NOT_SYNC = MAX ^ WRITE_SYNC;
      var WRITE_NON_PRIMARY = MAX ^ WRITE_PRIMARY;
      var WRITE_NOT_FINISHING = MAX ^ WRITE_FINISHING;
      var WRITE_DRAINED = MAX ^ WRITE_UNDRAINED;
      var WRITE_NOT_QUEUED = MAX ^ WRITE_QUEUED;
      var WRITE_NOT_NEXT_TICK = MAX ^ WRITE_NEXT_TICK;
      var ACTIVE = READ_ACTIVE | WRITE_ACTIVE;
      var NOT_ACTIVE = MAX ^ ACTIVE;
      var DONE = READ_DONE | WRITE_DONE;
      var DESTROY_STATUS = DESTROYING | DESTROYED;
      var OPEN_STATUS = DESTROY_STATUS | OPENING;
      var AUTO_DESTROY = DESTROY_STATUS | DONE;
      var NON_PRIMARY = WRITE_NON_PRIMARY & READ_NON_PRIMARY;
      var TICKING = (WRITE_NEXT_TICK | READ_NEXT_TICK) & NOT_ACTIVE;
      var ACTIVE_OR_TICKING = ACTIVE | TICKING;
      var IS_OPENING = OPEN_STATUS | TICKING;
      var READ_PRIMARY_STATUS = OPEN_STATUS | READ_ENDING | READ_DONE;
      var READ_STATUS = OPEN_STATUS | READ_DONE | READ_QUEUED;
      var READ_FLOWING = READ_RESUMED | READ_PIPE_DRAINED;
      var READ_ACTIVE_AND_SYNC = READ_ACTIVE | READ_SYNC;
      var READ_ACTIVE_AND_SYNC_AND_NEEDS_PUSH = READ_ACTIVE | READ_SYNC | READ_NEEDS_PUSH;
      var READ_PRIMARY_AND_ACTIVE = READ_PRIMARY | READ_ACTIVE;
      var READ_ENDING_STATUS = OPEN_STATUS | READ_ENDING | READ_QUEUED;
      var READ_EMIT_READABLE_AND_QUEUED = READ_EMIT_READABLE | READ_QUEUED;
      var READ_READABLE_STATUS = OPEN_STATUS | READ_EMIT_READABLE | READ_QUEUED | READ_EMITTED_READABLE;
      var SHOULD_NOT_READ = OPEN_STATUS | READ_ACTIVE | READ_ENDING | READ_DONE | READ_NEEDS_PUSH;
      var READ_BACKPRESSURE_STATUS = DESTROY_STATUS | READ_ENDING | READ_DONE;
      var WRITE_PRIMARY_STATUS = OPEN_STATUS | WRITE_FINISHING | WRITE_DONE;
      var WRITE_QUEUED_AND_UNDRAINED = WRITE_QUEUED | WRITE_UNDRAINED;
      var WRITE_QUEUED_AND_ACTIVE = WRITE_QUEUED | WRITE_ACTIVE;
      var WRITE_DRAIN_STATUS = WRITE_QUEUED | WRITE_UNDRAINED | OPEN_STATUS | WRITE_ACTIVE;
      var WRITE_STATUS = OPEN_STATUS | WRITE_ACTIVE | WRITE_QUEUED;
      var WRITE_PRIMARY_AND_ACTIVE = WRITE_PRIMARY | WRITE_ACTIVE;
      var WRITE_ACTIVE_AND_SYNC = WRITE_ACTIVE | WRITE_SYNC;
      var WRITE_FINISHING_STATUS = OPEN_STATUS | WRITE_FINISHING | WRITE_QUEUED_AND_ACTIVE | WRITE_DONE;
      var WRITE_BACKPRESSURE_STATUS = WRITE_UNDRAINED | DESTROY_STATUS | WRITE_FINISHING | WRITE_DONE;
      var asyncIterator = Symbol.asyncIterator || Symbol("asyncIterator");
      var WritableState = class {
        constructor(stream, { highWaterMark = 16384, map = null, mapWritable, byteLength, byteLengthWritable } = {}) {
          this.stream = stream;
          this.queue = new FIFO();
          this.highWaterMark = highWaterMark;
          this.buffered = 0;
          this.error = null;
          this.pipeline = null;
          this.byteLength = byteLengthWritable || byteLength || defaultByteLength;
          this.map = mapWritable || map;
          this.afterWrite = afterWrite.bind(this);
          this.afterUpdateNextTick = updateWriteNT.bind(this);
        }
        get ended() {
          return (this.stream._duplexState & WRITE_DONE) !== 0;
        }
        push(data) {
          if (this.map !== null)
            data = this.map(data);
          this.buffered += this.byteLength(data);
          this.queue.push(data);
          if (this.buffered < this.highWaterMark) {
            this.stream._duplexState |= WRITE_QUEUED;
            return true;
          }
          this.stream._duplexState |= WRITE_QUEUED_AND_UNDRAINED;
          return false;
        }
        shift() {
          const data = this.queue.shift();
          const stream = this.stream;
          this.buffered -= this.byteLength(data);
          if (this.buffered === 0)
            stream._duplexState &= WRITE_NOT_QUEUED;
          return data;
        }
        end(data) {
          if (typeof data === "function")
            this.stream.once("finish", data);
          else if (data !== void 0 && data !== null)
            this.push(data);
          this.stream._duplexState = (this.stream._duplexState | WRITE_FINISHING) & WRITE_NON_PRIMARY;
        }
        autoBatch(data, cb) {
          const buffer = [];
          const stream = this.stream;
          buffer.push(data);
          while ((stream._duplexState & WRITE_STATUS) === WRITE_QUEUED_AND_ACTIVE) {
            buffer.push(stream._writableState.shift());
          }
          if ((stream._duplexState & OPEN_STATUS) !== 0)
            return cb(null);
          stream._writev(buffer, cb);
        }
        update() {
          const stream = this.stream;
          while ((stream._duplexState & WRITE_STATUS) === WRITE_QUEUED) {
            const data = this.shift();
            stream._duplexState |= WRITE_ACTIVE_AND_SYNC;
            stream._write(data, this.afterWrite);
            stream._duplexState &= WRITE_NOT_SYNC;
          }
          if ((stream._duplexState & WRITE_PRIMARY_AND_ACTIVE) === 0)
            this.updateNonPrimary();
        }
        updateNonPrimary() {
          const stream = this.stream;
          if ((stream._duplexState & WRITE_FINISHING_STATUS) === WRITE_FINISHING) {
            stream._duplexState = (stream._duplexState | WRITE_ACTIVE) & WRITE_NOT_FINISHING;
            stream._final(afterFinal.bind(this));
            return;
          }
          if ((stream._duplexState & DESTROY_STATUS) === DESTROYING) {
            if ((stream._duplexState & ACTIVE_OR_TICKING) === 0) {
              stream._duplexState |= ACTIVE;
              stream._destroy(afterDestroy.bind(this));
            }
            return;
          }
          if ((stream._duplexState & IS_OPENING) === OPENING) {
            stream._duplexState = (stream._duplexState | ACTIVE) & NOT_OPENING;
            stream._open(afterOpen.bind(this));
          }
        }
        updateNextTick() {
          if ((this.stream._duplexState & WRITE_NEXT_TICK) !== 0)
            return;
          this.stream._duplexState |= WRITE_NEXT_TICK;
          queueTick(this.afterUpdateNextTick);
        }
      };
      var ReadableState = class {
        constructor(stream, { highWaterMark = 16384, map = null, mapReadable, byteLength, byteLengthReadable } = {}) {
          this.stream = stream;
          this.queue = new FIFO();
          this.highWaterMark = highWaterMark;
          this.buffered = 0;
          this.error = null;
          this.pipeline = null;
          this.byteLength = byteLengthReadable || byteLength || defaultByteLength;
          this.map = mapReadable || map;
          this.pipeTo = null;
          this.afterRead = afterRead.bind(this);
          this.afterUpdateNextTick = updateReadNT.bind(this);
        }
        get ended() {
          return (this.stream._duplexState & READ_DONE) !== 0;
        }
        pipe(pipeTo, cb) {
          if (this.pipeTo !== null)
            throw new Error("Can only pipe to one destination");
          if (typeof cb !== "function")
            cb = null;
          this.stream._duplexState |= READ_PIPE_DRAINED;
          this.pipeTo = pipeTo;
          this.pipeline = new Pipeline(this.stream, pipeTo, cb);
          if (cb)
            this.stream.on("error", noop);
          if (isStreamx(pipeTo)) {
            pipeTo._writableState.pipeline = this.pipeline;
            if (cb)
              pipeTo.on("error", noop);
            pipeTo.on("finish", this.pipeline.finished.bind(this.pipeline));
          } else {
            const onerror = this.pipeline.done.bind(this.pipeline, pipeTo);
            const onclose = this.pipeline.done.bind(this.pipeline, pipeTo, null);
            pipeTo.on("error", onerror);
            pipeTo.on("close", onclose);
            pipeTo.on("finish", this.pipeline.finished.bind(this.pipeline));
          }
          pipeTo.on("drain", afterDrain.bind(this));
          this.stream.emit("piping", pipeTo);
          pipeTo.emit("pipe", this.stream);
        }
        push(data) {
          const stream = this.stream;
          if (data === null) {
            this.highWaterMark = 0;
            stream._duplexState = (stream._duplexState | READ_ENDING) & READ_NON_PRIMARY_AND_PUSHED;
            return false;
          }
          if (this.map !== null)
            data = this.map(data);
          this.buffered += this.byteLength(data);
          this.queue.push(data);
          stream._duplexState = (stream._duplexState | READ_QUEUED) & READ_PUSHED;
          return this.buffered < this.highWaterMark;
        }
        shift() {
          const data = this.queue.shift();
          this.buffered -= this.byteLength(data);
          if (this.buffered === 0)
            this.stream._duplexState &= READ_NOT_QUEUED;
          return data;
        }
        unshift(data) {
          let tail;
          const pending = [];
          while ((tail = this.queue.shift()) !== void 0) {
            pending.push(tail);
          }
          this.push(data);
          for (let i = 0; i < pending.length; i++) {
            this.queue.push(pending[i]);
          }
        }
        read() {
          const stream = this.stream;
          if ((stream._duplexState & READ_STATUS) === READ_QUEUED) {
            const data = this.shift();
            if (this.pipeTo !== null && this.pipeTo.write(data) === false)
              stream._duplexState &= READ_PIPE_NOT_DRAINED;
            if ((stream._duplexState & READ_EMIT_DATA) !== 0)
              stream.emit("data", data);
            return data;
          }
          return null;
        }
        drain() {
          const stream = this.stream;
          while ((stream._duplexState & READ_STATUS) === READ_QUEUED && (stream._duplexState & READ_FLOWING) !== 0) {
            const data = this.shift();
            if (this.pipeTo !== null && this.pipeTo.write(data) === false)
              stream._duplexState &= READ_PIPE_NOT_DRAINED;
            if ((stream._duplexState & READ_EMIT_DATA) !== 0)
              stream.emit("data", data);
          }
        }
        update() {
          const stream = this.stream;
          this.drain();
          while (this.buffered < this.highWaterMark && (stream._duplexState & SHOULD_NOT_READ) === 0) {
            stream._duplexState |= READ_ACTIVE_AND_SYNC_AND_NEEDS_PUSH;
            stream._read(this.afterRead);
            stream._duplexState &= READ_NOT_SYNC;
            if ((stream._duplexState & READ_ACTIVE) === 0)
              this.drain();
          }
          if ((stream._duplexState & READ_READABLE_STATUS) === READ_EMIT_READABLE_AND_QUEUED) {
            stream._duplexState |= READ_EMITTED_READABLE;
            stream.emit("readable");
          }
          if ((stream._duplexState & READ_PRIMARY_AND_ACTIVE) === 0)
            this.updateNonPrimary();
        }
        updateNonPrimary() {
          const stream = this.stream;
          if ((stream._duplexState & READ_ENDING_STATUS) === READ_ENDING) {
            stream._duplexState = (stream._duplexState | READ_DONE) & READ_NOT_ENDING;
            stream.emit("end");
            if ((stream._duplexState & AUTO_DESTROY) === DONE)
              stream._duplexState |= DESTROYING;
            if (this.pipeTo !== null)
              this.pipeTo.end();
          }
          if ((stream._duplexState & DESTROY_STATUS) === DESTROYING) {
            if ((stream._duplexState & ACTIVE_OR_TICKING) === 0) {
              stream._duplexState |= ACTIVE;
              stream._destroy(afterDestroy.bind(this));
            }
            return;
          }
          if ((stream._duplexState & IS_OPENING) === OPENING) {
            stream._duplexState = (stream._duplexState | ACTIVE) & NOT_OPENING;
            stream._open(afterOpen.bind(this));
          }
        }
        updateNextTick() {
          if ((this.stream._duplexState & READ_NEXT_TICK) !== 0)
            return;
          this.stream._duplexState |= READ_NEXT_TICK;
          queueTick(this.afterUpdateNextTick);
        }
      };
      var TransformState = class {
        constructor(stream) {
          this.data = null;
          this.afterTransform = afterTransform.bind(stream);
          this.afterFinal = null;
        }
      };
      var Pipeline = class {
        constructor(src2, dst, cb) {
          this.from = src2;
          this.to = dst;
          this.afterPipe = cb;
          this.error = null;
          this.pipeToFinished = false;
        }
        finished() {
          this.pipeToFinished = true;
        }
        done(stream, err) {
          if (err)
            this.error = err;
          if (stream === this.to) {
            this.to = null;
            if (this.from !== null) {
              if ((this.from._duplexState & READ_DONE) === 0 || !this.pipeToFinished) {
                this.from.destroy(this.error || new Error("Writable stream closed prematurely"));
              }
              return;
            }
          }
          if (stream === this.from) {
            this.from = null;
            if (this.to !== null) {
              if ((stream._duplexState & READ_DONE) === 0) {
                this.to.destroy(this.error || new Error("Readable stream closed before ending"));
              }
              return;
            }
          }
          if (this.afterPipe !== null)
            this.afterPipe(this.error);
          this.to = this.from = this.afterPipe = null;
        }
      };
      function afterDrain() {
        this.stream._duplexState |= READ_PIPE_DRAINED;
        if ((this.stream._duplexState & READ_ACTIVE_AND_SYNC) === 0)
          this.updateNextTick();
        else
          this.drain();
      }
      function afterFinal(err) {
        const stream = this.stream;
        if (err)
          stream.destroy(err);
        if ((stream._duplexState & DESTROY_STATUS) === 0) {
          stream._duplexState |= WRITE_DONE;
          stream.emit("finish");
        }
        if ((stream._duplexState & AUTO_DESTROY) === DONE) {
          stream._duplexState |= DESTROYING;
        }
        stream._duplexState &= WRITE_NOT_ACTIVE;
        this.update();
      }
      function afterDestroy(err) {
        const stream = this.stream;
        if (!err && this.error !== STREAM_DESTROYED)
          err = this.error;
        if (err)
          stream.emit("error", err);
        stream._duplexState |= DESTROYED;
        stream.emit("close");
        const rs = stream._readableState;
        const ws = stream._writableState;
        if (rs !== null && rs.pipeline !== null)
          rs.pipeline.done(stream, err);
        if (ws !== null && ws.pipeline !== null)
          ws.pipeline.done(stream, err);
      }
      function afterWrite(err) {
        const stream = this.stream;
        if (err)
          stream.destroy(err);
        stream._duplexState &= WRITE_NOT_ACTIVE;
        if ((stream._duplexState & WRITE_DRAIN_STATUS) === WRITE_UNDRAINED) {
          stream._duplexState &= WRITE_DRAINED;
          if ((stream._duplexState & WRITE_EMIT_DRAIN) === WRITE_EMIT_DRAIN) {
            stream.emit("drain");
          }
        }
        if ((stream._duplexState & WRITE_SYNC) === 0)
          this.update();
      }
      function afterRead(err) {
        if (err)
          this.stream.destroy(err);
        this.stream._duplexState &= READ_NOT_ACTIVE;
        if ((this.stream._duplexState & READ_SYNC) === 0)
          this.update();
      }
      function updateReadNT() {
        this.stream._duplexState &= READ_NOT_NEXT_TICK;
        this.update();
      }
      function updateWriteNT() {
        this.stream._duplexState &= WRITE_NOT_NEXT_TICK;
        this.update();
      }
      function afterOpen(err) {
        const stream = this.stream;
        if (err)
          stream.destroy(err);
        if ((stream._duplexState & DESTROYING) === 0) {
          if ((stream._duplexState & READ_PRIMARY_STATUS) === 0)
            stream._duplexState |= READ_PRIMARY;
          if ((stream._duplexState & WRITE_PRIMARY_STATUS) === 0)
            stream._duplexState |= WRITE_PRIMARY;
          stream.emit("open");
        }
        stream._duplexState &= NOT_ACTIVE;
        if (stream._writableState !== null) {
          stream._writableState.update();
        }
        if (stream._readableState !== null) {
          stream._readableState.update();
        }
      }
      function afterTransform(err, data) {
        if (data !== void 0 && data !== null)
          this.push(data);
        this._writableState.afterWrite(err);
      }
      var Stream = class extends EventEmitter {
        constructor(opts) {
          super();
          this._duplexState = 0;
          this._readableState = null;
          this._writableState = null;
          if (opts) {
            if (opts.open)
              this._open = opts.open;
            if (opts.destroy)
              this._destroy = opts.destroy;
            if (opts.predestroy)
              this._predestroy = opts.predestroy;
            if (opts.signal) {
              opts.signal.addEventListener("abort", abort.bind(this));
            }
          }
        }
        _open(cb) {
          cb(null);
        }
        _destroy(cb) {
          cb(null);
        }
        _predestroy() {
        }
        get readable() {
          return this._readableState !== null ? true : void 0;
        }
        get writable() {
          return this._writableState !== null ? true : void 0;
        }
        get destroyed() {
          return (this._duplexState & DESTROYED) !== 0;
        }
        get destroying() {
          return (this._duplexState & DESTROY_STATUS) !== 0;
        }
        destroy(err) {
          if ((this._duplexState & DESTROY_STATUS) === 0) {
            if (!err)
              err = STREAM_DESTROYED;
            this._duplexState = (this._duplexState | DESTROYING) & NON_PRIMARY;
            if (this._readableState !== null) {
              this._readableState.error = err;
              this._readableState.updateNextTick();
            }
            if (this._writableState !== null) {
              this._writableState.error = err;
              this._writableState.updateNextTick();
            }
            this._predestroy();
          }
        }
        on(name, fn) {
          if (this._readableState !== null) {
            if (name === "data") {
              this._duplexState |= READ_EMIT_DATA | READ_RESUMED;
              this._readableState.updateNextTick();
            }
            if (name === "readable") {
              this._duplexState |= READ_EMIT_READABLE;
              this._readableState.updateNextTick();
            }
          }
          if (this._writableState !== null) {
            if (name === "drain") {
              this._duplexState |= WRITE_EMIT_DRAIN;
              this._writableState.updateNextTick();
            }
          }
          return super.on(name, fn);
        }
      };
      var Readable = class extends Stream {
        constructor(opts) {
          super(opts);
          this._duplexState |= OPENING | WRITE_DONE;
          this._readableState = new ReadableState(this, opts);
          if (opts) {
            if (opts.read)
              this._read = opts.read;
            if (opts.eagerOpen)
              this.resume().pause();
          }
        }
        _read(cb) {
          cb(null);
        }
        pipe(dest, cb) {
          this._readableState.pipe(dest, cb);
          this._readableState.updateNextTick();
          return dest;
        }
        read() {
          this._readableState.updateNextTick();
          return this._readableState.read();
        }
        push(data) {
          this._readableState.updateNextTick();
          return this._readableState.push(data);
        }
        unshift(data) {
          this._readableState.updateNextTick();
          return this._readableState.unshift(data);
        }
        resume() {
          this._duplexState |= READ_RESUMED;
          this._readableState.updateNextTick();
          return this;
        }
        pause() {
          this._duplexState &= READ_PAUSED;
          return this;
        }
        static _fromAsyncIterator(ite, opts) {
          let destroy;
          const rs = new Readable({
            ...opts,
            read(cb) {
              ite.next().then(push).then(cb.bind(null, null)).catch(cb);
            },
            predestroy() {
              destroy = ite.return();
            },
            destroy(cb) {
              if (!destroy)
                return cb(null);
              destroy.then(cb.bind(null, null)).catch(cb);
            }
          });
          return rs;
          function push(data) {
            if (data.done)
              rs.push(null);
            else
              rs.push(data.value);
          }
        }
        static from(data, opts) {
          if (isReadStreamx(data))
            return data;
          if (data[asyncIterator])
            return this._fromAsyncIterator(data[asyncIterator](), opts);
          if (!Array.isArray(data))
            data = data === void 0 ? [] : [data];
          let i = 0;
          return new Readable({
            ...opts,
            read(cb) {
              this.push(i === data.length ? null : data[i++]);
              cb(null);
            }
          });
        }
        static isBackpressured(rs) {
          return (rs._duplexState & READ_BACKPRESSURE_STATUS) !== 0 || rs._readableState.buffered >= rs._readableState.highWaterMark;
        }
        static isPaused(rs) {
          return (rs._duplexState & READ_RESUMED) === 0;
        }
        [asyncIterator]() {
          const stream = this;
          let error = null;
          let promiseResolve = null;
          let promiseReject = null;
          this.on("error", (err) => {
            error = err;
          });
          this.on("readable", onreadable);
          this.on("close", onclose);
          return {
            [asyncIterator]() {
              return this;
            },
            next() {
              return new Promise(function(resolve, reject) {
                promiseResolve = resolve;
                promiseReject = reject;
                const data = stream.read();
                if (data !== null)
                  ondata(data);
                else if ((stream._duplexState & DESTROYED) !== 0)
                  ondata(null);
              });
            },
            return() {
              return destroy(null);
            },
            throw(err) {
              return destroy(err);
            }
          };
          function onreadable() {
            if (promiseResolve !== null)
              ondata(stream.read());
          }
          function onclose() {
            if (promiseResolve !== null)
              ondata(null);
          }
          function ondata(data) {
            if (promiseReject === null)
              return;
            if (error)
              promiseReject(error);
            else if (data === null && (stream._duplexState & READ_DONE) === 0)
              promiseReject(STREAM_DESTROYED);
            else
              promiseResolve({ value: data, done: data === null });
            promiseReject = promiseResolve = null;
          }
          function destroy(err) {
            stream.destroy(err);
            return new Promise((resolve, reject) => {
              if (stream._duplexState & DESTROYED)
                return resolve({ value: void 0, done: true });
              stream.once("close", function() {
                if (err)
                  reject(err);
                else
                  resolve({ value: void 0, done: true });
              });
            });
          }
        }
      };
      var Writable = class extends Stream {
        constructor(opts) {
          super(opts);
          this._duplexState |= OPENING | READ_DONE;
          this._writableState = new WritableState(this, opts);
          if (opts) {
            if (opts.writev)
              this._writev = opts.writev;
            if (opts.write)
              this._write = opts.write;
            if (opts.final)
              this._final = opts.final;
          }
        }
        _writev(batch, cb) {
          cb(null);
        }
        _write(data, cb) {
          this._writableState.autoBatch(data, cb);
        }
        _final(cb) {
          cb(null);
        }
        static isBackpressured(ws) {
          return (ws._duplexState & WRITE_BACKPRESSURE_STATUS) !== 0;
        }
        write(data) {
          this._writableState.updateNextTick();
          return this._writableState.push(data);
        }
        end(data) {
          this._writableState.updateNextTick();
          this._writableState.end(data);
          return this;
        }
      };
      var Duplex = class extends Readable {
        constructor(opts) {
          super(opts);
          this._duplexState = OPENING;
          this._writableState = new WritableState(this, opts);
          if (opts) {
            if (opts.writev)
              this._writev = opts.writev;
            if (opts.write)
              this._write = opts.write;
            if (opts.final)
              this._final = opts.final;
          }
        }
        _writev(batch, cb) {
          cb(null);
        }
        _write(data, cb) {
          this._writableState.autoBatch(data, cb);
        }
        _final(cb) {
          cb(null);
        }
        write(data) {
          this._writableState.updateNextTick();
          return this._writableState.push(data);
        }
        end(data) {
          this._writableState.updateNextTick();
          this._writableState.end(data);
          return this;
        }
      };
      var Transform = class extends Duplex {
        constructor(opts) {
          super(opts);
          this._transformState = new TransformState(this);
          if (opts) {
            if (opts.transform)
              this._transform = opts.transform;
            if (opts.flush)
              this._flush = opts.flush;
          }
        }
        _write(data, cb) {
          if (this._readableState.buffered >= this._readableState.highWaterMark) {
            this._transformState.data = data;
          } else {
            this._transform(data, this._transformState.afterTransform);
          }
        }
        _read(cb) {
          if (this._transformState.data !== null) {
            const data = this._transformState.data;
            this._transformState.data = null;
            cb(null);
            this._transform(data, this._transformState.afterTransform);
          } else {
            cb(null);
          }
        }
        _transform(data, cb) {
          cb(null, data);
        }
        _flush(cb) {
          cb(null);
        }
        _final(cb) {
          this._transformState.afterFinal = cb;
          this._flush(transformAfterFlush.bind(this));
        }
      };
      var PassThrough = class extends Transform {
      };
      function transformAfterFlush(err, data) {
        const cb = this._transformState.afterFinal;
        if (err)
          return cb(err);
        if (data !== null && data !== void 0)
          this.push(data);
        this.push(null);
        cb(null);
      }
      function pipelinePromise(...streams) {
        return new Promise((resolve, reject) => {
          return pipeline(...streams, (err) => {
            if (err)
              return reject(err);
            resolve();
          });
        });
      }
      function pipeline(stream, ...streams) {
        const all = Array.isArray(stream) ? [...stream, ...streams] : [stream, ...streams];
        const done = all.length && typeof all[all.length - 1] === "function" ? all.pop() : null;
        if (all.length < 2)
          throw new Error("Pipeline requires at least 2 streams");
        let src2 = all[0];
        let dest = null;
        let error = null;
        for (let i = 1; i < all.length; i++) {
          dest = all[i];
          if (isStreamx(src2)) {
            src2.pipe(dest, onerror);
          } else {
            errorHandle(src2, true, i > 1, onerror);
            src2.pipe(dest);
          }
          src2 = dest;
        }
        if (done) {
          let fin = false;
          dest.on("finish", () => {
            fin = true;
          });
          dest.on("error", (err) => {
            error = error || err;
          });
          dest.on("close", () => done(error || (fin ? null : PREMATURE_CLOSE)));
        }
        return dest;
        function errorHandle(s, rd, wr, onerror2) {
          s.on("error", onerror2);
          s.on("close", onclose);
          function onclose() {
            if (rd && s._readableState && !s._readableState.ended)
              return onerror2(PREMATURE_CLOSE);
            if (wr && s._writableState && !s._writableState.ended)
              return onerror2(PREMATURE_CLOSE);
          }
        }
        function onerror(err) {
          if (!err || error)
            return;
          error = err;
          for (const s of all) {
            s.destroy(err);
          }
        }
      }
      function isStream(stream) {
        return !!stream._readableState || !!stream._writableState;
      }
      function isStreamx(stream) {
        return typeof stream._duplexState === "number" && isStream(stream);
      }
      function isReadStreamx(stream) {
        return isStreamx(stream) && stream.readable;
      }
      function isTypedArray(data) {
        return typeof data === "object" && data !== null && typeof data.byteLength === "number";
      }
      function defaultByteLength(data) {
        return isTypedArray(data) ? data.byteLength : 1024;
      }
      function noop() {
      }
      function abort() {
        this.destroy(new Error("Stream aborted."));
      }
      module.exports = {
        pipeline,
        pipelinePromise,
        isStream,
        isStreamx,
        Stream,
        Writable,
        Readable,
        Duplex,
        Transform,
        PassThrough
      };
    }
  });

  // node_modules/udx-native/lib/stream.js
  var require_stream = __commonJS({
    "node_modules/udx-native/lib/stream.js"(exports, module) {
      var streamx = require_streamx();
      var b4a = require_b4a();
      var binding = require_binding();
      var ip = require_ip();
      var MAX_PACKET = 2048;
      var BUFFER_SIZE = 65536 + MAX_PACKET;
      module.exports = class UDXStream extends streamx.Duplex {
        constructor(udx, id, opts = {}) {
          super({ mapWritable: toBuffer });
          this.udx = udx;
          this.socket = null;
          this._handle = b4a.allocUnsafe(binding.sizeof_udx_napi_stream_t);
          this._view = new Uint32Array(this._handle.buffer, this._handle.byteOffset, this._handle.byteLength >> 2);
          this._wreqs = [];
          this._wfree = [];
          this._sreqs = [];
          this._sfree = [];
          this._closed = false;
          this._mtuExceeded = false;
          this._readBuffer = b4a.allocUnsafe(BUFFER_SIZE);
          this._onwrite = null;
          this._ondestroy = null;
          this._firewall = opts.firewall || firewallAll;
          this.id = id;
          this.remoteId = 0;
          this.remoteHost = null;
          this.remoteFamily = 0;
          this.remotePort = 0;
          this.userData = null;
          binding.udx_napi_stream_init(
            this.udx._handle,
            this._handle,
            id,
            opts.framed ? 1 : 0,
            this,
            this._ondata,
            this._onend,
            this._ondrain,
            this._onack,
            this._onsend,
            this._onmessage,
            this._onclose,
            this._onfirewall,
            this._realloc
          );
          if (opts.seq)
            binding.udx_napi_stream_set_seq(this._handle, opts.seq);
          binding.udx_napi_stream_recv_start(this._handle, this._readBuffer);
        }
        get connected() {
          return this.socket !== null;
        }
        get mtu() {
          return this._view[binding.offsetof_udx_stream_t_mtu >> 2] & 65535;
        }
        get rtt() {
          return this._view[binding.offsetof_udx_stream_t_srtt >> 2];
        }
        get cwnd() {
          return this._view[binding.offsetof_udx_stream_t_cwnd >> 2];
        }
        get inflight() {
          return this._view[binding.offsetof_udx_stream_t_inflight >> 2];
        }
        get localHost() {
          return this.socket ? this.socket.address().host : null;
        }
        get localFamily() {
          return this.socket ? this.socket.address().family : 0;
        }
        get localPort() {
          return this.socket ? this.socket.address().port : 0;
        }
        setInteractive(bool) {
          if (!this._closed)
            return;
          binding.udx_napi_stream_set_mode(this._handle, bool ? 0 : 1);
        }
        setMTU(mtu) {
          if (this._closed)
            return;
          binding.udx_napi_stream_set_mtu(this._handle, mtu);
        }
        connect(socket, remoteId, port, host, opts = {}) {
          if (this._closed)
            return;
          if (this.connected)
            throw new Error("Already connected");
          if (socket.closing)
            throw new Error("Socket is closed");
          if (typeof host === "object") {
            opts = host;
            host = null;
          }
          if (!host)
            host = "127.0.0.1";
          const family = ip.isIP(host);
          if (!family)
            throw new Error(`${host} is not a valid IP address`);
          if (!socket.bound)
            socket.bind(0);
          this.remoteId = remoteId;
          this.remotePort = port;
          this.remoteHost = host;
          this.remoteFamily = family;
          this.socket = socket;
          if (opts.ack)
            binding.udx_napi_stream_set_ack(this._handle, opts.ack);
          binding.udx_napi_stream_connect(this._handle, socket._handle, remoteId, port, host, family);
          this.socket._addStream(this);
          this.emit("connect");
        }
        async send(buffer) {
          if (!this.connected || this._closed)
            return false;
          const id = this._allocSend();
          const req = this._sreqs[id];
          req.buffer = buffer;
          const promise = new Promise((resolve) => {
            req.onflush = resolve;
          });
          binding.udx_napi_stream_send(this._handle, req.handle, id, buffer);
          return promise;
        }
        trySend(buffer) {
          if (!this.connected || this._closed)
            return;
          const id = this._allocSend();
          const req = this._sreqs[id];
          req.buffer = buffer;
          req.onflush = noop;
          binding.udx_napi_stream_send(this._handle, req.handle, id, buffer);
        }
        _read(cb) {
          cb(null);
        }
        _writeContinue(err) {
          if (this._onwrite === null)
            return;
          const cb = this._onwrite;
          this._onwrite = null;
          cb(err);
        }
        _destroyContinue(err) {
          if (this._ondestroy === null)
            return;
          const cb = this._ondestroy;
          this._ondestroy = null;
          cb(err);
        }
        _write(buffer, cb) {
          const id = this._allocWrite();
          const req = this._wreqs[id];
          req.buffer = buffer;
          const drained = binding.udx_napi_stream_write(this._handle, req.handle, id, req.buffer) !== 0;
          if (drained)
            cb(null);
          else
            this._onwrite = cb;
          if (!this._mtuExceeded && buffer.byteLength > this.mtu - 20) {
            this._mtuExceeded = true;
            this.emit("mtu-exceeded");
          }
        }
        _final(cb) {
          const id = this._allocWrite();
          const req = this._wreqs[id];
          req.buffer = b4a.allocUnsafe(0);
          const drained = binding.udx_napi_stream_write_end(this._handle, req.handle, id, req.buffer) !== 0;
          if (drained)
            cb(null);
          else
            this._onwrite = cb;
        }
        _predestroy() {
          if (!this._closed)
            binding.udx_napi_stream_destroy(this._handle);
          this._closed = true;
          this._writeContinue(null);
        }
        _destroy(cb) {
          if (this.connected)
            this._ondestroy = cb;
          else
            cb(null);
        }
        _ondata(read2) {
          const data = this._readBuffer.subarray(0, read2);
          this.push(data);
          this._readBuffer = this._readBuffer.byteLength - read2 > MAX_PACKET ? this._readBuffer.subarray(read2) : b4a.allocUnsafe(BUFFER_SIZE);
          return this._readBuffer;
        }
        _onend(read2) {
          if (read2 > 0)
            this.push(this._readBuffer.subarray(0, read2));
          this.push(null);
        }
        _ondrain() {
          this._writeContinue(null);
        }
        _onack(id) {
          const req = this._wreqs[id];
          req.buffer = null;
          this._wfree.push(id);
          if (this._wfree.length >= 64 && this._wfree.length === this._wreqs.length) {
            this._wfree = [];
            this._wreqs = [];
          }
        }
        _onsend(id, err) {
          const req = this._sreqs[id];
          const onflush = req.onflush;
          req.buffer = null;
          req.onflush = null;
          this._sfree.push(id);
          onflush(err >= 0);
          if (this._sfree.length >= 16 && this._sfree.length === this._sreqs.length) {
            this._sfree = [];
            this._sreqs = [];
          }
        }
        _onmessage(buf) {
          this.emit("message", buf);
        }
        _onclose(err) {
          this._closed = true;
          if (this.socket) {
            this.socket._removeStream(this);
            this.socket = null;
          }
          if (!err)
            return this._destroyContinue(null);
          if (this._ondestroy === null)
            this.destroy(err);
          else
            this._destroyContinue(err);
        }
        _onfirewall(socket, port, host, family) {
          return this._firewall(socket, port, host, family) ? 1 : 0;
        }
        _realloc() {
          this._readBuffer = b4a.allocUnsafe(BUFFER_SIZE);
          return this._readBuffer;
        }
        _allocWrite() {
          if (this._wfree.length > 0)
            return this._wfree.pop();
          const handle = b4a.allocUnsafe(binding.sizeof_udx_stream_write_t);
          return this._wreqs.push({ handle, buffer: null }) - 1;
        }
        _allocSend() {
          if (this._sfree.length > 0)
            return this._sfree.pop();
          const handle = b4a.allocUnsafe(binding.sizeof_udx_stream_send_t);
          return this._sreqs.push({ handle, buffer: null, resolve: null, reject: null }) - 1;
        }
      };
      function noop() {
      }
      function toBuffer(data) {
        return typeof data === "string" ? b4a.from(data) : data;
      }
      function firewallAll(socket, port, host) {
        return true;
      }
    }
  });

  // node_modules/udx-native/lib/network-interfaces.js
  var require_network_interfaces = __commonJS({
    "node_modules/udx-native/lib/network-interfaces.js"(exports, module) {
      var events = __require("events");
      var b4a = require_b4a();
      var binding = require_binding();
      module.exports = class NetworkInterfaces extends events.EventEmitter {
        constructor() {
          super();
          this._handle = b4a.allocUnsafe(binding.sizeof_udx_napi_interface_event_t);
          this._watching = false;
          this._destroying = null;
          binding.udx_napi_interface_event_init(
            this._handle,
            this,
            this._onevent,
            this._onclose
          );
          this.interfaces = binding.udx_napi_interface_event_get_addrs(this._handle);
        }
        _onclose() {
          this.emit("close");
        }
        _onevent() {
          this.interfaces = binding.udx_napi_interface_event_get_addrs(this._handle);
          this.emit("change", this.interfaces);
        }
        watch() {
          if (this._watching)
            return this;
          this._watching = true;
          binding.udx_napi_interface_event_start(this._handle);
          return this;
        }
        unwatch() {
          if (!this._watching)
            return this;
          this._watching = false;
          binding.udx_napi_interface_event_stop(this._handle);
          return this;
        }
        async destroy() {
          if (this._destroying)
            return this._destroying;
          this._destroying = events.once(this, "close");
          binding.udx_napi_interface_event_close(this._handle);
          return this._destroying;
        }
      };
    }
  });

  // node_modules/udx-native/lib/udx.js
  var require_udx = __commonJS({
    "node_modules/udx-native/lib/udx.js"(exports, module) {
      var b4a = require_b4a();
      var binding = require_binding();
      var Socket = require_socket();
      var Stream = require_stream();
      var NetworkInterfaces = require_network_interfaces();
      module.exports = class UDX {
        constructor() {
          this._handle = b4a.allocUnsafe(binding.sizeof_udx_t);
          this._watchers = /* @__PURE__ */ new Set();
          binding.udx_napi_init(this._handle);
        }
        createSocket() {
          return new Socket(this);
        }
        createStream(id, opts) {
          return new Stream(this, id, opts);
        }
        networkInterfaces() {
          let [watcher = null] = this._watchers;
          if (watcher)
            return watcher.interfaces;
          watcher = new NetworkInterfaces();
          watcher.destroy();
          return watcher.interfaces;
        }
        watchNetworkInterfaces(onchange) {
          const watcher = new NetworkInterfaces();
          this._watchers.add(watcher);
          watcher.on("close", () => {
            this._watchers.delete(watcher);
          });
          if (onchange)
            watcher.on("change", onchange);
          return watcher.watch();
        }
        async lookup(host, opts = {}) {
          const {
            family = 0
          } = opts;
          const req = b4a.allocUnsafe(binding.sizeof_udx_napi_lookup_t);
          const ctx = {
            req,
            resolve: null,
            reject: null
          };
          const promise = new Promise((resolve, reject) => {
            ctx.resolve = resolve;
            ctx.reject = reject;
          });
          binding.udx_napi_lookup(req, host, family, ctx, onlookup);
          return promise;
        }
      };
      function onlookup(err, host, family) {
        if (err)
          this.reject(err);
        else
          this.resolve({ host, family });
      }
    }
  });

  // node_modules/sodium-native/index.js
  var require_sodium_native = __commonJS({
    "node_modules/sodium-native/index.js"(exports, module) {
      var sodium = require_node_gyp_build()(__dirname);
      module.exports = sodium;
    }
  });

  // node_modules/sodium-universal/index.js
  var require_sodium_universal = __commonJS({
    "node_modules/sodium-universal/index.js"(exports, module) {
      module.exports = require_sodium_native();
    }
  });

  // node_modules/compact-encoding/endian.js
  var require_endian = __commonJS({
    "node_modules/compact-encoding/endian.js"(exports) {
      var LE = exports.LE = new Uint8Array(new Uint16Array([255]).buffer)[0] === 255;
      exports.BE = !LE;
    }
  });

  // node_modules/compact-encoding/raw.js
  var require_raw = __commonJS({
    "node_modules/compact-encoding/raw.js"(exports, module) {
      var b4a = require_b4a();
      var { BE } = require_endian();
      exports = module.exports = {
        preencode(state, b) {
          state.end += b.byteLength;
        },
        encode(state, b) {
          state.buffer.set(b, state.start);
          state.start += b.byteLength;
        },
        decode(state) {
          const b = state.buffer.subarray(state.start, state.end);
          state.start = state.end;
          return b;
        }
      };
      var buffer = exports.buffer = {
        preencode(state, b) {
          if (b)
            uint8array.preencode(state, b);
          else
            state.end++;
        },
        encode(state, b) {
          if (b)
            uint8array.encode(state, b);
          else
            state.buffer[state.start++] = 0;
        },
        decode(state) {
          const b = state.buffer.subarray(state.start);
          if (b.byteLength === 0)
            return null;
          state.start = state.end;
          return b;
        }
      };
      exports.binary = {
        ...buffer,
        preencode(state, b) {
          if (typeof b === "string")
            utf8.preencode(state, b);
          else
            buffer.preencode(state, b);
        },
        encode(state, b) {
          if (typeof b === "string")
            utf8.encode(state, b);
          else
            buffer.encode(state, b);
        }
      };
      function typedarray(TypedArray, swap) {
        const n = TypedArray.BYTES_PER_ELEMENT;
        return {
          preencode(state, b) {
            state.end += b.byteLength;
          },
          encode(state, b) {
            const view = new Uint8Array(b.buffer, b.byteOffset, b.byteLength);
            if (BE && swap)
              swap(view);
            state.buffer.set(view, state.start);
            state.start += b.byteLength;
          },
          decode(state) {
            let b = state.buffer.subarray(state.start);
            if (b.byteOffset % n !== 0)
              b = new Uint8Array(b);
            if (BE && swap)
              swap(b);
            state.start = state.end;
            return new TypedArray(b.buffer, b.byteOffset, b.byteLength / n);
          }
        };
      }
      var uint8array = exports.uint8array = typedarray(Uint8Array);
      exports.uint16array = typedarray(Uint16Array, b4a.swap16);
      exports.uint32array = typedarray(Uint32Array, b4a.swap32);
      exports.int8array = typedarray(Int8Array);
      exports.int16array = typedarray(Int16Array, b4a.swap16);
      exports.int32array = typedarray(Int32Array, b4a.swap32);
      exports.float32array = typedarray(Float32Array, b4a.swap32);
      exports.float64array = typedarray(Float64Array, b4a.swap64);
      function string(encoding) {
        return {
          preencode(state, s) {
            state.end += b4a.byteLength(s, encoding);
          },
          encode(state, s) {
            state.start += b4a.write(state.buffer, s, state.start, encoding);
          },
          decode(state) {
            const s = b4a.toString(state.buffer, encoding, state.start);
            state.start = state.end;
            return s;
          }
        };
      }
      var utf8 = exports.string = exports.utf8 = string("utf-8");
      exports.ascii = string("ascii");
      exports.hex = string("hex");
      exports.base64 = string("base64");
      exports.ucs2 = exports.utf16le = string("utf16le");
      exports.array = function array(enc) {
        return {
          preencode(state, list) {
            for (const value of list)
              enc.preencode(state, value);
          },
          encode(state, list) {
            for (const value of list)
              enc.encode(state, value);
          },
          decode(state) {
            const arr = [];
            while (state.start < state.end)
              arr.push(enc.decode(state));
            return arr;
          }
        };
      };
      exports.json = {
        preencode(state, v) {
          utf8.preencode(state, JSON.stringify(v));
        },
        encode(state, v) {
          utf8.encode(state, JSON.stringify(v));
        },
        decode(state) {
          return JSON.parse(utf8.decode(state));
        }
      };
      exports.ndjson = {
        preencode(state, v) {
          utf8.preencode(state, JSON.stringify(v) + "\n");
        },
        encode(state, v) {
          utf8.encode(state, JSON.stringify(v) + "\n");
        },
        decode(state) {
          return JSON.parse(utf8.decode(state));
        }
      };
    }
  });

  // node_modules/compact-encoding/lexint.js
  var require_lexint = __commonJS({
    "node_modules/compact-encoding/lexint.js"(exports, module) {
      module.exports = {
        preencode,
        encode: encode2,
        decode: decode2
      };
      function preencode(state, num) {
        if (num < 251) {
          state.end++;
        } else if (num < 256) {
          state.end += 2;
        } else if (num < 65536) {
          state.end += 3;
        } else if (num < 16777216) {
          state.end += 4;
        } else if (num < 4294967296) {
          state.end += 5;
        } else {
          state.end++;
          const exp = Math.floor(Math.log(num) / Math.log(2)) - 32;
          preencode(state, exp);
          state.end += 6;
        }
      }
      function encode2(state, num) {
        const max = 251;
        const x = num - max;
        if (num < max) {
          state.buffer[state.start++] = num;
        } else if (num < 256) {
          state.buffer[state.start++] = max;
          state.buffer[state.start++] = x;
        } else if (num < 65536) {
          state.buffer[state.start++] = max + 1;
          state.buffer[state.start++] = x >> 8 & 255;
          state.buffer[state.start++] = x & 255;
        } else if (num < 16777216) {
          state.buffer[state.start++] = max + 2;
          state.buffer[state.start++] = x >> 16;
          state.buffer[state.start++] = x >> 8 & 255;
          state.buffer[state.start++] = x & 255;
        } else if (num < 4294967296) {
          state.buffer[state.start++] = max + 3;
          state.buffer[state.start++] = x >> 24;
          state.buffer[state.start++] = x >> 16 & 255;
          state.buffer[state.start++] = x >> 8 & 255;
          state.buffer[state.start++] = x & 255;
        } else {
          const exp = Math.floor(Math.log(x) / Math.log(2)) - 32;
          state.buffer[state.start++] = 255;
          encode2(state, exp);
          const rem = x / Math.pow(2, exp - 11);
          for (let i = 5; i >= 0; i--) {
            state.buffer[state.start++] = rem / Math.pow(2, 8 * i) & 255;
          }
        }
      }
      function decode2(state) {
        const max = 251;
        if (state.end - state.start < 1)
          throw new Error("Out of bounds");
        const flag = state.buffer[state.start++];
        if (flag < max)
          return flag;
        if (state.end - state.start < flag - max + 1) {
          throw new Error("Out of bounds.");
        }
        if (flag < 252) {
          return state.buffer[state.start++] + max;
        }
        if (flag < 253) {
          return (state.buffer[state.start++] << 8) + state.buffer[state.start++] + max;
        }
        if (flag < 254) {
          return (state.buffer[state.start++] << 16) + (state.buffer[state.start++] << 8) + state.buffer[state.start++] + max;
        }
        if (flag < 255) {
          return state.buffer[state.start++] * 16777216 + (state.buffer[state.start++] << 16) + (state.buffer[state.start++] << 8) + state.buffer[state.start++] + max;
        }
        const exp = decode2(state);
        if (state.end - state.start < 6)
          throw new Error("Out of bounds");
        let rem = 0;
        for (let i = 5; i >= 0; i--) {
          rem += state.buffer[state.start++] * Math.pow(2, 8 * i);
        }
        return rem * Math.pow(2, exp - 11) + max;
      }
    }
  });

  // node_modules/compact-encoding/index.js
  var require_compact_encoding = __commonJS({
    "node_modules/compact-encoding/index.js"(exports) {
      var b4a = require_b4a();
      var { BE } = require_endian();
      exports.state = function(start = 0, end = 0, buffer2 = null) {
        return { start, end, buffer: buffer2, cache: null };
      };
      var raw = exports.raw = require_raw();
      var uint = exports.uint = {
        preencode(state, n) {
          state.end += n <= 252 ? 1 : n <= 65535 ? 3 : n <= 4294967295 ? 5 : 9;
        },
        encode(state, n) {
          if (n <= 252)
            uint8.encode(state, n);
          else if (n <= 65535) {
            state.buffer[state.start++] = 253;
            uint16.encode(state, n);
          } else if (n <= 4294967295) {
            state.buffer[state.start++] = 254;
            uint32.encode(state, n);
          } else {
            state.buffer[state.start++] = 255;
            uint64.encode(state, n);
          }
        },
        decode(state) {
          const a = uint8.decode(state);
          if (a <= 252)
            return a;
          if (a === 253)
            return uint16.decode(state);
          if (a === 254)
            return uint32.decode(state);
          return uint64.decode(state);
        }
      };
      var uint8 = exports.uint8 = {
        preencode(state, n) {
          state.end += 1;
        },
        encode(state, n) {
          state.buffer[state.start++] = n;
        },
        decode(state) {
          if (state.start >= state.end)
            throw new Error("Out of bounds");
          return state.buffer[state.start++];
        }
      };
      var uint16 = exports.uint16 = {
        preencode(state, n) {
          state.end += 2;
        },
        encode(state, n) {
          state.buffer[state.start++] = n;
          state.buffer[state.start++] = n >>> 8;
        },
        decode(state) {
          if (state.end - state.start < 2)
            throw new Error("Out of bounds");
          return state.buffer[state.start++] + state.buffer[state.start++] * 256;
        }
      };
      var uint24 = exports.uint24 = {
        preencode(state, n) {
          state.end += 3;
        },
        encode(state, n) {
          state.buffer[state.start++] = n;
          state.buffer[state.start++] = n >>> 8;
          state.buffer[state.start++] = n >>> 16;
        },
        decode(state) {
          if (state.end - state.start < 3)
            throw new Error("Out of bounds");
          return state.buffer[state.start++] + state.buffer[state.start++] * 256 + state.buffer[state.start++] * 65536;
        }
      };
      var uint32 = exports.uint32 = {
        preencode(state, n) {
          state.end += 4;
        },
        encode(state, n) {
          state.buffer[state.start++] = n;
          state.buffer[state.start++] = n >>> 8;
          state.buffer[state.start++] = n >>> 16;
          state.buffer[state.start++] = n >>> 24;
        },
        decode(state) {
          if (state.end - state.start < 4)
            throw new Error("Out of bounds");
          return state.buffer[state.start++] + state.buffer[state.start++] * 256 + state.buffer[state.start++] * 65536 + state.buffer[state.start++] * 16777216;
        }
      };
      var uint40 = exports.uint40 = {
        preencode(state, n) {
          state.end += 5;
        },
        encode(state, n) {
          const r = Math.floor(n / 256);
          uint8.encode(state, n);
          uint32.encode(state, r);
        },
        decode(state) {
          if (state.end - state.start < 5)
            throw new Error("Out of bounds");
          return uint8.decode(state) + 256 * uint32.decode(state);
        }
      };
      var uint48 = exports.uint48 = {
        preencode(state, n) {
          state.end += 6;
        },
        encode(state, n) {
          const r = Math.floor(n / 65536);
          uint16.encode(state, n);
          uint32.encode(state, r);
        },
        decode(state) {
          if (state.end - state.start < 6)
            throw new Error("Out of bounds");
          return uint16.decode(state) + 65536 * uint32.decode(state);
        }
      };
      var uint56 = exports.uint56 = {
        preencode(state, n) {
          state.end += 7;
        },
        encode(state, n) {
          const r = Math.floor(n / 16777216);
          uint24.encode(state, n);
          uint32.encode(state, r);
        },
        decode(state) {
          if (state.end - state.start < 7)
            throw new Error("Out of bounds");
          return uint24.decode(state) + 16777216 * uint32.decode(state);
        }
      };
      var uint64 = exports.uint64 = {
        preencode(state, n) {
          state.end += 8;
        },
        encode(state, n) {
          const r = Math.floor(n / 4294967296);
          uint32.encode(state, n);
          uint32.encode(state, r);
        },
        decode(state) {
          if (state.end - state.start < 8)
            throw new Error("Out of bounds");
          return uint32.decode(state) + 4294967296 * uint32.decode(state);
        }
      };
      exports.int = zigZag(uint);
      exports.int8 = zigZag(uint8);
      exports.int16 = zigZag(uint16);
      exports.int24 = zigZag(uint24);
      exports.int32 = zigZag(uint32);
      exports.int40 = zigZag(uint40);
      exports.int48 = zigZag(uint48);
      exports.int56 = zigZag(uint56);
      exports.int64 = zigZag(uint64);
      exports.lexint = require_lexint();
      exports.float32 = {
        preencode(state, n) {
          state.end += 4;
        },
        encode(state, n) {
          const view = new DataView(state.buffer.buffer, state.start + state.buffer.byteOffset, 4);
          view.setFloat32(0, n, true);
          state.start += 4;
        },
        decode(state) {
          if (state.end - state.start < 4)
            throw new Error("Out of bounds");
          const view = new DataView(state.buffer.buffer, state.start + state.buffer.byteOffset, 4);
          const float = view.getFloat32(0, true);
          state.start += 4;
          return float;
        }
      };
      exports.float64 = {
        preencode(state, n) {
          state.end += 8;
        },
        encode(state, n) {
          const view = new DataView(state.buffer.buffer, state.start + state.buffer.byteOffset, 8);
          view.setFloat64(0, n, true);
          state.start += 8;
        },
        decode(state) {
          if (state.end - state.start < 8)
            throw new Error("Out of bounds");
          const view = new DataView(state.buffer.buffer, state.start + state.buffer.byteOffset, 8);
          const float = view.getFloat64(0, true);
          state.start += 8;
          return float;
        }
      };
      var buffer = exports.buffer = {
        preencode(state, b) {
          if (b)
            uint8array.preencode(state, b);
          else
            state.end++;
        },
        encode(state, b) {
          if (b)
            uint8array.encode(state, b);
          else
            state.buffer[state.start++] = 0;
        },
        decode(state) {
          const len = uint.decode(state);
          if (len === 0)
            return null;
          if (state.end - state.start < len)
            throw new Error("Out of bounds");
          return state.buffer.subarray(state.start, state.start += len);
        }
      };
      exports.binary = {
        ...buffer,
        preencode(state, b) {
          if (typeof b === "string")
            utf8.preencode(state, b);
          else
            buffer.preencode(state, b);
        },
        encode(state, b) {
          if (typeof b === "string")
            utf8.encode(state, b);
          else
            buffer.encode(state, b);
        }
      };
      function typedarray(TypedArray, swap) {
        const n = TypedArray.BYTES_PER_ELEMENT;
        return {
          preencode(state, b) {
            uint.preencode(state, b.length);
            state.end += b.byteLength;
          },
          encode(state, b) {
            uint.encode(state, b.length);
            const view = new Uint8Array(b.buffer, b.byteOffset, b.byteLength);
            if (BE && swap)
              swap(view);
            state.buffer.set(view, state.start);
            state.start += b.byteLength;
          },
          decode(state) {
            const len = uint.decode(state);
            let b = state.buffer.subarray(state.start, state.start += len * n);
            if (b.byteLength !== len * n)
              throw new Error("Out of bounds");
            if (b.byteOffset % n !== 0)
              b = new Uint8Array(b);
            if (BE && swap)
              swap(b);
            return new TypedArray(b.buffer, b.byteOffset, b.byteLength / n);
          }
        };
      }
      var uint8array = exports.uint8array = typedarray(Uint8Array);
      exports.uint16array = typedarray(Uint16Array, b4a.swap16);
      exports.uint32array = typedarray(Uint32Array, b4a.swap32);
      exports.int8array = typedarray(Int8Array);
      exports.int16array = typedarray(Int16Array, b4a.swap16);
      exports.int32array = typedarray(Int32Array, b4a.swap32);
      exports.float32array = typedarray(Float32Array, b4a.swap32);
      exports.float64array = typedarray(Float64Array, b4a.swap64);
      function string(encoding) {
        return {
          preencode(state, s) {
            const len = b4a.byteLength(s, encoding);
            uint.preencode(state, len);
            state.end += len;
          },
          encode(state, s) {
            const len = b4a.byteLength(s, encoding);
            uint.encode(state, len);
            b4a.write(state.buffer, s, state.start, encoding);
            state.start += len;
          },
          decode(state) {
            const len = uint.decode(state);
            if (state.end - state.start < len)
              throw new Error("Out of bounds");
            return b4a.toString(state.buffer, encoding, state.start, state.start += len);
          },
          fixed(n) {
            return {
              preencode(state) {
                state.end += n;
              },
              encode(state, s) {
                b4a.write(state.buffer, s, state.start, n, encoding);
                state.start += n;
              },
              decode(state) {
                if (state.end - state.start < n)
                  throw new Error("Out of bounds");
                return b4a.toString(state.buffer, encoding, state.start, state.start += n);
              }
            };
          }
        };
      }
      var utf8 = exports.string = exports.utf8 = string("utf-8");
      exports.ascii = string("ascii");
      exports.hex = string("hex");
      exports.base64 = string("base64");
      exports.ucs2 = exports.utf16le = string("utf16le");
      exports.bool = {
        preencode(state, b) {
          state.end++;
        },
        encode(state, b) {
          state.buffer[state.start++] = b ? 1 : 0;
        },
        decode(state) {
          if (state.start >= state.end)
            throw Error("Out of bounds");
          return state.buffer[state.start++] === 1;
        }
      };
      var fixed = exports.fixed = function fixed2(n) {
        return {
          preencode(state, s) {
            state.end += n;
          },
          encode(state, s) {
            state.buffer.set(s, state.start);
            state.start += n;
          },
          decode(state) {
            if (state.end - state.start < n)
              throw new Error("Out of bounds");
            return state.buffer.subarray(state.start, state.start += n);
          }
        };
      };
      exports.fixed32 = fixed(32);
      exports.fixed64 = fixed(64);
      exports.none = {
        preencode(state, m) {
        },
        encode(state, m) {
        },
        decode(state) {
          return null;
        }
      };
      exports.array = function array(enc) {
        return {
          preencode(state, list) {
            uint.preencode(state, list.length);
            for (let i = 0; i < list.length; i++)
              enc.preencode(state, list[i]);
          },
          encode(state, list) {
            uint.encode(state, list.length);
            for (let i = 0; i < list.length; i++)
              enc.encode(state, list[i]);
          },
          decode(state) {
            const len = uint.decode(state);
            if (len > 1048576)
              throw new Error("Array is too big");
            const arr = new Array(len);
            for (let i = 0; i < len; i++)
              arr[i] = enc.decode(state);
            return arr;
          }
        };
      };
      exports.json = {
        preencode(state, v) {
          utf8.preencode(state, JSON.stringify(v));
        },
        encode(state, v) {
          utf8.encode(state, JSON.stringify(v));
        },
        decode(state) {
          return JSON.parse(utf8.decode(state));
        }
      };
      exports.ndjson = {
        preencode(state, v) {
          utf8.preencode(state, JSON.stringify(v) + "\n");
        },
        encode(state, v) {
          utf8.encode(state, JSON.stringify(v) + "\n");
        },
        decode(state) {
          return JSON.parse(utf8.decode(state));
        }
      };
      exports.from = function from(enc) {
        if (typeof enc === "string")
          return fromNamed(enc);
        if (enc.preencode)
          return enc;
        if (enc.encodingLength)
          return fromAbstractEncoder(enc);
        return fromCodec(enc);
      };
      function fromNamed(enc) {
        switch (enc) {
          case "ascii":
            return raw.ascii;
          case "utf-8":
          case "utf8":
            return raw.utf8;
          case "hex":
            return raw.hex;
          case "base64":
            return raw.base64;
          case "utf16-le":
          case "utf16le":
          case "ucs-2":
          case "ucs2":
            return raw.ucs2;
          case "ndjson":
            return raw.ndjson;
          case "json":
            return raw.json;
          case "binary":
          default:
            return raw.binary;
        }
      }
      function fromCodec(enc) {
        let tmpM = null;
        let tmpBuf = null;
        return {
          preencode(state, m) {
            tmpM = m;
            tmpBuf = enc.encode(m);
            state.end += tmpBuf.byteLength;
          },
          encode(state, m) {
            raw.encode(state, m === tmpM ? tmpBuf : enc.encode(m));
            tmpM = tmpBuf = null;
          },
          decode(state) {
            return enc.decode(raw.decode(state));
          }
        };
      }
      function fromAbstractEncoder(enc) {
        return {
          preencode(state, m) {
            state.end += enc.encodingLength(m);
          },
          encode(state, m) {
            enc.encode(m, state.buffer, state.start);
            state.start += enc.encode.bytes;
          },
          decode(state) {
            const m = enc.decode(state.buffer, state.start, state.end);
            state.start += enc.decode.bytes;
            return m;
          }
        };
      }
      exports.encode = function encode2(enc, m) {
        const state = exports.state();
        enc.preencode(state, m);
        state.buffer = b4a.allocUnsafe(state.end);
        enc.encode(state, m);
        return state.buffer;
      };
      exports.decode = function decode2(enc, buffer2) {
        return enc.decode(exports.state(0, buffer2.byteLength, buffer2));
      };
      function zigZag(enc) {
        return {
          preencode(state, n) {
            enc.preencode(state, zigZagEncode(n));
          },
          encode(state, n) {
            enc.encode(state, zigZagEncode(n));
          },
          decode(state) {
            return zigZagDecode(enc.decode(state));
          }
        };
      }
      function zigZagDecode(n) {
        return n === 0 ? n : (n & 1) === 0 ? n / 2 : -(n + 1) / 2;
      }
      function zigZagEncode(n) {
        return n < 0 ? 2 * -n - 1 : n === 0 ? 0 : 2 * n;
      }
    }
  });

  // node_modules/nat-sampler/index.js
  var require_nat_sampler = __commonJS({
    "node_modules/nat-sampler/index.js"(exports, module) {
      module.exports = class NatSampler {
        constructor() {
          this.host = null;
          this.port = 0;
          this.size = 0;
          this._a = null;
          this._b = null;
          this._threshold = 0;
          this._top = 0;
          this._samples = [];
        }
        add(host, port) {
          const a = this._bump(host, port, 2);
          const b = this._bump(host, 0, 1);
          if (this._samples.length < 32) {
            this.size++;
            this._threshold = this.size - (this.size < 4 ? 0 : this.size < 8 ? 1 : this.size < 12 ? 2 : 3);
            this._samples.push(a, b);
            this._top += 2;
          } else {
            if (this._top === 32)
              this._top = 0;
            const oa = this._samples[this._top];
            this._samples[this._top++] = a;
            oa.hits--;
            const ob = this._samples[this._top];
            this._samples[this._top++] = b;
            ob.hits--;
          }
          if (this._a === null || this._a.hits < a.hits)
            this._a = a;
          if (this._b === null || this._b.hits < b.hits)
            this._b = b;
          if (this._a.hits >= this._threshold) {
            this.host = this._a.host;
            this.port = this._a.port;
          } else if (this._b.hits >= this._threshold) {
            this.host = this._b.host;
            this.port = 0;
          } else {
            this.host = null;
            this.port = 0;
          }
          return a.hits;
        }
        _bump(host, port, inc) {
          for (let i = 0; i < 4; i++) {
            const j = this._top - inc - 2 * i & 31;
            if (j >= this._samples.length)
              return { host, port, hits: 1 };
            const s = this._samples[j];
            if (s.port === port && s.host === host) {
              s.hits++;
              return s;
            }
          }
          return { host, port, hits: 1 };
        }
      };
    }
  });

  // node_modules/compact-encoding-net/index.js
  var require_compact_encoding_net = __commonJS({
    "node_modules/compact-encoding-net/index.js"(exports, module) {
      var c = require_compact_encoding();
      var port = c.uint16;
      var address = (host, family) => {
        return {
          preencode(state, m) {
            host.preencode(state, m.host);
            port.preencode(state, m.port);
          },
          encode(state, m) {
            host.encode(state, m.host);
            port.encode(state, m.port);
          },
          decode(state) {
            return {
              host: host.decode(state),
              family,
              port: port.decode(state)
            };
          }
        };
      };
      var ipv4 = {
        preencode(state) {
          state.end += 4;
        },
        encode(state, string) {
          const start = state.start;
          const end = start + 4;
          let i = 0;
          while (i < string.length) {
            let n = 0;
            let c2;
            while (i < string.length && (c2 = string.charCodeAt(i++)) !== 46) {
              n = n * 10 + (c2 - 48);
            }
            state.buffer[state.start++] = n;
          }
          state.start = end;
        },
        decode(state) {
          if (state.end - state.start < 4)
            throw new Error("Out of bounds");
          return state.buffer[state.start++] + "." + state.buffer[state.start++] + "." + state.buffer[state.start++] + "." + state.buffer[state.start++];
        }
      };
      var ipv4Address = address(ipv4, 4);
      var ipv6 = {
        preencode(state) {
          state.end += 16;
        },
        encode(state, string) {
          const start = state.start;
          const end = start + 16;
          let i = 0;
          let split = null;
          while (i < string.length) {
            let n = 0;
            let c2;
            while (i < string.length && (c2 = string.charCodeAt(i++)) !== 58) {
              if (c2 >= 48 && c2 <= 57)
                n = n * 16 + (c2 - 48);
              else if (c2 >= 65 && c2 <= 70)
                n = n * 16 + (c2 - 65 + 10);
              else if (c2 >= 97 && c2 <= 102)
                n = n * 16 + (c2 - 97 + 10);
            }
            state.buffer[state.start++] = n >>> 8;
            state.buffer[state.start++] = n;
            if (i < string.length && string.charCodeAt(i) === 58) {
              i++;
              split = state.start;
            }
          }
          if (split !== null) {
            const offset = end - state.start;
            state.buffer.copyWithin(split + offset, split).fill(0, split, split + offset);
          }
          state.start = end;
        },
        decode(state) {
          if (state.end - state.start < 16)
            throw new Error("Out of bounds");
          return (state.buffer[state.start++] * 256 + state.buffer[state.start++]).toString(16) + ":" + (state.buffer[state.start++] * 256 + state.buffer[state.start++]).toString(16) + ":" + (state.buffer[state.start++] * 256 + state.buffer[state.start++]).toString(16) + ":" + (state.buffer[state.start++] * 256 + state.buffer[state.start++]).toString(16) + ":" + (state.buffer[state.start++] * 256 + state.buffer[state.start++]).toString(16) + ":" + (state.buffer[state.start++] * 256 + state.buffer[state.start++]).toString(16) + ":" + (state.buffer[state.start++] * 256 + state.buffer[state.start++]).toString(16) + ":" + (state.buffer[state.start++] * 256 + state.buffer[state.start++]).toString(16);
        }
      };
      var ipv6Address = address(ipv6, 6);
      var ip = {
        preencode(state, string) {
          const family = string.includes(":") ? 6 : 4;
          c.uint8.preencode(state, family);
          if (family === 4)
            ipv4.preencode(state);
          else
            ipv6.preencode(state);
        },
        encode(state, string) {
          const family = string.includes(":") ? 6 : 4;
          c.uint8.encode(state, family);
          if (family === 4)
            ipv4.encode(state, string);
          else
            ipv6.encode(state, string);
        },
        decode(state) {
          const family = c.uint8.decode(state);
          if (family === 4)
            return ipv4.decode(state);
          else
            return ipv6.decode(state);
        }
      };
      var ipAddress = {
        preencode(state, m) {
          ip.preencode(state, m.host);
          port.preencode(state, m.port);
        },
        encode(state, m) {
          ip.encode(state, m.host);
          port.encode(state, m.port);
        },
        decode(state) {
          const family = c.uint8.decode(state);
          return {
            host: family === 4 ? ipv4.decode(state) : ipv6.decode(state),
            family,
            port: port.decode(state)
          };
        }
      };
      module.exports = {
        port,
        ipv4,
        ipv4Address,
        ipv6,
        ipv6Address,
        ip,
        ipAddress
      };
    }
  });

  // node_modules/dht-rpc/lib/peer.js
  var require_peer = __commonJS({
    "node_modules/dht-rpc/lib/peer.js"(exports, module) {
      var sodium = require_sodium_universal();
      var c = require_compact_encoding();
      var net = require_compact_encoding_net();
      var b4a = require_b4a();
      var ipv4 = {
        ...net.ipv4Address,
        decode(state) {
          const ip = net.ipv4Address.decode(state);
          return {
            id: null,
            host: ip.host,
            port: ip.port
          };
        }
      };
      module.exports = { id, ipv4, ipv4Array: c.array(ipv4) };
      function id(host, port, out = b4a.allocUnsafe(32)) {
        const addr = out.subarray(0, 6);
        ipv4.encode(
          { start: 0, end: 6, buffer: addr },
          { host, port }
        );
        sodium.crypto_generichash(out, addr);
        return out;
      }
    }
  });

  // node_modules/dht-rpc/lib/errors.js
  var require_errors = __commonJS({
    "node_modules/dht-rpc/lib/errors.js"(exports) {
      exports.UNKNOWN_COMMAND = 1;
      exports.INVALID_TOKEN = 2;
      exports.createTimeoutError = () => {
        const timeoutErr = new Error("Request timed out");
        timeoutErr.code = "ETIMEDOUT";
        return timeoutErr;
      };
      exports.createDestroyedError = () => {
        const destroyErr = new Error("Request destroyed");
        destroyErr.code = "EDESTROYED";
        return destroyErr;
      };
    }
  });

  // node_modules/dht-rpc/lib/io.js
  var require_io = __commonJS({
    "node_modules/dht-rpc/lib/io.js"(exports, module) {
      var FIFO = require_fast_fifo();
      var sodium = require_sodium_universal();
      var c = require_compact_encoding();
      var b4a = require_b4a();
      var peer = require_peer();
      var errors = require_errors();
      var VERSION = 3;
      var RESPONSE_ID = 1 << 4 | VERSION;
      var REQUEST_ID = 0 << 4 | VERSION;
      var TMP = b4a.alloc(32);
      var EMPTY_ARRAY2 = [];
      module.exports = class IO {
        constructor(table, udx, { maxWindow = 80, port = 0, host = "0.0.0.0", anyPort = true, firewalled = true, onrequest, onresponse = noop, ontimeout = noop } = {}) {
          this.table = table;
          this.udx = udx;
          this.inflight = [];
          this.clientSocket = null;
          this.serverSocket = null;
          this.firewalled = firewalled !== false;
          this.ephemeral = true;
          this.congestion = new CongestionWindow(maxWindow);
          this.networkInterfaces = udx.watchNetworkInterfaces();
          this.onrequest = onrequest;
          this.onresponse = onresponse;
          this.ontimeout = ontimeout;
          this._pending = new FIFO();
          this._rotateSecrets = 10;
          this._tid = Math.random() * 65536 | 0;
          this._secrets = null;
          this._drainInterval = null;
          this._destroying = null;
          this._binding = null;
          this._port = port;
          this._host = host;
          this._anyPort = anyPort !== false;
        }
        onmessage(socket, buffer, { host, port }) {
          if (buffer.byteLength < 2 || !(port > 0 && port < 65536))
            return;
          const from = { id: null, host, port };
          const state = { start: 1, end: buffer.byteLength, buffer };
          const expectedSocket = this.firewalled ? this.clientSocket : this.serverSocket;
          const external = socket !== expectedSocket;
          if (buffer[0] === REQUEST_ID) {
            const req = Request.decode(this, socket, from, state);
            if (req === null)
              return;
            if (req.token !== null && !b4a.equals(req.token, this.token(req.from, 1)) && !b4a.equals(req.token, this.token(req.from, 0))) {
              req.error(errors.INVALID_TOKEN, { token: true });
              return;
            }
            this.onrequest(req, external);
            return;
          }
          if (buffer[0] === RESPONSE_ID) {
            const res = decodeReply(from, state);
            if (res === null)
              return;
            for (let i = 0; i < this.inflight.length; i++) {
              const req = this.inflight[i];
              if (req.tid !== res.tid)
                continue;
              if (i === this.inflight.length - 1)
                this.inflight.pop();
              else
                this.inflight[i] = this.inflight.pop();
              if (req._timeout) {
                clearTimeout(req._timeout);
                req._timeout = null;
              }
              this.congestion.recv();
              this.onresponse(res, external);
              req.onresponse(res, req);
              break;
            }
          }
        }
        token(addr, i) {
          if (this._secrets === null) {
            const buf = b4a.alloc(64);
            this._secrets = [buf.subarray(0, 32), buf.subarray(32, 64)];
            sodium.randombytes_buf(this._secrets[0]);
            sodium.randombytes_buf(this._secrets[1]);
          }
          const token = b4a.allocUnsafe(32);
          sodium.crypto_generichash(token, b4a.from(addr.host), this._secrets[i]);
          return token;
        }
        async destroy() {
          if (this._destroying)
            return this._destroying;
          await this.bind();
          if (this._drainInterval) {
            clearInterval(this._drainInterval);
            this._drainInterval = null;
          }
          while (this.inflight.length) {
            const req = this.inflight.pop();
            if (req._timeout)
              clearTimeout(req._timeout);
            req._timeout = null;
            req.destroyed = true;
            req.onerror(errors.createDestroyedError(), req);
          }
          this._destroying = Promise.allSettled([
            this.serverSocket.close(),
            this.clientSocket.close(),
            this.networkInterfaces.destroy()
          ]);
          return this._destroying;
        }
        bind() {
          if (this._binding)
            return this._binding;
          this._binding = this._bindSockets();
          return this._binding;
        }
        async _bindSockets() {
          const serverSocket = this.udx.createSocket();
          try {
            serverSocket.bind(this._port, this._host);
          } catch (err) {
            if (!this._anyPort) {
              await serverSocket.close();
              throw err;
            }
            try {
              serverSocket.bind(0, this._host);
            } catch (err2) {
              await serverSocket.close();
              throw err2;
            }
          }
          const clientSocket = this.udx.createSocket();
          try {
            clientSocket.bind(0, this._host);
          } catch (err) {
            await serverSocket.close();
            await clientSocket.close();
            throw err;
          }
          this.clientSocket = clientSocket;
          this.serverSocket = serverSocket;
          this.serverSocket.on("message", this.onmessage.bind(this, this.serverSocket));
          this.clientSocket.on("message", this.onmessage.bind(this, this.clientSocket));
          if (this._drainInterval === null) {
            this._drainInterval = setInterval(this._drain.bind(this), 750);
            if (this._drainInterval.unref)
              this._drainInterval.unref();
          }
          for (const req of this.inflight) {
            if (!req.socket)
              req.socket = this.firewalled ? this.clientSocket : this.serverSocket;
            req.sent = 0;
            req.send(false);
          }
        }
        _drain() {
          if (this._secrets !== null && --this._rotateSecrets === 0) {
            this._rotateSecrets = 10;
            const tmp = this._secrets[0];
            this._secrets[0] = this._secrets[1];
            this._secrets[1] = tmp;
            sodium.crypto_generichash(tmp, tmp);
          }
          this.congestion.drain();
          while (!this.congestion.isFull()) {
            const p = this._pending.shift();
            if (p === void 0)
              return;
            p._sendNow();
          }
        }
        createRequest(to, token, internal, command, target2, value) {
          if (this._destroying !== null)
            return null;
          if (this._tid === 65536)
            this._tid = 0;
          const tid = this._tid++;
          const socket = this.firewalled ? this.clientSocket : this.serverSocket;
          const req = new Request(this, socket, tid, null, to, token, internal, command, target2, value);
          this.inflight.push(req);
          return req;
        }
      };
      var Request = class {
        constructor(io, socket, tid, from, to, token, internal, command, target2, value) {
          this.socket = socket;
          this.tid = tid;
          this.from = from;
          this.to = to;
          this.token = token;
          this.command = command;
          this.target = target2;
          this.value = value;
          this.internal = internal;
          this.sent = 0;
          this.retries = 3;
          this.destroyed = false;
          this.oncycle = noop;
          this.onerror = noop;
          this.onresponse = noop;
          this._buffer = null;
          this._io = io;
          this._timeout = null;
        }
        static decode(io, socket, from, state) {
          try {
            const flags = c.uint.decode(state);
            const tid = c.uint16.decode(state);
            const to = peer.ipv4.decode(state);
            const id = flags & 1 ? c.fixed32.decode(state) : null;
            const token = flags & 2 ? c.fixed32.decode(state) : null;
            const internal = (flags & 4) !== 0;
            const command = c.uint.decode(state);
            const target2 = flags & 8 ? c.fixed32.decode(state) : null;
            const value = flags & 16 ? c.buffer.decode(state) : null;
            if (id !== null)
              from.id = validateId(id, from);
            return new Request(io, socket, tid, from, to, token, internal, command, target2, value);
          } catch {
            return null;
          }
        }
        reply(value, opts = {}) {
          const socket = opts.socket || this.socket;
          const to = opts.to || this.from;
          this._sendReply(0, value || null, opts.token !== false, opts.closerNodes !== false, to, socket);
        }
        error(code, opts = {}) {
          const socket = opts.socket || this.socket;
          const to = opts.to || this.from;
          this._sendReply(code, null, opts.token === true, opts.closerNodes !== false, to, socket);
        }
        relay(value, to, opts) {
          const socket = opts && opts.socket || this.socket;
          const buffer = this._encodeRequest(null, value, to, socket);
          socket.trySend(buffer, to.port, to.host);
        }
        send(force = false) {
          if (this.destroyed)
            return;
          if (this.socket === null)
            return;
          if (this._buffer === null)
            this._buffer = this._encodeRequest(this.token, this.value, this.to, this.socket);
          if (!force && this._io.congestion.isFull()) {
            this._io._pending.push(this);
            return;
          }
          this._sendNow();
        }
        sendReply(error, value, token, hasCloserNodes) {
          this._sendReply(error, value, token, hasCloserNodes, this.from, this.socket, null);
        }
        _sendNow() {
          if (this.destroyed)
            return;
          this.sent++;
          this._io.congestion.send();
          this.socket.trySend(this._buffer, this.to.port, this.to.host);
          if (this._timeout)
            clearTimeout(this._timeout);
          this._timeout = setTimeout(oncycle, 1e3, this);
        }
        destroy(err) {
          if (this.destroyed)
            return;
          this.destroyed = true;
          const i = this._io.inflight.indexOf(this);
          if (i === -1)
            return;
          if (i === this._io.inflight.length - 1)
            this._io.inflight.pop();
          else
            this._io.inflight[i] = this._io.inflight.pop();
          this.onerror(err || errors.createDestroyedError(), this);
        }
        _sendReply(error, value, token, hasCloserNodes, from, socket) {
          if (socket === null || this.destroyed)
            return;
          const id = this._io.ephemeral === false && socket === this._io.serverSocket;
          const closerNodes = this.target !== null && hasCloserNodes ? this._io.table.closest(this.target) : EMPTY_ARRAY2;
          const state = { start: 0, end: 1 + 1 + 6 + 2, buffer: null };
          if (id)
            state.end += 32;
          if (token)
            state.end += 32;
          if (closerNodes.length > 0)
            peer.ipv4Array.preencode(state, closerNodes);
          if (error > 0)
            c.uint.preencode(state, error);
          if (value)
            c.buffer.preencode(state, value);
          state.buffer = b4a.allocUnsafe(state.end);
          state.buffer[state.start++] = RESPONSE_ID;
          state.buffer[state.start++] = (id ? 1 : 0) | (token ? 2 : 0) | (closerNodes.length > 0 ? 4 : 0) | (error > 0 ? 8 : 0) | (value ? 16 : 0);
          c.uint16.encode(state, this.tid);
          peer.ipv4.encode(state, from);
          if (id)
            c.fixed32.encode(state, this._io.table.id);
          if (token)
            c.fixed32.encode(state, this._io.token(from, 1));
          if (closerNodes.length > 0)
            peer.ipv4Array.encode(state, closerNodes);
          if (error > 0)
            c.uint.encode(state, error);
          if (value)
            c.buffer.encode(state, value);
          socket.trySend(state.buffer, from.port, from.host);
        }
        _encodeRequest(token, value, to, socket) {
          const id = this._io.ephemeral === false && socket === this._io.serverSocket;
          const state = { start: 0, end: 1 + 1 + 6 + 2, buffer: null };
          if (id)
            state.end += 32;
          if (token)
            state.end += 32;
          c.uint.preencode(state, this.command);
          if (this.target)
            state.end += 32;
          if (value)
            c.buffer.preencode(state, value);
          state.buffer = b4a.allocUnsafe(state.end);
          state.buffer[state.start++] = REQUEST_ID;
          state.buffer[state.start++] = (id ? 1 : 0) | (token ? 2 : 0) | (this.internal ? 4 : 0) | (this.target ? 8 : 0) | (value ? 16 : 0);
          c.uint16.encode(state, this.tid);
          peer.ipv4.encode(state, to);
          if (id)
            c.fixed32.encode(state, this._io.table.id);
          if (token)
            c.fixed32.encode(state, token);
          c.uint.encode(state, this.command);
          if (this.target)
            c.fixed32.encode(state, this.target);
          if (value)
            c.buffer.encode(state, value);
          return state.buffer;
        }
      };
      var CongestionWindow = class {
        constructor(maxWindow) {
          this._i = 0;
          this._total = 0;
          this._window = [0, 0, 0, 0];
          this._maxWindow = maxWindow;
        }
        isFull() {
          return this._total >= 2 * this._maxWindow || this._window[this._i] >= this._maxWindow;
        }
        recv() {
          if (this._window[this._i] > 0) {
            this._window[this._i]--;
            this._total--;
          }
        }
        send() {
          this._total++;
          this._window[this._i]++;
        }
        drain() {
          this._i = this._i + 1 & 3;
          this._total -= this._window[this._i];
          this._window[this._i] = 0;
        }
      };
      function noop() {
      }
      function oncycle(req) {
        req._timeout = null;
        req.oncycle(req);
        if (req.sent >= req.retries) {
          req.destroy(errors.createTimeoutError());
          req._io.ontimeout(req);
        } else {
          req.send();
        }
      }
      function decodeReply(from, state) {
        const flags = c.uint.decode(state);
        const tid = c.uint16.decode(state);
        const to = peer.ipv4.decode(state);
        const id = flags & 1 ? c.fixed32.decode(state) : null;
        const token = flags & 2 ? c.fixed32.decode(state) : null;
        const closerNodes = flags & 4 ? peer.ipv4Array.decode(state) : null;
        const error = flags & 8 ? c.uint.decode(state) : 0;
        const value = flags & 16 ? c.buffer.decode(state) : null;
        if (id !== null)
          from.id = validateId(id, from);
        try {
          return { tid, from, to, token, closerNodes, error, value };
        } catch {
          return null;
        }
      }
      function validateId(id, from) {
        return b4a.equals(peer.id(from.host, from.port, TMP), id) ? id : null;
      }
    }
  });

  // node_modules/dht-rpc/lib/commands.js
  var require_commands = __commonJS({
    "node_modules/dht-rpc/lib/commands.js"(exports) {
      exports.PING = 0;
      exports.PING_NAT = 1;
      exports.FIND_NODE = 2;
      exports.DOWN_HINT = 3;
    }
  });

  // node_modules/dht-rpc/lib/query.js
  var require_query = __commonJS({
    "node_modules/dht-rpc/lib/query.js"(exports, module) {
      var { Readable } = require_streamx();
      var b4a = require_b4a();
      var peer = require_peer();
      var { DOWN_HINT } = require_commands();
      var DONE = [];
      var DOWN = [];
      module.exports = class Query extends Readable {
        constructor(dht, target2, internal, command, value, opts = {}) {
          super();
          this.dht = dht;
          this.k = this.dht.table.k;
          this.target = target2;
          this.internal = internal;
          this.command = command;
          this.value = value;
          this.errors = 0;
          this.successes = 0;
          this.concurrency = opts.concurrency || this.dht.concurrency;
          this.inflight = 0;
          this.map = opts.map || defaultMap;
          this.maxSlow = opts.maxSlow === 0 ? 0 : opts.maxSlow || 5;
          this.closestReplies = [];
          this._slow = 0;
          this._slowdown = false;
          this._seen = /* @__PURE__ */ new Map();
          this._pending = [];
          this._fromTable = false;
          this._commit = opts.commit === true ? autoCommit : opts.commit || null;
          this._commiting = false;
          this._onvisitbound = this._onvisit.bind(this);
          this._onerrorbound = this._onerror.bind(this);
          this._oncyclebound = this._oncycle.bind(this);
          const nodes = opts.nodes || opts.closestNodes;
          const replies = opts.replies || opts.closestReplies;
          if (nodes) {
            for (let i = nodes.length - 1; i >= 0; i--) {
              const node = nodes[i];
              this._addPending({ id: node.id || peer.id(node.host, node.port), host: node.host, port: node.port }, null);
            }
          } else if (replies) {
            for (let i = replies.length - 1; i >= 0; i--) {
              this._addPending(replies[i].from, null);
            }
          }
        }
        get closestNodes() {
          const nodes = new Array(this.closestReplies.length);
          for (let i = 0; i < nodes.length; i++) {
            nodes[i] = this.closestReplies[i].from;
          }
          return nodes;
        }
        finished() {
          return new Promise((resolve, reject) => {
            const self = this;
            let error = null;
            this.resume();
            this.on("error", onerror);
            this.on("close", onclose);
            function onclose() {
              self.removeListener("error", onerror);
              self.removeListener("close", onclose);
              if (error)
                reject(error);
              else
                resolve();
            }
            function onerror(err) {
              error = err;
            }
          });
        }
        _addFromTable() {
          if (this._pending.length >= this.k)
            return;
          this._fromTable = true;
          const closest = this.dht.table.closest(this.target, this.k - this._pending.length);
          for (const node of closest) {
            this._addPending({ id: node.id, host: node.host, port: node.port }, null);
          }
        }
        async _open(cb) {
          this._addFromTable();
          if (this._pending.length >= this.k)
            return cb(null);
          for await (const node of this.dht._resolveBootstrapNodes()) {
            this._addPending(node, null);
          }
          cb(null);
        }
        _isCloser(id) {
          return this.closestReplies.length < this.k || this._compare(id, this.closestReplies[this.closestReplies.length - 1].from.id) < 0;
        }
        _addPending(node, ref) {
          const addr = node.host + ":" + node.port;
          const refs = this._seen.get(addr);
          const isCloser = this._isCloser(node.id);
          if (refs === DONE) {
            return isCloser;
          }
          if (refs === DOWN) {
            if (ref)
              this._downHint(ref, node);
            return isCloser;
          }
          if (refs) {
            if (ref !== null)
              refs.push(ref);
            return isCloser;
          }
          if (!isCloser) {
            return false;
          }
          this._seen.set(addr, ref === null ? [] : [ref]);
          this._pending.push(node);
          return true;
        }
        _read(cb) {
          this._readMore();
          cb(null);
        }
        _readMore() {
          if (this.destroying || this._commiting)
            return;
          const concurrency = (this._slowdown ? 3 : this.concurrency) + this._slow;
          while (this.inflight < concurrency && this._pending.length > 0) {
            const next = this._pending.pop();
            if (next && next.id && !this._isCloser(next.id))
              continue;
            this._visit(next);
          }
          if (!this._fromTable && this.successes === 0 && this.errors === 0) {
            this._slowdown = true;
          }
          if (this._pending.length > 0)
            return;
          if (this.inflight === 0 || this._slow <= this.maxSlow && this._slow === this.inflight && this.closestReplies.length >= this.k) {
            if (!this._fromTable && this.successes < this.k / 4) {
              this._addFromTable();
              this._readMore();
              return;
            }
            this._flush();
          }
        }
        _flush() {
          if (this._commiting)
            return;
          this._commiting = true;
          if (this._commit === null) {
            this.push(null);
            return;
          }
          const p = [];
          for (const m of this.closestReplies)
            p.push(this._commit(m, this.dht, this));
          this._endAfterCommit(p);
        }
        _endAfterCommit(ps) {
          if (!ps.length) {
            this.destroy(new Error("Too few nodes responded"));
            return;
          }
          const self = this;
          let pending = ps.length;
          let success = 0;
          for (const p of ps)
            p.then(ondone, onerror);
          function ondone() {
            success++;
            if (--pending === 0)
              self.push(null);
          }
          function onerror(err) {
            if (--pending > 0)
              return;
            if (success)
              self.push(null);
            else
              self.destroy(err);
          }
        }
        _dec(req) {
          if (req.oncycle === noop) {
            this._slow--;
          } else {
            req.oncycle = noop;
          }
          this.inflight--;
        }
        _onvisit(m, req) {
          this._dec(req);
          const addr = req.to.host + ":" + req.to.port;
          this._seen.set(addr, DONE);
          if (this._commiting)
            return;
          if (m.error === 0)
            this.successes++;
          else
            this.errors++;
          if (m.error === 0 && m.from.id !== null && this._isCloser(m.from.id))
            this._pushClosest(m);
          if (m.closerNodes !== null) {
            for (const node of m.closerNodes) {
              node.id = peer.id(node.host, node.port);
              if (this.dht._shouldAddNode !== null && !this.dht._shouldAddNode(node))
                continue;
              if (b4a.equals(node.id, this.dht.table.id))
                continue;
              if (!this._addPending(node, m.from))
                break;
            }
          }
          if (!this._fromTable && this.successes + this.errors >= this.concurrency) {
            this._slowdown = false;
          }
          if (m.error !== 0) {
            this._readMore();
            return;
          }
          const data = this.map(m);
          if (!data || this.push(data) !== false) {
            this._readMore();
          }
        }
        _onerror(_, req) {
          const addr = req.to.host + ":" + req.to.port;
          const refs = this._seen.get(addr);
          this._seen.set(addr, DOWN);
          for (const node of refs)
            this._downHint(node, req.to);
          this._dec(req);
          this.errors++;
          this._readMore();
        }
        _oncycle(req) {
          req.oncycle = noop;
          this._slow++;
          this._readMore();
        }
        _downHint(node, down) {
          const state = { start: 0, end: 6, buffer: b4a.allocUnsafe(6) };
          peer.ipv4.encode(state, down);
          this.dht._request(node, true, DOWN_HINT, null, state.buffer, noop, noop);
        }
        _pushClosest(m) {
          this.closestReplies.push(m);
          for (let i = this.closestReplies.length - 2; i >= 0; i--) {
            const prev = this.closestReplies[i];
            const cmp = this._compare(prev.from.id, m.from.id);
            if (cmp < 0)
              break;
            if (cmp === 0) {
              this.closestReplies.splice(i + 1, 1);
              break;
            }
            this.closestReplies[i + 1] = prev;
            this.closestReplies[i] = m;
          }
          if (this.closestReplies.length > this.k)
            this.closestReplies.pop();
        }
        _compare(a, b) {
          for (let i = 0; i < a.length; i++) {
            if (a[i] === b[i])
              continue;
            const t = this.target[i];
            return (t ^ a[i]) - (t ^ b[i]);
          }
          return 0;
        }
        _visit(to) {
          this.inflight++;
          const req = this.dht._request(to, this.internal, this.command, this.target, this.value, this._onvisitbound, this._onerrorbound);
          if (req === null) {
            this.destroy(new Error("Node was destroyed"));
            return;
          }
          req.oncycle = this._oncyclebound;
        }
      };
      function autoCommit(reply, dht, query) {
        if (!reply.token)
          return Promise.reject(new Error("No token received for closest node"));
        return dht.request({ token: reply.token, target: query.target, command: query.command, value: query.value }, reply.from);
      }
      function defaultMap(m) {
        return m;
      }
      function noop() {
      }
    }
  });

  // node_modules/dht-rpc/index.js
  var require_dht_rpc = __commonJS({
    "node_modules/dht-rpc/index.js"(exports, module) {
      var { EventEmitter } = __require("events");
      var Table = require_kademlia_routing_table();
      var TOS = require_time_ordered_set();
      var UDX = require_udx();
      var sodium = require_sodium_universal();
      var c = require_compact_encoding();
      var NatSampler = require_nat_sampler();
      var b4a = require_b4a();
      var IO = require_io();
      var Query = require_query();
      var peer = require_peer();
      var { UNKNOWN_COMMAND, INVALID_TOKEN } = require_errors();
      var { PING, PING_NAT, FIND_NODE, DOWN_HINT } = require_commands();
      var TMP = b4a.allocUnsafe(32);
      var TICK_INTERVAL = 5e3;
      var SLEEPING_INTERVAL = 3 * TICK_INTERVAL;
      var STABLE_TICKS = 240;
      var MORE_STABLE_TICKS = 3 * STABLE_TICKS;
      var REFRESH_TICKS = 60;
      var RECENT_NODE = 12;
      var OLD_NODE = 360;
      var DHT2 = class extends EventEmitter {
        constructor(opts = {}) {
          super();
          this.bootstrapNodes = opts.bootstrap === false ? [] : (opts.bootstrap || []).map(parseNode);
          this.table = new Table(opts.id || randomBytes(32));
          this.nodes = new TOS();
          this.udx = opts.udx || new UDX();
          this.io = new IO(this.table, this.udx, {
            ...opts,
            onrequest: this._onrequest.bind(this),
            onresponse: this._onresponse.bind(this),
            ontimeout: this._ontimeout.bind(this)
          });
          this.concurrency = opts.concurrency || 10;
          this.bootstrapped = false;
          this.ephemeral = opts.id ? !!opts.ephemeral : true;
          this.firewalled = this.io.firewalled;
          this.adaptive = typeof opts.ephemeral !== "boolean" && opts.adaptive !== false;
          this.destroyed = false;
          this._nat = new NatSampler();
          this._port = opts.port || 0;
          this._host = opts.host || "0.0.0.0";
          this._quickFirewall = opts.quickFirewall !== false;
          this._forcePersistent = opts.ephemeral === false;
          this._repinging = 0;
          this._checks = 0;
          this._tick = randomOffset(100);
          this._refreshTicks = randomOffset(REFRESH_TICKS);
          this._stableTicks = this.adaptive ? STABLE_TICKS : 0;
          this._tickInterval = setInterval(this._ontick.bind(this), TICK_INTERVAL);
          this._lastTick = Date.now();
          this._lastHost = null;
          this._shouldAddNode = opts.addNode || null;
          this._onrow = (row) => row.on("full", (node) => this._onfullrow(node, row));
          this._nonePersistentSamples = [];
          this._bootstrapping = this._bootstrap();
          this._bootstrapping.catch(noop);
          this.table.on("row", this._onrow);
          if (this.ephemeral === false)
            this.io.ephemeral = false;
          this.io.networkInterfaces.on("change", (interfaces) => this._onnetworkchange(interfaces));
          if (opts.nodes) {
            for (const node of opts.nodes)
              this.addNode(node);
          }
        }
        static bootstrapper(port, host, opts) {
          if (!port)
            throw new Error("Port is required");
          if (!host)
            throw new Error("Host is required");
          const id = peer.id(host, port);
          return new this({ port, id, ephemeral: false, firewalled: false, anyPort: false, bootstrap: [], ...opts });
        }
        get id() {
          return this.ephemeral ? null : this.table.id;
        }
        get host() {
          return this._nat.host;
        }
        get port() {
          return this._nat.port;
        }
        get socket() {
          return this.firewalled ? this.io.clientSocket : this.io.serverSocket;
        }
        onmessage(socket, buf, rinfo) {
          if (buf.byteLength > 1)
            this.io.onmessage(socket, buf, rinfo);
        }
        bind() {
          return this.io.bind();
        }
        address() {
          const socket = this.socket;
          return socket ? socket.address() : null;
        }
        addNode({ host, port }) {
          this._addNode({
            id: peer.id(host, port),
            port,
            host,
            token: null,
            to: null,
            sampled: 0,
            added: this._tick,
            pinged: 0,
            seen: 0,
            downHints: 0,
            prev: null,
            next: null
          });
        }
        toArray() {
          return this.nodes.toArray().map(({ host, port }) => ({ host, port }));
        }
        ready() {
          return this._bootstrapping;
        }
        findNode(target2, opts) {
          if (this.destroyed)
            throw new Error("Node destroyed");
          this._refreshTicks = REFRESH_TICKS;
          return new Query(this, target2, true, FIND_NODE, null, opts);
        }
        query({ target: target2, command, value }, opts) {
          if (this.destroyed)
            throw new Error("Node destroyed");
          this._refreshTicks = REFRESH_TICKS;
          return new Query(this, target2, false, command, value || null, opts);
        }
        ping({ host, port }, opts) {
          let value = null;
          if (opts && opts.size && opts.size > 0)
            value = b4a.alloc(opts.size);
          const req = this.io.createRequest({ id: null, host, port }, null, true, PING, null, value);
          return this._requestToPromise(req, opts);
        }
        request({ token = null, command, target: target2 = null, value = null }, { host, port }, opts) {
          const req = this.io.createRequest({ id: null, host, port }, token, false, command, target2, value);
          return this._requestToPromise(req, opts);
        }
        _requestToPromise(req, opts) {
          if (req === null)
            return Promise.reject(new Error("Node destroyed"));
          if (opts && opts.socket)
            req.socket = opts.socket;
          if (opts && opts.retry === false)
            req.retries = 0;
          return new Promise((resolve, reject) => {
            req.onresponse = resolve;
            req.onerror = reject;
            req.send();
          });
        }
        async _bootstrap() {
          const self = this;
          await Promise.resolve();
          await this.io.bind();
          this.emit("listening");
          let first = this.firewalled && this._quickFirewall && !this._forcePersistent;
          let testNat = false;
          const onlyFirewall = !this._forcePersistent;
          for (let i = 0; i < 2; i++) {
            await this._backgroundQuery(this.table.id).on("data", ondata).finished();
            if (this.bootstrapped || !testNat && !this._forcePersistent)
              break;
            if (!await this._updateNetworkState(onlyFirewall))
              break;
          }
          if (this.bootstrapped)
            return;
          this.bootstrapped = true;
          this.emit("ready");
          function ondata(data) {
            if (!first)
              return;
            first = false;
            const value = b4a.allocUnsafe(2);
            c.uint16.encode({ start: 0, end: 2, buffer: value }, self.io.serverSocket.address().port);
            self._request(data.from, true, PING_NAT, null, value, () => {
              testNat = true;
            }, noop);
          }
        }
        refresh() {
          const node = this.table.random();
          this._backgroundQuery(node ? node.id : this.table.id).on("error", noop);
        }
        destroy() {
          this.destroyed = true;
          clearInterval(this._tickInterval);
          return this.io.destroy();
        }
        _request(to, internal, command, target2, value, onresponse, onerror) {
          const req = this.io.createRequest(to, null, internal, command, target2, value);
          if (req === null)
            return null;
          req.onresponse = onresponse;
          req.onerror = onerror;
          req.send();
          return req;
        }
        _sampleBootstrapMaybe(from, to) {
          if (this._nonePersistentSamples.length >= Math.max(1, this.bootstrapNodes.length))
            return;
          const id = from.host + ":" + from.port;
          if (this._nonePersistentSamples.indexOf(id) > -1)
            return;
          this._nonePersistentSamples.push(id);
          this._nat.add(to.host, to.port);
        }
        _addNodeFromNetwork(sample, from, to) {
          if (this._shouldAddNode !== null && !this._shouldAddNode(from)) {
            return;
          }
          if (from.id === null) {
            this._sampleBootstrapMaybe(from, to);
            return;
          }
          const oldNode = this.table.get(from.id);
          if (oldNode) {
            if (sample && (oldNode.sampled === 0 || this._tick - oldNode.sampled >= OLD_NODE)) {
              oldNode.to = to;
              oldNode.sampled = this._tick;
              this._nat.add(to.host, to.port);
            }
            oldNode.pinged = oldNode.seen = this._tick;
            this.nodes.add(oldNode);
            return;
          }
          this._addNode({
            id: from.id,
            port: from.port,
            host: from.host,
            to,
            sampled: 0,
            added: this._tick,
            pinged: this._tick,
            seen: this._tick,
            downHints: 0,
            prev: null,
            next: null
          });
        }
        _addNode(node) {
          if (this.nodes.has(node) || b4a.equals(node.id, this.table.id))
            return;
          node.added = node.pinged = node.seen = this._tick;
          if (!this.table.add(node))
            return;
          this.nodes.add(node);
          if (node.to && node.sampled === 0) {
            node.sampled = this._tick;
            this._nat.add(node.to.host, node.to.port);
          }
          this.emit("add-node", node);
        }
        _removeStaleNode(node, lastSeen) {
          if (node.seen <= lastSeen)
            this._removeNode(node);
        }
        _removeNode(node) {
          if (!this.nodes.has(node))
            return;
          this.table.remove(node.id);
          this.nodes.remove(node);
          this.emit("remove-node", node);
        }
        _onwakeup() {
          this._tick += 2 * OLD_NODE;
          this._tick += 8 - (this._tick & 7) - 2;
          this._stableTicks = MORE_STABLE_TICKS;
          this._refreshTicks = 1;
          this._lastHost = null;
          if (this.adaptive && !this.ephemeral) {
            this.ephemeral = true;
            this.io.ephemeral = true;
            this.emit("ephemeral");
          }
          this.emit("wakeup");
        }
        _onfullrow(newNode, row) {
          if (!this.bootstrapped || this._repinging >= 3)
            return;
          let oldest = null;
          for (const node of row.nodes) {
            if (node.pinged === this._tick)
              continue;
            if (oldest === null || oldest.pinged > node.pinged || oldest.pinged === node.pinged && oldest.added > node.added)
              oldest = node;
          }
          if (oldest === null)
            return;
          if (this._tick - oldest.pinged < RECENT_NODE && this._tick - oldest.added > OLD_NODE)
            return;
          this._repingAndSwap(newNode, oldest);
        }
        _onnetworkchange(interfaces) {
          this.emit("network-change", interfaces);
        }
        _repingAndSwap(newNode, oldNode) {
          const self = this;
          const lastSeen = oldNode.seen;
          oldNode.pinged = this._tick;
          this._repinging++;
          this._request({ id: null, host: oldNode.host, port: oldNode.port }, true, PING, null, null, onsuccess, onswap);
          function onsuccess(m) {
            if (oldNode.seen <= lastSeen)
              return onswap();
            self._repinging--;
          }
          function onswap(e) {
            self._repinging--;
            self._removeNode(oldNode);
            self._addNode(newNode);
          }
        }
        _onrequest(req, external) {
          if (req.from.id !== null) {
            this._addNodeFromNetwork(!external, req.from, req.to);
          }
          if (req.internal) {
            switch (req.command) {
              case PING: {
                req.sendReply(0, null, false, false);
                return;
              }
              case PING_NAT: {
                if (req.value === null || req.value.byteLength < 2)
                  return;
                const port = c.uint16.decode({ start: 0, end: 2, buffer: req.value });
                if (port === 0)
                  return;
                req.from.port = port;
                req.sendReply(0, null, false, false);
                return;
              }
              case FIND_NODE: {
                if (!req.target)
                  return;
                req.sendReply(0, null, false, true);
                return;
              }
              case DOWN_HINT: {
                if (req.value === null || req.value.byteLength < 6)
                  return;
                if (this._checks < 10) {
                  sodium.crypto_generichash(TMP, req.value.subarray(0, 6));
                  const node = this.table.get(TMP);
                  if (node && (node.pinged < this._tick || node.downHints === 0)) {
                    node.downHints++;
                    this._check(node);
                  }
                }
                req.sendReply(0, null, false, false);
                return;
              }
            }
            req.sendReply(UNKNOWN_COMMAND, null, false, req.target !== null);
            return;
          }
          if (this.onrequest(req) === false) {
            req.sendReply(UNKNOWN_COMMAND, null, false, req.target !== null);
          }
        }
        onrequest(req) {
          return this.emit("request", req);
        }
        _onresponse(res, external) {
          this._addNodeFromNetwork(!external, res.from, res.to);
        }
        _ontimeout(req) {
          if (!req.to.id)
            return;
          const node = this.table.get(req.to.id);
          if (node)
            this._removeNode(node);
        }
        _pingSome() {
          let cnt = this.io.inflight.length > 2 ? 3 : 5;
          let oldest = this.nodes.oldest;
          if (!oldest) {
            this.refresh();
            return;
          }
          if (this._tick - oldest.pinged < RECENT_NODE) {
            cnt = 2;
          }
          while (cnt--) {
            if (!oldest || this._tick === oldest.pinged)
              continue;
            this._check(oldest);
            oldest = oldest.next;
          }
        }
        _check(node) {
          node.pinged = this._tick;
          const lastSeen = node.seen;
          const onresponse = () => {
            this._checks--;
            this._removeStaleNode(node, lastSeen);
          };
          const onerror = () => {
            this._checks--;
            this._removeNode(node);
          };
          this._checks++;
          this._request({ id: null, host: node.host, port: node.port }, true, PING, null, null, onresponse, onerror);
        }
        _ontick() {
          const time = Date.now();
          if (time - this._lastTick > SLEEPING_INTERVAL) {
            this._onwakeup();
          } else {
            this._tick++;
          }
          this._lastTick = time;
          if (!this.bootstrapped)
            return;
          if (this.adaptive && this.ephemeral && --this._stableTicks <= 0) {
            if (this._lastHost === this._nat.host) {
              this._stableTicks = MORE_STABLE_TICKS;
            } else {
              this._updateNetworkState();
            }
          }
          if ((this._tick & 7) === 0) {
            this._pingSome();
          }
          if ((this._tick & 63) === 0 && this.nodes.length < this.table.k || --this._refreshTicks <= 0) {
            this.refresh();
          }
        }
        async _updateNetworkState(onlyFirewall = false) {
          if (!this.ephemeral)
            return false;
          if (onlyFirewall && !this.firewalled)
            return false;
          const { host, port } = this._nat;
          if (!onlyFirewall) {
            this._stableTicks = MORE_STABLE_TICKS;
            this._lastHost = host;
          }
          if (host === null || port === 0) {
            return false;
          }
          const natSampler = this.firewalled ? new NatSampler() : this._nat;
          const firewalled = this.firewalled && await this._checkIfFirewalled(natSampler);
          if (firewalled)
            return false;
          this.firewalled = this.io.firewalled = false;
          if (!this.ephemeral || host !== this._nat.host || port !== this._nat.port)
            return false;
          if (natSampler.host !== host || natSampler.port === 0)
            return false;
          const id = peer.id(natSampler.host, natSampler.port);
          if (!onlyFirewall) {
            this.ephemeral = this.io.ephemeral = false;
          }
          if (natSampler !== this._nat) {
            this._nonePersistentSamples = [];
            this._nat = natSampler;
          }
          if (!b4a.equals(this.table.id, id)) {
            const nodes = this.table.toArray();
            this.table = this.io.table = new Table(id);
            for (const node of nodes) {
              if (b4a.equals(node.id, id))
                continue;
              if (!this.table.add(node))
                this.nodes.remove(node);
            }
            this.table.on("row", this._onrow);
            if (this.bootstrapped)
              this.refresh();
          }
          if (!this.ephemeral) {
            this.emit("persistent");
          }
          return true;
        }
        async *_resolveBootstrapNodes() {
          for (const node of this.bootstrapNodes) {
            let address;
            try {
              address = await this.udx.lookup(node.host, { family: 4 });
            } catch {
              continue;
            }
            yield {
              id: peer.id(address.host, node.port),
              host: address.host,
              port: node.port
            };
          }
        }
        async _addBootstrapNodes(nodes) {
          for await (const node of this._resolveBootstrapNodes()) {
            nodes.push(node);
          }
        }
        async _checkIfFirewalled(natSampler = new NatSampler()) {
          const nodes = [];
          for (let node = this.nodes.latest; node && nodes.length < 5; node = node.prev) {
            nodes.push(node);
          }
          if (nodes.length < 5)
            await this._addBootstrapNodes(nodes);
          if (nodes.length === 0)
            return true;
          const hosts = [];
          const value = b4a.allocUnsafe(2);
          c.uint16.encode({ start: 0, end: 2, buffer: value }, this.io.serverSocket.address().port);
          this.io.serverSocket.on("message", onmessage);
          const pongs = await requestAll(this, true, PING_NAT, value, nodes);
          if (!pongs.length)
            return true;
          let count = 0;
          for (const res of pongs) {
            if (hosts.indexOf(res.from.host) > -1) {
              count++;
              natSampler.add(res.to.host, res.to.port);
            }
          }
          this.io.serverSocket.removeListener("message", onmessage);
          if (count < (nodes.length >= 5 ? 3 : 1))
            return true;
          if (natSampler.host === null || this._nat.host !== natSampler.host)
            return true;
          if (natSampler.port === 0 || natSampler.port !== this.io.serverSocket.address().port)
            return true;
          return false;
          function onmessage(_, { host }) {
            hosts.push(host);
          }
        }
        _backgroundQuery(target2) {
          this._refreshTicks = REFRESH_TICKS;
          const backgroundCon = Math.min(this.concurrency, Math.max(2, this.concurrency / 8 | 0));
          const q = new Query(this, target2, true, FIND_NODE, null, { concurrency: backgroundCon, maxSlow: 0 });
          q.on("data", () => {
            q.concurrency = this.io.inflight.length < 3 ? this.concurrency : backgroundCon;
          });
          return q;
        }
      };
      DHT2.OK = 0;
      DHT2.ERROR_UNKNOWN_COMMAND = UNKNOWN_COMMAND;
      DHT2.ERROR_INVALID_TOKEN = INVALID_TOKEN;
      module.exports = DHT2;
      function parseNode(s) {
        if (typeof s === "object")
          return s;
        if (typeof s === "number")
          return { host: "127.0.0.1", port: s };
        const [host, port] = s.split(":");
        if (!port)
          throw new Error("Bootstrap node format is host:port");
        return {
          host,
          port: Number(port)
        };
      }
      function randomBytes(n) {
        const b = b4a.alloc(n);
        sodium.randombytes_buf(b);
        return b;
      }
      function randomOffset(n) {
        return n - (Math.random() * 0.5 * n | 0);
      }
      function requestAll(dht, internal, command, value, nodes) {
        let missing = nodes.length;
        const replies = [];
        return new Promise((resolve) => {
          for (const node of nodes) {
            const req = dht._request(node, internal, command, null, value, onsuccess, onerror);
            if (!req)
              return resolve(replies);
          }
          function onsuccess(res) {
            replies.push(res);
            if (--missing === 0)
              resolve(replies);
          }
          function onerror() {
            if (--missing === 0)
              resolve(replies);
          }
        });
      }
      function noop() {
      }
    }
  });

  // node_modules/@hyperswarm/dht/lib/messages.js
  var require_messages = __commonJS({
    "node_modules/@hyperswarm/dht/lib/messages.js"(exports) {
      var c = require_compact_encoding();
      var net = require_compact_encoding_net();
      var ipv4 = net.ipv4Address;
      var ipv4Array = c.array(ipv4);
      var ipv6 = net.ipv6Address;
      var ipv6Array = c.array(ipv6);
      exports.handshake = {
        preencode(state, m) {
          state.end += 1 + 1 + (m.peerAddress ? 6 : 0) + (m.relayAddress ? 6 : 0);
          c.buffer.preencode(state, m.noise);
        },
        encode(state, m) {
          const flags = (m.peerAddress ? 1 : 0) | (m.relayAddress ? 2 : 0);
          c.uint.encode(state, flags);
          c.uint.encode(state, m.mode);
          c.buffer.encode(state, m.noise);
          if (m.peerAddress)
            ipv4.encode(state, m.peerAddress);
          if (m.relayAddress)
            ipv4.encode(state, m.relayAddress);
        },
        decode(state) {
          const flags = c.uint.decode(state);
          return {
            mode: c.uint.decode(state),
            noise: c.buffer.decode(state),
            peerAddress: flags & 1 ? ipv4.decode(state) : null,
            relayAddress: flags & 2 ? ipv4.decode(state) : null
          };
        }
      };
      var relayInfo = {
        preencode(state, m) {
          state.end += 12;
        },
        encode(state, m) {
          ipv4.encode(state, m.relayAddress);
          ipv4.encode(state, m.peerAddress);
        },
        decode(state) {
          return {
            relayAddress: ipv4.decode(state),
            peerAddress: ipv4.decode(state)
          };
        }
      };
      var relayInfoArray = c.array(relayInfo);
      var holepunchInfo = {
        preencode(state, m) {
          c.uint.preencode(state, m.id);
          relayInfoArray.preencode(state, m.relays);
        },
        encode(state, m) {
          c.uint.encode(state, m.id);
          relayInfoArray.encode(state, m.relays);
        },
        decode(state) {
          return {
            id: c.uint.decode(state),
            relays: relayInfoArray.decode(state)
          };
        }
      };
      var udxInfo = {
        preencode(state, m) {
          state.end += 2;
          c.uint.preencode(state, m.id);
          c.uint.preencode(state, m.seq);
        },
        encode(state, m) {
          c.uint.encode(state, 1);
          c.uint.encode(state, m.reusableSocket ? 1 : 0);
          c.uint.encode(state, m.id);
          c.uint.encode(state, m.seq);
        },
        decode(state) {
          const version = c.uint.decode(state);
          const features = c.uint.decode(state);
          return {
            version,
            reusableSocket: (features & 1) !== 0,
            id: c.uint.decode(state),
            seq: c.uint.decode(state)
          };
        }
      };
      var secretStreamInfo = {
        preencode(state, m) {
          c.uint.preencode(state, 1);
        },
        encode(state, m) {
          c.uint.encode(state, 1);
        },
        decode(state) {
          return {
            version: c.uint.decode(state)
          };
        }
      };
      exports.noisePayload = {
        preencode(state, m) {
          state.end += 4;
          if (m.holepunch)
            holepunchInfo.preencode(state, m.holepunch);
          if (m.addresses4 && m.addresses4.length)
            ipv4Array.preencode(state, m.addresses4);
          if (m.addresses6 && m.addresses6.length)
            ipv6Array.preencode(state, m.addresses6);
          if (m.udx)
            udxInfo.preencode(state, m.udx);
          if (m.secretStream)
            secretStreamInfo.preencode(state, m.secretStream);
        },
        encode(state, m) {
          let flags = 0;
          if (m.holepunch)
            flags |= 1;
          if (m.addresses4 && m.addresses4.length)
            flags |= 2;
          if (m.addresses6 && m.addresses6.length)
            flags |= 4;
          if (m.udx)
            flags |= 8;
          if (m.secretStream)
            flags |= 16;
          c.uint.encode(state, 1);
          c.uint.encode(state, flags);
          c.uint.encode(state, m.error);
          c.uint.encode(state, m.firewall);
          if (m.holepunch)
            holepunchInfo.encode(state, m.holepunch);
          if (m.addresses4 && m.addresses4.length)
            ipv4Array.encode(state, m.addresses4);
          if (m.addresses6 && m.addresses6.length)
            ipv6Array.encode(state, m.addresses6);
          if (m.udx)
            udxInfo.encode(state, m.udx);
          if (m.secretStream)
            secretStreamInfo.encode(state, m.secretStream);
        },
        decode(state) {
          const version = c.uint.decode(state);
          if (version !== 1) {
            return {
              version,
              error: 0,
              firewall: 0,
              holepunch: null,
              addresses4: [],
              addresses6: [],
              udx: null,
              secretStream: null
            };
          }
          const flags = c.uint.decode(state);
          return {
            version,
            error: c.uint.decode(state),
            firewall: c.uint.decode(state),
            holepunch: (flags & 1) !== 0 ? holepunchInfo.decode(state) : null,
            addresses4: (flags & 2) !== 0 ? ipv4Array.decode(state) : [],
            addresses6: (flags & 4) !== 0 ? ipv6Array.decode(state) : [],
            udx: (flags & 8) !== 0 ? udxInfo.decode(state) : null,
            secretStream: (flags & 16) !== 0 ? secretStreamInfo.decode(state) : null
          };
        }
      };
      exports.holepunch = {
        preencode(state, m) {
          state.end += 2;
          c.uint.preencode(state, m.id);
          c.buffer.preencode(state, m.payload);
          if (m.peerAddress)
            ipv4.preencode(state, m.peerAddress);
        },
        encode(state, m) {
          const flags = m.peerAddress ? 1 : 0;
          c.uint.encode(state, flags);
          c.uint.encode(state, m.mode);
          c.uint.encode(state, m.id);
          c.buffer.encode(state, m.payload);
          if (m.peerAddress)
            ipv4.encode(state, m.peerAddress);
        },
        decode(state) {
          const flags = c.uint.decode(state);
          return {
            mode: c.uint.decode(state),
            id: c.uint.decode(state),
            payload: c.buffer.decode(state),
            peerAddress: flags & 1 ? ipv4.decode(state) : null
          };
        }
      };
      exports.holepunchPayload = {
        preencode(state, m) {
          state.end += 4;
          if (m.addresses)
            ipv4Array.preencode(state, m.addresses);
          if (m.remoteAddress)
            state.end += 6;
          if (m.token)
            state.end += 32;
          if (m.remoteToken)
            state.end += 32;
        },
        encode(state, m) {
          const flags = (m.connected ? 1 : 0) | (m.punching ? 2 : 0) | (m.addresses ? 4 : 0) | (m.remoteAddress ? 8 : 0) | (m.token ? 16 : 0) | (m.remoteToken ? 32 : 0);
          c.uint.encode(state, flags);
          c.uint.encode(state, m.error);
          c.uint.encode(state, m.firewall);
          c.uint.encode(state, m.round);
          if (m.addresses)
            ipv4Array.encode(state, m.addresses);
          if (m.remoteAddress)
            ipv4.encode(state, m.remoteAddress);
          if (m.token)
            c.fixed32.encode(state, m.token);
          if (m.remoteToken)
            c.fixed32.encode(state, m.remoteToken);
        },
        decode(state) {
          const flags = c.uint.decode(state);
          return {
            error: c.uint.decode(state),
            firewall: c.uint.decode(state),
            round: c.uint.decode(state),
            connected: (flags & 1) !== 0,
            punching: (flags & 2) !== 0,
            addresses: (flags & 4) !== 0 ? ipv4Array.decode(state) : null,
            remoteAddress: (flags & 8) !== 0 ? ipv4.decode(state) : null,
            token: (flags & 16) !== 0 ? c.fixed32.decode(state) : null,
            remoteToken: (flags & 32) !== 0 ? c.fixed32.decode(state) : null
          };
        }
      };
      var peer = exports.peer = {
        preencode(state, m) {
          state.end += 32;
          ipv4Array.preencode(state, m.relayAddresses);
        },
        encode(state, m) {
          c.fixed32.encode(state, m.publicKey);
          ipv4Array.encode(state, m.relayAddresses);
        },
        decode(state) {
          return {
            publicKey: c.fixed32.decode(state),
            relayAddresses: ipv4Array.decode(state)
          };
        }
      };
      exports.peers = c.array(peer);
      exports.announce = {
        preencode(state, m) {
          state.end++;
          if (m.peer)
            peer.preencode(state, m.peer);
          if (m.refresh)
            state.end += 32;
          if (m.signature)
            state.end += 64;
        },
        encode(state, m) {
          const flags = (m.peer ? 1 : 0) | (m.refresh ? 2 : 0) | (m.signature ? 4 : 0);
          c.uint.encode(state, flags);
          if (m.peer)
            peer.encode(state, m.peer);
          if (m.refresh)
            c.fixed32.encode(state, m.refresh);
          if (m.signature)
            c.fixed64.encode(state, m.signature);
        },
        decode(state) {
          const flags = c.uint.decode(state);
          return {
            peer: (flags & 1) !== 0 ? peer.decode(state) : null,
            refresh: (flags & 2) !== 0 ? c.fixed32.decode(state) : null,
            signature: (flags & 4) !== 0 ? c.fixed64.decode(state) : null
          };
        }
      };
      exports.mutableSignable = {
        preencode(state, m) {
          c.uint.preencode(state, m.seq);
          c.buffer.preencode(state, m.value);
        },
        encode(state, m) {
          c.uint.encode(state, m.seq);
          c.buffer.encode(state, m.value);
        },
        decode(state) {
          return {
            seq: c.uint.decode(state),
            value: c.buffer.decode(state)
          };
        }
      };
      exports.mutablePutRequest = {
        preencode(state, m) {
          c.fixed32.preencode(state, m.publicKey);
          c.uint.preencode(state, m.seq);
          c.buffer.preencode(state, m.value);
          c.fixed64.preencode(state, m.signature);
        },
        encode(state, m) {
          c.fixed32.encode(state, m.publicKey);
          c.uint.encode(state, m.seq);
          c.buffer.encode(state, m.value);
          c.fixed64.encode(state, m.signature);
        },
        decode(state) {
          return {
            publicKey: c.fixed32.decode(state),
            seq: c.uint.decode(state),
            value: c.buffer.decode(state),
            signature: c.fixed64.decode(state)
          };
        }
      };
      exports.mutableGetResponse = {
        preencode(state, m) {
          c.uint.preencode(state, m.seq);
          c.buffer.preencode(state, m.value);
          c.fixed64.preencode(state, m.signature);
        },
        encode(state, m) {
          c.uint.encode(state, m.seq);
          c.buffer.encode(state, m.value);
          c.fixed64.encode(state, m.signature);
        },
        decode(state) {
          return {
            seq: c.uint.decode(state),
            value: c.buffer.decode(state),
            signature: c.fixed64.decode(state)
          };
        }
      };
    }
  });

  // node_modules/@hyperswarm/dht/lib/socket-pool.js
  var require_socket_pool = __commonJS({
    "node_modules/@hyperswarm/dht/lib/socket-pool.js"(exports, module) {
      var b4a = require_b4a();
      var LINGER_TIME = 3e3;
      module.exports = class SocketPool {
        constructor(dht) {
          this._dht = dht;
          this._sockets = /* @__PURE__ */ new Map();
          this._lingering = /* @__PURE__ */ new Set();
          this.routes = new SocketRoutes(this);
        }
        _onmessage(ref, data, address) {
          this._dht.onmessage(ref.socket, data, address);
        }
        _add(ref) {
          this._sockets.set(ref.socket, ref);
        }
        _remove(ref) {
          this._sockets.delete(ref.socket);
          this._lingering.delete(ref);
        }
        lookup(socket) {
          return this._sockets.get(socket) || null;
        }
        setReusable(socket, bool) {
          const ref = this.lookup(socket);
          if (ref)
            ref.reusable = bool;
        }
        acquire() {
          return new SocketRef(this);
        }
        async destroy() {
          const closing = [];
          for (const ref of this._sockets.values()) {
            ref._unlinger();
            closing.push(ref.socket.close());
          }
          await Promise.allSettled(closing);
        }
      };
      var SocketRoutes = class {
        constructor(pool) {
          this._pool = pool;
          this._routes = /* @__PURE__ */ new Map();
        }
        add(publicKey, rawStream) {
          if (rawStream.socket)
            this._onconnect(publicKey, rawStream);
          else
            rawStream.on("connect", this._onconnect.bind(this, publicKey, rawStream));
        }
        get(publicKey) {
          const id = b4a.toString(publicKey, "hex");
          const route = this._routes.get(id);
          if (!route)
            return null;
          return route;
        }
        _onconnect(publicKey, rawStream) {
          const id = b4a.toString(publicKey, "hex");
          const socket = rawStream.socket;
          let route = this._routes.get(id);
          if (!route) {
            const gc = () => {
              if (this._routes.get(id) === route)
                this._routes.delete(id);
              socket.removeListener("close", gc);
            };
            route = {
              socket,
              address: { host: rawStream.remoteHost, port: rawStream.remotePort },
              gc
            };
            this._routes.set(id, route);
            socket.on("close", gc);
          }
          this._pool.setReusable(socket, true);
          rawStream.on("error", () => {
            this._pool.setReusable(socket, false);
            if (!route)
              route = this._routes.get(id);
            if (route && route.socket === socket)
              route.gc();
          });
        }
      };
      var SocketRef = class {
        constructor(pool) {
          this._pool = pool;
          this.onholepunchmessage = noop;
          this.reusable = false;
          this.socket = pool._dht._udx.createSocket();
          this.socket.on("close", this._onclose.bind(this)).on("message", this._onmessage.bind(this)).on("idle", this._onidle.bind(this)).on("busy", this._onbusy.bind(this)).bind();
          this._refs = 1;
          this._released = false;
          this._closed = false;
          this._timeout = null;
          this._wasBusy = false;
          this._pool._add(this);
        }
        _onclose() {
          this._pool._remove(this);
        }
        _onmessage(data, address) {
          if (data.byteLength > 1) {
            this._pool._onmessage(this, data, address);
          } else {
            this.onholepunchmessage(data, address, this);
          }
        }
        _onidle() {
          this._closeMaybe();
        }
        _onbusy() {
          this._wasBusy = true;
          this._unlinger();
        }
        _reset() {
          this.onholepunchmessage = noop;
        }
        _closeMaybe() {
          if (this._refs === 0 && this.socket.idle && !this._timeout)
            this._close();
        }
        _lingeringClose() {
          this._pool._lingering.delete(this);
          this._timeout = null;
          this._closeMaybe();
        }
        _close() {
          this._unlinger();
          if (this.reusable && this._wasBusy) {
            this._wasBusy = false;
            this._pool._lingering.add(this);
            this._timeout = setTimeout(this._lingeringClose.bind(this), LINGER_TIME);
            return;
          }
          this._closed = true;
          this.socket.close();
        }
        _unlinger() {
          if (this._timeout !== null) {
            clearTimeout(this._timeout);
            this._pool._lingering.delete(this);
            this._timeout = null;
          }
        }
        get free() {
          return this._refs === 0;
        }
        active() {
          this._refs++;
          this._unlinger();
        }
        inactive() {
          this._refs--;
          this._closeMaybe();
        }
        address() {
          return this.socket.address();
        }
        release() {
          if (this._released)
            return;
          this._released = true;
          this._reset();
          this._refs--;
          this._closeMaybe();
        }
      };
      function noop() {
      }
    }
  });

  // node_modules/record-cache/index.js
  var require_record_cache = __commonJS({
    "node_modules/record-cache/index.js"(exports, module) {
      var b4a = require_b4a();
      var EMPTY = [];
      module.exports = RecordCache;
      function RecordSet() {
        this.list = [];
        this.map = /* @__PURE__ */ new Map();
      }
      RecordSet.prototype.add = function(record, value) {
        var k = toString(record);
        var r = this.map.get(k);
        if (r)
          return false;
        r = { index: this.list.length, record: value || record };
        this.list.push(r);
        this.map.set(k, r);
        return true;
      };
      RecordSet.prototype.remove = function(record) {
        var k = toString(record);
        var r = this.map.get(k);
        if (!r)
          return false;
        swap(this.list, r.index, this.list.length - 1);
        this.list.pop();
        this.map.delete(k);
        return true;
      };
      function RecordStore() {
        this.records = /* @__PURE__ */ new Map();
        this.size = 0;
      }
      RecordStore.prototype.add = function(name, record, value) {
        var r = this.records.get(name);
        if (!r) {
          r = new RecordSet();
          this.records.set(name, r);
        }
        if (r.add(record, value)) {
          this.size++;
          return true;
        }
        return false;
      };
      RecordStore.prototype.remove = function(name, record, value) {
        var r = this.records.get(name);
        if (!r)
          return false;
        if (r.remove(record, value)) {
          this.size--;
          if (!r.map.size)
            this.records.delete(name);
          return true;
        }
        return false;
      };
      RecordStore.prototype.get = function(name) {
        var r = this.records.get(name);
        return r ? r.list : EMPTY;
      };
      function RecordCache(opts) {
        if (!(this instanceof RecordCache))
          return new RecordCache(opts);
        if (!opts)
          opts = {};
        this.maxSize = opts.maxSize || Infinity;
        this.maxAge = opts.maxAge || 0;
        this._onstale = opts.onStale || opts.onstale || null;
        this._fresh = new RecordStore();
        this._stale = new RecordStore();
        this._interval = null;
        this._gced = false;
        if (this.maxAge && this.maxAge < Infinity) {
          var tick = Math.ceil(2 / 3 * this.maxAge);
          this._interval = setInterval(this._gcAuto.bind(this), tick);
          if (this._interval.unref)
            this._interval.unref();
        }
      }
      Object.defineProperty(RecordCache.prototype, "size", {
        get: function() {
          return this._fresh.size + this._stale.size;
        }
      });
      RecordCache.prototype.add = function(name, record, value) {
        this._stale.remove(name, record, value);
        if (this._fresh.add(name, record, value) && this._fresh.size > this.maxSize) {
          this._gc();
        }
      };
      RecordCache.prototype.remove = function(name, record, value) {
        this._fresh.remove(name, record, value);
        this._stale.remove(name, record, value);
      };
      RecordCache.prototype.get = function(name, n) {
        var a = this._fresh.get(name);
        var b = this._stale.get(name);
        var aLen = a.length;
        var bLen = b.length;
        var len = aLen + bLen;
        if (n > len || !n)
          n = len;
        var result = new Array(n);
        for (var i = 0; i < n; i++) {
          var j = Math.floor(Math.random() * (aLen + bLen));
          if (j < aLen) {
            result[i] = a[j].record;
            swap(a, j, --aLen);
          } else {
            j -= aLen;
            result[i] = b[j].record;
            swap(b, j, --bLen);
          }
        }
        return result;
      };
      RecordCache.prototype._gcAuto = function() {
        if (!this._gced)
          this._gc();
        this._gced = false;
      };
      RecordCache.prototype._gc = function() {
        if (this._onstale && this._stale.size > 0)
          this._onstale(this._stale);
        this._stale = this._fresh;
        this._fresh = new RecordStore();
        this._gced = true;
      };
      RecordCache.prototype.clear = function() {
        this._gc();
        this._gc();
      };
      RecordCache.prototype.destroy = function() {
        this.clear();
        clearInterval(this._interval);
        this._interval = null;
      };
      function toString(record) {
        return b4a.isBuffer(record) ? b4a.toString(record, "hex") : record;
      }
      function swap(list, a, b) {
        var tmp = list[a];
        tmp.index = b;
        list[b].index = a;
        list[a] = list[b];
        list[b] = tmp;
      }
    }
  });

  // node_modules/xache/index.js
  var require_xache = __commonJS({
    "node_modules/xache/index.js"(exports, module) {
      module.exports = class MaxCache {
        constructor({ maxSize, maxAge, createMap }) {
          this.maxSize = maxSize;
          this.maxAge = maxAge;
          this._createMap = createMap || defaultCreateMap;
          this._latest = this._createMap();
          this._oldest = this._createMap();
          this._retained = this._createMap();
          this._gced = false;
          this._interval = null;
          if (this.maxAge > 0 && this.maxAge < Infinity) {
            const tick = Math.ceil(2 / 3 * this.maxAge);
            this._interval = setInterval(this._gcAuto.bind(this), tick);
            if (this._interval.unref)
              this._interval.unref();
          }
        }
        *[Symbol.iterator]() {
          for (const it of [this._latest, this._oldest, this._retained]) {
            yield* it;
          }
        }
        *keys() {
          for (const it of [this._latest, this._oldest, this._retained]) {
            yield* it.keys();
          }
        }
        *values() {
          for (const it of [this._latest, this._oldest, this._retained]) {
            yield* it.values();
          }
        }
        destroy() {
          this.clear();
          clearInterval(this._interval);
          this._interval = null;
        }
        clear() {
          this._gced = true;
          this._latest.clear();
          this._oldest.clear();
          this._retained.clear();
        }
        set(k, v) {
          if (this._retained.has(k))
            return this;
          this._latest.set(k, v);
          this._oldest.delete(k) || this._retained.delete(k);
          if (this._latest.size >= this.maxSize)
            this._gc();
          return this;
        }
        retain(k, v) {
          this._retained.set(k, v);
          this._latest.delete(k) || this._oldest.delete(k);
          return this;
        }
        delete(k) {
          return this._latest.delete(k) || this._oldest.delete(k) || this._retained.delete(k);
        }
        has(k) {
          return this._latest.has(k) || this._oldest.has(k) || this._retained.has(k);
        }
        get(k) {
          if (this._latest.has(k)) {
            return this._latest.get(k);
          }
          if (this._oldest.has(k)) {
            const v = this._oldest.get(k);
            this._latest.set(k, v);
            this._oldest.delete(k);
            return v;
          }
          if (this._retained.has(k)) {
            return this._retained.get(k);
          }
          return null;
        }
        _gcAuto() {
          if (!this._gced)
            this._gc();
          this._gced = false;
        }
        _gc() {
          this._gced = true;
          this._oldest = this._latest;
          this._latest = this._createMap();
        }
      };
      function defaultCreateMap() {
        return /* @__PURE__ */ new Map();
      }
    }
  });

  // node_modules/hypercore-crypto/index.js
  var require_hypercore_crypto = __commonJS({
    "node_modules/hypercore-crypto/index.js"(exports) {
      var sodium = require_sodium_universal();
      var c = require_compact_encoding();
      var b4a = require_b4a();
      var LEAF_TYPE = b4a.from([0]);
      var PARENT_TYPE = b4a.from([1]);
      var ROOT_TYPE = b4a.from([2]);
      var HYPERCORE = b4a.from("hypercore");
      exports.keyPair = function(seed) {
        const publicKey = b4a.allocUnsafe(sodium.crypto_sign_PUBLICKEYBYTES);
        const secretKey = b4a.allocUnsafe(sodium.crypto_sign_SECRETKEYBYTES);
        if (seed)
          sodium.crypto_sign_seed_keypair(publicKey, secretKey, seed);
        else
          sodium.crypto_sign_keypair(publicKey, secretKey);
        return {
          publicKey,
          secretKey
        };
      };
      exports.validateKeyPair = function(keyPair) {
        const pk = b4a.allocUnsafe(sodium.crypto_sign_PUBLICKEYBYTES);
        sodium.crypto_sign_ed25519_sk_to_pk(pk, keyPair.secretKey);
        return b4a.equals(pk, keyPair.publicKey);
      };
      exports.sign = function(message, secretKey) {
        const signature = b4a.allocUnsafe(sodium.crypto_sign_BYTES);
        sodium.crypto_sign_detached(signature, message, secretKey);
        return signature;
      };
      exports.verify = function(message, signature, publicKey) {
        return sodium.crypto_sign_verify_detached(signature, message, publicKey);
      };
      exports.data = function(data) {
        const out = b4a.allocUnsafe(32);
        sodium.crypto_generichash_batch(out, [
          LEAF_TYPE,
          c.encode(c.uint64, data.byteLength),
          data
        ]);
        return out;
      };
      exports.parent = function(a, b) {
        if (a.index > b.index) {
          const tmp = a;
          a = b;
          b = tmp;
        }
        const out = b4a.allocUnsafe(32);
        sodium.crypto_generichash_batch(out, [
          PARENT_TYPE,
          c.encode(c.uint64, a.size + b.size),
          a.hash,
          b.hash
        ]);
        return out;
      };
      exports.tree = function(roots, out) {
        const buffers = new Array(3 * roots.length + 1);
        let j = 0;
        buffers[j++] = ROOT_TYPE;
        for (let i = 0; i < roots.length; i++) {
          const r = roots[i];
          buffers[j++] = r.hash;
          buffers[j++] = c.encode(c.uint64, r.index);
          buffers[j++] = c.encode(c.uint64, r.size);
        }
        if (!out)
          out = b4a.allocUnsafe(32);
        sodium.crypto_generichash_batch(out, buffers);
        return out;
      };
      exports.randomBytes = function(n) {
        const buf = b4a.allocUnsafe(n);
        sodium.randombytes_buf(buf);
        return buf;
      };
      exports.discoveryKey = function(publicKey) {
        const digest = b4a.allocUnsafe(32);
        sodium.crypto_generichash(digest, HYPERCORE, publicKey);
        return digest;
      };
      if (sodium.sodium_free) {
        exports.free = function(secureBuf) {
          if (secureBuf.secure)
            sodium.sodium_free(secureBuf);
        };
      } else {
        exports.free = function() {
        };
      }
      exports.namespace = function(name, count) {
        const ids = typeof count === "number" ? range(count) : count;
        const buf = b4a.allocUnsafe(32 * ids.length);
        const list = new Array(ids.length);
        const ns = b4a.allocUnsafe(33);
        sodium.crypto_generichash(ns.subarray(0, 32), typeof name === "string" ? b4a.from(name) : name);
        for (let i = 0; i < list.length; i++) {
          list[i] = buf.subarray(32 * i, 32 * i + 32);
          ns[32] = ids[i];
          sodium.crypto_generichash(list[i], ns);
        }
        return list;
      };
      function range(count) {
        const arr = new Array(count);
        for (let i = 0; i < count; i++)
          arr[i] = i;
        return arr;
      }
    }
  });

  // node_modules/@hyperswarm/dht/lib/constants.js
  var require_constants = __commonJS({
    "node_modules/@hyperswarm/dht/lib/constants.js"(exports) {
      var crypto = require_hypercore_crypto();
      var COMMANDS = exports.COMMANDS = {
        PEER_HANDSHAKE: 0,
        PEER_HOLEPUNCH: 1,
        FIND_PEER: 2,
        LOOKUP: 3,
        ANNOUNCE: 4,
        UNANNOUNCE: 5,
        MUTABLE_PUT: 6,
        MUTABLE_GET: 7,
        IMMUTABLE_PUT: 8,
        IMMUTABLE_GET: 9
      };
      exports.BOOTSTRAP_NODES = [
        { host: "node1.hyperdht.org", port: 49737 },
        { host: "node2.hyperdht.org", port: 49737 },
        { host: "node3.hyperdht.org", port: 49737 }
      ];
      exports.FIREWALL = {
        UNKNOWN: 0,
        OPEN: 1,
        CONSISTENT: 2,
        RANDOM: 3
      };
      exports.ERROR = {
        NONE: 0,
        ABORTED: 1,
        VERSION_MISMATCH: 2,
        SEQ_REUSED: 16,
        SEQ_TOO_LOW: 17
      };
      var [
        NS_ANNOUNCE,
        NS_UNANNOUNCE,
        NS_MUTABLE_PUT,
        NS_PEER_HANDSHAKE,
        NS_PEER_HOLEPUNCH
      ] = crypto.namespace("hyperswarm/dht", [
        COMMANDS.ANNOUNCE,
        COMMANDS.UNANNOUNCE,
        COMMANDS.MUTABLE_PUT,
        COMMANDS.PEER_HANDSHAKE,
        COMMANDS.PEER_HOLEPUNCH
      ]);
      exports.NS = {
        ANNOUNCE: NS_ANNOUNCE,
        UNANNOUNCE: NS_UNANNOUNCE,
        MUTABLE_PUT: NS_MUTABLE_PUT,
        PEER_HANDSHAKE: NS_PEER_HANDSHAKE,
        PEER_HOLEPUNCH: NS_PEER_HOLEPUNCH
      };
    }
  });

  // node_modules/@hyperswarm/dht/lib/persistent.js
  var require_persistent = __commonJS({
    "node_modules/@hyperswarm/dht/lib/persistent.js"(exports, module) {
      var c = require_compact_encoding();
      var sodium = require_sodium_universal();
      var RecordCache = require_record_cache();
      var Cache = require_xache();
      var b4a = require_b4a();
      var m = require_messages();
      var { NS, ERROR } = require_constants();
      var EMPTY = b4a.alloc(0);
      var TMP = b4a.allocUnsafe(32);
      var rawArray = c.array(c.raw);
      module.exports = class Persistent {
        constructor(dht, { maxSize, maxAge }) {
          this.dht = dht;
          this.records = new RecordCache({ maxSize, maxAge });
          this.refreshes = new Cache({ maxSize, maxAge });
          this.mutables = new Cache({ maxSize: Math.floor(maxSize / 2), maxAge });
          this.immutables = new Cache({ maxSize: Math.floor(maxSize / 2), maxAge });
        }
        onlookup(req) {
          if (!req.target)
            return;
          const k = b4a.toString(req.target, "hex");
          const records = this.records.get(k, 20);
          const fwd = this.dht._router.get(k);
          if (fwd && records.length < 20)
            records.push(fwd.record);
          req.reply(records.length ? c.encode(rawArray, records) : null);
        }
        onfindpeer(req) {
          if (!req.target)
            return;
          const fwd = this.dht._router.get(req.target);
          req.reply(fwd ? fwd.record : null);
        }
        unannounce(target2, publicKey) {
          const k = b4a.toString(target2, "hex");
          sodium.crypto_generichash(TMP, publicKey);
          if (b4a.equals(TMP, target2))
            this.dht._router.delete(k);
          this.records.remove(k, publicKey);
        }
        onunannounce(req) {
          if (!req.target || !req.token)
            return;
          const unann = decode2(m.announce, req.value);
          if (unann === null)
            return;
          const { peer, signature } = unann;
          if (!peer || !signature)
            return;
          const signable = annSignable(req.target, req.token, this.dht.id, unann, NS.UNANNOUNCE);
          if (!sodium.crypto_sign_verify_detached(signature, signable, peer.publicKey)) {
            return;
          }
          this.unannounce(req.target, peer.publicKey);
          req.reply(null, { token: false, closerNodes: false });
        }
        _onrefresh(token, req) {
          sodium.crypto_generichash(TMP, token);
          const activeRefresh = b4a.toString(TMP, "hex");
          const r = this.refreshes.get(activeRefresh);
          if (!r)
            return;
          const { announceSelf, k, record } = r;
          const publicKey = record.subarray(0, 32);
          if (announceSelf) {
            this.dht._router.set(k, {
              relay: req.from,
              record,
              onconnect: null,
              onholepunch: null
            });
            this.records.remove(k, publicKey);
          } else {
            this.records.add(k, publicKey, record);
          }
          this.refreshes.delete(activeRefresh);
          this.refreshes.set(b4a.toString(token, "hex"), r);
          req.reply(null, { token: false, closerNodes: false });
        }
        onannounce(req) {
          if (!req.target || !req.token)
            return;
          const ann = decode2(m.announce, req.value);
          if (ann === null)
            return;
          const signable = annSignable(req.target, req.token, this.dht.id, ann, NS.ANNOUNCE);
          const { peer, refresh, signature } = ann;
          if (!peer) {
            if (!refresh)
              return;
            this._onrefresh(refresh, req);
            return;
          }
          if (!signature || !sodium.crypto_sign_verify_detached(signature, signable, peer.publicKey)) {
            return;
          }
          if (peer.relayAddresses.length > 3) {
            peer.relayAddresses = peer.relayAddresses.slice(0, 3);
          }
          sodium.crypto_generichash(TMP, peer.publicKey);
          const k = b4a.toString(req.target, "hex");
          const announceSelf = b4a.equals(TMP, req.target);
          const record = c.encode(m.peer, peer);
          if (announceSelf) {
            this.dht._router.set(k, {
              relay: req.from,
              record,
              onconnect: null,
              onholepunch: null
            });
            this.records.remove(k, peer.publicKey);
          } else {
            this.records.add(k, peer.publicKey, record);
          }
          if (refresh) {
            this.refreshes.set(b4a.toString(refresh, "hex"), { k, record, announceSelf });
          }
          req.reply(null, { token: false, closerNodes: false });
        }
        onmutableget(req) {
          if (!req.target || !req.value)
            return;
          let seq = 0;
          try {
            seq = c.decode(c.uint, req.value);
          } catch {
            return;
          }
          const k = b4a.toString(req.target, "hex");
          const value = this.mutables.get(k);
          if (!value) {
            req.reply(null);
            return;
          }
          const localSeq = c.decode(c.uint, value);
          req.reply(localSeq < seq ? null : value);
        }
        onmutableput(req) {
          if (!req.target || !req.token || !req.value)
            return;
          const p = decode2(m.mutablePutRequest, req.value);
          if (!p)
            return;
          const { publicKey, seq, value, signature } = p;
          const hash = b4a.allocUnsafe(32);
          sodium.crypto_generichash(hash, publicKey);
          if (!b4a.equals(hash, req.target))
            return;
          if (!value || !verifyMutable(signature, seq, value, publicKey))
            return;
          const k = b4a.toString(hash, "hex");
          const local = this.mutables.get(k);
          if (local) {
            const existing = c.decode(m.mutableGetResponse, local);
            if (existing.value && existing.seq === seq && b4a.compare(value, existing.value) !== 0) {
              req.error(ERROR.SEQ_REUSED);
              return;
            }
            if (seq < existing.seq) {
              req.error(ERROR.SEQ_TOO_LOW);
              return;
            }
          }
          this.mutables.set(k, c.encode(m.mutableGetResponse, { seq, value, signature }));
          req.reply(null);
        }
        onimmutableget(req) {
          if (!req.target)
            return;
          const k = b4a.toString(req.target, "hex");
          const value = this.immutables.get(k);
          req.reply(value || null);
        }
        onimmutableput(req) {
          if (!req.target || !req.token || !req.value)
            return;
          const hash = b4a.alloc(32);
          sodium.crypto_generichash(hash, req.value);
          if (!b4a.equals(hash, req.target))
            return;
          const k = b4a.toString(hash, "hex");
          this.immutables.set(k, req.value);
          req.reply(null);
        }
        static signMutable(seq, value, secretKey) {
          const signature = b4a.allocUnsafe(64);
          const signable = b4a.allocUnsafe(32 + 32);
          const hash = signable.subarray(32);
          signable.set(NS.MUTABLE_PUT, 0);
          sodium.crypto_generichash(hash, c.encode(m.mutableSignable, { seq, value }));
          sodium.crypto_sign_detached(signature, signable, secretKey);
          return signature;
        }
        static verifyMutable(signature, seq, value, publicKey) {
          return verifyMutable(signature, seq, value, publicKey);
        }
        static signAnnounce(target2, token, id, ann, secretKey) {
          const signature = b4a.allocUnsafe(64);
          sodium.crypto_sign_detached(signature, annSignable(target2, token, id, ann, NS.ANNOUNCE), secretKey);
          return signature;
        }
        static signUnannounce(target2, token, id, ann, secretKey) {
          const signature = b4a.allocUnsafe(64);
          sodium.crypto_sign_detached(signature, annSignable(target2, token, id, ann, NS.UNANNOUNCE), secretKey);
          return signature;
        }
      };
      function verifyMutable(signature, seq, value, publicKey) {
        const signable = b4a.allocUnsafe(32 + 32);
        const hash = signable.subarray(32);
        signable.set(NS.MUTABLE_PUT, 0);
        sodium.crypto_generichash(hash, c.encode(m.mutableSignable, { seq, value }));
        return sodium.crypto_sign_verify_detached(signature, signable, publicKey);
      }
      function annSignable(target2, token, id, ann, ns) {
        const signable = b4a.allocUnsafe(32 + 32);
        const hash = signable.subarray(32);
        signable.set(ns, 0);
        sodium.crypto_generichash_batch(hash, [
          target2,
          id,
          token,
          c.encode(m.peer, ann.peer),
          ann.refresh || EMPTY
        ]);
        return signable;
      }
      function decode2(enc, val) {
        try {
          return val && c.decode(enc, val);
        } catch (err) {
          return null;
        }
      }
    }
  });

  // node_modules/safety-catch/index.js
  var require_safety_catch = __commonJS({
    "node_modules/safety-catch/index.js"(exports, module) {
      module.exports = safetyCatch;
      function isActuallyUncaught(err) {
        if (!err)
          return false;
        return err instanceof TypeError || err instanceof SyntaxError || err instanceof ReferenceError || err instanceof EvalError || err instanceof RangeError || err instanceof URIError || err.code === "ERR_ASSERTION";
      }
      function throwErrorNT(err) {
        queueMicrotask(() => {
          throw err;
        });
      }
      function safetyCatch(err) {
        if (isActuallyUncaught(err)) {
          throwErrorNT(err);
          throw err;
        }
      }
    }
  });

  // node_modules/@hyperswarm/dht/lib/router.js
  var require_router = __commonJS({
    "node_modules/@hyperswarm/dht/lib/router.js"(exports, module) {
      var c = require_compact_encoding();
      var Cache = require_xache();
      var safetyCatch = require_safety_catch();
      var b4a = require_b4a();
      var { handshake, holepunch } = require_messages();
      var { COMMANDS } = require_constants();
      var FROM_CLIENT = 0;
      var FROM_SERVER = 1;
      var FROM_RELAY = 2;
      var FROM_SECOND_RELAY = 3;
      var REPLY = 4;
      module.exports = class HolepunchRouter {
        constructor(dht, opts) {
          this.dht = dht;
          this.forwards = new Cache(opts);
        }
        set(target2, state) {
          if (state.onpeerhandshake) {
            this.forwards.retain(toString(target2), state);
          } else {
            this.forwards.set(toString(target2), state);
          }
        }
        get(target2) {
          return this.forwards.get(toString(target2));
        }
        delete(target2) {
          this.forwards.delete(toString(target2));
        }
        async peerHandshake(target2, { noise, peerAddress, relayAddress, socket }, to) {
          const dht = this.dht;
          const requestValue = c.encode(handshake, {
            mode: FROM_CLIENT,
            noise,
            peerAddress,
            relayAddress
          });
          const res = await dht.request({ command: COMMANDS.PEER_HANDSHAKE, target: target2, value: requestValue }, to, { socket });
          const hs = decode2(handshake, res.value);
          if (!hs || hs.mode !== REPLY || (to.host !== res.from.host || to.port !== res.from.port) || !hs.noise) {
            throw new Error("Bad handshake reply");
          }
          return {
            noise: hs.noise,
            relayed: !!hs.peerAddress,
            serverAddress: hs.peerAddress || to,
            clientAddress: res.to
          };
        }
        async onpeerhandshake(req) {
          const hs = req.value && decode2(handshake, req.value);
          if (!hs)
            return;
          const { mode, noise, peerAddress, relayAddress } = hs;
          const state = req.target && this.get(req.target);
          const isServer = !!(state && state.onpeerhandshake);
          const relay = state && state.relay;
          if (isServer) {
            let reply = null;
            try {
              reply = noise && await state.onpeerhandshake({ noise, peerAddress }, req);
            } catch (e) {
              safetyCatch(e);
              return;
            }
            if (!reply || !reply.noise)
              return;
            const opts = { socket: reply.socket, closerNodes: false, token: false };
            switch (mode) {
              case FROM_CLIENT: {
                req.reply(c.encode(handshake, { mode: REPLY, noise: reply.noise, peerAddress: null }), opts);
                return;
              }
              case FROM_RELAY: {
                req.relay(c.encode(handshake, { mode: FROM_SERVER, noise: reply.noise, peerAddress }), req.from, opts);
                return;
              }
              case FROM_SECOND_RELAY: {
                if (!relayAddress)
                  return;
                req.relay(c.encode(handshake, { mode: FROM_SERVER, noise: reply.noise, peerAddress }), relayAddress, opts);
                return;
              }
            }
          } else {
            switch (mode) {
              case FROM_CLIENT: {
                if (!noise)
                  return;
                if (!relay && !relayAddress) {
                  req.reply(null, { token: false, closerNodes: true });
                  return;
                }
                req.relay(c.encode(handshake, { mode: FROM_RELAY, noise, peerAddress: req.from, relayAddress: null }), relayAddress || relay);
                return;
              }
              case FROM_RELAY: {
                if (!relay || !noise)
                  return;
                req.relay(c.encode(handshake, { mode: FROM_SECOND_RELAY, noise, peerAddress, relayAddress: req.from }), relay);
                return;
              }
              case FROM_SERVER: {
                if (!peerAddress || !noise)
                  return;
                req.reply(c.encode(handshake, { mode: REPLY, noise, peerAddress: req.from, relayAddress: null }), { to: peerAddress, closerNodes: false, token: false });
                return;
              }
            }
          }
        }
        async peerHolepunch(target2, { id, payload, peerAddress, socket }, to) {
          const dht = this.dht;
          const requestValue = c.encode(holepunch, {
            mode: FROM_CLIENT,
            id,
            payload,
            peerAddress
          });
          const res = await dht.request({ command: COMMANDS.PEER_HOLEPUNCH, target: target2, value: requestValue }, to, { socket });
          const hp = decode2(holepunch, res.value);
          if (!hp || hp.mode !== REPLY || (to.host !== res.from.host || to.port !== res.from.port)) {
            throw new Error("Bad holepunch reply");
          }
          return {
            from: res.from,
            to: res.to,
            payload: hp.payload,
            peerAddress: hp.peerAddress || to
          };
        }
        async onpeerholepunch(req) {
          const hp = req.value && decode2(holepunch, req.value);
          if (!hp)
            return;
          const { mode, id, payload, peerAddress } = hp;
          const state = req.target && this.get(req.target);
          const isServer = !!(state && state.onpeerholepunch);
          const relay = state && state.relay;
          switch (mode) {
            case FROM_CLIENT: {
              if (!peerAddress && !relay)
                return;
              req.relay(c.encode(holepunch, { mode: FROM_RELAY, id, payload, peerAddress: req.from }), peerAddress || relay);
              return;
            }
            case FROM_RELAY: {
              if (!isServer || !peerAddress)
                return;
              let reply = null;
              try {
                reply = await state.onpeerholepunch({ id, payload, peerAddress }, req);
              } catch (e) {
                safetyCatch(e);
                return;
              }
              if (!reply)
                return;
              const opts = { socket: reply.socket, closerNodes: false, token: false };
              req.relay(c.encode(holepunch, { mode: FROM_SERVER, id: 0, payload: reply.payload, peerAddress }), req.from, opts);
              return;
            }
            case FROM_SERVER: {
              req.reply(c.encode(holepunch, { mode: REPLY, id, payload, peerAddress: req.from }), { to: peerAddress, closerNodes: false, token: false });
              return;
            }
          }
        }
      };
      function decode2(enc, val) {
        try {
          return c.decode(enc, val);
        } catch {
          return null;
        }
      }
      function toString(t) {
        return typeof t === "string" ? t : b4a.toString(t, "hex");
      }
    }
  });

  // node_modules/sodium-secretstream/index.js
  var require_sodium_secretstream = __commonJS({
    "node_modules/sodium-secretstream/index.js"(exports, module) {
      var sodium = require_sodium_universal();
      var b4a = require_b4a();
      var ABYTES = sodium.crypto_secretstream_xchacha20poly1305_ABYTES;
      var TAG_MESSAGE = sodium.crypto_secretstream_xchacha20poly1305_TAG_MESSAGE;
      var TAG_FINAL = sodium.crypto_secretstream_xchacha20poly1305_TAG_FINAL;
      var STATEBYTES = sodium.crypto_secretstream_xchacha20poly1305_STATEBYTES;
      var HEADERBYTES = sodium.crypto_secretstream_xchacha20poly1305_HEADERBYTES;
      var KEYBYTES = sodium.crypto_secretstream_xchacha20poly1305_KEYBYTES;
      var EMPTY = b4a.alloc(0);
      var TAG = b4a.alloc(1);
      var Push = class {
        constructor(key, state = b4a.allocUnsafe(STATEBYTES), header = b4a.allocUnsafe(HEADERBYTES)) {
          if (!TAG_FINAL)
            throw new Error("JavaScript sodium version needs to support crypto_secretstream_xchacha20poly");
          this.key = key;
          this.state = state;
          this.header = header;
          sodium.crypto_secretstream_xchacha20poly1305_init_push(this.state, this.header, this.key);
        }
        next(message, cipher = b4a.allocUnsafe(message.byteLength + ABYTES)) {
          sodium.crypto_secretstream_xchacha20poly1305_push(this.state, cipher, message, null, TAG_MESSAGE);
          return cipher;
        }
        final(message = EMPTY, cipher = b4a.allocUnsafe(ABYTES)) {
          sodium.crypto_secretstream_xchacha20poly1305_push(this.state, cipher, message, null, TAG_FINAL);
          return cipher;
        }
      };
      var Pull = class {
        constructor(key, state = b4a.allocUnsafe(STATEBYTES)) {
          if (!TAG_FINAL)
            throw new Error("JavaScript sodium version needs to support crypto_secretstream_xchacha20poly");
          this.key = key;
          this.state = state;
          this.final = false;
        }
        init(header) {
          sodium.crypto_secretstream_xchacha20poly1305_init_pull(this.state, header, this.key);
        }
        next(cipher, message = b4a.allocUnsafe(cipher.byteLength - ABYTES)) {
          sodium.crypto_secretstream_xchacha20poly1305_pull(this.state, message, TAG, cipher, null);
          this.final = b4a.equals(TAG, TAG_FINAL);
          return message;
        }
      };
      function keygen(buf = b4a.alloc(KEYBYTES)) {
        sodium.crypto_secretstream_xchacha20poly1305_keygen(buf);
        return buf;
      }
      module.exports = {
        keygen,
        KEYBYTES,
        ABYTES,
        STATEBYTES,
        HEADERBYTES,
        Push,
        Pull
      };
    }
  });

  // node_modules/timeout-refresh/node.js
  var require_node = __commonJS({
    "node_modules/timeout-refresh/node.js"(exports, module) {
      module.exports = class Timer {
        constructor(ms, fn, ctx = null, interval = false) {
          this.ms = ms;
          this.ontimeout = fn;
          this.context = ctx;
          this.interval = interval;
          this.done = false;
          this._timer = interval ? setInterval(callInterval, ms, this) : setTimeout(callTimeout, ms, this);
        }
        unref() {
          this._timer.unref();
        }
        ref() {
          this._timer.ref();
        }
        refresh() {
          if (this.done !== true)
            this._timer.refresh();
        }
        destroy() {
          this.done = true;
          this.ontimeout = null;
          if (this.interval)
            clearInterval(this._timer);
          else
            clearTimeout(this._timer);
        }
        static once(ms, fn, ctx) {
          return new this(ms, fn, ctx, false);
        }
        static on(ms, fn, ctx) {
          return new this(ms, fn, ctx, true);
        }
      };
      function callTimeout(self) {
        self.done = true;
        self.ontimeout.call(self.context);
      }
      function callInterval(self) {
        self.ontimeout.call(self.context);
      }
    }
  });

  // node_modules/timeout-refresh/browser.js
  var require_browser = __commonJS({
    "node_modules/timeout-refresh/browser.js"(exports, module) {
      module.exports = class TimerBrowser {
        constructor(ms, fn, ctx = null, interval = false) {
          this.ms = ms;
          this.ontimeout = fn;
          this.context = ctx || null;
          this.interval = interval;
          this.done = false;
          this._timer = interval ? setInterval(callInterval, ms, this) : setTimeout(callTimeout, ms, this);
        }
        unref() {
        }
        ref() {
        }
        refresh() {
          if (this.done)
            return;
          if (this.interval) {
            clearInterval(this._timer);
            this._timer = setInterval(callInterval, this.ms, this);
          } else {
            clearTimeout(this._timer);
            this._timer = setTimeout(callTimeout, this.ms, this);
          }
        }
        destroy() {
          this.done = true;
          this.ontimeout = null;
          if (this.interval)
            clearInterval(this._timer);
          else
            clearTimeout(this._timer);
        }
        static once(ms, fn, ctx) {
          return new this(ms, fn, ctx, false);
        }
        static on(ms, fn, ctx) {
          return new this(ms, fn, ctx, true);
        }
      };
      function callTimeout(self) {
        self.done = true;
        self.ontimeout.call(self.context);
      }
      function callInterval(self) {
        self.ontimeout.call(self.context);
      }
    }
  });

  // node_modules/timeout-refresh/index.js
  var require_timeout_refresh = __commonJS({
    "node_modules/timeout-refresh/index.js"(exports, module) {
      module.exports = isNode() ? require_node() : require_browser();
      function isNode() {
        const to = setTimeout(function() {
        }, 1e3);
        clearTimeout(to);
        return !!to.refresh;
      }
    }
  });

  // node_modules/@hyperswarm/secret-stream/lib/bridge.js
  var require_bridge = __commonJS({
    "node_modules/@hyperswarm/secret-stream/lib/bridge.js"(exports, module) {
      var { Duplex } = require_streamx();
      var ReversePassThrough = class extends Duplex {
        constructor(s) {
          super();
          this._stream = s;
          this._ondrain = null;
        }
        _write(data, cb) {
          if (this._stream.push(data) === false) {
            this._stream._ondrain = cb;
          } else {
            cb(null);
          }
        }
        _final(cb) {
          this._stream.push(null);
          cb(null);
        }
        _read(cb) {
          const ondrain = this._ondrain;
          this._ondrain = null;
          if (ondrain)
            ondrain();
          cb(null);
        }
      };
      module.exports = class Bridge extends Duplex {
        constructor(noiseStream) {
          super();
          this.noiseStream = noiseStream;
          this._ondrain = null;
          this.reverse = new ReversePassThrough(this);
        }
        get publicKey() {
          return this.noiseStream.publicKey;
        }
        get remotePublicKey() {
          return this.noiseStream.remotePublicKey;
        }
        get handshakeHash() {
          return this.noiseStream.handshakeHash;
        }
        _read(cb) {
          const ondrain = this._ondrain;
          this._ondrain = null;
          if (ondrain)
            ondrain();
          cb(null);
        }
        _write(data, cb) {
          if (this.reverse.push(data) === false) {
            this.reverse._ondrain = cb;
          } else {
            cb(null);
          }
        }
        _final(cb) {
          this.reverse.push(null);
          cb(null);
        }
      };
    }
  });

  // node_modules/nanoassert/index.js
  var require_nanoassert = __commonJS({
    "node_modules/nanoassert/index.js"(exports, module) {
      module.exports = assert;
      var AssertionError = class extends Error {
      };
      AssertionError.prototype.name = "AssertionError";
      function assert(t, m) {
        if (!t) {
          var err = new AssertionError(m);
          if (Error.captureStackTrace)
            Error.captureStackTrace(err, assert);
          throw err;
        }
      }
    }
  });

  // node_modules/noise-curve-ed/index.js
  var require_noise_curve_ed = __commonJS({
    "node_modules/noise-curve-ed/index.js"(exports, module) {
      var sodium = require_sodium_universal();
      var assert = require_nanoassert();
      var b4a = require_b4a();
      var DHLEN = sodium.crypto_scalarmult_ed25519_BYTES;
      var PKLEN = sodium.crypto_scalarmult_ed25519_BYTES;
      var SKLEN = sodium.crypto_sign_SECRETKEYBYTES;
      var ALG = "Ed25519";
      module.exports = {
        DHLEN,
        PKLEN,
        SKLEN,
        ALG,
        name: ALG,
        generateKeyPair,
        dh
      };
      function generateKeyPair(privKey) {
        if (privKey)
          return generateSeedKeyPair(privKey.subarray(0, 32));
        const keyPair = {};
        keyPair.secretKey = b4a.alloc(SKLEN);
        keyPair.publicKey = b4a.alloc(PKLEN);
        sodium.crypto_sign_keypair(keyPair.publicKey, keyPair.secretKey);
        return keyPair;
      }
      function generateSeedKeyPair(seed) {
        const keyPair = {};
        keyPair.secretKey = b4a.alloc(SKLEN);
        keyPair.publicKey = b4a.alloc(PKLEN);
        sodium.crypto_sign_seed_keypair(keyPair.publicKey, keyPair.secretKey, seed);
        return keyPair;
      }
      function dh(pk, lsk) {
        assert(lsk.byteLength === SKLEN);
        assert(pk.byteLength === PKLEN);
        const output = b4a.alloc(DHLEN);
        const sk = b4a.alloc(64);
        sodium.crypto_hash_sha512(sk, lsk.subarray(0, 32));
        sk[0] &= 248;
        sk[31] &= 127;
        sk[31] |= 64;
        sodium.crypto_scalarmult_ed25519(
          output,
          sk.subarray(0, 32),
          pk
        );
        return output;
      }
    }
  });

  // node_modules/noise-handshake/cipher.js
  var require_cipher = __commonJS({
    "node_modules/noise-handshake/cipher.js"(exports, module) {
      var sodium = require_sodium_universal();
      var b4a = require_b4a();
      module.exports = class CipherState {
        constructor(key) {
          this.key = key || null;
          this.nonce = 0;
          this.CIPHER_ALG = "ChaChaPoly";
        }
        initialiseKey(key) {
          this.key = key;
          this.nonce = 0;
        }
        setNonce(nonce) {
          this.nonce = nonce;
        }
        encrypt(plaintext, ad) {
          if (!this.hasKey)
            return plaintext;
          if (!ad)
            ad = b4a.alloc(0);
          const ciphertext = encryptWithAD(this.key, this.nonce, ad, plaintext);
          this.nonce++;
          return ciphertext;
        }
        decrypt(ciphertext, ad) {
          if (!this.hasKey)
            return ciphertext;
          if (!ad)
            ad = b4a.alloc(0);
          const plaintext = decryptWithAD(this.key, this.nonce, ad, ciphertext);
          this.nonce++;
          return plaintext;
        }
        get hasKey() {
          return this.key !== null;
        }
        _clear() {
          sodium.sodium_memzero(this.key);
          this.key = null;
          this.nonce = null;
        }
        static get MACBYTES() {
          return 16;
        }
        static get NONCEBYTES() {
          return 8;
        }
        static get KEYBYTES() {
          return 32;
        }
      };
      function encryptWithAD(key, counter, additionalData, plaintext) {
        if (!b4a.isBuffer(additionalData))
          additionalData = b4a.from(additionalData, "hex");
        if (!b4a.isBuffer(plaintext))
          plaintext = b4a.from(plaintext, "hex");
        const nonce = b4a.alloc(sodium.crypto_aead_chacha20poly1305_ietf_NPUBBYTES);
        const view = new DataView(nonce.buffer, nonce.byteOffset, nonce.byteLength);
        view.setUint32(4, counter, true);
        const ciphertext = b4a.alloc(plaintext.byteLength + sodium.crypto_aead_chacha20poly1305_ietf_ABYTES);
        sodium.crypto_aead_chacha20poly1305_ietf_encrypt(ciphertext, plaintext, additionalData, null, nonce, key);
        return ciphertext;
      }
      function decryptWithAD(key, counter, additionalData, ciphertext) {
        if (!b4a.isBuffer(additionalData))
          additionalData = b4a.from(additionalData, "hex");
        if (!b4a.isBuffer(ciphertext))
          ciphertext = b4a.from(ciphertext, "hex");
        const nonce = b4a.alloc(sodium.crypto_aead_chacha20poly1305_ietf_NPUBBYTES);
        const view = new DataView(nonce.buffer, nonce.byteOffset, nonce.byteLength);
        view.setUint32(4, counter, true);
        const plaintext = b4a.alloc(ciphertext.byteLength - sodium.crypto_aead_chacha20poly1305_ietf_ABYTES);
        sodium.crypto_aead_chacha20poly1305_ietf_decrypt(plaintext, null, ciphertext, additionalData, nonce, key);
        return plaintext;
      }
    }
  });

  // node_modules/sodium-universal/crypto_kx.js
  var require_crypto_kx = __commonJS({
    "node_modules/sodium-universal/crypto_kx.js"(exports, module) {
      module.exports = require_sodium_native();
    }
  });

  // node_modules/sodium-universal/crypto_scalarmult.js
  var require_crypto_scalarmult = __commonJS({
    "node_modules/sodium-universal/crypto_scalarmult.js"(exports, module) {
      module.exports = require_sodium_native();
    }
  });

  // node_modules/noise-handshake/dh.js
  var require_dh = __commonJS({
    "node_modules/noise-handshake/dh.js"(exports, module) {
      var { crypto_kx_SEEDBYTES, crypto_kx_keypair, crypto_kx_seed_keypair } = require_crypto_kx();
      var { crypto_scalarmult_BYTES, crypto_scalarmult_SCALARBYTES, crypto_scalarmult, crypto_scalarmult_base } = require_crypto_scalarmult();
      var assert = require_nanoassert();
      var b4a = require_b4a();
      var DHLEN = crypto_scalarmult_BYTES;
      var PKLEN = crypto_scalarmult_BYTES;
      var SKLEN = crypto_scalarmult_SCALARBYTES;
      var SEEDLEN = crypto_kx_SEEDBYTES;
      var ALG = "25519";
      module.exports = {
        DHLEN,
        PKLEN,
        SKLEN,
        SEEDLEN,
        ALG,
        generateKeyPair,
        generateSeedKeyPair,
        dh
      };
      function generateKeyPair(privKey) {
        const keyPair = {};
        keyPair.secretKey = privKey || b4a.alloc(SKLEN);
        keyPair.publicKey = b4a.alloc(PKLEN);
        if (privKey) {
          crypto_scalarmult_base(keyPair.publicKey, keyPair.secretKey);
        } else {
          crypto_kx_keypair(keyPair.publicKey, keyPair.secretKey);
        }
        return keyPair;
      }
      function generateSeedKeyPair(seed) {
        assert(seed.byteLength === SKLEN);
        const keyPair = {};
        keyPair.secretKey = b4a.alloc(SKLEN);
        keyPair.publicKey = b4a.alloc(PKLEN);
        crypto_kx_seed_keypair(keyPair.publicKey, keyPair.secretKey, seed);
        return keyPair;
      }
      function dh(pk, lsk) {
        assert(lsk.byteLength === SKLEN);
        assert(pk.byteLength === PKLEN);
        const output = b4a.alloc(DHLEN);
        crypto_scalarmult(
          output,
          lsk,
          pk
        );
        return output;
      }
    }
  });

  // node_modules/sodium-universal/memory.js
  var require_memory = __commonJS({
    "node_modules/sodium-universal/memory.js"(exports, module) {
      module.exports = require_sodium_native();
    }
  });

  // node_modules/sodium-universal/crypto_generichash.js
  var require_crypto_generichash = __commonJS({
    "node_modules/sodium-universal/crypto_generichash.js"(exports, module) {
      module.exports = require_sodium_native();
    }
  });

  // node_modules/hmac-blake2b/node_modules/nanoassert/index.js
  var require_nanoassert2 = __commonJS({
    "node_modules/hmac-blake2b/node_modules/nanoassert/index.js"(exports, module) {
      assert.notEqual = notEqual;
      assert.notOk = notOk;
      assert.equal = equal;
      assert.ok = assert;
      module.exports = assert;
      function equal(a, b, m) {
        assert(a == b, m);
      }
      function notEqual(a, b, m) {
        assert(a != b, m);
      }
      function notOk(t, m) {
        assert(!t, m);
      }
      function assert(t, m) {
        if (!t)
          throw new Error(m || "AssertionError");
      }
    }
  });

  // node_modules/hmac-blake2b/index.js
  var require_hmac_blake2b = __commonJS({
    "node_modules/hmac-blake2b/index.js"(exports, module) {
      var { sodium_malloc, sodium_memzero } = require_memory();
      var { crypto_generichash, crypto_generichash_batch } = require_crypto_generichash();
      var assert = require_nanoassert2();
      var HASHLEN = 64;
      var BLOCKLEN = 128;
      var scratch = sodium_malloc(BLOCKLEN * 3);
      var HMACKey = scratch.subarray(BLOCKLEN * 0, BLOCKLEN * 1);
      var OuterKeyPad = scratch.subarray(BLOCKLEN * 1, BLOCKLEN * 2);
      var InnerKeyPad = scratch.subarray(BLOCKLEN * 2, BLOCKLEN * 3);
      module.exports = function hmac(out, data, key) {
        assert(out.byteLength === HASHLEN);
        assert(key.byteLength != null);
        assert(Array.isArray(data) ? data.every((d) => d.byteLength != null) : data.byteLength != null);
        if (key.byteLength > BLOCKLEN) {
          crypto_generichash(HMACKey.subarray(0, HASHLEN), key);
          sodium_memzero(HMACKey.subarray(HASHLEN));
        } else {
          HMACKey.set(key);
          sodium_memzero(HMACKey.subarray(key.byteLength));
        }
        for (var i = 0; i < HMACKey.byteLength; i++) {
          OuterKeyPad[i] = 92 ^ HMACKey[i];
          InnerKeyPad[i] = 54 ^ HMACKey[i];
        }
        sodium_memzero(HMACKey);
        crypto_generichash_batch(out, [InnerKeyPad].concat(data));
        sodium_memzero(InnerKeyPad);
        crypto_generichash_batch(out, [OuterKeyPad].concat(out));
        sodium_memzero(OuterKeyPad);
      };
      module.exports.BYTES = HASHLEN;
      module.exports.KEYBYTES = BLOCKLEN;
    }
  });

  // node_modules/noise-handshake/hkdf.js
  var require_hkdf = __commonJS({
    "node_modules/noise-handshake/hkdf.js"(exports, module) {
      var assert = require_nanoassert();
      var hmacBlake2b = require_hmac_blake2b();
      var b4a = require_b4a();
      var HASHLEN = 64;
      module.exports = {
        hkdf,
        HASHLEN
      };
      function hkdf(salt, inputKeyMaterial, info = "", length = 2 * HASHLEN) {
        const pseudoRandomKey = hkdfExtract(salt, inputKeyMaterial);
        const result = hkdfExpand(pseudoRandomKey, info, length);
        const [k1, k2] = [result.slice(0, HASHLEN), result.slice(HASHLEN)];
        return [k1, k2];
        function hkdfExtract(salt2, inputKeyMaterial2) {
          return hmacDigest(salt2, inputKeyMaterial2);
        }
        function hkdfExpand(key, info2, length2) {
          const T = [b4a.from(info2)];
          const lengthRatio = length2 / HASHLEN;
          for (let i = 0; i < lengthRatio; i++) {
            const infoBuf = b4a.from(info2);
            const toHash = b4a.concat([T[i], infoBuf, b4a.from([i + 1])]);
            T[i + 1] = hmacDigest(key, toHash);
          }
          const result2 = b4a.concat(T.slice(1));
          assert(result2.byteLength === length2, "key expansion failed, length not as expected");
          return result2;
        }
      }
      function hmacDigest(key, input) {
        const hmac = b4a.alloc(HASHLEN);
        hmacBlake2b(hmac, input, key);
        return hmac;
      }
    }
  });

  // node_modules/noise-handshake/symmetric-state.js
  var require_symmetric_state = __commonJS({
    "node_modules/noise-handshake/symmetric-state.js"(exports, module) {
      var sodium = require_sodium_universal();
      var assert = require_nanoassert();
      var b4a = require_b4a();
      var CipherState = require_cipher();
      var curve = require_dh();
      var { HASHLEN, hkdf } = require_hkdf();
      module.exports = class SymmetricState extends CipherState {
        constructor(opts = {}) {
          super();
          this.curve = opts.curve || curve;
          this.digest = b4a.alloc(HASHLEN);
          this.chainingKey = null;
          this.offset = 0;
          this.DH_ALG = this.curve.ALG;
        }
        mixHash(data) {
          accumulateDigest(this.digest, data);
        }
        mixKey(pubkey, seckey) {
          const dh = this.curve.dh(pubkey, seckey);
          const hkdfResult = hkdf(this.chainingKey, dh);
          this.chainingKey = hkdfResult[0];
          this.initialiseKey(hkdfResult[1].subarray(0, 32));
        }
        encryptAndHash(plaintext) {
          const ciphertext = this.encrypt(plaintext, this.digest);
          accumulateDigest(this.digest, ciphertext);
          return ciphertext;
        }
        decryptAndHash(ciphertext) {
          const plaintext = this.decrypt(ciphertext, this.digest);
          accumulateDigest(this.digest, ciphertext);
          return plaintext;
        }
        getHandshakeHash(out) {
          if (!out)
            return this.getHandshakeHash(b4a.alloc(HASHLEN));
          assert(out.byteLength === HASHLEN, `output must be ${HASHLEN} bytes`);
          out.set(this.digest);
          return out;
        }
        split() {
          const res = hkdf(this.chainingKey, b4a.alloc(0));
          return res.map((k) => k.subarray(0, 32));
        }
        _clear() {
          super._clear();
          sodium.sodium_memzero(this.digest);
          sodium.sodium_memzero(this.chainingKey);
          this.digest = null;
          this.chainingKey = null;
          this.offset = null;
          this.curve = null;
        }
        static get alg() {
          return CipherState.alg + "_BLAKE2b";
        }
      };
      function accumulateDigest(digest, input) {
        const toHash = b4a.concat([digest, input]);
        sodium.crypto_generichash(digest, toHash);
      }
    }
  });

  // node_modules/noise-handshake/noise.js
  var require_noise = __commonJS({
    "node_modules/noise-handshake/noise.js"(exports, module) {
      var assert = require_nanoassert();
      var b4a = require_b4a();
      var SymmetricState = require_symmetric_state();
      var { HASHLEN } = require_hkdf();
      var PRESHARE_IS = Symbol("initiator static key preshared");
      var PRESHARE_RS = Symbol("responder static key preshared");
      var TOK_S = Symbol("s");
      var TOK_E = Symbol("e");
      var TOK_ES = Symbol("es");
      var TOK_SE = Symbol("se");
      var TOK_EE = Symbol("ee");
      var TOK_SS = Symbol("ss");
      var HANDSHAKES = Object.freeze({
        XX: [
          [TOK_E],
          [TOK_E, TOK_EE, TOK_S, TOK_ES],
          [TOK_S, TOK_SE]
        ],
        IK: [
          PRESHARE_RS,
          [TOK_E, TOK_ES, TOK_S, TOK_SS],
          [TOK_E, TOK_EE, TOK_SE]
        ]
      });
      var Writer = class {
        constructor() {
          this.size = 0;
          this.buffers = [];
        }
        push(b) {
          this.size += b.byteLength;
          this.buffers.push(b);
        }
        end() {
          const all = b4a.alloc(this.size);
          let offset = 0;
          for (const b of this.buffers) {
            all.set(b, offset);
            offset += b.byteLength;
          }
          return all;
        }
      };
      var Reader = class {
        constructor(buf) {
          this.offset = 0;
          this.buffer = buf;
        }
        shift(n) {
          const start = this.offset;
          const end = this.offset += n;
          if (end > this.buffer.byteLength)
            throw new Error("Insufficient bytes");
          return this.buffer.subarray(start, end);
        }
        end() {
          return this.shift(this.buffer.byteLength - this.offset);
        }
      };
      module.exports = class NoiseState extends SymmetricState {
        constructor(pattern, initiator, staticKeypair, opts = {}) {
          super(opts);
          this.s = staticKeypair || this.curve.generateKeyPair();
          this.e = null;
          this.re = null;
          this.rs = null;
          this.pattern = pattern;
          this.handshake = HANDSHAKES[this.pattern].slice();
          this.protocol = b4a.from([
            "Noise",
            this.pattern,
            this.DH_ALG,
            this.CIPHER_ALG,
            "BLAKE2b"
          ].join("_"));
          this.initiator = initiator;
          this.complete = false;
          this.rx = null;
          this.tx = null;
          this.hash = null;
        }
        initialise(prologue, remoteStatic) {
          if (this.protocol.byteLength <= HASHLEN)
            this.digest.set(this.protocol);
          else
            this.mixHash(this.protocol);
          this.chainingKey = b4a.from(this.digest);
          this.mixHash(prologue);
          while (!Array.isArray(this.handshake[0])) {
            const message = this.handshake.shift();
            assert(
              message === PRESHARE_RS || message === PRESHARE_IS,
              "Unexpected pattern"
            );
            const takeRemoteKey = this.initiator ? message === PRESHARE_RS : message === PRESHARE_IS;
            if (takeRemoteKey)
              this.rs = remoteStatic;
            const key = takeRemoteKey ? this.rs : this.s.publicKey;
            assert(key != null, "Remote pubkey required");
            this.mixHash(key);
          }
        }
        final() {
          const [k1, k2] = this.split();
          this.tx = this.initiator ? k1 : k2;
          this.rx = this.initiator ? k2 : k1;
          this.complete = true;
          this.hash = this.getHandshakeHash();
          this._clear();
        }
        recv(buf) {
          const r = new Reader(buf);
          for (const pattern of this.handshake.shift()) {
            switch (pattern) {
              case TOK_E:
                this.re = r.shift(this.curve.PKLEN);
                this.mixHash(this.re);
                break;
              case TOK_S: {
                const klen = this.hasKey ? this.curve.PKLEN + 16 : this.curve.PKLEN;
                this.rs = this.decryptAndHash(r.shift(klen));
                break;
              }
              case TOK_EE:
              case TOK_ES:
              case TOK_SE:
              case TOK_SS: {
                const useStatic = keyPattern(pattern, this.initiator);
                const localKey = useStatic.local ? this.s.secretKey : this.e.secretKey;
                const remoteKey = useStatic.remote ? this.rs : this.re;
                this.mixKey(remoteKey, localKey);
                break;
              }
              default:
                throw new Error("Unexpected message");
            }
          }
          const payload = this.decryptAndHash(r.end());
          if (!this.handshake.length)
            this.final();
          return payload;
        }
        send(payload = b4a.alloc(0)) {
          const w = new Writer();
          for (const pattern of this.handshake.shift()) {
            switch (pattern) {
              case TOK_E:
                if (this.e === null)
                  this.e = this.curve.generateKeyPair();
                this.mixHash(this.e.publicKey);
                w.push(this.e.publicKey);
                break;
              case TOK_S:
                w.push(this.encryptAndHash(this.s.publicKey));
                break;
              case TOK_ES:
              case TOK_SE:
              case TOK_EE:
              case TOK_SS: {
                const useStatic = keyPattern(pattern, this.initiator);
                const localKey = useStatic.local ? this.s.secretKey : this.e.secretKey;
                const remoteKey = useStatic.remote ? this.rs : this.re;
                this.mixKey(remoteKey, localKey);
                break;
              }
              default:
                throw new Error("Unexpected message");
            }
          }
          w.push(this.encryptAndHash(payload));
          const response = w.end();
          if (!this.handshake.length)
            this.final();
          return response;
        }
        _clear() {
          super._clear();
          this.e.secretKey.fill(0);
          this.e.publicKey.fill(0);
          this.re.fill(0);
          this.e = null;
          this.re = null;
        }
      };
      function keyPattern(pattern, initiator) {
        const ret = {
          local: false,
          remote: false
        };
        switch (pattern) {
          case TOK_EE:
            return ret;
          case TOK_ES:
            ret.local ^= !initiator;
            ret.remote ^= initiator;
            return ret;
          case TOK_SE:
            ret.local ^= initiator;
            ret.remote ^= !initiator;
            return ret;
          case TOK_SS:
            ret.local ^= 1;
            ret.remote ^= 1;
            return ret;
        }
      }
    }
  });

  // node_modules/@hyperswarm/secret-stream/lib/handshake.js
  var require_handshake = __commonJS({
    "node_modules/@hyperswarm/secret-stream/lib/handshake.js"(exports, module) {
      var sodium = require_sodium_universal();
      var curve = require_noise_curve_ed();
      var Noise = require_noise();
      var b4a = require_b4a();
      var EMPTY = b4a.alloc(0);
      module.exports = class Handshake {
        constructor(isInitiator, keyPair, remotePublicKey, pattern) {
          this.isInitiator = isInitiator;
          this.keyPair = keyPair;
          this.noise = new Noise(pattern, isInitiator, keyPair, { curve });
          this.noise.initialise(EMPTY, remotePublicKey);
          this.destroyed = false;
        }
        static keyPair(seed) {
          const publicKey = b4a.alloc(32);
          const secretKey = b4a.alloc(64);
          if (seed)
            sodium.crypto_sign_seed_keypair(publicKey, secretKey, seed);
          else
            sodium.crypto_sign_keypair(publicKey, secretKey);
          return { publicKey, secretKey };
        }
        recv(data) {
          try {
            this.noise.recv(data);
            if (this.noise.complete)
              return this._return(null);
            return this.send();
          } catch {
            this.destroy();
            return null;
          }
        }
        send() {
          try {
            const data = this.noise.send();
            const wrap = b4a.allocUnsafe(data.byteLength + 3);
            writeUint24le(data.byteLength, wrap);
            wrap.set(data, 3);
            return this._return(wrap);
          } catch {
            this.destroy();
            return null;
          }
        }
        destroy() {
          if (this.destroyed)
            return;
          this.destroyed = true;
        }
        _return(data) {
          const tx = this.noise.complete ? b4a.toBuffer(this.noise.tx) : null;
          const rx = this.noise.complete ? b4a.toBuffer(this.noise.rx) : null;
          const hash = this.noise.complete ? b4a.toBuffer(this.noise.hash) : null;
          const remotePublicKey = this.noise.complete ? b4a.toBuffer(this.noise.rs) : null;
          return {
            data,
            remotePublicKey,
            hash,
            tx,
            rx
          };
        }
      };
      function writeUint24le(n, buf) {
        buf[0] = n & 255;
        buf[1] = n >>> 8 & 255;
        buf[2] = n >>> 16 & 255;
      }
    }
  });

  // node_modules/@hyperswarm/secret-stream/index.js
  var require_secret_stream = __commonJS({
    "node_modules/@hyperswarm/secret-stream/index.js"(exports, module) {
      var { Pull, Push, HEADERBYTES, KEYBYTES, ABYTES } = require_sodium_secretstream();
      var sodium = require_sodium_universal();
      var crypto = require_hypercore_crypto();
      var { Duplex } = require_streamx();
      var b4a = require_b4a();
      var Timeout = require_timeout_refresh();
      var Bridge = require_bridge();
      var Handshake = require_handshake();
      var IDHEADERBYTES = HEADERBYTES + 32;
      var [NS_INITIATOR, NS_RESPONDER] = crypto.namespace("hyperswarm/secret-stream", 2);
      module.exports = class NoiseSecretStream extends Duplex {
        constructor(isInitiator, rawStream, opts = {}) {
          super({ mapWritable: toBuffer });
          if (typeof isInitiator !== "boolean") {
            throw new Error("isInitiator should be a boolean");
          }
          this.noiseStream = this;
          this.isInitiator = isInitiator;
          this.rawStream = null;
          this.publicKey = opts.publicKey || null;
          this.remotePublicKey = opts.remotePublicKey || null;
          this.handshakeHash = null;
          this.userData = null;
          let openedDone = null;
          this.opened = new Promise((resolve) => {
            openedDone = resolve;
          });
          this._rawStream = null;
          this._handshake = null;
          this._handshakePattern = opts.pattern || null;
          this._handshakeDone = null;
          this._state = 0;
          this._len = 0;
          this._tmp = 1;
          this._message = null;
          this._openedDone = openedDone;
          this._startDone = null;
          this._drainDone = null;
          this._outgoingPlain = null;
          this._outgoingWrapped = null;
          this._utp = null;
          this._setup = true;
          this._ended = 2;
          this._encrypt = null;
          this._decrypt = null;
          this._timeout = null;
          this._timeoutMs = 0;
          this._keepAlive = null;
          this._keepAliveMs = 0;
          if (opts.autoStart !== false)
            this.start(rawStream, opts);
          this.resume();
          this.pause();
        }
        static keyPair(seed) {
          return Handshake.keyPair(seed);
        }
        static id(handshakeHash, isInitiator, id) {
          return streamId(handshakeHash, isInitiator, id);
        }
        setTimeout(ms) {
          if (!ms)
            ms = 0;
          this._clearTimeout();
          this._timeoutMs = ms;
          if (!ms || this.rawStream === null)
            return;
          this._timeout = Timeout.once(ms, destroyTimeout, this);
          this._timeout.unref();
        }
        setKeepAlive(ms) {
          if (!ms)
            ms = 0;
          this._keepAliveMs = ms;
          if (!ms || this.rawStream === null)
            return;
          this._keepAlive = Timeout.on(ms, sendKeepAlive, this);
          this._keepAlive.unref();
        }
        start(rawStream, opts = {}) {
          if (rawStream) {
            this.rawStream = rawStream;
            this._rawStream = rawStream;
            if (typeof this.rawStream.setContentSize === "function") {
              this._utp = rawStream;
            }
          } else {
            this.rawStream = new Bridge(this);
            this._rawStream = this.rawStream.reverse;
          }
          this.rawStream.on("error", this._onrawerror.bind(this));
          this.rawStream.on("close", this._onrawclose.bind(this));
          this._startHandshake(opts.handshake, opts.keyPair || null);
          this._continueOpen(null);
          if (this.destroying)
            return;
          if (opts.data)
            this._onrawdata(opts.data);
          if (opts.ended)
            this._onrawend();
          if (this._keepAliveMs > 0 && this._keepAlive === null) {
            this.setKeepAlive(this._keepAliveMs);
          }
          if (this._timeoutMs > 0 && this._timeout === null) {
            this.setTimeout(this._timeoutMs);
          }
        }
        _continueOpen(err) {
          if (err)
            this.destroy(err);
          if (this._startDone === null)
            return;
          const done = this._startDone;
          this._startDone = null;
          this._open(done);
        }
        _onkeypairpromise(p) {
          const self = this;
          const cont = this._continueOpen.bind(this);
          p.then(onkeypair, cont);
          function onkeypair(kp) {
            self._onkeypair(kp);
            cont(null);
          }
        }
        _onkeypair(keyPair) {
          const pattern = this._handshakePattern || "XX";
          const remotePublicKey = this.remotePublicKey;
          this._handshake = new Handshake(this.isInitiator, keyPair, remotePublicKey, pattern);
          this.publicKey = this._handshake.keyPair.publicKey;
        }
        _startHandshake(handshake, keyPair) {
          if (handshake) {
            const { tx, rx, hash, publicKey, remotePublicKey } = handshake;
            this._setupSecretStream(tx, rx, hash, publicKey, remotePublicKey);
            return;
          }
          if (!keyPair)
            keyPair = Handshake.keyPair();
          if (typeof keyPair.then === "function") {
            this._onkeypairpromise(keyPair);
          } else {
            this._onkeypair(keyPair);
          }
        }
        _onrawerror(err) {
          this.destroy(err);
        }
        _onrawclose() {
          if (this._ended !== 0)
            this.destroy();
        }
        _onrawdata(data) {
          let offset = 0;
          if (this._timeout !== null) {
            this._timeout.refresh();
          }
          do {
            switch (this._state) {
              case 0: {
                while (this._tmp !== 16777216 && offset < data.length) {
                  const v = data[offset++];
                  this._len += this._tmp * v;
                  this._tmp *= 256;
                }
                if (this._tmp === 16777216) {
                  this._tmp = 0;
                  this._state = 1;
                  const unprocessed = data.length - offset;
                  if (unprocessed < this._len && this._utp !== null)
                    this._utp.setContentSize(this._len - unprocessed);
                }
                break;
              }
              case 1: {
                const missing = this._len - this._tmp;
                const end = missing + offset;
                if (this._message === null && end <= data.length) {
                  this._message = data.subarray(offset, end);
                  offset += missing;
                  this._incoming();
                  break;
                }
                const unprocessed = data.length - offset;
                if (this._message === null) {
                  this._message = b4a.allocUnsafe(this._len);
                }
                b4a.copy(data, this._message, this._tmp, offset);
                this._tmp += unprocessed;
                if (end <= data.length) {
                  offset += missing;
                  this._incoming();
                } else {
                  offset += unprocessed;
                }
                break;
              }
            }
          } while (offset < data.length && !this.destroying);
        }
        _onrawend() {
          this._ended--;
          this.push(null);
        }
        _onrawdrain() {
          const drain = this._drainDone;
          if (drain === null)
            return;
          this._drainDone = null;
          drain();
        }
        _read(cb) {
          this.rawStream.resume();
          cb(null);
        }
        _incoming() {
          const message = this._message;
          this._state = 0;
          this._len = 0;
          this._tmp = 1;
          this._message = null;
          if (this._setup === true) {
            if (this._handshake) {
              this._onhandshakert(this._handshake.recv(message));
            } else {
              if (message.byteLength !== IDHEADERBYTES) {
                this.destroy(new Error("Invalid header message received"));
                return;
              }
              const remoteId = message.subarray(0, 32);
              const expectedId = streamId(this.handshakeHash, !this.isInitiator);
              const header = message.subarray(32);
              if (!b4a.equals(expectedId, remoteId)) {
                this.destroy(new Error("Invalid header received"));
                return;
              }
              this._decrypt.init(header);
              this._setup = false;
            }
            return;
          }
          if (message.length < ABYTES) {
            this.destroy(new Error("Invalid message received"));
            return;
          }
          const plain = message.subarray(1, message.byteLength - ABYTES + 1);
          try {
            this._decrypt.next(message, plain);
          } catch (err) {
            this.destroy(err);
            return;
          }
          if (plain.byteLength === 0 && this._keepAliveMs !== 0)
            return;
          if (this.push(plain) === false) {
            this.rawStream.pause();
          }
        }
        _onhandshakert(h) {
          if (this._handshakeDone === null)
            return;
          if (h !== null) {
            if (h.data)
              this._rawStream.write(h.data);
            if (!h.tx)
              return;
          }
          const done = this._handshakeDone;
          const publicKey = this._handshake.keyPair.publicKey;
          this._handshakeDone = null;
          this._handshake = null;
          if (h === null)
            return done(new Error("Noise handshake failed"));
          this._setupSecretStream(h.tx, h.rx, h.hash, publicKey, h.remotePublicKey);
          this._resolveOpened(true);
          done(null);
        }
        _setupSecretStream(tx, rx, handshakeHash, publicKey, remotePublicKey) {
          const buf = b4a.allocUnsafe(3 + IDHEADERBYTES);
          writeUint24le(IDHEADERBYTES, buf);
          this._encrypt = new Push(tx.subarray(0, KEYBYTES), void 0, buf.subarray(3 + 32));
          this._decrypt = new Pull(rx.subarray(0, KEYBYTES));
          this.publicKey = publicKey;
          this.remotePublicKey = remotePublicKey;
          this.handshakeHash = handshakeHash;
          const id = buf.subarray(3, 3 + 32);
          streamId(handshakeHash, this.isInitiator, id);
          this.emit("handshake");
          if (this.rawStream !== this._rawStream)
            this.rawStream.emit("handshake");
          if (this.destroying)
            return;
          this._rawStream.write(buf);
        }
        _open(cb) {
          if (this._rawStream === null || this._handshake === null && this._encrypt === null) {
            this._startDone = cb;
            return;
          }
          this._rawStream.on("data", this._onrawdata.bind(this));
          this._rawStream.on("end", this._onrawend.bind(this));
          this._rawStream.on("drain", this._onrawdrain.bind(this));
          if (this._encrypt !== null) {
            this._resolveOpened(true);
            return cb(null);
          }
          this._handshakeDone = cb;
          if (this.isInitiator)
            this._onhandshakert(this._handshake.send());
        }
        _predestroy() {
          if (this.rawStream) {
            const error = this._readableState.error || this._writableState.error;
            this.rawStream.destroy(error);
          }
          if (this._startDone !== null) {
            const done = this._startDone;
            this._startDone = null;
            done(new Error("Stream destroyed"));
          }
          if (this._handshakeDone !== null) {
            const done = this._handshakeDone;
            this._handshakeDone = null;
            done(new Error("Stream destroyed"));
          }
          if (this._drainDone !== null) {
            const done = this._drainDone;
            this._drainDone = null;
            done(new Error("Stream destroyed"));
          }
        }
        _write(data, cb) {
          let wrapped = this._outgoingWrapped;
          if (data !== this._outgoingPlain) {
            wrapped = b4a.allocUnsafe(data.byteLength + 3 + ABYTES);
            wrapped.set(data, 4);
          } else {
            this._outgoingWrapped = this._outgoingPlain = null;
          }
          writeUint24le(wrapped.byteLength - 3, wrapped);
          this._encrypt.next(wrapped.subarray(4, 4 + data.byteLength), wrapped.subarray(3));
          if (this._keepAlive !== null)
            this._keepAlive.refresh();
          if (this._rawStream.write(wrapped) === false) {
            this._drainDone = cb;
          } else {
            cb(null);
          }
        }
        _final(cb) {
          this._clearKeepAlive();
          this._ended--;
          this._rawStream.end();
          cb(null);
        }
        _resolveOpened(val) {
          if (this._openedDone !== null) {
            const opened = this._openedDone;
            this._openedDone = null;
            opened(val);
            if (val)
              this.emit("connect");
          }
        }
        _clearTimeout() {
          if (this._timeout === null)
            return;
          this._timeout.destroy();
          this._timeout = null;
          this._timeoutMs = 0;
        }
        _clearKeepAlive() {
          if (this._keepAlive === null)
            return;
          this._keepAlive.destroy();
          this._keepAlive = null;
          this._keepAliveMs = 0;
        }
        _destroy(cb) {
          this._clearKeepAlive();
          this._clearTimeout();
          this._resolveOpened(false);
          cb(null);
        }
        alloc(len) {
          const buf = b4a.allocUnsafe(len + 3 + ABYTES);
          this._outgoingWrapped = buf;
          this._outgoingPlain = buf.subarray(4, buf.byteLength - ABYTES + 1);
          return this._outgoingPlain;
        }
      };
      function writeUint24le(n, buf) {
        buf[0] = n & 255;
        buf[1] = n >>> 8 & 255;
        buf[2] = n >>> 16 & 255;
      }
      function streamId(handshakeHash, isInitiator, out = b4a.allocUnsafe(32)) {
        sodium.crypto_generichash(out, isInitiator ? NS_INITIATOR : NS_RESPONDER, handshakeHash);
        return out;
      }
      function toBuffer(data) {
        return typeof data === "string" ? b4a.from(data) : data;
      }
      function destroyTimeout() {
        this.destroy(new Error("Stream timed out"));
      }
      function sendKeepAlive() {
        const empty = this.alloc(0);
        this.write(empty);
      }
    }
  });

  // node_modules/@hyperswarm/dht/lib/noise-wrap.js
  var require_noise_wrap = __commonJS({
    "node_modules/@hyperswarm/dht/lib/noise-wrap.js"(exports, module) {
      var NoiseSecretStream = require_secret_stream();
      var NoiseHandshake = require_noise();
      var curve = require_noise_curve_ed();
      var c = require_compact_encoding();
      var b4a = require_b4a();
      var sodium = require_sodium_universal();
      var m = require_messages();
      var { NS } = require_constants();
      var NOISE_PROLOUGE = NS.PEER_HANDSHAKE;
      module.exports = class NoiseWrap {
        constructor(keyPair, remotePublicKey) {
          this.isInitiator = !!remotePublicKey;
          this.remotePublicKey = remotePublicKey;
          this.keyPair = keyPair;
          this.handshake = new NoiseHandshake("IK", this.isInitiator, keyPair, { curve });
          this.handshake.initialise(NOISE_PROLOUGE, remotePublicKey);
        }
        send(payload) {
          const buf = c.encode(m.noisePayload, payload);
          return this.handshake.send(buf);
        }
        recv(buf) {
          const payload = c.decode(m.noisePayload, this.handshake.recv(buf));
          this.remotePublicKey = b4a.toBuffer(this.handshake.rs);
          return payload;
        }
        final() {
          if (!this.handshake.complete)
            throw new Error("Handshake did not finish");
          const holepunchSecret = b4a.allocUnsafe(32);
          sodium.crypto_generichash(holepunchSecret, NS.PEER_HOLEPUNCH, this.handshake.hash);
          return {
            isInitiator: this.isInitiator,
            publicKey: this.keyPair.publicKey,
            streamId: this.streamId,
            remotePublicKey: this.remotePublicKey,
            remoteId: NoiseSecretStream.id(this.handshake.hash, !this.isInitiator),
            holepunchSecret,
            hash: b4a.toBuffer(this.handshake.hash),
            rx: b4a.toBuffer(this.handshake.rx),
            tx: b4a.toBuffer(this.handshake.tx)
          };
        }
      };
    }
  });

  // node_modules/@hyperswarm/dht/lib/sleeper.js
  var require_sleeper = __commonJS({
    "node_modules/@hyperswarm/dht/lib/sleeper.js"(exports, module) {
      module.exports = class Sleeper {
        constructor() {
          this._timeout = null;
          this._resolve = null;
          this._start = (resolve) => {
            this._resolve = resolve;
          };
          this._trigger = () => {
            if (this._resolve === null)
              return;
            const resolve = this._resolve;
            this._timeout = null;
            this._resolve = null;
            resolve();
          };
        }
        pause(ms) {
          const p = new Promise(this._start);
          if (this._timeout !== null) {
            clearTimeout(this._timeout);
            this._trigger();
          }
          this._timeout = setTimeout(this._trigger, ms);
          return p;
        }
        resume() {
          if (this._timeout !== null) {
            clearTimeout(this._timeout);
            this._trigger();
          }
        }
      };
    }
  });

  // node_modules/@hyperswarm/dht/lib/announcer.js
  var require_announcer = __commonJS({
    "node_modules/@hyperswarm/dht/lib/announcer.js"(exports, module) {
      var safetyCatch = require_safety_catch();
      var c = require_compact_encoding();
      var Sleeper = require_sleeper();
      var m = require_messages();
      var Persistent = require_persistent();
      var { COMMANDS } = require_constants();
      module.exports = class Announcer {
        constructor(dht, keyPair, target2, opts = {}) {
          this.dht = dht;
          this.keyPair = keyPair;
          this.target = target2;
          this.relays = [];
          this.stopped = false;
          this.record = c.encode(m.peer, { publicKey: keyPair.publicKey, relayAddresses: [] });
          this._refreshing = false;
          this._closestNodes = null;
          this._active = null;
          this._sleeper = new Sleeper();
          this._signAnnounce = opts.signAnnounce || Persistent.signAnnounce;
          this._signUnannounce = opts.signUnannounce || Persistent.signUnannounce;
          this._serverRelays = [
            /* @__PURE__ */ new Map(),
            /* @__PURE__ */ new Map(),
            /* @__PURE__ */ new Map()
          ];
        }
        isRelay(addr) {
          const id = addr.host + ":" + addr.port;
          const [a, b, c2] = this._serverRelays;
          return a.has(id) || b.has(id) || c2.has(id);
        }
        refresh() {
          if (this.stopped)
            return;
          this._refreshing = true;
        }
        async start() {
          if (this.stopped)
            return;
          this._active = this._update();
          await this._active;
          if (this.stopped)
            return;
          this._active = this._background();
        }
        async stop() {
          this.stopped = true;
          this._sleeper.resume();
          await this._active;
          await this._unannounceAll(this._serverRelays[2].values());
        }
        async _background() {
          while (!this.stopped) {
            try {
              this._refreshing = false;
              for (let i = 0; i < 100 && !this.stopped && !this._refreshing; i++) {
                const pings = [];
                for (const node of this._serverRelays[2].values()) {
                  pings.push(this.dht.ping(node));
                }
                const pongs = await allFastest(pings);
                if (this.stopped)
                  return;
                const relays = [];
                for (let i2 = 0; i2 < pongs.length && relays.length < 3; i2++) {
                  relays.push(pongs[i2].from);
                }
                await this._sleeper.pause(3e3);
              }
              if (!this.stopped)
                await this._update();
            } catch (err) {
              safetyCatch(err);
            }
          }
        }
        async _update() {
          const relays = [];
          this._cycle();
          const q = this.dht.findPeer(this.target, { hash: false, nodes: this._closestNodes });
          try {
            await q.finished();
          } catch {
          }
          if (this.stopped)
            return;
          const ann = [];
          const top = q.closestReplies.slice(0, 5);
          for (const msg of top) {
            ann.push(this._commit(msg, relays));
          }
          await Promise.allSettled(ann);
          if (this.stopped)
            return;
          this._closestNodes = q.closestNodes;
          this.relays = relays;
          const removed = [];
          for (const [key, value] of this._serverRelays[1]) {
            if (!this._serverRelays[2].has(key))
              removed.push(value);
          }
          await this._unannounceAll(removed);
        }
        _unannounceAll(relays) {
          const unann = [];
          for (const r of relays)
            unann.push(this._unannounce(r));
          return Promise.allSettled(unann);
        }
        async _unannounce(to) {
          const unann = {
            peer: {
              publicKey: this.keyPair.publicKey,
              relayAddresses: []
            },
            refresh: null,
            signature: null
          };
          const { from, token, value } = await this.dht.request({
            token: null,
            command: COMMANDS.FIND_PEER,
            target: this.target,
            value: null
          }, to);
          if (!token || !from.id || !value)
            return;
          unann.signature = await this._signUnannounce(this.target, token, from.id, unann, this.keyPair.secretKey);
          await this.dht.request({
            token,
            command: COMMANDS.UNANNOUNCE,
            target: this.target,
            value: c.encode(m.announce, unann)
          }, to);
        }
        async _commit(msg, relays) {
          const ann = {
            peer: {
              publicKey: this.keyPair.publicKey,
              relayAddresses: []
            },
            refresh: null,
            signature: null
          };
          ann.signature = await this._signAnnounce(this.target, msg.token, msg.from.id, ann, this.keyPair.secretKey);
          const res = await this.dht.request({
            token: msg.token,
            command: COMMANDS.ANNOUNCE,
            target: this.target,
            value: c.encode(m.announce, ann)
          }, msg.from);
          if (res.error !== 0)
            return;
          this._serverRelays[2].set(msg.from.host + ":" + msg.from.port, msg.from);
          if (relays.length < 3) {
            relays.push({ relayAddress: msg.from, peerAddress: msg.to });
          }
          if (relays.length === 3) {
            this.relays = relays;
          }
        }
        _cycle() {
          const tmp = this._serverRelays[0];
          this._serverRelays[0] = this._serverRelays[1];
          this._serverRelays[1] = this._serverRelays[2];
          this._serverRelays[2] = tmp;
          tmp.clear();
        }
      };
      function allFastest(ps) {
        const result = [];
        let ticks = ps.length + 1;
        return new Promise((resolve) => {
          for (const p of ps)
            p.then(push, tick);
          tick();
          function push(v) {
            result.push(v);
            tick();
          }
          function tick() {
            if (--ticks === 0)
              resolve(result);
          }
        });
      }
    }
  });

  // node_modules/@hyperswarm/dht/lib/crypto.js
  var require_crypto = __commonJS({
    "node_modules/@hyperswarm/dht/lib/crypto.js"(exports, module) {
      var sodium = require_sodium_universal();
      var b4a = require_b4a();
      function hash(data) {
        const out = b4a.allocUnsafe(32);
        sodium.crypto_generichash(out, data);
        return out;
      }
      function createKeyPair(seed) {
        const publicKey = b4a.alloc(32);
        const secretKey = b4a.alloc(64);
        if (seed)
          sodium.crypto_sign_seed_keypair(publicKey, secretKey, seed);
        else
          sodium.crypto_sign_keypair(publicKey, secretKey);
        return { publicKey, secretKey };
      }
      module.exports = {
        hash,
        createKeyPair
      };
    }
  });

  // node_modules/@hyperswarm/dht/lib/secure-payload.js
  var require_secure_payload = __commonJS({
    "node_modules/@hyperswarm/dht/lib/secure-payload.js"(exports, module) {
      var sodium = require_sodium_universal();
      var b4a = require_b4a();
      var { holepunchPayload } = require_messages();
      module.exports = class HolepunchPayload {
        constructor(holepunchSecret) {
          this._sharedSecret = holepunchSecret;
          this._localSecret = b4a.allocUnsafe(32);
          sodium.randombytes_buf(this._localSecret);
        }
        decrypt(buffer) {
          const state = { start: 24, end: buffer.byteLength - 16, buffer };
          if (state.end <= state.start)
            return null;
          const nonce = buffer.subarray(0, 24);
          const msg = state.buffer.subarray(state.start, state.end);
          const cipher = state.buffer.subarray(state.start);
          if (!sodium.crypto_secretbox_open_easy(msg, cipher, nonce, this._sharedSecret))
            return null;
          try {
            return holepunchPayload.decode(state);
          } catch {
            return null;
          }
        }
        encrypt(payload) {
          const state = { start: 24, end: 24, buffer: null };
          holepunchPayload.preencode(state, payload);
          state.buffer = b4a.allocUnsafe(state.end + 16);
          const nonce = state.buffer.subarray(0, 24);
          const msg = state.buffer.subarray(state.start, state.end);
          const cipher = state.buffer.subarray(state.start);
          holepunchPayload.encode(state, payload);
          sodium.randombytes_buf(nonce);
          sodium.crypto_secretbox_easy(cipher, msg, nonce, this._sharedSecret);
          return state.buffer;
        }
        token(addr) {
          const out = b4a.allocUnsafe(32);
          sodium.crypto_generichash(out, b4a.from(addr.host), this._localSecret);
          return out;
        }
      };
    }
  });

  // node_modules/@hyperswarm/dht/lib/nat.js
  var require_nat = __commonJS({
    "node_modules/@hyperswarm/dht/lib/nat.js"(exports, module) {
      var { FIREWALL } = require_constants();
      module.exports = class Nat {
        constructor(dht, socket) {
          this._samplesHost = [];
          this._samplesFull = [];
          this._visited = /* @__PURE__ */ new Map();
          this._resolve = null;
          this._minSamples = 4;
          this._autoSampling = false;
          this.dht = dht;
          this.socket = socket;
          this.sampled = 0;
          this.firewall = dht.firewalled ? FIREWALL.UNKNOWN : FIREWALL.OPEN;
          this.addresses = null;
          this.analyzing = new Promise((resolve) => {
            this._resolve = resolve;
          });
        }
        autoSample(retry = true) {
          if (this._autoSampling)
            return;
          this._autoSampling = true;
          const self = this;
          const socket = this.socket;
          const maxPings = this._minSamples;
          let skip = this.dht.nodes.length >= 8 ? 5 : 0;
          let pending = 0;
          for (let node = this.dht.nodes.latest; node && this.sampled + pending < maxPings; node = node.prev) {
            if (skip > 0) {
              skip--;
              continue;
            }
            const ref = node.host + ":" + node.port;
            if (this._visited.has(ref))
              continue;
            this._visited.set(ref, 1);
            pending++;
            this.dht.ping(node, { socket, retry: false }).then(onpong, onskip);
          }
          pending++;
          onskip();
          function onpong(res) {
            self.add(res.to, res.from);
            onskip();
          }
          function onskip() {
            if (--pending === 0 && self.sampled < self._minSamples) {
              if (retry) {
                self._autoSampling = false;
                self.autoSample(false);
                return;
              }
              self._resolve();
            }
          }
        }
        destroy() {
          this._autoSampling = true;
          this._minSamples = 0;
          this._resolve();
        }
        unfreeze() {
          this.frozen = false;
          this._updateFirewall();
          this._updateAddresses();
        }
        freeze() {
          this.frozen = true;
        }
        _updateFirewall() {
          if (!this.dht.firewalled) {
            this.firewall = FIREWALL.OPEN;
            return;
          }
          if (this.sampled < 3)
            return;
          const max = this._samplesFull[0].hits;
          if (max >= 3) {
            this.firewall = FIREWALL.CONSISTENT;
            return;
          }
          if (max === 1) {
            this.firewall = FIREWALL.RANDOM;
            return;
          }
          if (this._samplesHost.length === 1 && this.sampled > 3) {
            this.firewall = FIREWALL.RANDOM;
            return;
          }
          if (this._samplesHost.length > 1 && this._samplesFull[1].hits > 1) {
            this.firewall = FIREWALL.CONSISTENT;
            return;
          }
          if (this.sampled > 4) {
            this.firewall = FIREWALL.RANDOM;
          }
        }
        _updateAddresses() {
          if (this.firewall === FIREWALL.UNKNOWN) {
            this.addresses = null;
            return;
          }
          if (this.firewall === FIREWALL.RANDOM) {
            this.addresses = [this._samplesHost[0]];
            return;
          }
          if (this.firewall === FIREWALL.CONSISTENT) {
            this.addresses = [];
            for (const addr of this._samplesFull) {
              if (addr.hits >= 2 || this.addresses.length < 2)
                this.addresses.push(addr);
            }
          }
        }
        update() {
          if (this.dht.firewalled && this.firewall === FIREWALL.OPEN) {
            this.firewall = FIREWALL.UNKNOWN;
          }
          this._updateFirewall();
          this._updateAddresses();
        }
        add(addr, from) {
          const ref = from.host + ":" + from.port;
          if (this._visited.get(ref) === 2)
            return;
          this._visited.set(ref, 2);
          addSample(this._samplesHost, addr.host, 0);
          addSample(this._samplesFull, addr.host, addr.port);
          if ((++this.sampled >= 3 || !this.dht.firewalled) && !this.frozen) {
            this.update();
          }
          if (this.firewall === FIREWALL.CONSISTENT || this.firewall === FIREWALL.OPEN) {
            this._resolve();
          } else if (this.sampled >= this._minSamples) {
            this._resolve();
          }
        }
      };
      function addSample(samples, host, port) {
        for (let i = 0; i < samples.length; i++) {
          const s = samples[i];
          if (s.port !== port || s.host !== host)
            continue;
          s.hits++;
          for (; i > 0; i--) {
            const prev = samples[i - 1];
            if (prev.hits >= s.hits)
              return;
            samples[i - 1] = s;
            samples[i] = prev;
          }
          return;
        }
        samples.push({
          host,
          port,
          hits: 1
        });
      }
    }
  });

  // node_modules/@hyperswarm/dht/lib/holepuncher.js
  var require_holepuncher = __commonJS({
    "node_modules/@hyperswarm/dht/lib/holepuncher.js"(exports, module) {
      var b4a = require_b4a();
      var Nat = require_nat();
      var Sleeper = require_sleeper();
      var { FIREWALL } = require_constants();
      var BIRTHDAY_SOCKETS = 256;
      var HOLEPUNCH = b4a.from([0]);
      var HOLEPUNCH_TTL = 5;
      var DEFAULT_TTL = 64;
      var MAX_REOPENS = 3;
      module.exports = class Holepuncher {
        constructor(dht, isInitiator, remoteFirewall = FIREWALL.UNKNOWN) {
          const holder = dht._socketPool.acquire();
          this.dht = dht;
          this.nat = new Nat(dht, holder.socket);
          this.nat.autoSample();
          this.isInitiator = isInitiator;
          this.onconnect = noop;
          this.onabort = noop;
          this.punching = false;
          this.connected = false;
          this.destroyed = false;
          this.remoteFirewall = remoteFirewall;
          this.remoteAddresses = [];
          this.remoteHolepunching = false;
          this._sleeper = new Sleeper();
          this._reopening = null;
          this._timeout = null;
          this._punching = null;
          this._allHolders = [];
          this._holder = this._addRef(holder);
        }
        get socket() {
          return this._holder.socket;
        }
        updateRemote({ punching, firewall, addresses, verified }) {
          const remoteAddresses = [];
          if (addresses) {
            for (const addr of addresses) {
              remoteAddresses.push({
                host: addr.host,
                port: addr.port,
                verified: verified === addr.host || this._isVerified(addr.host)
              });
            }
          }
          this.remoteFirewall = firewall;
          this.remoteAddresses = remoteAddresses;
          this.remoteHolepunching = punching;
        }
        _isVerified(host) {
          for (const addr of this.remoteAddresses) {
            if (addr.verified && addr.host === host) {
              return true;
            }
          }
          return false;
        }
        ping(addr, socket = this._holder.socket) {
          return holepunch(socket, addr, false);
        }
        openSession(addr, socket = this._holder.socket) {
          return holepunch(socket, addr, true);
        }
        async analyze(allowReopen) {
          await this.nat.analyzing;
          if (this._unstable()) {
            if (!allowReopen)
              return false;
            if (!this._reopening)
              this._reopening = this._reopen();
            return this._reopening;
          }
          return true;
        }
        _unstable() {
          const firewall = this.nat.firewall;
          return this.remoteFirewall >= FIREWALL.RANDOM && firewall >= FIREWALL.RANDOM || firewall === FIREWALL.UNKNOWN;
        }
        _reset() {
          const prev = this._holder;
          this._allHolders.pop();
          this._holder = this._addRef(this.dht._socketPool.acquire());
          prev.release();
          this.nat.destroy();
          this.nat = new Nat(this.dht, this._holder.socket);
          this.nat.autoSample();
        }
        _addRef(ref) {
          this._allHolders.push(ref);
          ref.onholepunchmessage = (msg, rinfo) => this._onholepunchmessage(msg, rinfo, ref);
          return ref;
        }
        _onholepunchmessage(_, addr, ref) {
          if (!this.isInitiator) {
            holepunch(ref.socket, addr, false);
            return;
          }
          if (this.connected)
            return;
          this.connected = true;
          this.punching = false;
          for (const r of this._allHolders) {
            if (r === ref)
              continue;
            r.release();
          }
          this._allHolders[0] = ref;
          while (this._allHolders.length > 1)
            this._allHolders.pop();
          this.onconnect(ref.socket, addr.port, addr.host);
        }
        _done() {
          return this.destroyed || this.connected;
        }
        async _reopen() {
          for (let i = 0; this._unstable() && i < MAX_REOPENS && !this._done() && !this.punching; i++) {
            this._reset();
            await this.nat.analyzing;
          }
          return coerceFirewall(this.nat.firewall) === FIREWALL.CONSISTENT;
        }
        punch() {
          if (!this._punching)
            this._punching = this._punch();
          return this._punching;
        }
        async _punch() {
          if (this._done() || !this.remoteAddresses.length)
            return false;
          this.punching = true;
          const local = coerceFirewall(this.nat.firewall);
          const remote = coerceFirewall(this.remoteFirewall);
          let remoteVerifiedAddress = null;
          for (const addr of this.remoteAddresses) {
            if (addr.verified) {
              remoteVerifiedAddress = addr;
              break;
            }
          }
          if (local === FIREWALL.CONSISTENT && remote === FIREWALL.CONSISTENT) {
            this._consistentProbe();
            return true;
          }
          if (!remoteVerifiedAddress)
            return false;
          if (local === FIREWALL.CONSISTENT && remote >= FIREWALL.RANDOM) {
            this._randomProbes(remoteVerifiedAddress);
            return true;
          }
          if (local >= FIREWALL.RANDOM && remote === FIREWALL.CONSISTENT) {
            await this._openBirthdaySockets(remoteVerifiedAddress);
            if (this.punching)
              this._keepAliveRandomNat(remoteVerifiedAddress);
            return true;
          }
          return false;
        }
        async _consistentProbe() {
          if (!this.isInitiator)
            await this._sleeper.pause(1e3);
          let tries = 0;
          while (this.punching && tries++ < 10) {
            for (const addr of this.remoteAddresses) {
              if (!addr.verified && (tries & 3) !== 0)
                continue;
              await holepunch(this._holder.socket, addr, false);
            }
            if (this.punching)
              await this._sleeper.pause(1e3);
          }
          this._autoDestroy();
        }
        async _randomProbes(remoteAddr) {
          let tries = 1750;
          while (this.punching && tries-- > 0) {
            const addr = { host: remoteAddr.host, port: randomPort() };
            await holepunch(this._holder.socket, addr, false);
            if (this.punching)
              await this._sleeper.pause(20);
          }
          this._autoDestroy();
        }
        async _keepAliveRandomNat(remoteAddr) {
          let i = 0;
          let lowTTLRounds = 1;
          await this._sleeper.pause(100);
          let tries = 1750;
          while (this.punching && tries-- > 0) {
            if (i === this._allHolders.length) {
              i = 0;
              if (lowTTLRounds > 0)
                lowTTLRounds--;
            }
            await holepunch(this._allHolders[i++].socket, remoteAddr, lowTTLRounds > 0);
            if (this.punching)
              await this._sleeper.pause(20);
          }
          this._autoDestroy();
        }
        async _openBirthdaySockets(remoteAddr) {
          while (this.punching && this._allHolders.length < BIRTHDAY_SOCKETS) {
            const ref = this._addRef(this.dht._socketPool.acquire());
            await holepunch(ref.socket, remoteAddr, HOLEPUNCH_TTL);
          }
        }
        _autoDestroy() {
          if (!this.connected)
            this.destroy();
        }
        destroy() {
          if (this.destroyed)
            return;
          this.destroyed = true;
          this.punching = false;
          for (const ref of this._allHolders)
            ref.release();
          this._allHolders = [];
          this.nat.destroy();
          if (!this.connected)
            this.onabort();
        }
        static ping(socket, addr) {
          return holepunch(socket, addr, false);
        }
      };
      function holepunch(socket, addr, lowTTL) {
        return socket.send(HOLEPUNCH, addr.port, addr.host, lowTTL ? HOLEPUNCH_TTL : DEFAULT_TTL);
      }
      function randomPort() {
        return 1e3 + Math.random() * 64536 | 0;
      }
      function coerceFirewall(fw) {
        return fw === FIREWALL.OPEN ? FIREWALL.CONSISTENT : fw;
      }
      function noop() {
      }
    }
  });

  // node_modules/debugging-stream/index.js
  var require_debugging_stream = __commonJS({
    "node_modules/debugging-stream/index.js"(exports, module) {
      var { Duplex } = require_streamx();
      module.exports = class DebuggingStream extends Duplex {
        constructor(stream, { random = Math.random, latency = 0 } = {}) {
          super();
          this._random = random;
          this._latency = toRange(latency);
          this._queued = [];
          this._ondrain = null;
          this.stream = stream;
          let ended = false;
          this.stream.on("data", (data) => {
            this._queue({ pending: true, data, error: null, done: false });
          });
          this.stream.on("end", () => {
            ended = true;
            this._queue({ pending: true, data: null, error: null, done: false });
          });
          this.stream.on("error", (err) => {
            this._queue({ pending: true, data: null, error: err, done: true });
          });
          this.stream.on("close", () => {
            if (ended)
              return;
            this._queue({ pending: true, data: null, error: null, done: true });
          });
          this.stream.on("drain", () => {
            this._triggerDrain();
          });
        }
        _triggerDrain() {
          if (this._ondrain === null)
            return;
          const ondrain = this._ondrain;
          this._ondrain = null;
          ondrain();
        }
        _queue(evt) {
          const l = this._latency.start + Math.round(this._random() * this._latency.variance);
          this._queued.push(evt);
          setTimeout(() => {
            evt.pending = false;
            this._drain();
          }, l);
        }
        _drain() {
          let paused = false;
          while (this._queued.length > 0 && this._queued[0].pending === false) {
            const q = this._queued.shift();
            if (q.done) {
              this.destroy(q.error);
              continue;
            }
            if (this.push(q.data) === false) {
              paused = true;
            }
          }
          if (paused)
            this.stream.pause();
        }
        _read(cb) {
          this.stream.resume();
          cb(null);
        }
        _predestroy() {
          this._triggerDrain();
        }
        _write(data, cb) {
          if (this.stream.write(data) === false) {
            this._ondrain = cb;
            return;
          }
          cb(null);
        }
        _final(cb) {
          this.stream.end();
          cb();
        }
      };
      function toRange(range) {
        if (typeof range === "number") {
          range = [range, range];
        }
        return { start: range[0], variance: range[1] - range[0] };
      }
    }
  });

  // node_modules/@hyperswarm/dht/lib/server.js
  var require_server = __commonJS({
    "node_modules/@hyperswarm/dht/lib/server.js"(exports, module) {
      var { EventEmitter } = __require("events");
      var safetyCatch = require_safety_catch();
      var NoiseSecretStream = require_secret_stream();
      var b4a = require_b4a();
      var NoiseWrap = require_noise_wrap();
      var Announcer = require_announcer();
      var { FIREWALL, ERROR } = require_constants();
      var { hash } = require_crypto();
      var SecurePayload = require_secure_payload();
      var Holepuncher = require_holepuncher();
      var DebuggingStream = require_debugging_stream();
      var HANDSHAKE_CLEAR_WAIT = 1e4;
      var HANDSHAKE_INITIAL_TIMEOUT = 1e4;
      module.exports = class Server extends EventEmitter {
        constructor(dht, opts = {}) {
          super();
          this.dht = dht;
          this.target = null;
          this.relayAddresses = null;
          this.closed = false;
          this.firewall = opts.firewall || (() => false);
          this.holepunch = opts.holepunch || (() => true);
          this.createHandshake = opts.createHandshake || defaultCreateHandshake;
          this.createSecretStream = opts.createSecretStream || defaultCreateSecretStream;
          this._shareLocalAddress = opts.shareLocalAddress !== false;
          this._reusableSocket = !!opts.reusableSocket;
          this._keyPair = null;
          this._announcer = null;
          this._connects = /* @__PURE__ */ new Map();
          this._holepunches = [];
          this._listening = false;
          this._closing = null;
        }
        get publicKey() {
          return this._keyPair && this._keyPair.publicKey;
        }
        onconnection(encryptedSocket) {
          this.emit("connection", encryptedSocket);
        }
        address() {
          if (!this._keyPair)
            return null;
          return {
            publicKey: this._keyPair.publicKey,
            host: this.dht.host,
            port: this.dht.port
          };
        }
        close() {
          if (this._closing)
            return this._closing;
          this._closing = this._close();
          return this._closing;
        }
        async _close() {
          this.closed = true;
          if (!this._listening)
            return;
          this.dht.listening.delete(this);
          this.dht._router.delete(this.target);
          while (this._holepunches.length > 0) {
            const h = this._holepunches.pop();
            if (h && h.puncher)
              h.puncher.destroy();
            if (h && h.clearing)
              clearTimeout(h.clearing);
            if (h && h.prepunching)
              clearTimeout(h.prepunching);
          }
          this._connects.clear();
          await this._announcer.stop();
          this._announcer = null;
          this.emit("close");
        }
        async listen(keyPair = this.dht.defaultKeyPair, opts = {}) {
          if (this._listening)
            throw new Error("Already listening");
          if (this.dht.destroyed)
            throw new Error("Node destroyed");
          this.target = hash(keyPair.publicKey);
          this._keyPair = keyPair;
          this._announcer = new Announcer(this.dht, keyPair, this.target, opts);
          this.dht._router.set(this.target, {
            relay: null,
            record: this._announcer.record,
            onpeerhandshake: this._onpeerhandshake.bind(this),
            onpeerholepunch: this._onpeerholepunch.bind(this)
          });
          this._listening = true;
          try {
            await this._announcer.start();
          } catch (err) {
            await this._announcer.stop();
            this._announcer = null;
            this._listening = false;
            throw err;
          }
          if (this.dht.destroyed)
            throw new Error("Node destroyed");
          this.dht.listening.add(this);
          this.emit("listening");
        }
        refresh() {
          if (this._announcer)
            this._announcer.refresh();
        }
        async _addHandshake(k, noise, clientAddress, { from, to: serverAddress, socket }, direct) {
          let id = this._holepunches.indexOf(null);
          if (id === -1)
            id = this._holepunches.push(null) - 1;
          const hs = {
            round: 0,
            reply: null,
            puncher: null,
            payload: null,
            rawStream: null,
            prepunching: null,
            firewalled: true,
            clearing: null,
            onsocket: null
          };
          this._holepunches[id] = hs;
          const handshake = this.createHandshake(this._keyPair, null);
          let remotePayload;
          try {
            remotePayload = await handshake.recv(noise);
          } catch (err) {
            safetyCatch(err);
            this._clearLater(hs, id, k);
            return null;
          }
          try {
            hs.firewalled = await this.firewall(handshake.remotePublicKey, remotePayload, clientAddress);
          } catch (err) {
            safetyCatch(err);
          }
          if (hs.firewalled) {
            this._clearLater(hs, id, k);
            return null;
          }
          if (this.closed)
            return null;
          const error = remotePayload.version === 1 ? remotePayload.udx ? ERROR.NONE : ERROR.ABORTED : ERROR.VERSION_MISMATCH;
          const addresses = [];
          const ourLocalAddr = this._shareLocalAddress ? this.dht.localAddress() : null;
          const ourRemoteAddr = this.dht.remoteAddress();
          if (ourRemoteAddr)
            addresses.push(ourRemoteAddr);
          if (ourLocalAddr)
            addresses.push(ourLocalAddr);
          if (error === ERROR.NONE) {
            let autoDestroy2 = function() {
              if (hs.puncher)
                hs.puncher.destroy();
            };
            var autoDestroy = autoDestroy2;
            hs.rawStream = this.dht._rawStreams.add({
              firewall(socket2, port, host) {
                hs.onsocket(socket2, port, host);
                return false;
              }
            });
            hs.rawStream.on("error", autoDestroy2);
            hs.onsocket = (socket2, port, host) => {
              this._clearLater(hs, id, k);
              const rawStream = this.dht._debugStream !== null ? new DebuggingStream(hs.rawStream, this.dht._debugStream) : hs.rawStream;
              if (this._reusableSocket && remotePayload.udx.reusableSocket) {
                this.dht._socketPool.routes.add(handshake.remotePublicKey, hs.rawStream);
              }
              hs.rawStream.removeListener("error", autoDestroy2);
              hs.rawStream.connect(socket2, remotePayload.udx.id, port, host);
              this.onconnection(this.createSecretStream(false, rawStream, { handshake: h }));
              if (hs.puncher) {
                hs.puncher.onabort = noop;
                hs.puncher.destroy();
              }
            };
          }
          try {
            hs.reply = await handshake.send({
              error,
              firewall: ourRemoteAddr ? FIREWALL.OPEN : FIREWALL.UNKNOWN,
              holepunch: ourRemoteAddr ? null : { id, relays: this._announcer.relays },
              addresses4: addresses,
              addresses6: null,
              udx: {
                reusableSocket: this._reusableSocket,
                id: hs.rawStream ? hs.rawStream.id : 0,
                seq: 0
              },
              secretStream: {}
            });
          } catch (err) {
            safetyCatch(err);
            hs.rawStream.destroy();
            this._clearLater(hs, id, k);
            return null;
          }
          if (this.dht._debugHandshakeLatency !== null) {
            const [start, end] = this.dht._debugHandshakeLatency;
            await sleep(start + Math.round(Math.random() * (end - start)));
          }
          const h = handshake.final();
          if (error !== ERROR.NONE) {
            this._clearLater(hs, id, k);
            return hs;
          }
          if (remotePayload.firewall === FIREWALL.OPEN || direct) {
            const sock = direct ? socket : this.dht.socket;
            hs.onsocket(sock, clientAddress.port, clientAddress.host);
            return hs;
          }
          if (ourRemoteAddr) {
            return hs;
          }
          hs.payload = new SecurePayload(h.holepunchSecret);
          hs.puncher = new Holepuncher(this.dht, false, remotePayload.firewall);
          const onabort = () => {
            if (hs.prepunching)
              clearTimeout(hs.prepunching);
            hs.prepunching = null;
            hs.rawStream.destroy();
            this._clearLater(hs, id, k);
          };
          hs.puncher.onconnect = hs.onsocket;
          hs.puncher.onabort = onabort;
          hs.prepunching = setTimeout(hs.puncher.destroy.bind(hs.puncher), HANDSHAKE_INITIAL_TIMEOUT);
          return hs;
        }
        _clearLater(hs, id, k) {
          if (hs.clearing)
            return;
          hs.clearing = setTimeout(() => this._clear(hs, id, k), HANDSHAKE_CLEAR_WAIT);
        }
        _clear(hs, id, k) {
          if (id >= this._holepunches.length || this._holepunches[id] !== hs)
            return;
          this._holepunches[id] = null;
          while (this._holepunches.length > 0 && this._holepunches[this._holepunches.length - 1] === null) {
            this._holepunches.pop();
          }
          this._connects.delete(k);
        }
        async _onpeerhandshake({ noise, peerAddress }, req) {
          const k = b4a.toString(noise, "hex");
          let p = this._connects.get(k);
          if (!p) {
            p = this._addHandshake(k, noise, peerAddress || req.from, req, !peerAddress);
            this._connects.set(k, p);
          }
          const h = await p;
          if (!h)
            return null;
          if (this.closed)
            return null;
          return { socket: h.puncher && h.puncher.socket, noise: h.reply };
        }
        async _onpeerholepunch({ id, peerAddress, payload }, req) {
          const h = id < this._holepunches.length ? this._holepunches[id] : null;
          if (!h)
            return null;
          if (!peerAddress || this.closed)
            return null;
          const p = h.puncher;
          if (!p || !p.socket)
            return this._abort(h);
          const remotePayload = h.payload.decrypt(payload);
          if (!remotePayload)
            return null;
          const isServerRelay = this._announcer.isRelay(req.from);
          const { error, firewall, round, punching, addresses, remoteAddress, remoteToken } = remotePayload;
          if (error !== ERROR.NONE) {
            if (round >= h.round)
              h.round = round;
            return this._abort(h);
          }
          const token = h.payload.token(peerAddress);
          const echoed = isServerRelay && !!remoteToken && b4a.equals(token, remoteToken);
          if (req.socket === p.socket) {
            p.nat.add(req.to, req.from);
          }
          if (round >= h.round) {
            h.round = round;
            p.updateRemote({ punching, firewall, addresses, verified: echoed ? peerAddress.host : null });
          }
          let stable = await p.analyze(false);
          if (p.destroyed)
            return null;
          if (!p.remoteHolepunching && !stable) {
            stable = await p.analyze(true);
            if (p.destroyed)
              return null;
            if (!stable)
              return this._abort(h);
          }
          if (isConsistent(p.nat.firewall) && remoteAddress && hasSameAddr(p.nat.addresses, remoteAddress)) {
            await p.ping(peerAddress);
            if (p.destroyed)
              return null;
          }
          if (p.remoteHolepunching) {
            if (!this.holepunch(p.remoteFirewall, p.nat.firewall, p.remoteAddresses, p.nat.addresses)) {
              return p.destroyed ? null : this._abort(h);
            }
            if (h.prepunching) {
              clearTimeout(h.prepunching);
              h.prepunching = null;
            }
            const punching2 = await p.punch();
            if (p.destroyed)
              return null;
            if (!punching2)
              return this._abort(h);
          }
          if (p.nat.firewall !== FIREWALL.UNKNOWN) {
            p.nat.freeze();
          }
          return {
            socket: p.socket,
            payload: h.payload.encrypt({
              error: ERROR.NONE,
              firewall: p.nat.firewall,
              round: h.round,
              connected: p.connected,
              punching: p.punching,
              addresses: p.nat.addresses,
              remoteAddress: null,
              token: isServerRelay ? token : null,
              remoteToken: remotePayload.token
            })
          };
        }
        _abort(h) {
          if (!h.payload) {
            if (h.puncher)
              h.puncher.destroy();
            return null;
          }
          const payload = h.payload.encrypt({
            error: ERROR.ABORTED,
            firewall: FIREWALL.UNKNOWN,
            round: h.round,
            connected: false,
            punching: false,
            addresses: null,
            remoteAddress: null,
            token: null,
            remoteToken: null
          });
          h.puncher.destroy();
          return { socket: this.dht.socket, payload };
        }
      };
      function isConsistent(fw) {
        return fw === FIREWALL.OPEN || fw === FIREWALL.CONSISTENT;
      }
      function hasSameAddr(addrs, other) {
        if (addrs === null)
          return false;
        for (const addr of addrs) {
          if (addr.port === other.port && addr.host === other.host)
            return true;
        }
        return false;
      }
      function defaultCreateHandshake(keyPair, remotePublicKey) {
        return new NoiseWrap(keyPair, remotePublicKey);
      }
      function defaultCreateSecretStream(isInitiator, rawStream, opts) {
        return new NoiseSecretStream(isInitiator, rawStream, opts);
      }
      function sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }
      function noop() {
      }
    }
  });

  // node_modules/bogon/index.js
  var require_bogon = __commonJS({
    "node_modules/bogon/index.js"(exports, module) {
      module.exports = isBogon;
      isBogon.isBogon = isBogon;
      isBogon.isPrivate = isPrivate;
      function isBogon(ip) {
        const n = toNumber(ip);
        return isPrivateN(n) || n >>> 24 === 0 || n >>> 8 === 12582912 || n >>> 8 === 12582914 || n >>> 17 === 25353 || n >>> 8 === 12989284 || n >>> 8 === 13303921 || n >>> 28 === 14 || n >>> 28 === 15 || n === 4294967295;
      }
      function isPrivateN(n) {
        return n >>> 24 === 10 || n >>> 22 === 401 || n >>> 24 === 127 || n >>> 16 === 43518 || n >>> 20 === 2753 || n >>> 16 === 49320;
      }
      function isPrivate(ip) {
        return isPrivateN(toNumber(ip));
      }
      function toNumber(ip) {
        const [a, b, c, d] = ip.split(".");
        return 16777216 * parseInt(a, 10) + 65536 * parseInt(b, 10) + 256 * parseInt(c, 10) + parseInt(d, 10);
      }
    }
  });

  // node_modules/@hyperswarm/dht/lib/semaphore.js
  var require_semaphore = __commonJS({
    "node_modules/@hyperswarm/dht/lib/semaphore.js"(exports, module) {
      var DONE = Promise.resolve(true);
      var DESTROYED = Promise.resolve(false);
      module.exports = class Semaphore {
        constructor(limit = 1) {
          this.limit = limit;
          this.active = 0;
          this.waiting = [];
          this.destroyed = false;
          this._onwait = (resolve) => {
            this.waiting.push(resolve);
          };
        }
        wait() {
          if (this.destroyed === true)
            return DESTROYED;
          if (this.active < this.limit && this.waiting.length === 0) {
            this.active++;
            return DONE;
          }
          return new Promise(this._onwait);
        }
        signal() {
          if (this.destroyed === true)
            return;
          this.active--;
          while (this.active < this.limit && this.waiting.length > 0 && this.destroyed === false) {
            this.active++;
            this.waiting.shift()(true);
          }
        }
        async flush() {
          if (this.destroyed === true)
            return;
          this.limit = 1;
          await this.wait();
          this.signal();
        }
        destroy() {
          this.destroyed = true;
          this.active = 0;
          while (this.waiting.length)
            this.waiting.pop()(false);
        }
      };
    }
  });

  // node_modules/@hyperswarm/dht/lib/connect.js
  var require_connect = __commonJS({
    "node_modules/@hyperswarm/dht/lib/connect.js"(exports, module) {
      var NoiseSecretStream = require_secret_stream();
      var b4a = require_b4a();
      var DebuggingStream = require_debugging_stream();
      var { isPrivate } = require_bogon();
      var Semaphore = require_semaphore();
      var NoiseWrap = require_noise_wrap();
      var SecurePayload = require_secure_payload();
      var Holepuncher = require_holepuncher();
      var Sleeper = require_sleeper();
      var { FIREWALL, ERROR } = require_constants();
      var { hash } = require_crypto();
      module.exports = function connect(dht, publicKey, opts = {}) {
        const keyPair = opts.keyPair || dht.defaultKeyPair;
        const encryptedSocket = (opts.createSecretStream || defaultCreateSecretStream)(true, null, {
          publicKey: keyPair.publicKey,
          remotePublicKey: publicKey,
          autoStart: false
        });
        const c = {
          dht,
          round: 0,
          target: hash(publicKey),
          remotePublicKey: publicKey,
          reusableSocket: !!opts.reusableSocket,
          handshake: (opts.createHandshake || defaultCreateHandshake)(keyPair, publicKey),
          request: null,
          requesting: false,
          firewall: FIREWALL.UNKNOWN,
          rawStream: dht._rawStreams.add({ firewall }),
          connect: null,
          query: null,
          puncher: null,
          payload: null,
          passiveConnectTimeout: null,
          serverSocket: null,
          serverAddress: null,
          onsocket: null,
          sleeper: new Sleeper(),
          encryptedSocket
        };
        c.rawStream.on("error", autoDestroy);
        c.rawStream.once("connect", () => c.rawStream.removeListener("error", autoDestroy));
        encryptedSocket.on("close", function() {
          if (c.passiveConnectTimeout)
            clearPassiveConnectTimeout(c);
          if (c.query)
            c.query.destroy();
          if (c.puncher)
            c.puncher.destroy();
          if (c.rawStream)
            c.rawStream.destroy();
          c.sleeper.resume();
        });
        connectAndHolepunch(c, opts);
        return encryptedSocket;
        function autoDestroy(err) {
          encryptedSocket.destroy(err);
        }
        function firewall(socket, port, host) {
          if (c.onsocket) {
            c.onsocket(socket, port, host);
          } else {
            c.serverSocket = socket;
            c.serverAddress = { port, host };
          }
          return false;
        }
      };
      function isDone(c) {
        return c.encryptedSocket.destroyed || c.encryptedSocket.rawStream !== null || !!(c.puncher && c.puncher.connected);
      }
      async function retryRoute(c, route) {
        const ref = c.dht._socketPool.lookup(route.socket);
        if (!ref)
          return;
        ref.active();
        try {
          await connectThroughNode(c, route.address, route.socket);
        } catch {
        }
        ref.inactive();
      }
      async function connectAndHolepunch(c, opts) {
        const route = c.reusableSocket ? c.dht._socketPool.routes.get(c.remotePublicKey) : null;
        if (route) {
          await retryRoute(c, route);
          if (isDone(c))
            return;
        }
        await findAndConnect(c, opts);
        if (isDone(c))
          return;
        if (!c.connect) {
          c.encryptedSocket.destroy(new Error("Received invalid handshake"));
          return;
        }
        await holepunch(c, opts);
      }
      async function holepunch(c, opts) {
        let { relayAddress, serverAddress, clientAddress, payload } = c.connect;
        const remoteHolepunchable = !!(payload.holepunch && payload.holepunch.relays.length);
        const relayed = diffAddress(serverAddress, relayAddress);
        if (payload.firewall === FIREWALL.OPEN || relayed && !remoteHolepunchable) {
          if (payload.addresses4.length) {
            const socket = c.dht.socket;
            c.onsocket(socket, payload.addresses4[0].port, payload.addresses4[0].host);
            return;
          }
        }
        const onabort = () => c.encryptedSocket.destroy(new Error("Holepunch aborted"));
        if (c.firewall === FIREWALL.OPEN) {
          c.passiveConnectTimeout = setTimeout(onabort, 1e4);
          return;
        }
        if (relayed && clientAddress.host === serverAddress.host) {
          for (const addr of payload.addresses4) {
            if (isPrivate(addr.host) && opts.localConnection !== false) {
              const socket = c.dht.socket;
              c.onsocket(socket, addr.port, addr.host);
              return;
            }
          }
        }
        if (!remoteHolepunchable) {
          c.encryptedSocket.destroy(new Error("Cannot holepunch to remote"));
          return;
        }
        c.puncher = new Holepuncher(c.dht, true, payload.firewall);
        c.puncher.onconnect = c.onsocket;
        c.puncher.onabort = onabort;
        const serverRelay = pickServerRelay(payload.holepunch.relays, relayAddress);
        let probe;
        try {
          probe = await probeRound(c, opts.fastOpen === false ? null : serverAddress, serverRelay, true);
        } catch (err) {
          if (isDone(c))
            return;
          c.encryptedSocket.destroy(err);
          return;
        }
        if (isDone(c))
          return;
        const { token, peerAddress } = probe;
        if (!diffAddress(serverRelay.relayAddress, relayAddress) && diffAddress(serverAddress, peerAddress)) {
          serverAddress = peerAddress;
          await c.puncher.openSession(serverAddress);
          if (isDone(c))
            return;
        }
        if (opts.holepunch && !opts.holepunch(c.puncher.remoteFirewall, c.puncher.nat.firewall, c.puncher.remoteAddresses, c.puncher.nat.addresses)) {
          await abort(c, serverRelay, new Error("Client aborted holepunch"));
          return;
        }
        try {
          await roundPunch(c, serverAddress, token, relayAddress);
        } catch (err) {
          if (isDone(c))
            return;
          c.encryptedSocket.destroy(err);
        }
      }
      async function findAndConnect(c, opts) {
        c.query = c.dht.findPeer(c.target, { hash: false });
        const sem = new Semaphore(2);
        let attempts = 0;
        const signal = sem.signal.bind(sem);
        try {
          for await (const data of c.query) {
            await sem.wait();
            if (isDone(c))
              return;
            if (c.connect) {
              sem.signal();
              break;
            }
            attempts++;
            connectThroughNode(c, data.from, null).then(signal, signal);
          }
        } catch (err) {
          c.query = null;
          if (isDone(c))
            return;
          c.encryptedSocket.destroy(err);
          return;
        }
        c.query = null;
        if (isDone(c))
          return;
        await sem.flush();
        if (isDone(c))
          return;
        if (!c.connect) {
          c.encryptedSocket.destroy(attempts ? new Error("Could not connect to peer") : new Error("Could not find peer"));
        }
      }
      async function connectThroughNode(c, address, socket) {
        if (!c.requesting) {
          const addr = c.dht.remoteAddress();
          c.firewall = addr ? FIREWALL.OPEN : FIREWALL.UNKNOWN;
          c.requesting = true;
          c.request = await c.handshake.send({
            error: ERROR.NONE,
            firewall: c.firewall,
            holepunch: null,
            addresses4: addr ? [addr] : [],
            addresses6: [],
            udx: {
              reusableSocket: c.reusableSocket,
              id: c.rawStream.id,
              seq: 0
            },
            secretStream: {}
          });
          if (isDone(c))
            return;
        }
        const { serverAddress, clientAddress, relayed, noise } = await c.dht._router.peerHandshake(c.target, { noise: c.request, socket }, address);
        if (isDone(c) || c.connect)
          return;
        const payload = await c.handshake.recv(noise);
        if (isDone(c) || !payload)
          return;
        if (payload.version !== 1) {
          c.encryptedSocket.destroy(new Error("Server is using an incompatible version"));
          return;
        }
        if (payload.error !== ERROR.NONE) {
          c.encryptedSocket.destroy(new Error("Server returned an error"));
          return;
        }
        if (!payload.udx) {
          c.encryptedSocket.destroy(new Error("Server did not send UDX data"));
          return;
        }
        const hs = c.handshake.final();
        c.handshake = null;
        c.request = null;
        c.requesting = false;
        c.connect = {
          relayed,
          relayAddress: address,
          clientAddress,
          serverAddress,
          payload
        };
        c.payload = new SecurePayload(hs.holepunchSecret);
        c.onsocket = function(socket2, port, host) {
          const rawStream = c.dht._debugStream !== null ? new DebuggingStream(c.rawStream, c.dht._debugStream) : c.rawStream;
          c.rawStream.connect(socket2, c.connect.payload.udx.id, port, host);
          c.encryptedSocket.start(rawStream, { handshake: hs });
          if (c.reusableSocket && payload.udx.reusableSocket) {
            c.dht._socketPool.routes.add(c.remotePublicKey, c.rawStream);
          }
          if (c.puncher) {
            c.puncher.onabort = noop;
            c.puncher.destroy();
          }
          if (c.passiveConnectTimeout) {
            clearPassiveConnectTimeout(c);
          }
          c.rawStream = null;
        };
        if (c.serverSocket) {
          c.onsocket(c.serverSocket, c.serverAddress.port, c.serverAddress.host);
          return;
        }
        if (!relayed) {
          c.onsocket(socket || c.dht.socket, address.port, address.host);
        }
      }
      async function updateHolepunch(c, peerAddress, relayAddr, payload) {
        const holepunch2 = await c.dht._router.peerHolepunch(c.target, {
          id: c.connect.payload.holepunch.id,
          payload: c.payload.encrypt(payload),
          peerAddress,
          socket: c.puncher.socket
        }, relayAddr);
        if (isDone(c))
          return null;
        const remotePayload = c.payload.decrypt(holepunch2.payload);
        if (!remotePayload) {
          throw new Error("Invalid holepunch payload");
        }
        const { error, firewall, punching, addresses, remoteToken } = remotePayload;
        if (error !== ERROR.NONE) {
          throw new Error("Remote aborted with error code " + error);
        }
        const echoed = !!(remoteToken && payload.token && b4a.equals(remoteToken, payload.token));
        c.puncher.updateRemote({ punching, firewall, addresses, verified: echoed ? peerAddress.host : null });
        return {
          ...holepunch2,
          payload: remotePayload
        };
      }
      async function probeRound(c, serverAddress, serverRelay, retry) {
        if (serverAddress)
          await c.puncher.openSession(serverAddress);
        if (isDone(c))
          return null;
        const reply = await updateHolepunch(c, serverRelay.peerAddress, serverRelay.relayAddress, {
          error: ERROR.NONE,
          firewall: c.puncher.nat.firewall,
          round: c.round++,
          connected: false,
          punching: false,
          addresses: c.puncher.nat.addresses,
          remoteAddress: serverAddress,
          token: null,
          remoteToken: null
        });
        if (isDone(c))
          return null;
        const { peerAddress } = reply;
        const { address, token } = reply.payload;
        c.puncher.nat.add(reply.to, reply.from);
        if (c.puncher.remoteFirewall < FIREWALL.RANDOM && address && address.host && address.port && diffAddress(address, serverAddress)) {
          await c.puncher.openSession(address);
          if (isDone(c))
            return null;
        }
        if (c.puncher.remoteFirewall === FIREWALL.UNKNOWN) {
          await c.sleeper.pause(1e3);
          if (isDone(c))
            return null;
        }
        let stable = await c.puncher.analyze(false);
        if (isDone(c))
          return null;
        if (!stable) {
          stable = await c.puncher.analyze(true);
          if (isDone(c))
            return null;
          if (stable)
            return probeRound(c, serverAddress, serverRelay, false);
        }
        if ((c.puncher.remoteFirewall === FIREWALL.UNKNOWN || !token) && retry) {
          return probeRound(c, serverAddress, serverRelay, false);
        }
        if (c.puncher.remoteFirewall === FIREWALL.UNKNOWN || c.puncher.nat.firewall === FIREWALL.UNKNOWN) {
          await abort(c, serverRelay, new Error("Holepunching probe did not finish in time"));
          return null;
        }
        if (c.puncher.remoteFirewall >= FIREWALL.RANDOM && c.puncher.nat.firewall >= FIREWALL.RANDOM) {
          await abort(c, serverRelay, new Error("Both remote and local NATs are randomized"));
          return null;
        }
        return { token, peerAddress };
      }
      async function roundPunch(c, serverAddress, remoteToken, clientRelay) {
        c.puncher.nat.freeze();
        await updateHolepunch(c, serverAddress, clientRelay, {
          error: ERROR.NONE,
          firewall: c.puncher.nat.firewall,
          round: c.round++,
          connected: false,
          punching: true,
          addresses: c.puncher.nat.addresses,
          remoteAddress: null,
          token: c.payload.token(serverAddress),
          remoteToken
        });
        if (!c.puncher.remoteHolepunching) {
          throw new Error("Remote is not holepunching");
        }
        if (!await c.puncher.punch()) {
          throw new Error("Remote is not holepunchable");
        }
      }
      async function abort(c, { peerAddress, relayAddress }, err) {
        try {
          await updateHolepunch(peerAddress, relayAddress, {
            error: ERROR.ABORTED,
            firewall: FIREWALL.UNKNOWN,
            round: c.round++,
            connected: false,
            punching: false,
            addresses: null,
            remoteAddress: null,
            token: null,
            remoteToken: null
          });
        } catch {
        }
        c.encryptedSocket.destroy(err);
      }
      function clearPassiveConnectTimeout(c) {
        clearTimeout(c.passiveConnectTimeout);
        c.passiveConnectTimeout = null;
      }
      function pickServerRelay(relays, clientRelay) {
        for (const r of relays) {
          if (!diffAddress(r.relayAddress, clientRelay))
            return r;
        }
        return relays[0];
      }
      function diffAddress(a, b) {
        return a.host !== b.host || a.port !== b.port;
      }
      function defaultCreateHandshake(keyPair, remotePublicKey) {
        return new NoiseWrap(keyPair, remotePublicKey);
      }
      function defaultCreateSecretStream(isInitiator, rawStream, opts) {
        return new NoiseSecretStream(isInitiator, rawStream, opts);
      }
      function noop() {
      }
    }
  });

  // node_modules/@hyperswarm/dht/lib/raw-stream-set.js
  var require_raw_stream_set = __commonJS({
    "node_modules/@hyperswarm/dht/lib/raw-stream-set.js"(exports, module) {
      module.exports = class RawStreamSet {
        constructor(dht) {
          this._dht = dht;
          this._streams = /* @__PURE__ */ new Map();
        }
        add(opts) {
          const self = this;
          let id;
          while (true) {
            id = Math.random() * 4294967296 >>> 0;
            if (this._streams.has(id))
              continue;
            break;
          }
          const stream = this._dht._udx.createStream(id, opts);
          this._streams.set(id, stream);
          stream.on("close", onclose);
          return stream;
          function onclose() {
            self._streams.delete(id);
          }
        }
      };
    }
  });

  // node_modules/@hyperswarm/dht/index.js
  var require_dht = __commonJS({
    "node_modules/@hyperswarm/dht/index.js"(exports, module) {
      var DHT2 = require_dht_rpc();
      var sodium = require_sodium_universal();
      var UDX = require_udx();
      var c = require_compact_encoding();
      var b4a = require_b4a();
      var m = require_messages();
      var SocketPool = require_socket_pool();
      var Persistent = require_persistent();
      var Router = require_router();
      var Server = require_server();
      var connect = require_connect();
      var { FIREWALL, BOOTSTRAP_NODES, COMMANDS } = require_constants();
      var { hash, createKeyPair } = require_crypto();
      var RawStreamSet = require_raw_stream_set();
      var maxSize = 65536;
      var maxAge = 20 * 60 * 1e3;
      var HyperDHT = class extends DHT2 {
        constructor(opts = {}) {
          const udx = new UDX();
          const port = opts.port || 49737;
          const bootstrap = opts.bootstrap || BOOTSTRAP_NODES;
          super({ ...opts, udx, port, bootstrap, addNode });
          const cacheOpts = {
            maxSize: opts.maxSize || maxSize,
            maxAge: opts.maxAge || maxAge
          };
          this.defaultKeyPair = opts.keyPair || createKeyPair(opts.seed);
          this.listening = /* @__PURE__ */ new Set();
          this._udx = udx;
          this._router = new Router(this, cacheOpts);
          this._socketPool = new SocketPool(this);
          this._rawStreams = new RawStreamSet(this);
          this._persistent = null;
          this._debugStream = opts.debug && opts.debug.stream || null;
          this._debugHandshakeLatency = toRange(opts.debug && opts.debug.handshake && opts.debug.handshake.latency || 0);
          this.once("persistent", () => {
            this._persistent = new Persistent(this, cacheOpts);
          });
          this.on("network-change", () => {
            for (const server of this.listening)
              server.refresh();
          });
        }
        connect(remotePublicKey, opts) {
          return connect(this, remotePublicKey, opts);
        }
        createServer(opts, onconnection) {
          if (typeof opts === "function")
            return this.createServer({}, opts);
          if (opts && opts.onconnection)
            onconnection = opts.onconnection;
          const s = new Server(this, opts);
          if (onconnection)
            s.on("connection", onconnection);
          return s;
        }
        async destroy({ force } = {}) {
          if (!force) {
            const closing = [];
            for (const server of this.listening)
              closing.push(server.close());
            await Promise.allSettled(closing);
          }
          await this._socketPool.destroy();
          await super.destroy();
        }
        findPeer(publicKey, opts = {}) {
          const target2 = opts.hash === false ? publicKey : hash(publicKey);
          opts = { ...opts, map: mapFindPeer };
          return this.query({ target: target2, command: COMMANDS.FIND_PEER, value: null }, opts);
        }
        lookup(target2, opts = {}) {
          opts = { ...opts, map: mapLookup };
          return this.query({ target: target2, command: COMMANDS.LOOKUP, value: null }, opts);
        }
        lookupAndUnannounce(target2, keyPair, opts = {}) {
          const unannounces = [];
          const dht = this;
          const userCommit = opts.commit || noop;
          const signUnannounce = opts.signUnannounce || Persistent.signUnannounce;
          if (this._persistent !== null) {
            this._persistent.unannounce(target2, keyPair.publicKey);
          }
          opts = { ...opts, map, commit };
          return this.query({ target: target2, command: COMMANDS.LOOKUP, value: null }, opts);
          async function commit(reply, dht2, query) {
            await Promise.all(unannounces);
            return userCommit(reply, dht2, query);
          }
          function map(reply) {
            const data = mapLookup(reply);
            if (!data || !data.token)
              return data;
            let found = data.peers.length >= 20;
            for (let i = 0; !found && i < data.peers.length; i++) {
              found = b4a.equals(data.peers[i].publicKey, keyPair.publicKey);
            }
            if (!found)
              return data;
            unannounces.push(
              dht._requestUnannounce(
                keyPair,
                dht,
                target2,
                data.token,
                data.from,
                signUnannounce
              ).catch(noop)
            );
            return data;
          }
        }
        unannounce(target2, keyPair, opts = {}) {
          return this.lookupAndUnannounce(target2, keyPair, opts).finished();
        }
        announce(target2, keyPair, relayAddresses, opts = {}) {
          const signAnnounce = opts.signAnnounce || Persistent.signAnnounce;
          opts = { ...opts, commit };
          return opts.clear ? this.lookupAndUnannounce(target2, keyPair, opts) : this.lookup(target2, opts);
          function commit(reply, dht) {
            return dht._requestAnnounce(
              keyPair,
              dht,
              target2,
              reply.token,
              reply.from,
              relayAddresses,
              signAnnounce
            );
          }
        }
        async immutableGet(target2, opts = {}) {
          opts = { ...opts, map: mapImmutable };
          const query = this.query({ target: target2, command: COMMANDS.IMMUTABLE_GET, value: null }, opts);
          const check = b4a.allocUnsafe(32);
          for await (const node of query) {
            const { value } = node;
            sodium.crypto_generichash(check, value);
            if (b4a.equals(check, target2))
              return node;
          }
          return null;
        }
        async immutablePut(value, opts = {}) {
          const target2 = b4a.allocUnsafe(32);
          sodium.crypto_generichash(target2, value);
          opts = {
            ...opts,
            map: mapImmutable,
            commit(reply, dht) {
              return dht.request({ token: reply.token, target: target2, command: COMMANDS.IMMUTABLE_PUT, value }, reply.from);
            }
          };
          const query = this.query({ target: target2, command: COMMANDS.IMMUTABLE_GET, value: null }, opts);
          await query.finished();
          return { hash: target2, closestNodes: query.closestNodes };
        }
        async mutableGet(publicKey, opts = {}) {
          let refresh = opts.refresh || null;
          let signed = null;
          let result = null;
          opts = { ...opts, map: mapMutable, commit: refresh ? commit : null };
          const target2 = b4a.allocUnsafe(32);
          sodium.crypto_generichash(target2, publicKey);
          const userSeq = opts.seq || 0;
          const query = this.query({ target: target2, command: COMMANDS.MUTABLE_GET, value: c.encode(c.uint, userSeq) }, opts);
          const latest = opts.latest !== false;
          for await (const node of query) {
            if (result && node.seq <= result.seq)
              continue;
            if (node.seq < userSeq || !Persistent.verifyMutable(node.signature, node.seq, node.value, publicKey))
              continue;
            if (!latest)
              return node;
            if (!result || node.seq > result.seq)
              result = node;
          }
          return result;
          function commit(reply, dht) {
            if (!signed && result && refresh) {
              if (refresh(result)) {
                signed = c.encode(m.mutablePutRequest, {
                  publicKey,
                  seq: result.seq,
                  value: result.value,
                  signature: result.signature
                });
              } else {
                refresh = null;
              }
            }
            return signed ? dht.request({ token: reply.token, target: target2, command: COMMANDS.MUTABLE_PUT, value: signed }, reply.from) : Promise.resolve(null);
          }
        }
        async mutablePut(keyPair, value, opts = {}) {
          const signMutable = opts.signMutable || Persistent.signMutable;
          const target2 = b4a.allocUnsafe(32);
          sodium.crypto_generichash(target2, keyPair.publicKey);
          const seq = opts.seq || 0;
          const signature = await signMutable(seq, value, keyPair.secretKey);
          const signed = c.encode(m.mutablePutRequest, {
            publicKey: keyPair.publicKey,
            seq,
            value,
            signature
          });
          opts = {
            ...opts,
            map: mapMutable,
            commit(reply, dht) {
              return dht.request({ token: reply.token, target: target2, command: COMMANDS.MUTABLE_PUT, value: signed }, reply.from);
            }
          };
          const query = this.query({ target: target2, command: COMMANDS.MUTABLE_GET, value: c.encode(c.uint, 0) }, opts);
          await query.finished();
          return { publicKey: keyPair.publicKey, closestNodes: query.closestNodes, seq, signature };
        }
        onrequest(req) {
          switch (req.command) {
            case COMMANDS.PEER_HANDSHAKE: {
              this._router.onpeerhandshake(req);
              return true;
            }
            case COMMANDS.PEER_HOLEPUNCH: {
              this._router.onpeerholepunch(req);
              return true;
            }
          }
          if (this._persistent === null)
            return false;
          switch (req.command) {
            case COMMANDS.FIND_PEER: {
              this._persistent.onfindpeer(req);
              return true;
            }
            case COMMANDS.LOOKUP: {
              this._persistent.onlookup(req);
              return true;
            }
            case COMMANDS.ANNOUNCE: {
              this._persistent.onannounce(req);
              return true;
            }
            case COMMANDS.UNANNOUNCE: {
              this._persistent.onunannounce(req);
              return true;
            }
            case COMMANDS.MUTABLE_PUT: {
              this._persistent.onmutableput(req);
              return true;
            }
            case COMMANDS.MUTABLE_GET: {
              this._persistent.onmutableget(req);
              return true;
            }
            case COMMANDS.IMMUTABLE_PUT: {
              this._persistent.onimmutableput(req);
              return true;
            }
            case COMMANDS.IMMUTABLE_GET: {
              this._persistent.onimmutableget(req);
              return true;
            }
          }
          return false;
        }
        static keyPair(seed) {
          return createKeyPair(seed);
        }
        static hash(data) {
          return hash(data);
        }
        static connectRawStream(encryptedStream, rawStream, remoteId) {
          const stream = encryptedStream.rawStream;
          if (!stream.connected)
            throw new Error("Encrypted stream is not connected");
          rawStream.connect(
            stream.socket,
            remoteId,
            stream.remotePort,
            stream.remoteHost
          );
        }
        localAddress() {
          return {
            host: localIP(this._udx),
            port: this.io.serverSocket.address().port
          };
        }
        createRawStream(opts) {
          return this._rawStreams.add(opts);
        }
        remoteAddress() {
          if (!this.host)
            return null;
          if (!this.port)
            return null;
          if (this.firewalled)
            return null;
          const port = this.io.serverSocket.address().port;
          if (port !== this.port)
            return null;
          return {
            host: this.host,
            port
          };
        }
        async _requestAnnounce(keyPair, dht, target2, token, from, relayAddresses, sign) {
          const ann = {
            peer: {
              publicKey: keyPair.publicKey,
              relayAddresses: relayAddresses || []
            },
            refresh: null,
            signature: null
          };
          ann.signature = await sign(target2, token, from.id, ann, keyPair.secretKey);
          const value = c.encode(m.announce, ann);
          return dht.request({
            token,
            target: target2,
            command: COMMANDS.ANNOUNCE,
            value
          }, from);
        }
        async _requestUnannounce(keyPair, dht, target2, token, from, sign) {
          const unann = {
            peer: {
              publicKey: keyPair.publicKey,
              relayAddresses: []
            },
            signature: null
          };
          unann.signature = await sign(target2, token, from.id, unann, keyPair.secretKey);
          const value = c.encode(m.announce, unann);
          return dht.request({
            token,
            target: target2,
            command: COMMANDS.UNANNOUNCE,
            value
          }, from);
        }
      };
      HyperDHT.BOOTSTRAP = BOOTSTRAP_NODES;
      HyperDHT.FIREWALL = FIREWALL;
      module.exports = HyperDHT;
      function mapLookup(node) {
        if (!node.value)
          return null;
        try {
          return {
            token: node.token,
            from: node.from,
            to: node.to,
            peers: c.decode(m.peers, node.value)
          };
        } catch {
          return null;
        }
      }
      function mapFindPeer(node) {
        if (!node.value)
          return null;
        try {
          return {
            token: node.token,
            from: node.from,
            to: node.to,
            peer: c.decode(m.peer, node.value)
          };
        } catch {
          return null;
        }
      }
      function mapImmutable(node) {
        if (!node.value)
          return null;
        return {
          token: node.token,
          from: node.from,
          to: node.to,
          value: node.value
        };
      }
      function mapMutable(node) {
        if (!node.value)
          return null;
        try {
          const { seq, value, signature } = c.decode(m.mutableGetResponse, node.value);
          return {
            token: node.token,
            from: node.from,
            to: node.to,
            seq,
            value,
            signature
          };
        } catch {
          return null;
        }
      }
      function noop() {
      }
      function toRange(n) {
        if (!n)
          return null;
        return typeof n === "number" ? [n, n] : n;
      }
      function localIP(udx) {
        for (const n of udx.networkInterfaces()) {
          if (n.family === 4 && !n.internal)
            return n.host;
        }
        return "127.0.0.1";
      }
      function addNode(node) {
        return !(node.port === 49738 && (node.host === "134.209.28.98" || node.host === "167.99.142.185"));
      }
    }
  });

  // node_modules/@lumeweb/dht-rpc-client/dist/rpcQuery.js
  var import_timers = __require("timers");

  // node_modules/msgpackr/unpack.js
  var decoder;
  try {
    decoder = new TextDecoder();
  } catch (error) {
  }
  var src;
  var srcEnd;
  var position = 0;
  var EMPTY_ARRAY = [];
  var strings = EMPTY_ARRAY;
  var stringPosition = 0;
  var currentUnpackr = {};
  var currentStructures;
  var srcString;
  var srcStringStart = 0;
  var srcStringEnd = 0;
  var bundledStrings;
  var referenceMap;
  var currentExtensions = [];
  var dataView;
  var defaultOptions = {
    useRecords: false,
    mapsAsObjects: true
  };
  var C1Type = class {
  };
  var C1 = new C1Type();
  C1.name = "MessagePack 0xC1";
  var sequentialMode = false;
  var inlineObjectReadThreshold = 2;
  try {
    new Function("");
  } catch (error) {
    inlineObjectReadThreshold = Infinity;
  }
  var Unpackr = class {
    constructor(options) {
      if (options) {
        if (options.useRecords === false && options.mapsAsObjects === void 0)
          options.mapsAsObjects = true;
        if (options.sequential && options.trusted !== false) {
          options.trusted = true;
          if (!options.structures && options.useRecords != false) {
            options.structures = [];
            if (!options.maxSharedStructures)
              options.maxSharedStructures = 0;
          }
        }
        if (options.structures)
          options.structures.sharedLength = options.structures.length;
        else if (options.getStructures) {
          (options.structures = []).uninitialized = true;
          options.structures.sharedLength = 0;
        }
      }
      Object.assign(this, options);
    }
    unpack(source, end) {
      if (src) {
        return saveState(() => {
          clearSource();
          return this ? this.unpack(source, end) : Unpackr.prototype.unpack.call(defaultOptions, source, end);
        });
      }
      srcEnd = end > -1 ? end : source.length;
      position = 0;
      stringPosition = 0;
      srcStringEnd = 0;
      srcString = null;
      strings = EMPTY_ARRAY;
      bundledStrings = null;
      src = source;
      try {
        dataView = source.dataView || (source.dataView = new DataView(source.buffer, source.byteOffset, source.byteLength));
      } catch (error) {
        src = null;
        if (source instanceof Uint8Array)
          throw error;
        throw new Error("Source must be a Uint8Array or Buffer but was a " + (source && typeof source == "object" ? source.constructor.name : typeof source));
      }
      if (this instanceof Unpackr) {
        currentUnpackr = this;
        if (this.structures) {
          currentStructures = this.structures;
          return checkedRead();
        } else if (!currentStructures || currentStructures.length > 0) {
          currentStructures = [];
        }
      } else {
        currentUnpackr = defaultOptions;
        if (!currentStructures || currentStructures.length > 0)
          currentStructures = [];
      }
      return checkedRead();
    }
    unpackMultiple(source, forEach) {
      let values, lastPosition = 0;
      try {
        sequentialMode = true;
        let size = source.length;
        let value = this ? this.unpack(source, size) : defaultUnpackr.unpack(source, size);
        if (forEach) {
          forEach(value);
          while (position < size) {
            lastPosition = position;
            if (forEach(checkedRead()) === false) {
              return;
            }
          }
        } else {
          values = [value];
          while (position < size) {
            lastPosition = position;
            values.push(checkedRead());
          }
          return values;
        }
      } catch (error) {
        error.lastPosition = lastPosition;
        error.values = values;
        throw error;
      } finally {
        sequentialMode = false;
        clearSource();
      }
    }
    _mergeStructures(loadedStructures, existingStructures) {
      loadedStructures = loadedStructures || [];
      for (let i = 0, l = loadedStructures.length; i < l; i++) {
        let structure = loadedStructures[i];
        if (structure) {
          structure.isShared = true;
          if (i >= 32)
            structure.highByte = i - 32 >> 5;
        }
      }
      loadedStructures.sharedLength = loadedStructures.length;
      for (let id in existingStructures || []) {
        if (id >= 0) {
          let structure = loadedStructures[id];
          let existing = existingStructures[id];
          if (existing) {
            if (structure)
              (loadedStructures.restoreStructures || (loadedStructures.restoreStructures = []))[id] = structure;
            loadedStructures[id] = existing;
          }
        }
      }
      return this.structures = loadedStructures;
    }
    decode(source, end) {
      return this.unpack(source, end);
    }
  };
  function checkedRead() {
    try {
      if (!currentUnpackr.trusted && !sequentialMode) {
        let sharedLength = currentStructures.sharedLength || 0;
        if (sharedLength < currentStructures.length)
          currentStructures.length = sharedLength;
      }
      let result = read();
      if (bundledStrings)
        position = bundledStrings.postBundlePosition;
      if (position == srcEnd) {
        if (currentStructures.restoreStructures)
          restoreStructures();
        currentStructures = null;
        src = null;
        if (referenceMap)
          referenceMap = null;
      } else if (position > srcEnd) {
        throw new Error("Unexpected end of MessagePack data");
      } else if (!sequentialMode) {
        throw new Error("Data read, but end of buffer not reached " + JSON.stringify(result).slice(0, 100));
      }
      return result;
    } catch (error) {
      if (currentStructures.restoreStructures)
        restoreStructures();
      clearSource();
      if (error instanceof RangeError || error.message.startsWith("Unexpected end of buffer") || position > srcEnd) {
        error.incomplete = true;
      }
      throw error;
    }
  }
  function restoreStructures() {
    for (let id in currentStructures.restoreStructures) {
      currentStructures[id] = currentStructures.restoreStructures[id];
    }
    currentStructures.restoreStructures = null;
  }
  function read() {
    let token = src[position++];
    if (token < 160) {
      if (token < 128) {
        if (token < 64)
          return token;
        else {
          let structure = currentStructures[token & 63] || currentUnpackr.getStructures && loadStructures()[token & 63];
          if (structure) {
            if (!structure.read) {
              structure.read = createStructureReader(structure, token & 63);
            }
            return structure.read();
          } else
            return token;
        }
      } else if (token < 144) {
        token -= 128;
        if (currentUnpackr.mapsAsObjects) {
          let object = {};
          for (let i = 0; i < token; i++) {
            object[readKey()] = read();
          }
          return object;
        } else {
          let map = /* @__PURE__ */ new Map();
          for (let i = 0; i < token; i++) {
            map.set(read(), read());
          }
          return map;
        }
      } else {
        token -= 144;
        let array = new Array(token);
        for (let i = 0; i < token; i++) {
          array[i] = read();
        }
        return array;
      }
    } else if (token < 192) {
      let length = token - 160;
      if (srcStringEnd >= position) {
        return srcString.slice(position - srcStringStart, (position += length) - srcStringStart);
      }
      if (srcStringEnd == 0 && srcEnd < 140) {
        let string = length < 16 ? shortStringInJS(length) : longStringInJS(length);
        if (string != null)
          return string;
      }
      return readFixedString(length);
    } else {
      let value;
      switch (token) {
        case 192:
          return null;
        case 193:
          if (bundledStrings) {
            value = read();
            if (value > 0)
              return bundledStrings[1].slice(bundledStrings.position1, bundledStrings.position1 += value);
            else
              return bundledStrings[0].slice(bundledStrings.position0, bundledStrings.position0 -= value);
          }
          return C1;
        case 194:
          return false;
        case 195:
          return true;
        case 196:
          value = src[position++];
          if (value === void 0)
            throw new Error("Unexpected end of buffer");
          return readBin(value);
        case 197:
          value = dataView.getUint16(position);
          position += 2;
          return readBin(value);
        case 198:
          value = dataView.getUint32(position);
          position += 4;
          return readBin(value);
        case 199:
          return readExt(src[position++]);
        case 200:
          value = dataView.getUint16(position);
          position += 2;
          return readExt(value);
        case 201:
          value = dataView.getUint32(position);
          position += 4;
          return readExt(value);
        case 202:
          value = dataView.getFloat32(position);
          if (currentUnpackr.useFloat32 > 2) {
            let multiplier = mult10[(src[position] & 127) << 1 | src[position + 1] >> 7];
            position += 4;
            return (multiplier * value + (value > 0 ? 0.5 : -0.5) >> 0) / multiplier;
          }
          position += 4;
          return value;
        case 203:
          value = dataView.getFloat64(position);
          position += 8;
          return value;
        case 204:
          return src[position++];
        case 205:
          value = dataView.getUint16(position);
          position += 2;
          return value;
        case 206:
          value = dataView.getUint32(position);
          position += 4;
          return value;
        case 207:
          if (currentUnpackr.int64AsNumber) {
            value = dataView.getUint32(position) * 4294967296;
            value += dataView.getUint32(position + 4);
          } else
            value = dataView.getBigUint64(position);
          position += 8;
          return value;
        case 208:
          return dataView.getInt8(position++);
        case 209:
          value = dataView.getInt16(position);
          position += 2;
          return value;
        case 210:
          value = dataView.getInt32(position);
          position += 4;
          return value;
        case 211:
          if (currentUnpackr.int64AsNumber) {
            value = dataView.getInt32(position) * 4294967296;
            value += dataView.getUint32(position + 4);
          } else
            value = dataView.getBigInt64(position);
          position += 8;
          return value;
        case 212:
          value = src[position++];
          if (value == 114) {
            return recordDefinition(src[position++] & 63);
          } else {
            let extension = currentExtensions[value];
            if (extension) {
              if (extension.read) {
                position++;
                return extension.read(read());
              } else if (extension.noBuffer) {
                position++;
                return extension();
              } else
                return extension(src.subarray(position, ++position));
            } else
              throw new Error("Unknown extension " + value);
          }
        case 213:
          value = src[position];
          if (value == 114) {
            position++;
            return recordDefinition(src[position++] & 63, src[position++]);
          } else
            return readExt(2);
        case 214:
          return readExt(4);
        case 215:
          return readExt(8);
        case 216:
          return readExt(16);
        case 217:
          value = src[position++];
          if (srcStringEnd >= position) {
            return srcString.slice(position - srcStringStart, (position += value) - srcStringStart);
          }
          return readString8(value);
        case 218:
          value = dataView.getUint16(position);
          position += 2;
          if (srcStringEnd >= position) {
            return srcString.slice(position - srcStringStart, (position += value) - srcStringStart);
          }
          return readString16(value);
        case 219:
          value = dataView.getUint32(position);
          position += 4;
          if (srcStringEnd >= position) {
            return srcString.slice(position - srcStringStart, (position += value) - srcStringStart);
          }
          return readString32(value);
        case 220:
          value = dataView.getUint16(position);
          position += 2;
          return readArray(value);
        case 221:
          value = dataView.getUint32(position);
          position += 4;
          return readArray(value);
        case 222:
          value = dataView.getUint16(position);
          position += 2;
          return readMap(value);
        case 223:
          value = dataView.getUint32(position);
          position += 4;
          return readMap(value);
        default:
          if (token >= 224)
            return token - 256;
          if (token === void 0) {
            let error = new Error("Unexpected end of MessagePack data");
            error.incomplete = true;
            throw error;
          }
          throw new Error("Unknown MessagePack token " + token);
      }
    }
  }
  var validName = /^[a-zA-Z_$][a-zA-Z\d_$]*$/;
  function createStructureReader(structure, firstId) {
    function readObject() {
      if (readObject.count++ > inlineObjectReadThreshold) {
        let readObject2 = structure.read = new Function("r", "return function(){return {" + structure.map((key) => validName.test(key) ? key + ":r()" : "[" + JSON.stringify(key) + "]:r()").join(",") + "}}")(read);
        if (structure.highByte === 0)
          structure.read = createSecondByteReader(firstId, structure.read);
        return readObject2();
      }
      let object = {};
      for (let i = 0, l = structure.length; i < l; i++) {
        let key = structure[i];
        object[key] = read();
      }
      return object;
    }
    readObject.count = 0;
    if (structure.highByte === 0) {
      return createSecondByteReader(firstId, readObject);
    }
    return readObject;
  }
  var createSecondByteReader = (firstId, read0) => {
    return function() {
      let highByte = src[position++];
      if (highByte === 0)
        return read0();
      let id = firstId < 32 ? -(firstId + (highByte << 5)) : firstId + (highByte << 5);
      let structure = currentStructures[id] || loadStructures()[id];
      if (!structure) {
        throw new Error("Record id is not defined for " + id);
      }
      if (!structure.read)
        structure.read = createStructureReader(structure, firstId);
      return structure.read();
    };
  };
  function loadStructures() {
    let loadedStructures = saveState(() => {
      src = null;
      return currentUnpackr.getStructures();
    });
    return currentStructures = currentUnpackr._mergeStructures(loadedStructures, currentStructures);
  }
  var readFixedString = readStringJS;
  var readString8 = readStringJS;
  var readString16 = readStringJS;
  var readString32 = readStringJS;
  var isNativeAccelerationEnabled = false;
  function setExtractor(extractStrings) {
    isNativeAccelerationEnabled = true;
    readFixedString = readString(1);
    readString8 = readString(2);
    readString16 = readString(3);
    readString32 = readString(5);
    function readString(headerLength) {
      return function readString2(length) {
        let string = strings[stringPosition++];
        if (string == null) {
          if (bundledStrings)
            return readStringJS(length);
          let extraction = extractStrings(position - headerLength, srcEnd, src);
          if (typeof extraction == "string") {
            string = extraction;
            strings = EMPTY_ARRAY;
          } else {
            strings = extraction;
            stringPosition = 1;
            srcStringEnd = 1;
            string = strings[0];
            if (string === void 0)
              throw new Error("Unexpected end of buffer");
          }
        }
        let srcStringLength = string.length;
        if (srcStringLength <= length) {
          position += length;
          return string;
        }
        srcString = string;
        srcStringStart = position;
        srcStringEnd = position + srcStringLength;
        position += length;
        return string.slice(0, length);
      };
    }
  }
  function readStringJS(length) {
    let result;
    if (length < 16) {
      if (result = shortStringInJS(length))
        return result;
    }
    if (length > 64 && decoder)
      return decoder.decode(src.subarray(position, position += length));
    const end = position + length;
    const units = [];
    result = "";
    while (position < end) {
      const byte1 = src[position++];
      if ((byte1 & 128) === 0) {
        units.push(byte1);
      } else if ((byte1 & 224) === 192) {
        const byte2 = src[position++] & 63;
        units.push((byte1 & 31) << 6 | byte2);
      } else if ((byte1 & 240) === 224) {
        const byte2 = src[position++] & 63;
        const byte3 = src[position++] & 63;
        units.push((byte1 & 31) << 12 | byte2 << 6 | byte3);
      } else if ((byte1 & 248) === 240) {
        const byte2 = src[position++] & 63;
        const byte3 = src[position++] & 63;
        const byte4 = src[position++] & 63;
        let unit = (byte1 & 7) << 18 | byte2 << 12 | byte3 << 6 | byte4;
        if (unit > 65535) {
          unit -= 65536;
          units.push(unit >>> 10 & 1023 | 55296);
          unit = 56320 | unit & 1023;
        }
        units.push(unit);
      } else {
        units.push(byte1);
      }
      if (units.length >= 4096) {
        result += fromCharCode.apply(String, units);
        units.length = 0;
      }
    }
    if (units.length > 0) {
      result += fromCharCode.apply(String, units);
    }
    return result;
  }
  function readArray(length) {
    let array = new Array(length);
    for (let i = 0; i < length; i++) {
      array[i] = read();
    }
    return array;
  }
  function readMap(length) {
    if (currentUnpackr.mapsAsObjects) {
      let object = {};
      for (let i = 0; i < length; i++) {
        object[readKey()] = read();
      }
      return object;
    } else {
      let map = /* @__PURE__ */ new Map();
      for (let i = 0; i < length; i++) {
        map.set(read(), read());
      }
      return map;
    }
  }
  var fromCharCode = String.fromCharCode;
  function longStringInJS(length) {
    let start = position;
    let bytes = new Array(length);
    for (let i = 0; i < length; i++) {
      const byte = src[position++];
      if ((byte & 128) > 0) {
        position = start;
        return;
      }
      bytes[i] = byte;
    }
    return fromCharCode.apply(String, bytes);
  }
  function shortStringInJS(length) {
    if (length < 4) {
      if (length < 2) {
        if (length === 0)
          return "";
        else {
          let a = src[position++];
          if ((a & 128) > 1) {
            position -= 1;
            return;
          }
          return fromCharCode(a);
        }
      } else {
        let a = src[position++];
        let b = src[position++];
        if ((a & 128) > 0 || (b & 128) > 0) {
          position -= 2;
          return;
        }
        if (length < 3)
          return fromCharCode(a, b);
        let c = src[position++];
        if ((c & 128) > 0) {
          position -= 3;
          return;
        }
        return fromCharCode(a, b, c);
      }
    } else {
      let a = src[position++];
      let b = src[position++];
      let c = src[position++];
      let d = src[position++];
      if ((a & 128) > 0 || (b & 128) > 0 || (c & 128) > 0 || (d & 128) > 0) {
        position -= 4;
        return;
      }
      if (length < 6) {
        if (length === 4)
          return fromCharCode(a, b, c, d);
        else {
          let e = src[position++];
          if ((e & 128) > 0) {
            position -= 5;
            return;
          }
          return fromCharCode(a, b, c, d, e);
        }
      } else if (length < 8) {
        let e = src[position++];
        let f = src[position++];
        if ((e & 128) > 0 || (f & 128) > 0) {
          position -= 6;
          return;
        }
        if (length < 7)
          return fromCharCode(a, b, c, d, e, f);
        let g = src[position++];
        if ((g & 128) > 0) {
          position -= 7;
          return;
        }
        return fromCharCode(a, b, c, d, e, f, g);
      } else {
        let e = src[position++];
        let f = src[position++];
        let g = src[position++];
        let h = src[position++];
        if ((e & 128) > 0 || (f & 128) > 0 || (g & 128) > 0 || (h & 128) > 0) {
          position -= 8;
          return;
        }
        if (length < 10) {
          if (length === 8)
            return fromCharCode(a, b, c, d, e, f, g, h);
          else {
            let i = src[position++];
            if ((i & 128) > 0) {
              position -= 9;
              return;
            }
            return fromCharCode(a, b, c, d, e, f, g, h, i);
          }
        } else if (length < 12) {
          let i = src[position++];
          let j = src[position++];
          if ((i & 128) > 0 || (j & 128) > 0) {
            position -= 10;
            return;
          }
          if (length < 11)
            return fromCharCode(a, b, c, d, e, f, g, h, i, j);
          let k = src[position++];
          if ((k & 128) > 0) {
            position -= 11;
            return;
          }
          return fromCharCode(a, b, c, d, e, f, g, h, i, j, k);
        } else {
          let i = src[position++];
          let j = src[position++];
          let k = src[position++];
          let l = src[position++];
          if ((i & 128) > 0 || (j & 128) > 0 || (k & 128) > 0 || (l & 128) > 0) {
            position -= 12;
            return;
          }
          if (length < 14) {
            if (length === 12)
              return fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l);
            else {
              let m = src[position++];
              if ((m & 128) > 0) {
                position -= 13;
                return;
              }
              return fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l, m);
            }
          } else {
            let m = src[position++];
            let n = src[position++];
            if ((m & 128) > 0 || (n & 128) > 0) {
              position -= 14;
              return;
            }
            if (length < 15)
              return fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l, m, n);
            let o = src[position++];
            if ((o & 128) > 0) {
              position -= 15;
              return;
            }
            return fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o);
          }
        }
      }
    }
  }
  function readOnlyJSString() {
    let token = src[position++];
    let length;
    if (token < 192) {
      length = token - 160;
    } else {
      switch (token) {
        case 217:
          length = src[position++];
          break;
        case 218:
          length = dataView.getUint16(position);
          position += 2;
          break;
        case 219:
          length = dataView.getUint32(position);
          position += 4;
          break;
        default:
          throw new Error("Expected string");
      }
    }
    return readStringJS(length);
  }
  function readBin(length) {
    return currentUnpackr.copyBuffers ? Uint8Array.prototype.slice.call(src, position, position += length) : src.subarray(position, position += length);
  }
  function readExt(length) {
    let type = src[position++];
    if (currentExtensions[type]) {
      return currentExtensions[type](src.subarray(position, position += length));
    } else
      throw new Error("Unknown extension type " + type);
  }
  var keyCache = new Array(4096);
  function readKey() {
    let length = src[position++];
    if (length >= 160 && length < 192) {
      length = length - 160;
      if (srcStringEnd >= position)
        return srcString.slice(position - srcStringStart, (position += length) - srcStringStart);
      else if (!(srcStringEnd == 0 && srcEnd < 180))
        return readFixedString(length);
    } else {
      position--;
      return read();
    }
    let key = (length << 5 ^ (length > 1 ? dataView.getUint16(position) : length > 0 ? src[position] : 0)) & 4095;
    let entry = keyCache[key];
    let checkPosition = position;
    let end = position + length - 3;
    let chunk;
    let i = 0;
    if (entry && entry.bytes == length) {
      while (checkPosition < end) {
        chunk = dataView.getUint32(checkPosition);
        if (chunk != entry[i++]) {
          checkPosition = 1879048192;
          break;
        }
        checkPosition += 4;
      }
      end += 3;
      while (checkPosition < end) {
        chunk = src[checkPosition++];
        if (chunk != entry[i++]) {
          checkPosition = 1879048192;
          break;
        }
      }
      if (checkPosition === end) {
        position = checkPosition;
        return entry.string;
      }
      end -= 3;
      checkPosition = position;
    }
    entry = [];
    keyCache[key] = entry;
    entry.bytes = length;
    while (checkPosition < end) {
      chunk = dataView.getUint32(checkPosition);
      entry.push(chunk);
      checkPosition += 4;
    }
    end += 3;
    while (checkPosition < end) {
      chunk = src[checkPosition++];
      entry.push(chunk);
    }
    let string = length < 16 ? shortStringInJS(length) : longStringInJS(length);
    if (string != null)
      return entry.string = string;
    return entry.string = readFixedString(length);
  }
  var recordDefinition = (id, highByte) => {
    var structure = read();
    let firstByte = id;
    if (highByte !== void 0) {
      id = id < 32 ? -((highByte << 5) + id) : (highByte << 5) + id;
      structure.highByte = highByte;
    }
    let existingStructure = currentStructures[id];
    if (existingStructure && existingStructure.isShared) {
      (currentStructures.restoreStructures || (currentStructures.restoreStructures = []))[id] = existingStructure;
    }
    currentStructures[id] = structure;
    structure.read = createStructureReader(structure, firstByte);
    return structure.read();
  };
  currentExtensions[0] = () => {
  };
  currentExtensions[0].noBuffer = true;
  currentExtensions[101] = () => {
    let data = read();
    return (globalThis[data[0]] || Error)(data[1]);
  };
  currentExtensions[105] = (data) => {
    let id = dataView.getUint32(position - 4);
    if (!referenceMap)
      referenceMap = /* @__PURE__ */ new Map();
    let token = src[position];
    let target2;
    if (token >= 144 && token < 160 || token == 220 || token == 221)
      target2 = [];
    else
      target2 = {};
    let refEntry = { target: target2 };
    referenceMap.set(id, refEntry);
    let targetProperties = read();
    if (refEntry.used)
      return Object.assign(target2, targetProperties);
    refEntry.target = targetProperties;
    return targetProperties;
  };
  currentExtensions[112] = (data) => {
    let id = dataView.getUint32(position - 4);
    let refEntry = referenceMap.get(id);
    refEntry.used = true;
    return refEntry.target;
  };
  currentExtensions[115] = () => new Set(read());
  var typedArrays = ["Int8", "Uint8", "Uint8Clamped", "Int16", "Uint16", "Int32", "Uint32", "Float32", "Float64", "BigInt64", "BigUint64"].map((type) => type + "Array");
  currentExtensions[116] = (data) => {
    let typeCode = data[0];
    let typedArrayName = typedArrays[typeCode];
    if (!typedArrayName)
      throw new Error("Could not find typed array for code " + typeCode);
    return new globalThis[typedArrayName](Uint8Array.prototype.slice.call(data, 1).buffer);
  };
  currentExtensions[120] = () => {
    let data = read();
    return new RegExp(data[0], data[1]);
  };
  var TEMP_BUNDLE = [];
  currentExtensions[98] = (data) => {
    let dataSize = (data[0] << 24) + (data[1] << 16) + (data[2] << 8) + data[3];
    let dataPosition = position;
    position += dataSize - data.length;
    bundledStrings = TEMP_BUNDLE;
    bundledStrings = [readOnlyJSString(), readOnlyJSString()];
    bundledStrings.position0 = 0;
    bundledStrings.position1 = 0;
    bundledStrings.postBundlePosition = position;
    position = dataPosition;
    return read();
  };
  currentExtensions[255] = (data) => {
    if (data.length == 4)
      return new Date((data[0] * 16777216 + (data[1] << 16) + (data[2] << 8) + data[3]) * 1e3);
    else if (data.length == 8)
      return new Date(
        ((data[0] << 22) + (data[1] << 14) + (data[2] << 6) + (data[3] >> 2)) / 1e6 + ((data[3] & 3) * 4294967296 + data[4] * 16777216 + (data[5] << 16) + (data[6] << 8) + data[7]) * 1e3
      );
    else if (data.length == 12)
      return new Date(
        ((data[0] << 24) + (data[1] << 16) + (data[2] << 8) + data[3]) / 1e6 + ((data[4] & 128 ? -281474976710656 : 0) + data[6] * 1099511627776 + data[7] * 4294967296 + data[8] * 16777216 + (data[9] << 16) + (data[10] << 8) + data[11]) * 1e3
      );
    else
      return new Date("invalid");
  };
  function saveState(callback) {
    let savedSrcEnd = srcEnd;
    let savedPosition = position;
    let savedStringPosition = stringPosition;
    let savedSrcStringStart = srcStringStart;
    let savedSrcStringEnd = srcStringEnd;
    let savedSrcString = srcString;
    let savedStrings = strings;
    let savedReferenceMap = referenceMap;
    let savedBundledStrings = bundledStrings;
    let savedSrc = new Uint8Array(src.slice(0, srcEnd));
    let savedStructures = currentStructures;
    let savedStructuresContents = currentStructures.slice(0, currentStructures.length);
    let savedPackr = currentUnpackr;
    let savedSequentialMode = sequentialMode;
    let value = callback();
    srcEnd = savedSrcEnd;
    position = savedPosition;
    stringPosition = savedStringPosition;
    srcStringStart = savedSrcStringStart;
    srcStringEnd = savedSrcStringEnd;
    srcString = savedSrcString;
    strings = savedStrings;
    referenceMap = savedReferenceMap;
    bundledStrings = savedBundledStrings;
    src = savedSrc;
    sequentialMode = savedSequentialMode;
    currentStructures = savedStructures;
    currentStructures.splice(0, currentStructures.length, ...savedStructuresContents);
    currentUnpackr = savedPackr;
    dataView = new DataView(src.buffer, src.byteOffset, src.byteLength);
    return value;
  }
  function clearSource() {
    src = null;
    referenceMap = null;
    currentStructures = null;
  }
  var mult10 = new Array(147);
  for (let i = 0; i < 256; i++) {
    mult10[i] = +("1e" + Math.floor(45.15 - i * 0.30103));
  }
  var defaultUnpackr = new Unpackr({ useRecords: false });
  var unpack = defaultUnpackr.unpack;
  var unpackMultiple = defaultUnpackr.unpackMultiple;
  var decode = defaultUnpackr.unpack;
  var FLOAT32_OPTIONS = {
    NEVER: 0,
    ALWAYS: 1,
    DECIMAL_ROUND: 3,
    DECIMAL_FIT: 4
  };
  var f32Array = new Float32Array(1);
  var u8Array = new Uint8Array(f32Array.buffer, 0, 4);

  // node_modules/msgpackr/pack.js
  var textEncoder;
  try {
    textEncoder = new TextEncoder();
  } catch (error) {
  }
  var extensions;
  var extensionClasses;
  var hasNodeBuffer = typeof Buffer !== "undefined";
  var ByteArrayAllocate = hasNodeBuffer ? function(length) {
    return Buffer.allocUnsafeSlow(length);
  } : Uint8Array;
  var ByteArray = hasNodeBuffer ? Buffer : Uint8Array;
  var MAX_BUFFER_SIZE = hasNodeBuffer ? 4294967296 : 2144337920;
  var target;
  var keysTarget;
  var targetView;
  var position2 = 0;
  var safeEnd;
  var bundledStrings2 = null;
  var MAX_BUNDLE_SIZE = 61440;
  var hasNonLatin = /[\u0080-\uFFFF]/;
  var RECORD_SYMBOL = Symbol("record-id");
  var Packr = class extends Unpackr {
    constructor(options) {
      super(options);
      this.offset = 0;
      let typeBuffer;
      let start;
      let hasSharedUpdate;
      let structures;
      let referenceMap2;
      let lastSharedStructuresLength = 0;
      let encodeUtf8 = ByteArray.prototype.utf8Write ? function(string, position3) {
        return target.utf8Write(string, position3, 4294967295);
      } : textEncoder && textEncoder.encodeInto ? function(string, position3) {
        return textEncoder.encodeInto(string, target.subarray(position3)).written;
      } : false;
      let packr = this;
      if (!options)
        options = {};
      let isSequential = options && options.sequential;
      let hasSharedStructures = options.structures || options.saveStructures;
      let maxSharedStructures = options.maxSharedStructures;
      if (maxSharedStructures == null)
        maxSharedStructures = hasSharedStructures ? 32 : 0;
      if (maxSharedStructures > 8160)
        throw new Error("Maximum maxSharedStructure is 8160");
      if (options.structuredClone && options.moreTypes == void 0) {
        options.moreTypes = true;
      }
      let maxOwnStructures = options.maxOwnStructures;
      if (maxOwnStructures == null)
        maxOwnStructures = hasSharedStructures ? 32 : 64;
      if (!this.structures && options.useRecords != false)
        this.structures = [];
      let useTwoByteRecords = maxSharedStructures > 32 || maxOwnStructures + maxSharedStructures > 64;
      let sharedLimitId = maxSharedStructures + 64;
      let maxStructureId = maxSharedStructures + maxOwnStructures + 64;
      if (maxStructureId > 8256) {
        throw new Error("Maximum maxSharedStructure + maxOwnStructure is 8192");
      }
      let recordIdsToRemove = [];
      let transitionsCount = 0;
      let serializationsSinceTransitionRebuild = 0;
      this.pack = this.encode = function(value, encodeOptions) {
        if (!target) {
          target = new ByteArrayAllocate(8192);
          targetView = new DataView(target.buffer, 0, 8192);
          position2 = 0;
        }
        safeEnd = target.length - 10;
        if (safeEnd - position2 < 2048) {
          target = new ByteArrayAllocate(target.length);
          targetView = new DataView(target.buffer, 0, target.length);
          safeEnd = target.length - 10;
          position2 = 0;
        } else
          position2 = position2 + 7 & 2147483640;
        start = position2;
        referenceMap2 = packr.structuredClone ? /* @__PURE__ */ new Map() : null;
        if (packr.bundleStrings && typeof value !== "string") {
          bundledStrings2 = [];
          bundledStrings2.size = Infinity;
        } else
          bundledStrings2 = null;
        structures = packr.structures;
        if (structures) {
          if (structures.uninitialized)
            structures = packr._mergeStructures(packr.getStructures());
          let sharedLength = structures.sharedLength || 0;
          if (sharedLength > maxSharedStructures) {
            throw new Error("Shared structures is larger than maximum shared structures, try increasing maxSharedStructures to " + structures.sharedLength);
          }
          if (!structures.transitions) {
            structures.transitions = /* @__PURE__ */ Object.create(null);
            for (let i = 0; i < sharedLength; i++) {
              let keys = structures[i];
              if (!keys)
                continue;
              let nextTransition, transition = structures.transitions;
              for (let j = 0, l = keys.length; j < l; j++) {
                let key = keys[j];
                nextTransition = transition[key];
                if (!nextTransition) {
                  nextTransition = transition[key] = /* @__PURE__ */ Object.create(null);
                }
                transition = nextTransition;
              }
              transition[RECORD_SYMBOL] = i + 64;
            }
            lastSharedStructuresLength = sharedLength;
          }
          if (!isSequential) {
            structures.nextId = sharedLength + 64;
          }
        }
        if (hasSharedUpdate)
          hasSharedUpdate = false;
        try {
          pack2(value);
          if (bundledStrings2) {
            writeBundles(start, pack2);
          }
          packr.offset = position2;
          if (referenceMap2 && referenceMap2.idsToInsert) {
            position2 += referenceMap2.idsToInsert.length * 6;
            if (position2 > safeEnd)
              makeRoom(position2);
            packr.offset = position2;
            let serialized = insertIds(target.subarray(start, position2), referenceMap2.idsToInsert);
            referenceMap2 = null;
            return serialized;
          }
          if (encodeOptions & REUSE_BUFFER_MODE) {
            target.start = start;
            target.end = position2;
            return target;
          }
          return target.subarray(start, position2);
        } finally {
          if (structures) {
            if (serializationsSinceTransitionRebuild < 10)
              serializationsSinceTransitionRebuild++;
            let sharedLength = structures.sharedLength || maxSharedStructures;
            if (structures.length > sharedLength)
              structures.length = sharedLength;
            if (transitionsCount > 1e4) {
              structures.transitions = null;
              serializationsSinceTransitionRebuild = 0;
              transitionsCount = 0;
              if (recordIdsToRemove.length > 0)
                recordIdsToRemove = [];
            } else if (recordIdsToRemove.length > 0 && !isSequential) {
              for (let i = 0, l = recordIdsToRemove.length; i < l; i++) {
                recordIdsToRemove[i][RECORD_SYMBOL] = 0;
              }
              recordIdsToRemove = [];
            }
            if (hasSharedUpdate && packr.saveStructures) {
              let returnBuffer = target.subarray(start, position2);
              if (packr.saveStructures(structures, lastSharedStructuresLength) === false) {
                packr._mergeStructures(packr.getStructures());
                return packr.pack(value);
              }
              lastSharedStructuresLength = sharedLength;
              return returnBuffer;
            }
          }
          if (encodeOptions & RESET_BUFFER_MODE)
            position2 = start;
        }
      };
      const pack2 = (value) => {
        if (position2 > safeEnd)
          target = makeRoom(position2);
        var type = typeof value;
        var length;
        if (type === "string") {
          let strLength = value.length;
          if (bundledStrings2 && strLength >= 4 && strLength < 4096) {
            if ((bundledStrings2.size += strLength) > MAX_BUNDLE_SIZE) {
              let extStart;
              let maxBytes2 = (bundledStrings2[0] ? bundledStrings2[0].length * 3 + bundledStrings2[1].length : 0) + 10;
              if (position2 + maxBytes2 > safeEnd)
                target = makeRoom(position2 + maxBytes2);
              if (bundledStrings2.position) {
                target[position2] = 200;
                position2 += 3;
                target[position2++] = 98;
                extStart = position2 - start;
                position2 += 4;
                writeBundles(start, pack2);
                targetView.setUint16(extStart + start - 3, position2 - start - extStart);
              } else {
                target[position2++] = 214;
                target[position2++] = 98;
                extStart = position2 - start;
                position2 += 4;
              }
              bundledStrings2 = ["", ""];
              bundledStrings2.size = 0;
              bundledStrings2.position = extStart;
            }
            let twoByte = hasNonLatin.test(value);
            bundledStrings2[twoByte ? 0 : 1] += value;
            target[position2++] = 193;
            pack2(twoByte ? -strLength : strLength);
            return;
          }
          let headerSize;
          if (strLength < 32) {
            headerSize = 1;
          } else if (strLength < 256) {
            headerSize = 2;
          } else if (strLength < 65536) {
            headerSize = 3;
          } else {
            headerSize = 5;
          }
          let maxBytes = strLength * 3;
          if (position2 + maxBytes > safeEnd)
            target = makeRoom(position2 + maxBytes);
          if (strLength < 64 || !encodeUtf8) {
            let i, c1, c2, strPosition = position2 + headerSize;
            for (i = 0; i < strLength; i++) {
              c1 = value.charCodeAt(i);
              if (c1 < 128) {
                target[strPosition++] = c1;
              } else if (c1 < 2048) {
                target[strPosition++] = c1 >> 6 | 192;
                target[strPosition++] = c1 & 63 | 128;
              } else if ((c1 & 64512) === 55296 && ((c2 = value.charCodeAt(i + 1)) & 64512) === 56320) {
                c1 = 65536 + ((c1 & 1023) << 10) + (c2 & 1023);
                i++;
                target[strPosition++] = c1 >> 18 | 240;
                target[strPosition++] = c1 >> 12 & 63 | 128;
                target[strPosition++] = c1 >> 6 & 63 | 128;
                target[strPosition++] = c1 & 63 | 128;
              } else {
                target[strPosition++] = c1 >> 12 | 224;
                target[strPosition++] = c1 >> 6 & 63 | 128;
                target[strPosition++] = c1 & 63 | 128;
              }
            }
            length = strPosition - position2 - headerSize;
          } else {
            length = encodeUtf8(value, position2 + headerSize);
          }
          if (length < 32) {
            target[position2++] = 160 | length;
          } else if (length < 256) {
            if (headerSize < 2) {
              target.copyWithin(position2 + 2, position2 + 1, position2 + 1 + length);
            }
            target[position2++] = 217;
            target[position2++] = length;
          } else if (length < 65536) {
            if (headerSize < 3) {
              target.copyWithin(position2 + 3, position2 + 2, position2 + 2 + length);
            }
            target[position2++] = 218;
            target[position2++] = length >> 8;
            target[position2++] = length & 255;
          } else {
            if (headerSize < 5) {
              target.copyWithin(position2 + 5, position2 + 3, position2 + 3 + length);
            }
            target[position2++] = 219;
            targetView.setUint32(position2, length);
            position2 += 4;
          }
          position2 += length;
        } else if (type === "number") {
          if (value >>> 0 === value) {
            if (value < 64 || value < 128 && this.useRecords === false) {
              target[position2++] = value;
            } else if (value < 256) {
              target[position2++] = 204;
              target[position2++] = value;
            } else if (value < 65536) {
              target[position2++] = 205;
              target[position2++] = value >> 8;
              target[position2++] = value & 255;
            } else {
              target[position2++] = 206;
              targetView.setUint32(position2, value);
              position2 += 4;
            }
          } else if (value >> 0 === value) {
            if (value >= -32) {
              target[position2++] = 256 + value;
            } else if (value >= -128) {
              target[position2++] = 208;
              target[position2++] = value + 256;
            } else if (value >= -32768) {
              target[position2++] = 209;
              targetView.setInt16(position2, value);
              position2 += 2;
            } else {
              target[position2++] = 210;
              targetView.setInt32(position2, value);
              position2 += 4;
            }
          } else {
            let useFloat32;
            if ((useFloat32 = this.useFloat32) > 0 && value < 4294967296 && value >= -2147483648) {
              target[position2++] = 202;
              targetView.setFloat32(position2, value);
              let xShifted;
              if (useFloat32 < 4 || (xShifted = value * mult10[(target[position2] & 127) << 1 | target[position2 + 1] >> 7]) >> 0 === xShifted) {
                position2 += 4;
                return;
              } else
                position2--;
            }
            target[position2++] = 203;
            targetView.setFloat64(position2, value);
            position2 += 8;
          }
        } else if (type === "object") {
          if (!value)
            target[position2++] = 192;
          else {
            if (referenceMap2) {
              let referee = referenceMap2.get(value);
              if (referee) {
                if (!referee.id) {
                  let idsToInsert = referenceMap2.idsToInsert || (referenceMap2.idsToInsert = []);
                  referee.id = idsToInsert.push(referee);
                }
                target[position2++] = 214;
                target[position2++] = 112;
                targetView.setUint32(position2, referee.id);
                position2 += 4;
                return;
              } else
                referenceMap2.set(value, { offset: position2 - start });
            }
            let constructor = value.constructor;
            if (constructor === Object) {
              writeObject(value, true);
            } else if (constructor === Array) {
              length = value.length;
              if (length < 16) {
                target[position2++] = 144 | length;
              } else if (length < 65536) {
                target[position2++] = 220;
                target[position2++] = length >> 8;
                target[position2++] = length & 255;
              } else {
                target[position2++] = 221;
                targetView.setUint32(position2, length);
                position2 += 4;
              }
              for (let i = 0; i < length; i++) {
                pack2(value[i]);
              }
            } else if (constructor === Map) {
              length = value.size;
              if (length < 16) {
                target[position2++] = 128 | length;
              } else if (length < 65536) {
                target[position2++] = 222;
                target[position2++] = length >> 8;
                target[position2++] = length & 255;
              } else {
                target[position2++] = 223;
                targetView.setUint32(position2, length);
                position2 += 4;
              }
              for (let [key, entryValue] of value) {
                pack2(key);
                pack2(entryValue);
              }
            } else {
              for (let i = 0, l = extensions.length; i < l; i++) {
                let extensionClass = extensionClasses[i];
                if (value instanceof extensionClass) {
                  let extension = extensions[i];
                  if (extension.write) {
                    if (extension.type) {
                      target[position2++] = 212;
                      target[position2++] = extension.type;
                      target[position2++] = 0;
                    }
                    pack2(extension.write.call(this, value));
                    return;
                  }
                  let currentTarget = target;
                  let currentTargetView = targetView;
                  let currentPosition = position2;
                  target = null;
                  let result;
                  try {
                    result = extension.pack.call(this, value, (size) => {
                      target = currentTarget;
                      currentTarget = null;
                      position2 += size;
                      if (position2 > safeEnd)
                        makeRoom(position2);
                      return {
                        target,
                        targetView,
                        position: position2 - size
                      };
                    }, pack2);
                  } finally {
                    if (currentTarget) {
                      target = currentTarget;
                      targetView = currentTargetView;
                      position2 = currentPosition;
                      safeEnd = target.length - 10;
                    }
                  }
                  if (result) {
                    if (result.length + position2 > safeEnd)
                      makeRoom(result.length + position2);
                    position2 = writeExtensionData(result, target, position2, extension.type);
                  }
                  return;
                }
              }
              writeObject(value, !value.hasOwnProperty);
            }
          }
        } else if (type === "boolean") {
          target[position2++] = value ? 195 : 194;
        } else if (type === "bigint") {
          if (value < BigInt(1) << BigInt(63) && value >= -(BigInt(1) << BigInt(63))) {
            target[position2++] = 211;
            targetView.setBigInt64(position2, value);
          } else if (value < BigInt(1) << BigInt(64) && value > 0) {
            target[position2++] = 207;
            targetView.setBigUint64(position2, value);
          } else {
            if (this.largeBigIntToFloat) {
              target[position2++] = 203;
              targetView.setFloat64(position2, Number(value));
            } else {
              throw new RangeError(value + " was too large to fit in MessagePack 64-bit integer format, set largeBigIntToFloat to convert to float-64");
            }
          }
          position2 += 8;
        } else if (type === "undefined") {
          if (this.encodeUndefinedAsNil)
            target[position2++] = 192;
          else {
            target[position2++] = 212;
            target[position2++] = 0;
            target[position2++] = 0;
          }
        } else if (type === "function") {
          pack2(this.writeFunction && this.writeFunction());
        } else {
          throw new Error("Unknown type: " + type);
        }
      };
      const writeObject = this.useRecords === false ? this.variableMapSize ? (object) => {
        let keys = Object.keys(object);
        let length = keys.length;
        if (length < 16) {
          target[position2++] = 128 | length;
        } else if (length < 65536) {
          target[position2++] = 222;
          target[position2++] = length >> 8;
          target[position2++] = length & 255;
        } else {
          target[position2++] = 223;
          targetView.setUint32(position2, length);
          position2 += 4;
        }
        let key;
        for (let i = 0; i < length; i++) {
          pack2(key = keys[i]);
          pack2(object[key]);
        }
      } : (object, safePrototype) => {
        target[position2++] = 222;
        let objectOffset = position2 - start;
        position2 += 2;
        let size = 0;
        for (let key in object) {
          if (safePrototype || object.hasOwnProperty(key)) {
            pack2(key);
            pack2(object[key]);
            size++;
          }
        }
        target[objectOffset++ + start] = size >> 8;
        target[objectOffset + start] = size & 255;
      } : options.progressiveRecords && !useTwoByteRecords ? (object, safePrototype) => {
        let nextTransition, transition = structures.transitions || (structures.transitions = /* @__PURE__ */ Object.create(null));
        let objectOffset = position2++ - start;
        let wroteKeys;
        for (let key in object) {
          if (safePrototype || object.hasOwnProperty(key)) {
            nextTransition = transition[key];
            if (nextTransition)
              transition = nextTransition;
            else {
              let keys = Object.keys(object);
              let lastTransition = transition;
              transition = structures.transitions;
              let newTransitions = 0;
              for (let i = 0, l = keys.length; i < l; i++) {
                let key2 = keys[i];
                nextTransition = transition[key2];
                if (!nextTransition) {
                  nextTransition = transition[key2] = /* @__PURE__ */ Object.create(null);
                  newTransitions++;
                }
                transition = nextTransition;
              }
              if (objectOffset + start + 1 == position2) {
                position2--;
                newRecord(transition, keys, newTransitions);
              } else
                insertNewRecord(transition, keys, objectOffset, newTransitions);
              wroteKeys = true;
              transition = lastTransition[key];
            }
            pack2(object[key]);
          }
        }
        if (!wroteKeys) {
          let recordId = transition[RECORD_SYMBOL];
          if (recordId)
            target[objectOffset + start] = recordId;
          else
            insertNewRecord(transition, Object.keys(object), objectOffset, 0);
        }
      } : (object, safePrototype) => {
        let nextTransition, transition = structures.transitions || (structures.transitions = /* @__PURE__ */ Object.create(null));
        let newTransitions = 0;
        for (let key in object)
          if (safePrototype || object.hasOwnProperty(key)) {
            nextTransition = transition[key];
            if (!nextTransition) {
              nextTransition = transition[key] = /* @__PURE__ */ Object.create(null);
              newTransitions++;
            }
            transition = nextTransition;
          }
        let recordId = transition[RECORD_SYMBOL];
        if (recordId) {
          if (recordId >= 96 && useTwoByteRecords) {
            target[position2++] = ((recordId -= 96) & 31) + 96;
            target[position2++] = recordId >> 5;
          } else
            target[position2++] = recordId;
        } else {
          newRecord(transition, transition.__keys__ || Object.keys(object), newTransitions);
        }
        for (let key in object)
          if (safePrototype || object.hasOwnProperty(key))
            pack2(object[key]);
      };
      const makeRoom = (end) => {
        let newSize;
        if (end > 16777216) {
          if (end - start > MAX_BUFFER_SIZE)
            throw new Error("Packed buffer would be larger than maximum buffer size");
          newSize = Math.min(
            MAX_BUFFER_SIZE,
            Math.round(Math.max((end - start) * (end > 67108864 ? 1.25 : 2), 4194304) / 4096) * 4096
          );
        } else
          newSize = (Math.max(end - start << 2, target.length - 1) >> 12) + 1 << 12;
        let newBuffer = new ByteArrayAllocate(newSize);
        targetView = new DataView(newBuffer.buffer, 0, newSize);
        end = Math.min(end, target.length);
        if (target.copy)
          target.copy(newBuffer, 0, start, end);
        else
          newBuffer.set(target.slice(start, end));
        position2 -= start;
        start = 0;
        safeEnd = newBuffer.length - 10;
        return target = newBuffer;
      };
      const newRecord = (transition, keys, newTransitions) => {
        let recordId = structures.nextId;
        if (!recordId)
          recordId = 64;
        if (recordId < sharedLimitId && this.shouldShareStructure && !this.shouldShareStructure(keys)) {
          recordId = structures.nextOwnId;
          if (!(recordId < maxStructureId))
            recordId = sharedLimitId;
          structures.nextOwnId = recordId + 1;
        } else {
          if (recordId >= maxStructureId)
            recordId = sharedLimitId;
          structures.nextId = recordId + 1;
        }
        let highByte = keys.highByte = recordId >= 96 && useTwoByteRecords ? recordId - 96 >> 5 : -1;
        transition[RECORD_SYMBOL] = recordId;
        transition.__keys__ = keys;
        structures[recordId - 64] = keys;
        if (recordId < sharedLimitId) {
          keys.isShared = true;
          structures.sharedLength = recordId - 63;
          hasSharedUpdate = true;
          if (highByte >= 0) {
            target[position2++] = (recordId & 31) + 96;
            target[position2++] = highByte;
          } else {
            target[position2++] = recordId;
          }
        } else {
          if (highByte >= 0) {
            target[position2++] = 213;
            target[position2++] = 114;
            target[position2++] = (recordId & 31) + 96;
            target[position2++] = highByte;
          } else {
            target[position2++] = 212;
            target[position2++] = 114;
            target[position2++] = recordId;
          }
          if (newTransitions)
            transitionsCount += serializationsSinceTransitionRebuild * newTransitions;
          if (recordIdsToRemove.length >= maxOwnStructures)
            recordIdsToRemove.shift()[RECORD_SYMBOL] = 0;
          recordIdsToRemove.push(transition);
          pack2(keys);
        }
      };
      const insertNewRecord = (transition, keys, insertionOffset, newTransitions) => {
        let mainTarget = target;
        let mainPosition = position2;
        let mainSafeEnd = safeEnd;
        let mainStart = start;
        target = keysTarget;
        position2 = 0;
        start = 0;
        if (!target)
          keysTarget = target = new ByteArrayAllocate(8192);
        safeEnd = target.length - 10;
        newRecord(transition, keys, newTransitions);
        keysTarget = target;
        let keysPosition = position2;
        target = mainTarget;
        position2 = mainPosition;
        safeEnd = mainSafeEnd;
        start = mainStart;
        if (keysPosition > 1) {
          let newEnd = position2 + keysPosition - 1;
          if (newEnd > safeEnd)
            makeRoom(newEnd);
          let insertionPosition = insertionOffset + start;
          target.copyWithin(insertionPosition + keysPosition, insertionPosition + 1, position2);
          target.set(keysTarget.slice(0, keysPosition), insertionPosition);
          position2 = newEnd;
        } else {
          target[insertionOffset + start] = keysTarget[0];
        }
      };
    }
    useBuffer(buffer) {
      target = buffer;
      targetView = new DataView(target.buffer, target.byteOffset, target.byteLength);
      position2 = 0;
    }
    clearSharedData() {
      if (this.structures)
        this.structures = [];
    }
  };
  extensionClasses = [Date, Set, Error, RegExp, ArrayBuffer, Object.getPrototypeOf(Uint8Array.prototype).constructor, C1Type];
  extensions = [{
    pack(date, allocateForWrite, pack2) {
      let seconds = date.getTime() / 1e3;
      if ((this.useTimestamp32 || date.getMilliseconds() === 0) && seconds >= 0 && seconds < 4294967296) {
        let { target: target2, targetView: targetView2, position: position3 } = allocateForWrite(6);
        target2[position3++] = 214;
        target2[position3++] = 255;
        targetView2.setUint32(position3, seconds);
      } else if (seconds > 0 && seconds < 4294967296) {
        let { target: target2, targetView: targetView2, position: position3 } = allocateForWrite(10);
        target2[position3++] = 215;
        target2[position3++] = 255;
        targetView2.setUint32(position3, date.getMilliseconds() * 4e6 + (seconds / 1e3 / 4294967296 >> 0));
        targetView2.setUint32(position3 + 4, seconds);
      } else if (isNaN(seconds)) {
        if (this.onInvalidDate) {
          allocateForWrite(0);
          return pack2(this.onInvalidDate());
        }
        let { target: target2, targetView: targetView2, position: position3 } = allocateForWrite(3);
        target2[position3++] = 212;
        target2[position3++] = 255;
        target2[position3++] = 255;
      } else {
        let { target: target2, targetView: targetView2, position: position3 } = allocateForWrite(15);
        target2[position3++] = 199;
        target2[position3++] = 12;
        target2[position3++] = 255;
        targetView2.setUint32(position3, date.getMilliseconds() * 1e6);
        targetView2.setBigInt64(position3 + 4, BigInt(Math.floor(seconds)));
      }
    }
  }, {
    pack(set, allocateForWrite, pack2) {
      let array = Array.from(set);
      let { target: target2, position: position3 } = allocateForWrite(this.moreTypes ? 3 : 0);
      if (this.moreTypes) {
        target2[position3++] = 212;
        target2[position3++] = 115;
        target2[position3++] = 0;
      }
      pack2(array);
    }
  }, {
    pack(error, allocateForWrite, pack2) {
      let { target: target2, position: position3 } = allocateForWrite(this.moreTypes ? 3 : 0);
      if (this.moreTypes) {
        target2[position3++] = 212;
        target2[position3++] = 101;
        target2[position3++] = 0;
      }
      pack2([error.name, error.message]);
    }
  }, {
    pack(regex, allocateForWrite, pack2) {
      let { target: target2, position: position3 } = allocateForWrite(this.moreTypes ? 3 : 0);
      if (this.moreTypes) {
        target2[position3++] = 212;
        target2[position3++] = 120;
        target2[position3++] = 0;
      }
      pack2([regex.source, regex.flags]);
    }
  }, {
    pack(arrayBuffer, allocateForWrite) {
      if (this.moreTypes)
        writeExtBuffer(arrayBuffer, 16, allocateForWrite);
      else
        writeBuffer(hasNodeBuffer ? Buffer.from(arrayBuffer) : new Uint8Array(arrayBuffer), allocateForWrite);
    }
  }, {
    pack(typedArray, allocateForWrite) {
      let constructor = typedArray.constructor;
      if (constructor !== ByteArray && this.moreTypes)
        writeExtBuffer(typedArray, typedArrays.indexOf(constructor.name), allocateForWrite);
      else
        writeBuffer(typedArray, allocateForWrite);
    }
  }, {
    pack(c1, allocateForWrite) {
      let { target: target2, position: position3 } = allocateForWrite(1);
      target2[position3] = 193;
    }
  }];
  function writeExtBuffer(typedArray, type, allocateForWrite, encode2) {
    let length = typedArray.byteLength;
    if (length + 1 < 256) {
      var { target: target2, position: position3 } = allocateForWrite(4 + length);
      target2[position3++] = 199;
      target2[position3++] = length + 1;
    } else if (length + 1 < 65536) {
      var { target: target2, position: position3 } = allocateForWrite(5 + length);
      target2[position3++] = 200;
      target2[position3++] = length + 1 >> 8;
      target2[position3++] = length + 1 & 255;
    } else {
      var { target: target2, position: position3, targetView: targetView2 } = allocateForWrite(7 + length);
      target2[position3++] = 201;
      targetView2.setUint32(position3, length + 1);
      position3 += 4;
    }
    target2[position3++] = 116;
    target2[position3++] = type;
    target2.set(new Uint8Array(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength), position3);
  }
  function writeBuffer(buffer, allocateForWrite) {
    let length = buffer.byteLength;
    var target2, position3;
    if (length < 256) {
      var { target: target2, position: position3 } = allocateForWrite(length + 2);
      target2[position3++] = 196;
      target2[position3++] = length;
    } else if (length < 65536) {
      var { target: target2, position: position3 } = allocateForWrite(length + 3);
      target2[position3++] = 197;
      target2[position3++] = length >> 8;
      target2[position3++] = length & 255;
    } else {
      var { target: target2, position: position3, targetView: targetView2 } = allocateForWrite(length + 5);
      target2[position3++] = 198;
      targetView2.setUint32(position3, length);
      position3 += 4;
    }
    target2.set(buffer, position3);
  }
  function writeExtensionData(result, target2, position3, type) {
    let length = result.length;
    switch (length) {
      case 1:
        target2[position3++] = 212;
        break;
      case 2:
        target2[position3++] = 213;
        break;
      case 4:
        target2[position3++] = 214;
        break;
      case 8:
        target2[position3++] = 215;
        break;
      case 16:
        target2[position3++] = 216;
        break;
      default:
        if (length < 256) {
          target2[position3++] = 199;
          target2[position3++] = length;
        } else if (length < 65536) {
          target2[position3++] = 200;
          target2[position3++] = length >> 8;
          target2[position3++] = length & 255;
        } else {
          target2[position3++] = 201;
          target2[position3++] = length >> 24;
          target2[position3++] = length >> 16 & 255;
          target2[position3++] = length >> 8 & 255;
          target2[position3++] = length & 255;
        }
    }
    target2[position3++] = type;
    target2.set(result, position3);
    position3 += length;
    return position3;
  }
  function insertIds(serialized, idsToInsert) {
    let nextId;
    let distanceToMove = idsToInsert.length * 6;
    let lastEnd = serialized.length - distanceToMove;
    idsToInsert.sort((a, b) => a.offset > b.offset ? 1 : -1);
    while (nextId = idsToInsert.pop()) {
      let offset = nextId.offset;
      let id = nextId.id;
      serialized.copyWithin(offset + distanceToMove, offset, lastEnd);
      distanceToMove -= 6;
      let position3 = offset + distanceToMove;
      serialized[position3++] = 214;
      serialized[position3++] = 105;
      serialized[position3++] = id >> 24;
      serialized[position3++] = id >> 16 & 255;
      serialized[position3++] = id >> 8 & 255;
      serialized[position3++] = id & 255;
      lastEnd = offset;
    }
    return serialized;
  }
  function writeBundles(start, pack2) {
    if (bundledStrings2.length > 0) {
      targetView.setUint32(bundledStrings2.position + start, position2 - bundledStrings2.position - start);
      let writeStrings = bundledStrings2;
      bundledStrings2 = null;
      let startPosition = position2;
      pack2(writeStrings[0]);
      pack2(writeStrings[1]);
    }
  }
  var defaultPackr = new Packr({ useRecords: false });
  var pack = defaultPackr.pack;
  var encode = defaultPackr.pack;
  var { NEVER, ALWAYS, DECIMAL_ROUND, DECIMAL_FIT } = FLOAT32_OPTIONS;
  var REUSE_BUFFER_MODE = 512;
  var RESET_BUFFER_MODE = 1024;

  // node_modules/msgpackr/node-index.js
  var import_module = __require("module");
  var import_meta = {};
  var nativeAccelerationDisabled = process.env.MSGPACKR_NATIVE_ACCELERATION_DISABLED !== void 0 && process.env.MSGPACKR_NATIVE_ACCELERATION_DISABLED.toLowerCase() === "true";
  if (!nativeAccelerationDisabled) {
    let extractor;
    try {
      if (typeof __require == "function")
        extractor = require_msgpackr_extract();
      else
        extractor = (0, import_module.createRequire)(import_meta.url)("msgpackr-extract");
      if (extractor)
        setExtractor(extractor.extractStrings);
    } catch (error) {
    }
  }

  // node_modules/@lumeweb/dht-rpc-client/dist/rpcQuery.js
  var import_buffer = __require("buffer");

  // node_modules/libskynet/dist/blake2b.js
  function ADD64AA(v, a, b) {
    const o0 = v[a] + v[b];
    let o1 = v[a + 1] + v[b + 1];
    if (o0 >= 4294967296) {
      o1++;
    }
    v[a] = o0;
    v[a + 1] = o1;
  }
  function ADD64AC(v, a, b0, b1) {
    let o0 = v[a] + b0;
    if (b0 < 0) {
      o0 += 4294967296;
    }
    let o1 = v[a + 1] + b1;
    if (o0 >= 4294967296) {
      o1++;
    }
    v[a] = o0;
    v[a + 1] = o1;
  }
  function B2B_GET32(arr, i) {
    return arr[i] ^ arr[i + 1] << 8 ^ arr[i + 2] << 16 ^ arr[i + 3] << 24;
  }
  function B2B_G(a, b, c, d, ix, iy, m, v) {
    const x0 = m[ix];
    const x1 = m[ix + 1];
    const y0 = m[iy];
    const y1 = m[iy + 1];
    ADD64AA(v, a, b);
    ADD64AC(v, a, x0, x1);
    let xor0 = v[d] ^ v[a];
    let xor1 = v[d + 1] ^ v[a + 1];
    v[d] = xor1;
    v[d + 1] = xor0;
    ADD64AA(v, c, d);
    xor0 = v[b] ^ v[c];
    xor1 = v[b + 1] ^ v[c + 1];
    v[b] = xor0 >>> 24 ^ xor1 << 8;
    v[b + 1] = xor1 >>> 24 ^ xor0 << 8;
    ADD64AA(v, a, b);
    ADD64AC(v, a, y0, y1);
    xor0 = v[d] ^ v[a];
    xor1 = v[d + 1] ^ v[a + 1];
    v[d] = xor0 >>> 16 ^ xor1 << 16;
    v[d + 1] = xor1 >>> 16 ^ xor0 << 16;
    ADD64AA(v, c, d);
    xor0 = v[b] ^ v[c];
    xor1 = v[b + 1] ^ v[c + 1];
    v[b] = xor1 >>> 31 ^ xor0 << 1;
    v[b + 1] = xor0 >>> 31 ^ xor1 << 1;
  }
  var BLAKE2B_IV32 = new Uint32Array([
    4089235720,
    1779033703,
    2227873595,
    3144134277,
    4271175723,
    1013904242,
    1595750129,
    2773480762,
    2917565137,
    1359893119,
    725511199,
    2600822924,
    4215389547,
    528734635,
    327033209,
    1541459225
  ]);
  var SIGMA8 = [
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    14,
    10,
    4,
    8,
    9,
    15,
    13,
    6,
    1,
    12,
    0,
    2,
    11,
    7,
    5,
    3,
    11,
    8,
    12,
    0,
    5,
    2,
    15,
    13,
    10,
    14,
    3,
    6,
    7,
    1,
    9,
    4,
    7,
    9,
    3,
    1,
    13,
    12,
    11,
    14,
    2,
    6,
    5,
    10,
    4,
    0,
    15,
    8,
    9,
    0,
    5,
    7,
    2,
    4,
    10,
    15,
    14,
    1,
    11,
    12,
    6,
    8,
    3,
    13,
    2,
    12,
    6,
    10,
    0,
    11,
    8,
    3,
    4,
    13,
    7,
    5,
    15,
    14,
    1,
    9,
    12,
    5,
    1,
    15,
    14,
    13,
    4,
    10,
    0,
    7,
    6,
    3,
    9,
    2,
    8,
    11,
    13,
    11,
    7,
    14,
    12,
    1,
    3,
    9,
    5,
    0,
    15,
    4,
    8,
    6,
    2,
    10,
    6,
    15,
    14,
    9,
    11,
    3,
    0,
    8,
    12,
    2,
    13,
    7,
    1,
    4,
    10,
    5,
    10,
    2,
    8,
    4,
    7,
    6,
    1,
    5,
    15,
    11,
    9,
    14,
    3,
    12,
    13,
    0,
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    14,
    10,
    4,
    8,
    9,
    15,
    13,
    6,
    1,
    12,
    0,
    2,
    11,
    7,
    5,
    3
  ];
  var SIGMA82 = new Uint8Array(SIGMA8.map(function(x) {
    return x * 2;
  }));
  function blake2bCompress(ctx, last) {
    const v = new Uint32Array(32);
    const m = new Uint32Array(32);
    let i = 0;
    for (i = 0; i < 16; i++) {
      v[i] = ctx.h[i];
      v[i + 16] = BLAKE2B_IV32[i];
    }
    v[24] = v[24] ^ ctx.t;
    v[25] = v[25] ^ ctx.t / 4294967296;
    if (last) {
      v[28] = ~v[28];
      v[29] = ~v[29];
    }
    for (i = 0; i < 32; i++) {
      m[i] = B2B_GET32(ctx.b, 4 * i);
    }
    for (i = 0; i < 12; i++) {
      B2B_G(0, 8, 16, 24, SIGMA82[i * 16 + 0], SIGMA82[i * 16 + 1], m, v);
      B2B_G(2, 10, 18, 26, SIGMA82[i * 16 + 2], SIGMA82[i * 16 + 3], m, v);
      B2B_G(4, 12, 20, 28, SIGMA82[i * 16 + 4], SIGMA82[i * 16 + 5], m, v);
      B2B_G(6, 14, 22, 30, SIGMA82[i * 16 + 6], SIGMA82[i * 16 + 7], m, v);
      B2B_G(0, 10, 20, 30, SIGMA82[i * 16 + 8], SIGMA82[i * 16 + 9], m, v);
      B2B_G(2, 12, 22, 24, SIGMA82[i * 16 + 10], SIGMA82[i * 16 + 11], m, v);
      B2B_G(4, 14, 16, 26, SIGMA82[i * 16 + 12], SIGMA82[i * 16 + 13], m, v);
      B2B_G(6, 8, 18, 28, SIGMA82[i * 16 + 14], SIGMA82[i * 16 + 15], m, v);
    }
    for (i = 0; i < 16; i++) {
      ctx.h[i] = ctx.h[i] ^ v[i] ^ v[i + 16];
    }
  }
  function blake2bInit() {
    const ctx = {
      b: new Uint8Array(128),
      h: new Uint32Array(16),
      t: 0,
      c: 0,
      outlen: 32
    };
    for (let i = 0; i < 16; i++) {
      ctx.h[i] = BLAKE2B_IV32[i];
    }
    ctx.h[0] ^= 16842752 ^ 32;
    return ctx;
  }
  function blake2bUpdate(ctx, input) {
    for (let i = 0; i < input.length; i++) {
      if (ctx.c === 128) {
        ctx.t += ctx.c;
        blake2bCompress(ctx, false);
        ctx.c = 0;
      }
      ctx.b[ctx.c++] = input[i];
    }
  }
  function blake2bFinal(ctx) {
    ctx.t += ctx.c;
    while (ctx.c < 128) {
      ctx.b[ctx.c++] = 0;
    }
    blake2bCompress(ctx, true);
    const out = new Uint8Array(ctx.outlen);
    for (let i = 0; i < ctx.outlen; i++) {
      out[i] = ctx.h[i >> 2] >> 8 * (i & 3);
    }
    return out;
  }
  function blake2b(input) {
    const ctx = blake2bInit();
    blake2bUpdate(ctx, input);
    return blake2bFinal(ctx);
  }

  // node_modules/libskynet/dist/merkle.js
  var nu8 = new Uint8Array(0);

  // node_modules/libskynet/dist/apidownloadverify.js
  var nu82 = new Uint8Array(0);

  // node_modules/libskynet/dist/skylinkbitfield.js
  var nu83 = new Uint8Array(0);

  // node_modules/libskynet/dist/ed25519.js
  var gf = function() {
    const r = new Float64Array(16);
    return r;
  };
  var gfi = function(init) {
    let i;
    const r = new Float64Array(16);
    if (init)
      for (i = 0; i < init.length; i++)
        r[i] = init[i];
    return r;
  };
  var gf0 = gf();
  var gf1 = gfi([1]);
  var D = gfi([
    30883,
    4953,
    19914,
    30187,
    55467,
    16705,
    2637,
    112,
    59544,
    30585,
    16505,
    36039,
    65139,
    11119,
    27886,
    20995
  ]);
  var D2 = gfi([
    61785,
    9906,
    39828,
    60374,
    45398,
    33411,
    5274,
    224,
    53552,
    61171,
    33010,
    6542,
    64743,
    22239,
    55772,
    9222
  ]);
  var X = gfi([
    54554,
    36645,
    11616,
    51542,
    42930,
    38181,
    51040,
    26924,
    56412,
    64982,
    57905,
    49316,
    21502,
    52590,
    14035,
    8553
  ]);
  var Y = gfi([
    26200,
    26214,
    26214,
    26214,
    26214,
    26214,
    26214,
    26214,
    26214,
    26214,
    26214,
    26214,
    26214,
    26214,
    26214,
    26214
  ]);
  var I = gfi([
    41136,
    18958,
    6951,
    50414,
    58488,
    44335,
    6150,
    12099,
    55207,
    15867,
    153,
    11085,
    57099,
    20417,
    9344,
    11139
  ]);
  var L = new Float64Array([
    237,
    211,
    245,
    92,
    26,
    99,
    18,
    88,
    214,
    156,
    247,
    162,
    222,
    249,
    222,
    20,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    16
  ]);
  var nu84 = new Uint8Array(0);

  // node_modules/libskynet/dist/registry.js
  var nu85 = new Uint8Array(0);

  // node_modules/libskynet/dist/skylinkverifyresolver.js
  var nu86 = new Uint8Array(0);

  // node_modules/@lumeweb/dht-rpc-client/dist/util.js
  function isBuffer(obj) {
    return obj && obj.constructor && typeof obj.constructor.isBuffer === "function" && obj.constructor.isBuffer(obj);
  }
  function flatten(target2, opts = {}) {
    opts = opts || {};
    const delimiter = opts.delimiter || ".";
    const maxDepth = opts.maxDepth;
    const transformKey = opts.transformKey || ((key) => isNaN(parseInt(key)) ? key : "");
    const output = [];
    function step(object, prev, currentDepth) {
      currentDepth = currentDepth || 1;
      if (!Array.isArray(object)) {
        object = Object.keys(object != null ? object : {});
      }
      object.forEach(function(key) {
        const value = object[key];
        const isarray = opts.safe && Array.isArray(value);
        const type = Object.prototype.toString.call(value);
        const isbuffer = isBuffer(value);
        const isobject = type === "[object Object]" || type === "[object Array]";
        const newKey = prev ? prev + delimiter + transformKey(key) : transformKey(key);
        if (!isarray && !isbuffer && isobject && Object.keys(value).length && (!opts.maxDepth || currentDepth < maxDepth)) {
          return step(value, newKey, currentDepth + 1);
        }
        output.push(`${newKey}=${value}`);
      });
    }
    step(target2);
    return output;
  }

  // node_modules/@lumeweb/dht-rpc-client/dist/rpcQuery.js
  var RpcQuery = class {
    _network;
    _query;
    _promise;
    _timeoutTimer;
    _timeout = false;
    _completed = false;
    _responses = {};
    _promiseResolve;
    _maxTries = 3;
    _tries = 0;
    constructor(network, query) {
      this._network = network;
      this._query = query;
      this.init();
    }
    get result() {
      return this._promise;
    }
    handeTimeout() {
      this.resolve(false, true);
    }
    resolve(data, timeout = false) {
      (0, import_timers.clearTimeout)(this._timeoutTimer);
      this._timeout = timeout;
      this._completed = true;
      this._promiseResolve(data);
    }
    async init() {
      var _a, _b;
      this._promise = (_a = this._promise) != null ? _a : new Promise((resolve) => {
        this._promiseResolve = resolve;
      });
      this._timeoutTimer = (_b = this._timeoutTimer) != null ? _b : (0, import_timers.setTimeout)(this.handeTimeout.bind(this), this._network.queryTimeout * 1e3);
      await this._network.ready;
      const promises = [];
      for (const relay of this._network.relays) {
        promises.push(this.queryRelay(relay));
      }
      await Promise.allSettled(promises);
      this.checkResponses();
    }
    async queryRelay(relay) {
      let socket;
      try {
        socket = this._network.dht.connect(import_buffer.Buffer.from(relay, "hex"));
        if (isPromise(socket)) {
          socket = await socket;
        }
      } catch (e) {
        return;
      }
      return new Promise((resolve, reject) => {
        let timer;
        socket.on("data", (res) => {
          (0, import_timers.clearTimeout)(timer);
          socket.end();
          const response = unpack(res);
          if (response && response.error) {
            return reject(response);
          }
          this._responses[relay] = response;
          resolve(null);
        });
        socket.on("error", (error) => reject({ error }));
        socket.write("rpc");
        socket.write(pack(this._query));
        timer = (0, import_timers.setTimeout)(() => {
          reject("timeout");
        }, this._network.relayTimeout * 1e3);
      });
    }
    checkResponses() {
      const responseStore = this._responses;
      const responseStoreData = Object.values(responseStore);
      const responseObjects = responseStoreData.reduce((output, item) => {
        const itemFlattened = flatten(item == null ? void 0 : item.data).sort();
        const hash = import_buffer.Buffer.from(blake2b(import_buffer.Buffer.from(JSON.stringify(itemFlattened)))).toString("hex");
        output[hash] = item == null ? void 0 : item.data;
        return output;
      }, {});
      const responses = responseStoreData.reduce((output, item) => {
        var _a;
        const itemFlattened = flatten(item == null ? void 0 : item.data).sort();
        const hash = import_buffer.Buffer.from(blake2b(import_buffer.Buffer.from(JSON.stringify(itemFlattened)))).toString("hex");
        output[hash] = (_a = output[hash]) != null ? _a : 0;
        output[hash]++;
        return output;
      }, {});
      for (const responseHash in responses) {
        if (responses[responseHash] / responseStoreData.length >= this._network.majorityThreshold) {
          let response = responseObjects[responseHash];
          if (null === response) {
            if (this._tries <= this._maxTries) {
              this._tries++;
              this.retry();
              return;
            }
            response = false;
          }
          this.resolve(response);
          break;
        }
      }
    }
    retry() {
      this._responses = {};
      if (this._completed) {
        return;
      }
      this.init();
    }
  };
  function isPromise(obj) {
    return !!obj && (typeof obj === "object" || typeof obj === "function") && typeof obj.then === "function";
  }

  // node_modules/@lumeweb/dht-rpc-client/dist/rpcNetwork.js
  var import_dht = __toESM(require_dht(), 1);
  var RpcNetwork = class {
    constructor(dht = new import_dht.default()) {
      this._dht = dht;
    }
    _dht;
    get dht() {
      return this._dht;
    }
    _majorityThreshold = 0.75;
    get majorityThreshold() {
      return this._majorityThreshold;
    }
    set majorityThreshold(value) {
      this._majorityThreshold = value;
    }
    _maxTtl = 12 * 60 * 60;
    get maxTtl() {
      return this._maxTtl;
    }
    set maxTtl(value) {
      this._maxTtl = value;
    }
    _queryTimeout = 30;
    get queryTimeout() {
      return this._queryTimeout;
    }
    set queryTimeout(value) {
      this._queryTimeout = value;
    }
    _relayTimeout = 2;
    get relayTimeout() {
      return this._relayTimeout;
    }
    set relayTimeout(value) {
      this._relayTimeout = value;
    }
    _relays = [];
    get relays() {
      return this._relays;
    }
    _ready;
    get ready() {
      if (!this._ready) {
        this._ready = this._dht.ready();
      }
      return this._ready;
    }
    _force = false;
    get force() {
      return this._force;
    }
    set force(value) {
      this._force = value;
    }
    addRelay(pubkey) {
      this._relays.push(pubkey);
      this._relays = [...new Set(this._relays)];
    }
    removeRelay(pubkey) {
      if (!this._relays.includes(pubkey)) {
        return false;
      }
      delete this._relays[this._relays.indexOf(pubkey)];
      this._relays = Object.values(this._relays);
      return true;
    }
    clearRelays() {
      this._relays = [];
    }
    query(query, chain, data = {}, force = false) {
      return new RpcQuery(this, {
        query,
        chain,
        data,
        force: force || this._force
      });
    }
  };

  // node_modules/@lumeweb/resolver-common/dist/types.js
  var DNS_RECORD_TYPE = {
    DEFAULT: "DEFAULT",
    A: "A",
    CNAME: "CNAME",
    NS: "NS",
    CONTENT: "CONTENT",
    TEXT: "TEXT",
    ALL: "ALL",
    CUSTOM: "CUSTOM"
  };
  Object.freeze(DNS_RECORD_TYPE);

  // src/resolverRegistry.ts
  var ResolverRegistry = class {
    _resolvers = /* @__PURE__ */ new Set();
    _rpcNetwork;
    constructor(network = new RpcNetwork()) {
      this._rpcNetwork = network;
    }
    get resolvers() {
      return this._resolvers;
    }
    get rpcNetwork() {
      return this._rpcNetwork;
    }
    async resolve(domain, options = { type: DNS_RECORD_TYPE.CONTENT }, bypassCache = false) {
      for (const resolver of this._resolvers) {
        const result = await resolver.resolve(domain, options, bypassCache);
        if (!result.error && result.records.length) {
          return result;
        }
      }
      return { records: [] };
    }
    register(resolver) {
      this._resolvers.add(resolver);
    }
    clear() {
      this._resolvers.clear();
    }
  };
})();
//# sourceMappingURL=index.global.js.map