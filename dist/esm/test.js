import resolvers from "./index.js";
const resolver = resolvers.createDefaultResolver();
resolver.registerPortal(
  "fileportal.org",
  ["dns", "registry"],
  "Omkq3gTKAil75U-p1CeyEoq-pQWFKYH5Z31x9GiQvOM.OLWIuw8_h4o03HtNnc7x_egpxW5Q5LaBK9u-8mI7QNg"
);
resolver.registerPortal("direct.fileportal.org", ["web3link"]);
(async () => {
  // tslint:disable-next-line:no-console
  console.log(await resolver.resolve("wealthy.forever"));
})();
