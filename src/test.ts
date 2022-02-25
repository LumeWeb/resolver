import resolver from "./index.js";

resolver.registerPortal('skynet.derrickhammer.com');

(async function (){
    console.log((await resolver.resolve('skyrider')));
})();
