import resolver from "../../src/index.js";
import Eip137 from "../../src/resolvers/eip137.js";
import is_ipfs from "is-ipfs";
import assert from "assert";

const { ipnsPath } = is_ipfs;

resolver.registerPortal(process.env.TEST_PORTAL as string);

describe("Eip137", () => {
  const subresolver = new Eip137(resolver);
  it("should resolve ens.eth correctly", async () => {
    // @ts-ignore
    const result = (await subresolver.resolve("ens.eth")) as string;
    assert.notEqual(result, null);
    assert.notEqual(result, "");
    const path = `/${result.replace("://", "/")}`;
    assert.equal(ipnsPath(path), true);
  });
  it("should fail to resolve lumeweb.eth correctly", async () => {
    // @ts-ignore
    const result = (await subresolver.resolve("lumeweb.eth")) as string;
    assert.equal(result, false);
  });
});
