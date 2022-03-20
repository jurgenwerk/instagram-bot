import html2image from "./renderer/html2image";
import { getNaughtyCommits, Commit } from "./fetcher/github";
import { render } from "./renderer/render";
import { publishPhoto } from "./instagram/instagram";
import { readFileSync, writeFileSync } from "fs";

let lastPostAtFilePath = `${__dirname}/assets/last-post-at.txt`;
let minSecondsBetweenPosts = 60 * 60 * 60 * 8; // 8 hours

let isEnoughTimeSinceLastPost = () => {
  let lastPostAtString = readFileSync(lastPostAtFilePath, "utf8");
  if (!lastPostAtString || lastPostAtString.trim() === "") {
    return true;
  }
  let lastPostAt = new Date(lastPostAtString);
  let secondsInBetween = (new Date().getTime() - lastPostAt.getTime()) / 1000;
  return secondsInBetween >= minSecondsBetweenPosts;
};

setInterval(async function () {
  if (isEnoughTimeSinceLastPost()) {
    let commit = (await getNaughtyCommits())[0];

    if (commit) {
      log(`Posting commit: ${commit.message}`);
      let html = render(commit);
      let imageBuffer = await html2image(html);
      await publishPhoto(imageBuffer, commit.profile_name);

      writeFileSync(lastPostAtFilePath, new Date().toISOString(), "utf-8");
      log(`Posted commit: ${commit.message}`);
    } else {
      log("No naughty commits found...");
    }
  } else {
    log("Not enough time since last post");
  }
}, 10 * 1000);

let log = (message: string) => {
  console.log(`[${new Date().toISOString()}] ${message}`);
};
