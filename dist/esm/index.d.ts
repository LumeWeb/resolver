import Resolver from "./resolver.js";
export * from "./resolver.js";
import Handshake from "./resolvers/handshake.js";
import Icann from "./resolvers/icann.js";
import Eip137 from "./resolvers/eip137.js";
import Solana from "./resolvers/solana.js";
import Algorand from "./resolvers/algorand.js";
import Avax from "./resolvers/avax.js";
import Evmos from "./resolvers/evmos.js";
declare const resolvers: {
  Icann: typeof Icann;
  Eip137: typeof Eip137;
  Solana: typeof Solana;
  Algorand: typeof Algorand;
  Avax: typeof Avax;
  Evmos: typeof Evmos;
  Handshake: typeof Handshake;
  createDefaultResolver: () => Resolver;
};
export * from "./lib/util.js";
export default resolvers;
export { Resolver };
//# sourceMappingURL=index.d.ts.map
