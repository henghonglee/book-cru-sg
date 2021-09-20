import * as schedule from "node-schedule";
import { Worker, workerData } from "worker_threads";

schedule.scheduleJob("0 12 * * 1", async function () {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  new Worker("./book.js");
});
