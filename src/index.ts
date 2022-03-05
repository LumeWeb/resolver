import Resolver from "./Resolver.js";
import Handshake from "./resolvers/handshake.js";
import Icann from "./resolvers/icann.js";
import Eip137 from "./resolvers/eip137.js";

const resolver = new Resolver();
resolver.registerResolver(new Icann(resolver));
resolver.registerResolver(new Eip137(resolver));
resolver.registerResolver(new Handshake(resolver));

export { Resolver };
export default resolver;
