import fetch from "node-fetch";
import { Worker, isMainThread, workerData } from "worker_threads";

if (isMainThread) {
  console.log("hello");
} else {
  console.log(`booking ${workerData.spotid} for class ${workerData.classid}`);
  await bookClassSpot(
    workerData.classid,
    workerData.spotid,
    workerData.cookies
  );
}

async function bookClassSpot(classid, spotid, cookies) {
  //Login
  const str = cookies[0];
  const cfid = str.substring(str.indexOf("cfid=") + 5, str.indexOf(";Path=/"));
  const zing = cookies[4];
  const encoded = zing.substring(
    zing.indexOf("ZING2PUB=") + 9,
    zing.indexOf("; path=/")
  );

  // Spot booking
  const action = "Reserve.book";
  const seriesorderitemid = "1409348269619808180";
  const st = "d80439bd-e89a-4101-bd69-3a09fec10a1b"; // This ST is impt. need to update everytime until i figure out how to get it programatically
  const response = await fetch(
    `https://cru68.zingfit.com/reserve/index.cfm?action=${action}&classid=${classid}&spotid=${spotid}&seriesorderitemid=${seriesorderitemid}&st=${st}&site=1`,
    {
      method: "GET",
      header: {
        Cookie: `SITE=1; ZING2PUB=${encoded}; cfid=${cfid}; cftoken=0`,
      },
    }
  );
  console.log(`Response for BOOK -- ${response.status}`);

  const responseText = await response.text();
  console.log(responseText);
  {
    if (
      responseText.indexOf("you must sign up") != -1 ||
      responseText.indexOf("Please login to continue") != -1
    ) {
      console.error("Login Failed");
    }
    if (responseText.indexOf("Sorry") != -1) {
      console.error("Slot Taken");
    }
    if (
      responseText.indexOf("We're sorry. That page could not be found.") != -1
    ) {
      console.error("Page Not Found");
    }
    if (
      responseText.indexOf("ga('send', 'event', 'Booking', 'Complete');") != -1
    ) {
      console.log(`Successfully booked!`);
    }
  }
}
