"use strict";

const request = require("supertest");

const db = require("../db.js");
const app = require("../app");
const Job = require("../models/job");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  adminToken,
  userToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    title: "newJob",
    salary: 100000,
    equity: "0.05",
    companyHandle: "c1",
  };

  test("ok for admins", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "newJob",
        salary: 100000,
        equity: "0.05",
        companyHandle: "c1",
      },
    });
  });

  test("unauthorized for non-admin users", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${userToken}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request if missing data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "newJob",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request if invalid data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        ...newJob,
        salary: "not-a-number",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs: [
        {
          id: expect.any(Number),
          title: "Job1",
          salary: 50000,
          equity: "0.01",
          companyHandle: "c1",
        },
        {
          id: expect.any(Number),
          title: "Job2",
          salary: 60000,
          equity: "0.02",
          companyHandle: "c2",
        },
      ],
    });
  });

  test("works: filtering by min salary", async function () {
    const resp = await request(app).get("/jobs").query({ minSalary: 55000 });
    expect(resp.body).toEqual({
      jobs: [
        {
          id: expect.any(Number),
          title: "Job2",
          salary: 60000,
          equity: "0.02",
          companyHandle: "c2",
        },
      ],
    });
  });

  test("works: filtering by hasEquity", async function () {
    const resp = await request(app).get("/jobs").query({ hasEquity: true });
    expect(resp.body).toEqual({
      jobs: [
        {
          id: expect.any(Number),
          title: "Job1",
          salary: 50000,
          equity: "0.01",
          companyHandle: "c1",
        },
        {
          id: expect.any(Number),
          title: "Job2",
          salary: 60000,
          equity: "0.02",
          companyHandle: "c2",
        },
      ],
    });
  });

  test("bad request on invalid filter", async function () {
    const resp = await request(app).get("/jobs").query({ minSalary: "not-a-number" });
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const job = await Job.findAll();
    const resp = await request(app).get(`/jobs/${job[0].id}`);
    expect(resp.body).toEqual({
      job: {
        id: job[0].id,
        title: "Job1",
        salary: 50000,
        equity: "0.01",
        companyHandle: "c1",
      },
    });
  });

  test("not found if job not found", async function () {
    const resp = await request(app).get(`/jobs/9999`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
  test("works for admins", async function () {
    const job = await Job.findAll();
    const resp = await request(app)
      .patch(`/jobs/${job[0].id}`)
      .send({
        title: "Updated Job",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      job: {
        id: job[0].id,
        title: "Updated Job",
        salary: 50000,
        equity: "0.01",
        companyHandle: "c1",
      },
    });
  });

  test("unauthorized for non-admin users", async function () {
    const job = await Job.findAll();
    const resp = await request(app)
      .patch(`/jobs/${job[0].id}`)
      .send({
        title: "Updated Job",
      })
      .set("authorization", `Bearer ${userToken}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if no such job", async function () {
    const resp = await request(app)
      .patch(`/jobs/9999`)
      .send({
        title: "No such job",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on invalid data", async function () {
    const job = await Job.findAll();
    const resp = await request(app)
      .patch(`/jobs/${job[0].id}`)
      .send({
        salary: "not-a-number",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
  test("works for admins", async function () {
    const job = await Job.findAll();
    const resp = await request(app)
      .delete(`/jobs/${job[0].id}`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: `${job[0].id}` });
  });

  test("unauthorized for non-admin users", async function () {
    const job = await Job.findAll();
    const resp = await request(app)
      .delete(`/jobs/${job[0].id}`)
      .set("authorization", `Bearer ${userToken}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if job not found", async function () {
    const resp = await request(app)
      .delete(`/jobs/9999`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});
