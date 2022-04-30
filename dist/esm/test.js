import resolvers from "./index.js";
const resolver = resolvers.createDefaultResolver();
resolver.registerPortal(
  "skynet.derrickhammer.com",
  ["dns", "registry", "web3link"],
  "0odMB49AQllK7aSqJiDrv9OUCW-tQGiecFVROwdBTUY.v3KCBG8oguJgfT050iMA42QRNkiqlqslSs0Xb2-3iU8"
);
(async () => {
  // tslint:disable-next-line:no-console
  console.log(await resolver.resolve("lumeweb.sol"));
})();
