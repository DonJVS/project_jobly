"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "newJob",
    salary: 100000,
    equity: "0.05",
    companyHandle: "c1",
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual({
      id: expect.any(Number),
      title: "newJob",
      salary: 100000,
      equity: "0.05",
      companyHandle: "c1",
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE title = 'newJob'`
    );
    expect(result.rows).toEqual([
      {
        id: expect.any(Number),
        title: "newJob",
        salary: 100000,
        equity: "0.05",
        company_handle: "c1",
      },
    ]);
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
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
    ]);
  });

  test("works: filter by min salary", async function () {
    let jobs = await Job.findAll({ minSalary: 60000 });
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "Job2",
        salary: 60000,
        equity: "0.02",
        companyHandle: "c2",
      },
    ]);
  });

  test("works: filter by equity", async function () {
    let jobs = await Job.findAll({ hasEquity: true });
    expect(jobs).toEqual([
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
    ]);
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let job = await Job.get(1);
    expect(job).toEqual({
      id: 1,
      title: "Job1",
      salary: 50000,
      equity: "0.01",
      companyHandle: "c1",
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(9999);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    title: "Updated Job",
    salary: 70000,
    equity: "0.03",
  };

  test("works", async function () {
    let job = await Job.update(1, updateData);
    expect(job).toEqual({
      id: 1,
      title: "Updated Job",
      salary: 70000,
      equity: "0.03",
      companyHandle: "c1",
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE id = 1`
    );
    expect(result.rows).toEqual([
      {
        id: 1,
        title: "Updated Job",
        salary: 70000,
        equity: "0.03",
        company_handle: "c1",
      },
    ]);
  });

  test("not found if no such job", async function () {
    try {
      await Job.update(9999, updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update(1, {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove(1);
    const res = await db.query(
      "SELECT id FROM jobs WHERE id=1"
    );
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(9999);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});