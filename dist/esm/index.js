import Resolver from "./Resolver.js";
export * from "./Resolver.js";
import Handshake from "./resolvers/handshake.js";
import Icann from "./resolvers/icann.js";
import Eip137 from "./resolvers/eip137.js";
const resolvers = {
  Icann,
  Handshake,
  Eip137,
  createDefaultResolver: () => {
    const defaultResolver = new Resolver();
    defaultResolver.registerResolver(new Icann(defaultResolver));
    defaultResolver.registerResolver(new Eip137(defaultResolver));
    defaultResolver.registerResolver(new Handshake(defaultResolver));
    return defaultResolver;
  },
};
export * from "./lib/util.js";
export default resolvers;
export { Resolver };
