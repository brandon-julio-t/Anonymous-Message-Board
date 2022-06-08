const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

const board = "u-i-u-a-a-bing-bing-wala-wala-bing-bing";
suite("Functional Tests", function () {
  const threadsUrl = `/api/threads/${board}`;
  const repliesUrl = `/api/replies/${board}`;

  suite("/api/threads", () => {
    test("Creating a new thread: POST request to /api/threads/{board}", (done) => {
      chai
        .request(server)
        .post(threadsUrl)
        .send({ text: "text", delete_password: "password" })
        .end((err, res) => {
          assert.strictEqual(res.status, 200);

          const thread = res.body;
          assert.isString(thread._id);
          assert.strictEqual(thread.text, "text");
          assert.isNotNaN(Date.parse(thread.created_on));
          assert.isNotNaN(Date.parse(thread.bumped_on));
          assert.strictEqual(
            Date.parse(thread.created_on),
            Date.parse(thread.bumped_on)
          );
          assert.notProperty(thread, "reported");
          assert.notProperty(thread, "delete_password");
          assert.isArray(thread.replies);

          done();
        });
    });

    test("Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}", (done) => {
      chai
        .request(server)
        .get(threadsUrl)
        .end((err, res) => {
          assert.strictEqual(res.status, 200);

          const threads = res.body;
          assert.isArray(threads);
          assert.strictEqual(threads.length, 10);
          threads.forEach((thread) => {
            assert.isString(thread._id);
            assert.isString(thread.text);
            assert.isNotNaN(Date.parse(thread.created_on));
            assert.isNotNaN(Date.parse(thread.bumped_on));
            assert.notProperty(thread, "reported");
            assert.notProperty(thread, "delete_password");

            assert.isArray(thread.replies);
            if (thread.replies.length > 0) {
              assert.strictEqual(thread.replies.length, 3);
            }
            thread.replies.forEach((reply) => {
              assert.isString(reply._id);
              assert.isString(reply.text);
              assert.isNotNaN(Date.parse(reply.created_on));
              assert.notProperty(reply, "reported");
              assert.notProperty(reply, "delete_password");
            });
          });

          done();
        });
    });

    test("Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password", (done) => {
      chai
        .request(server)
        .get(threadsUrl)
        .end((err, res) => {
          const thread = res.body[0];

          chai
            .request(server)
            .delete(threadsUrl)
            .send({ thread_id: thread._id, delete_password: "wahoo" })
            .end((err, res) => {
              assert.strictEqual(res.status, 200);
              assert.strictEqual(res.text, "incorrect password");
              done();
            });
        });
    });

    test("Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password", (done) => {
      chai
        .request(server)
        .get(threadsUrl)
        .end((err, res) => {
          const thread = res.body[0];

          chai
            .request(server)
            .delete(threadsUrl)
            .send({ thread_id: thread._id, delete_password: "password" })
            .end((err, res) => {
              assert.strictEqual(res.status, 200);
              assert.strictEqual(res.text, "success");
              done();
            });
        });
    });

    test("Reporting a thread: PUT request to /api/threads/{board}", (done) => {
      chai
        .request(server)
        .get(threadsUrl)
        .end((err, res) => {
          const thread = res.body[0];

          chai
            .request(server)
            .put(threadsUrl)
            .send({ report_id: thread._id })
            .end((err, res) => {
              assert.strictEqual(res.status, 200);
              assert.strictEqual(res.text, "reported");
              done();
            });
        });
    });
  });

  suite("/api/replies", () => {
    test("Creating a new reply: POST request to /api/replies/{board}", (done) => {
      chai
        .request(server)
        .get(threadsUrl)
        .end((err, res) => {
          const thread = res.body[0];

          chai
            .request(server)
            .post(repliesUrl)
            .send({
              thread_id: thread._id,
              text: "text",
              delete_password: "duar",
            })
            .end((err, res) => {
              assert.strictEqual(res.status, 200);

              const thread = res.body;
              assert.notStrictEqual(thread.created_on, thread.bumped_on);

              const reply = thread.replies[thread.replies.length - 1];
              assert.isString(reply._id);
              assert.isString(reply.text);
              assert.strictEqual(reply.text, "text");
              assert.isNotNaN(Date.parse(reply.created_on));
              assert.notProperty(reply, "reported");
              assert.notProperty(reply, "delete_password");

              done();
            });
        });
    });

    test("Viewing a single thread with all replies: GET request to /api/replies/{board}", (done) => {
      chai
        .request(server)
        .get(threadsUrl)
        .end((err, res) => {
          const thread = res.body[0];

          chai
            .request(server)
            .get(repliesUrl)
            .query({ thread_id: thread._id })
            .end((err, res) => {
              assert.strictEqual(res.status, 200);

              const thread = res.body;
              assert.isString(thread._id);
              assert.isString(thread.text);
              assert.isNotNaN(Date.parse(thread.created_on));
              assert.isNotNaN(Date.parse(thread.bumped_on));
              assert.notProperty(thread, "reported");
              assert.notProperty(thread, "delete_password");

              thread.replies.forEach((reply) => {
                assert.isString(reply._id);
                assert.isString(reply.text);
                assert.isNotNaN(Date.parse(reply.created_on));
                assert.notProperty(reply, "reported");
                assert.notProperty(reply, "delete_password");
              });

              done();
            });
        });
    });

    test("Deleting a reply with the incorrect password: DELETE request to /api/replies/{board} with an invalid delete_password", (done) => {
      chai
        .request(server)
        .get(threadsUrl)
        .end((err, res) => {
          const thread = res.body[0];

          chai
            .request(server)
            .post(repliesUrl)
            .send({
              thread_id: thread._id,
              text: "text",
              delete_password: "duar",
            })
            .end((err, res) => {
              const thread = res.body;
              const reply = thread.replies[thread.replies.length - 1];

              chai
                .request(server)
                .delete(repliesUrl)
                .send({
                  thread_id: thread._id,
                  reply_id: reply._id,
                  delete_password: "raud",
                })
                .end((err, res) => {
                  assert.strictEqual(res.status, 200);
                  assert.strictEqual(res.text, "incorrect password");
                  done();
                });
            });
        });
    });

    test("Deleting a reply with the correct password: DELETE request to /api/replies/{board} with a valid delete_password", (done) => {
      chai
        .request(server)
        .get(threadsUrl)
        .end((err, res) => {
          const thread = res.body[0];

          chai
            .request(server)
            .post(repliesUrl)
            .send({
              thread_id: thread._id,
              text: "text",
              delete_password: "duar",
            })
            .end((err, res) => {
              const thread = res.body;
              const reply = thread.replies[thread.replies.length - 1];

              chai
                .request(server)
                .delete(repliesUrl)
                .send({
                  thread_id: thread._id,
                  reply_id: reply._id,
                  delete_password: "duar",
                })
                .end((err, res) => {
                  assert.strictEqual(res.status, 200);
                  assert.strictEqual(res.text, "success");
                  done();
                });
            });
        });
    });

    test("Reporting a reply: PUT request to /api/replies/{board}", (done) => {
      chai
        .request(server)
        .get(threadsUrl)
        .end((err, res) => {
          const thread = res.body[0];

          chai
            .request(server)
            .post(repliesUrl)
            .send({
              thread_id: thread._id,
              text: "text",
              delete_password: "duar",
            })
            .end((err, res) => {
              const thread = res.body;
              const reply = thread.replies[thread.replies.length - 1];

              chai
                .request(server)
                .put(repliesUrl)
                .send({
                  thread_id: thread._id,
                  reply_id: reply._id,
                })
                .end((err, res) => {
                  assert.strictEqual(res.status, 200);
                  assert.strictEqual(res.text, "reported");
                  done();
                });
            });
        });
    });
  });
});
