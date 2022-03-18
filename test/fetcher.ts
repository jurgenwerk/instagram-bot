var assert = require("assert");
import { extractNaughtyCommits } from "../fetcher/github";

describe("fetcher", function () {
  describe("extractNaughtyCommits", function () {
    it("should extract naughty commits from events", function () {
      let events = [
        {
          type: "PushEvent",
          actor: {
            avatar_url: "avatar_url",
            display_login: "craig",
            login: "craig",
            url: "url",
          },
          created_at: "created_at",
          payload: {
            commits: [
              {
                author: {
                  email: "email",
                  name: "name",
                },
                message: "what the shit java eating too much memory again",
              },
              {
                author: {
                  email: "email",
                  name: "name",
                },
                message: "no cursing here",
              },
            ],
          },
        },
      ];

      let commits = extractNaughtyCommits(events);
      assert.deepEqual(commits, [
        {
          profile_name: "craig",
          avatar_url: "avatar_url",
          message: "what the shit java eating too much memory again",
          created_at: "created_at",
        },
      ]);
    });
  });
});
