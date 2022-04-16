import Resolver from "./Resolver.js";
export * from "./Resolver.js";
import Handshake from "./resolvers/handshake.js";
import Icann from "./resolvers/icann.js";
import Eip137 from "./resolvers/eip137.js";
declare const resolvers: {
  Icann: typeof Icann;
  Handshake: typeof Handshake;
  Eip137: typeof Eip137;
  createDefaultResolver: () => Resolver;
};
export * from "./lib/util.js";
export default resolvers;
export { Resolver };
//# sourceMappingURL=index.d.ts.map
