import fetch from "node-fetch";
import * as jsdom from "jsdom";
// import { Worker, workerData } from "worker_threads";

// This ST is impt. need to update everytime until i figure out how to get it programatically
const sessionToken = "da9299da-0571-4326-b51e-acc8f4f68655"; 

// Restrictions:
// can only book
// - hannah's thurs 7pm class and
// - on the SAME week
// - with our package only

/**
 * TODO: Timer to start at 12:00:01 noon
 */
const cookies = await getCookies();
//Login
console.log(cookies)
const str = cookies[0];
const cfid = str.substring(str.indexOf("cfid=") + 5, str.indexOf(";Path=/"));
const zing = cookies[4];
const encoded = zing.substring(
  zing.indexOf("ZING2PUB=") + 9,
  zing.indexOf("; path=/")
);

const result = await getClassId();
const date = result[1];
const classid = result[0];
console.log(`classid = ${classid}, date = ${date}`);

if (date == "28.10") {
  console.log("Right date");
  await bookClassAll(classid, 5);
} else {
  console.log("Wrong Date");
}

////
//// Priv Methods
////

async function getClassId() {
  const resp = await fetch(
    `https://cru68.zingfit.com/reserve/index.cfm?action=Reserve.chooseClass&instructorid=20000000018&wk=1&site=1`,
    {
      method: "GET",
    }
  );
  const res = await resp.text();
  const virtualConsole = new jsdom.VirtualConsole();
  const dom = new jsdom.default.JSDOM(res, { virtualConsole });

  const date_node = dom.window.document.querySelector(
    "#reserve > thead > tr > td:nth-child(4) > span.thead-date"
  );
  const node = dom.window.document.querySelector(
    "#reserve > tbody > tr > td.day3 > div:nth-child(2)"
  ); // 2nd div in column

  const classid = node.attributes["data-classid"].value;
  return [classid, date_node.textContent];
}

// returns array of strings with cookies
async function getCookies(ck) {
  const params = new URLSearchParams();
  params.append("action", "Account.doLogin");
  params.append("username", "henghong.lee@gmail.com");
  params.append("password", "");
  params.append("site", 1);

  const response = await fetch("https://cru68.zingfit.com/reserve/index.cfm", {
    method: "POST",
    body: params,
    header: {
      Cookie: ck,
    },
  });
  console.log(`Response for login -- ${response.status}`);
  return response.headers.raw()["set-cookie"];
}

async function bookClassAll(classid, slotsToBook) {
  const cookies = await getCookies();
  const possible_spots = Array.from(Array(17).keys()).reverse();
  possible_spots.pop() // pop 0
  possible_spots.push(17) // sidebar
  possible_spots.push(18) // sidebar
  console.log(possible_spots)
  var slotsLeftToBook = slotsToBook
  for (const spotid of possible_spots) {
    // new Worker("./book_worker.js", {
    //   workerData: { classid, spotid, cookies },
    // });
    console.log(`Booking slot ${spotid}`)
    const resp = await bookClassSpot(
      classid,
      spotid,
      cookies
    );
    if (resp == "booked") {
      slotsLeftToBook = slotsLeftToBook - 1
      if (slotsLeftToBook == 0) {
        break
      }
    }
  }
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
  const response = await fetch(
    `https://cru68.zingfit.com/reserve/index.cfm?action=${action}&classid=${classid}&spotid=${spotid}&seriesorderitemid=${seriesorderitemid}&st=${sessionToken}&site=1`,
    {
      method: "GET",
      header: {
        Cookie: `SITE=1; ZING2PUB=${encoded}; cfid=${cfid}; cftoken=0`,
      },
    }
  );
  // console.log(`Response for BOOK -- ${response.status}`);

  const responseText = await response.text();
  // console.log(responseText);
  {
    if (
      responseText.indexOf("you must sign up") != -1 ||
      responseText.indexOf("Please login to continue") != -1
    ) {
      console.error("Login Failed");
      return "failed"
    }
    if (responseText.indexOf("Sorry") != -1) {
      console.error("Slot Taken");
      return "taken"
    }
    if (
      responseText.indexOf("We're sorry. That page could not be found.") != -1
    ) {
      console.error("Page Not Found");
      return "failed"
    }
    if (
      responseText.indexOf("ga('send', 'event', 'Booking', 'Complete');") != -1
    ) {
      console.log(`Successfully booked!`);
      return "booked"
    }
  }
}
