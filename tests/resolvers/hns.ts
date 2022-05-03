import resolvers, {
  isDomain,
  isIp,
  startsWithSkylinkRegExp,
} from "../../src/index.js";
import Handshake from "../../src/resolvers/handshake.js";
import assert from "assert";

const resolver = resolvers.createDefaultResolver();

resolver.registerPortal(
  process.env.TEST_PORTAL as string,
  ["dns", "registry"],
  process.env.TEST_PORTAL_PUBKEY as string
);

resolver.dnsNetwork.force = true;
resolver.connect();

describe("Handshake", () => {
  const subresolver = new Handshake(resolver);
  it("should resolve homescreen/ correctly for testing skynet resolver links", async () => {
    // @ts-ignore
    const result = (await subresolver.resolve("homescreen")) as string;
    assert.notEqual(result, null);
    assert.notEqual(result, "");
    assert.equal(startsWithSkylinkRegExp.test(result), true);
  });

  it("should resolve skapp/ correctly for testing legacy skynet registry links", async () => {
    // @ts-ignore
    const result = (await subresolver.resolve("skapp")) as string;
    assert.notEqual(result, null);
    assert.notEqual(result, "");
    assert.equal(startsWithSkylinkRegExp.test(result), true);
  });

  it("should fail to resolve com/ correctly", async () => {
    // @ts-ignore
    const result = (await subresolver.resolve("com")) as string;
    assert.equal(result, false);
  });

  it("should to resolve welcome.nb/ to an ip address for testing GLUE records", async () => {
    // @ts-ignore
    const result = (await subresolver.resolve("welcome.nb")) as string;
    assert.equal(isIp(result), true);
  });
  it("should to resolve proofofconcept/ to an ip address for testing a handshake domain nameserver", async () => {
    // @ts-ignore
    const result = (await subresolver.resolve("proofofconcept")) as string;
    assert.equal(isIp(result), true);
  });
  it("should to resolve bcoin.js to a CNAME domain", async () => {
    // @ts-ignore
    const result = (await subresolver.resolve("bcoin.js")) as string;
    assert.equal(isDomain(result), true);
  });
  it("should to resolve handshake.txt to a CNAME domain", async () => {
    // @ts-ignore
    const result = (await subresolver.resolve("handshake.txt")) as string;
    assert.equal(isDomain(result), true);
  });
  it("should to resolve domains.durendil to a domain testing GLUE records and CNAMES", async () => {
    // @ts-ignore
    const result = (await subresolver.resolve("domains.durendil")) as string;
    assert.equal(isDomain(result), true);
  });

  it("should to resolve humbly to an ip address for testing ICANN nameservers", async () => {
    // @ts-ignore
    const result = (await subresolver.resolve("humbly")) as string;
    assert.equal(isIp(result), true);
  });
});
