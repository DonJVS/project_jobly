test("config can come from env", function () {
  // Set environment variables
  process.env.SECRET_KEY = "abc";
  process.env.PORT = "5000";
  process.env.DATABASE_USER = "testuser";
  process.env.DATABASE_PASSWORD = "testpassword";
  process.env.DATABASE_HOST = "localhost";
  process.env.DATABASE_PORT = "5432";
  process.env.DATABASE_NAME = "other"; // This should match your expected value
  process.env.TEST_DATABASE_NAME = "other_test"; // For test environment

  // Require the config after setting the env variables to ensure they are used
  const config = require("./config");

  expect(config.SECRET_KEY).toEqual("abc");
  expect(config.PORT).toEqual(5000);
  
  // Since you're running in test mode, this will return the test database URI
  expect(config.getDatabaseUri()).toEqual("postgresql://testuser:testpassword@localhost:5432/other_test");
  
  expect(config.BCRYPT_WORK_FACTOR).toEqual(1); // Since NODE_ENV is "test"

  // Clean up environment variables after the test
  delete process.env.SECRET_KEY;
  delete process.env.PORT;
  delete process.env.DATABASE_USER;
  delete process.env.DATABASE_PASSWORD;
  delete process.env.DATABASE_HOST;
  delete process.env.DATABASE_PORT;
  delete process.env.DATABASE_NAME;
  delete process.env.TEST_DATABASE_NAME;
});

