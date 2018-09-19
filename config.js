"use strict";
exports.DATABASE_URL =
  process.env.DATABASE_URL ||
  "mongodb://jordan:jordan123@ds131151.mlab.com:31151/restful_blog_app";
exports.TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL || "mongodb://localhost/restful_blog_app";
exports.PORT = process.env.PORT || 3000;
