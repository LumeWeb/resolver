import resolver from "../../src/index.js";
import Handshake from "../../src/resolvers/handshake.js";
import assert from "assert";
import { startsWithSkylinkRegExp } from "../../src/lib/util.js";

resolver.registerPortal(<string>process.env.TEST_PORTAL);

describe("Handshake", () => {
  const subresolver = new Handshake(resolver);
  it("should resolve homescreen/ correctly", async () => {
    // @ts-ignore
    let result = <string>await subresolver.resolve("homescreen");
    assert.notEqual(result, null);
    assert.notEqual(result, "");
    assert.equal(startsWithSkylinkRegExp.test(result), true);
  });

  it("should resolve skapp/ correctly", async () => {
    // @ts-ignore
    let result = <string>await subresolver.resolve("skapp");
    assert.notEqual(result, null);
    assert.notEqual(result, "");
    assert.equal(startsWithSkylinkRegExp.test(result), true);
  });

  it("should fail to resolve com correctly", async () => {
    // @ts-ignore
    let result = <string>await subresolver.resolve("com");
    assert.equal(result, false);
  });
});
