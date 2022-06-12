import Resolver from "./Resolver.js";
export * from "./Resolver.js";
import Handshake from "./resolvers/handshake.js";
import Icann from "./resolvers/icann.js";
import Eip137 from "./resolvers/eip137.js";
import Solana from "./resolvers/solana.js";
import Algorand from "./resolvers/algorand.js";
import Avax from "./resolvers/avax.js";
import Evmos from "./resolvers/evmos.js";

const resolvers = {
  Icann,
  Eip137,
  Solana,
  Algorand,
  Avax,
  Evmos,
  Handshake,
  createDefaultResolver: () => {
    const defaultResolver = new Resolver();
    defaultResolver.registerResolver(new Icann(defaultResolver));
    defaultResolver.registerResolver(new Eip137(defaultResolver));
    defaultResolver.registerResolver(new Solana(defaultResolver));
    defaultResolver.registerResolver(new Algorand(defaultResolver));
    defaultResolver.registerResolver(new Avax(defaultResolver));
    defaultResolver.registerResolver(new Evmos(defaultResolver));
    defaultResolver.registerResolver(new Handshake(defaultResolver));

    return defaultResolver;
  },
};

export * from "./lib/util.js";
export default resolvers;
export { Resolver };
