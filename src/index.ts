import Resolver from "./Resolver.js";
export * from "./Resolver.js";
import Handshake from "./resolvers/handshake.js";
import Icann from "./resolvers/icann.js";
import Eip137 from "./resolvers/eip137.js";

const resolver = {
  Icann,
  Handshake,
  Eip137,
};

export * from "./lib/util.js";
export default resolver;
export { Resolver };
