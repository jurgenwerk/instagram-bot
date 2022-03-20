import fetch from "node-fetch";
import { readFileSync } from "fs";

export type Commit = {
  profile_name: string;
  avatar_url: string;
  message: string;
  created_at: string;
};

type GithubCommit = {
  author: {
    email: string;
    name: string;
  };
  message: string;
};

type GithubEvent = {
  type: "PushEvent"; // Can also be "CreateEvent", "PullRequestReviewEvent", ... but unsupported for now
  actor: {
    url: string;
    avatar_url: string;
    login: string;
    display_login: string;
  };
  created_at: string;
  payload: {
    commits: GithubCommit[];
  };
};

// Recent GitHub public events
export async function fetchEvents(): Promise<GithubEvent[]> {
  let token = process.env.GITHUB_TOKEN;

  if (!token) {
    throw new Error("GITHUB_TOKEN environment variable not set");
  }

  let url = "https://api.github.com/events?per_page=100";
  let events = await (
    await fetch(url, {
      headers: {
        authorization: `token ${token}`,
      },
    })
  ).json();

  return events;
}

export function extractNaughtyCommits(events: GithubEvent[]): Commit[] {
  let naughtyWords = readFileSync(
    `${__dirname}/../assets/cursewords.txt`,
    "utf8"
  )
    .split("\n")
    .filter((str) => str.trim() !== "");

  let isNaughtyWord = (word: string) => naughtyWords.includes(word);

  let naughtyCommits: Commit[] = [];

  events.forEach((event) => {
    if (event.type !== "PushEvent") {
      // Only PushEvent supported for now
      return null;
    }

    let commits = event.payload.commits;
    let naughtyCommitsInEvent = commits.filter((commit) => {
      let commitWords = commit.message.split(" ");
      return commitWords.some((word) => isNaughtyWord(word));
    });

    naughtyCommitsInEvent.forEach((commit) => {
      naughtyCommits.push({
        profile_name: event.actor.display_login,
        avatar_url: event.actor.avatar_url,
        message: commit.message,
        created_at: event.created_at,
      });
    });
  });

  return naughtyCommits;
}

export function filterCommits(commits: Commit[]): Commit[] {
  return commits.filter((commit) => {
    let minWords = 4;
    return commit.message.split(" ").length >= minWords;
  });
}

export async function getNaughtyCommits(): Promise<Commit[]> {
  let events = await fetchEvents();
  return filterCommits(extractNaughtyCommits(events));
}
