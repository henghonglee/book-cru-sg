import fetch from "node-fetch";
import { Worker, isMainThread, workerData } from "worker_threads";

if (isMainThread) {
  console.log("hello");
} else {
  console.log(`booking ${workerData.spotid} for class ${workerData.classid}`);

}


