/* tslint:disable: next-line no-var-requires no-empty */
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const Gun = require("gun");
require("gun/nts.js");

Gun.Rmem = require("gun/lib/rmem.js");

const GunClass = Gun;
export default GunClass;
