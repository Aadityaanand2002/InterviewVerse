import { Inngest } from "inngest";
const inngest = new Inngest({ id: "test", isDev: true });
console.log(inngest.mode);
