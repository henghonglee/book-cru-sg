import * as schedule from "node-schedule";
import { Worker, workerData } from "worker_threads";

// schedule.scheduleJob("18 * * * *", async function () {
schedule.scheduleJob("0 12 * * 1", async function () {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  new Worker("./book.js");
});
