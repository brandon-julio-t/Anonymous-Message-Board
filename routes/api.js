"use strict";

const helmet = require("helmet");
const bcrypt = require("bcrypt");
const ThreadFactory = require("../factories/thread-factory");
const ReplyFactory = require("../factories/reply-factory");

const threadFactory = new ThreadFactory();
const replyFactory = new ReplyFactory();

const board = "u-i-u-a-a-bing-bing-wala-wala-bing-bing";

let boards = {};

function getThreads(board) {
  if (!boards[board]) boards[board] = [];
  return boards[board];
}

module.exports = function (app) {
  seed();

  app
    .route("/api/threads/:board")
    .get((req, res) => {
      const { board } = req.params;

      const topTenThreads = [...getThreads(board)]
        .sort((a, b) => Date.parse(b.bumped_on) - Date.parse(a.bumped_on))
        .slice(0, 10)
        .map((thread) => {
          const topThreeReplies = [...thread.replies]
            .sort((a, b) => Date.parse(b.created_on) - Date.parse(a.created_on))
            .slice(0, 3)
            .map((reply) => reply.withoutHiddenProperties());

          return threadFactory
            .parse({
              ...thread,
              replies: topThreeReplies,
            })
            .withoutHiddenProperties();
        });

      res.json(topTenThreads);
    })
    .post((req, res) => {
      const { board } = req.params;
      const thread = threadFactory.create(req.body);
      getThreads(board).push(thread);
      res.json(thread.withoutHiddenProperties());
    })
    .delete((req, res) => {
      const { board } = req.params;
      const { thread_id, delete_password } = req.body;

      const threads = getThreads(board);
      const thread = threads.find((thread) => thread._id === thread_id);
      if (bcrypt.compareSync(delete_password, thread.delete_password)) {
        boards[board] = threads.filter((thread) => thread._id !== thread_id);
        res.send("success");
        return;
      }

      res.send("incorrect password");
    })
    .put((req, res) => {
      const { board } = req.params;
      const { report_id } = req.body;
      const thread = getThreads(board).find(
        (thread) => thread._id === report_id
      );
      thread.reported = true;
      res.send("reported");
    });

  app
    .route("/api/replies/:board")
    .get((req, res) => {
      const { board } = req.params;
      const { thread_id } = req.query;

      const thread = getThreads(board).find(
        (thread) => thread._id === thread_id
      );
      const clone = thread.withoutHiddenProperties();
      clone.replies = clone.replies.map((reply) =>
        reply.withoutHiddenProperties()
      );

      return res.json(clone);
    })
    .post((req, res) => {
      const { board } = req.params;
      const { thread_id, text, delete_password } = req.body;

      const thread = getThreads(board).find(
        (thread) => thread._id === thread_id
      );
      const reply = replyFactory.create({ text, delete_password });
      thread.replies.push(reply);
      thread.bumped_on = reply.created_on;

      const threadClone = thread.withoutHiddenProperties();
      threadClone.replies = threadClone.replies.map(reply => reply.withoutHiddenProperties());
      res.json(threadClone);
    })
    .delete((req, res) => {
      const { board } = req.params;
      const { thread_id, reply_id, delete_password } = req.body;

      const thread = getThreads(board).find(
        (thread) => thread._id === thread_id
      );
      const reply = thread.replies.find((reply) => reply._id === reply_id);

      if (!bcrypt.compareSync(delete_password, reply.delete_password)) {
        res.send("incorrect password");
        return;
      }

      reply.text = "[deleted]";
      res.send("success");
    })
    .put((req, res) => {
      const { board } = req.params;
      const { thread_id, reply_id } = req.body;

      const thread = getThreads(board).find(
        (thread) => thread._id === thread_id
      );
      const reply = thread.replies.find((reply) => reply._id === reply_id);

      reply.reported = true;
      res.send("reported");
    });
};

function seed() {
  for (let i = 0; i < 12; i++) {
    const thread = threadFactory.create({
      text: `text${i}`,
      delete_password: "password",
    });

    for (let j = 0; j < 5; j++) {
      const reply = replyFactory.create({
        text: `reply${j}`,
        delete_password: "password",
      });

      thread.replies.push(reply);
    }

    getThreads(board).push(thread);
  }
}
