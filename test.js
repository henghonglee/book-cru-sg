import fetch from "node-fetch";

const params = new URLSearchParams();
params.append("action", "Account.doLogin");
params.append("username", "henghong.lee@gmail.com");
params.append("password", "2cycle");
params.append("site", 1);

const response = await fetch("https://cru68.zingfit.com/reserve/index.cfm", {
  method: "POST",
  body: params,
  redirect: "follow",
});

console.log(`Response for login -- ${response.status}`);
// console.log(await response.text());
console.log(response.headers.raw());
console.log(response.headers.raw()["set-cookie"]);
const cookies = response.headers.raw()["set-cookie"];
const str = cookies[0];
const cfid = str.substring(str.indexOf("cfid=") + 5, str.indexOf(";Path=/"));
const zing = cookies[4];
const encoded = zing.substring(
  zing.indexOf("ZING2PUB=") + 9,
  zing.indexOf("; path=/")
);

const response2 = await fetch(
  `https://www.cru68.com/schedule#/schedule/site/1/st/d80439bd-e89a-4101-bd69-3a09fec10a1b`,
  {
    method: "GET",
    header: {
      Cookie: `SITE=1; ZING2PUB=${encoded}; cfid=${cfid}; cftoken=0;`,
    },
  }
);
console.log(await response.text());
console.log(response2.headers.raw());
