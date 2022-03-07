import resolver, {
  isDomain,
  isIp,
  startsWithSkylinkRegExp,
} from "../../src/index.js";
import Handshake from "../../src/resolvers/handshake.js";
import assert from "assert";

resolver.registerPortal(process.env.TEST_PORTAL as string);

describe("Handshake", () => {
  const subresolver = new Handshake(resolver);
  it("should resolve homescreen/ correctly", async () => {
    // @ts-ignore
    const result = (await subresolver.resolve("homescreen")) as string;
    assert.notEqual(result, null);
    assert.notEqual(result, "");
    assert.equal(startsWithSkylinkRegExp.test(result), true);
  });

  it("should resolve skapp/ correctly", async () => {
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

  it("should to resolve welcome.nb/ to an ip address", async () => {
    // @ts-ignore
    const result = (await subresolver.resolve("welcome.nb")) as string;
    assert.equal(isIp(result), true);
  });
  it("should to resolve proofofconcept/ to an ip address", async () => {
    // @ts-ignore
    const result = (await subresolver.resolve("proofofconcept")) as string;
    assert.equal(isIp(result), true);
  });
  it("should to resolve bcoin.js to an ip address", async () => {
    // @ts-ignore
    const result = (await subresolver.resolve("bcoin.js")) as string;
    assert.equal(isIp(result), true);
  });
  it("should to resolve handshake.txt to an ip address", async () => {
    // @ts-ignore
    const result = (await subresolver.resolve("handshake.txt")) as string;
    assert.equal(isIp(result), true);
  });
  it("should to resolve domains.durendil to a domain", async () => {
    // @ts-ignore
    const result = (await subresolver.resolve("domains.durendil")) as string;
    assert.equal(isDomain(result), true);
  });

  it("should to resolve humbly to an ip address", async () => {
    // @ts-ignore
    const result = (await subresolver.resolve("humbly")) as string;
    assert.equal(isIp(result), true);
  });
});
