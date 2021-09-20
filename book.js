import fetch from "node-fetch";
import * as jsdom from "jsdom";
import { Worker, workerData } from "worker_threads";

// Restrictions:
// can only book
// - hannah's thurs 7pm class and
// - on the SAME week
// - with our package only

/**
 * TODO: Timer to start at 12:00:01 noon
 */
const result = await getClassId();
const date = result[1];
const classid = result[0];
console.log(`classid = ${classid}, date = ${date}`);

if (date == "23.09") {
  console.log("Right date");
  await bookClassAll(classid);
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
  params.append("password", "2cycle");
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

async function bookClassAll(classid) {
  const cookies = await getCookies();
  const possible_spots = Array.from(Array(30).keys()).reverse();
  for (const spotid of possible_spots) {
    new Worker("./book_worker.js", {
      workerData: { classid, spotid, cookies },
    });
  }
}
