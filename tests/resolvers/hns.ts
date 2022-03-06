import resolver from "../../src/index.js";
import Handshake from "../../src/resolvers/handshake.js";
import assert from "assert";
import { startsWithSkylinkRegExp } from "../../src/lib/util.js";

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
});
