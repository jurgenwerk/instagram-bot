import { writeFileSync, existsSync, readFileSync } from "fs";
import { IgApiClient } from "instagram-private-api";

const cookiesPath = `${__dirname}/cookies.txt`;
const devicePath = `${__dirname}/device.txt`;

export function upload() {}

async function saveSession(ig: any) {
  const cookieJar = await ig.state.serializeCookieJar();
  const device = (({ deviceString, deviceId, uuid, adid, build }) => ({
    deviceString,
    deviceId,
    uuid,
    adid,
    build,
  }))(ig.state);

  writeFileSync(cookiesPath, JSON.stringify(cookieJar), "utf-8");
  writeFileSync(devicePath, JSON.stringify(device), "utf-8");
}

async function restoreSession(ig: any) {
  // TODO: regenerate if session is more that 1 month old?
  if (!existsSync(cookiesPath) || !existsSync(devicePath)) {
    debugger;
    await regenerateSession(ig);
  }

  const savedCookie = readFileSync(cookiesPath, "utf-8");
  const savedDevice = JSON.parse(readFileSync(devicePath, "utf-8"));
  debugger;
  await ig.state.deserializeCookieJar(savedCookie);
  ig.state.deviceString = savedDevice.deviceString;
  ig.state.deviceId = savedDevice.deviceId;
  ig.state.uuid = savedDevice.uuid;
  ig.state.adid = savedDevice.adid;
  ig.state.build = savedDevice.build;
}

async function regenerateSession(ig: any) {
  await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);
  await ig.simulate.postLoginFlow();
  await saveSession(ig);
  await restoreSession(ig);
}

export async function publishPhoto(imageBuffer: Buffer, igProfileName: string) {
  let ig = new IgApiClient();

  ig.request.end$.subscribe(async () => {
    saveSession(ig);
  });
  await restoreSession(ig);

  await ig.publish.photo({
    file: imageBuffer,
    caption: `@${igProfileName} #developerlife #developers #developermemes #codinglife #codingmemes #programming #programmingmemes #programmingjokes #geek #geeklife @GitHub`,
  });
}
