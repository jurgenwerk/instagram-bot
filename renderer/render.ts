import { Commit } from "../fetcher/github";
import { readFileSync } from "fs";

export function render(commit: Commit) {
  let templateString = readFileSync(
    `${process.cwd()}/renderer/template.html`,
    "utf8"
  );
  templateString = templateString.replace("{{AUTHOR}}", commit.profile_name);
  templateString = templateString.replace(
    "{{AVATAR_IMAGE_URL}}",
    commit.avatar_url
  );
  templateString = templateString.replace("{{COMMIT_MESSAGE}}", commit.message);
  templateString = templateString.replace(
    "{{TIME}}",
    new Date(commit.created_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  );

  templateString = templateString.replace(
    "{{BACKGROUND_IMAGE_URL}}",
    randomImageBackgroundUrl()
  );
  templateString = templateString.replace(
    "{{MARGIN_LEFT}}",
    `${20 + randomIntFromInterval(0, 140)}`
  );
  templateString = templateString.replace(
    "{{MARGIN_TOP}}",
    `${100 + randomIntFromInterval(0, 500)}`
  );

  return templateString;
}

function randomImageBackgroundUrl() {
  let index = randomIntFromInterval(0, 2685); // There are 2685 images in the bucket
  return `https://gitfuck.s3-eu-west-1.amazonaws.com/backgrounds/${index}.jpg`;
}

function randomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
