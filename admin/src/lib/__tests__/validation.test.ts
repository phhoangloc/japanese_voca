import { describe, expect, it } from "vitest";
import {
  validateAdmin,
  validateChapter,
  validateCourse,
  validateCustomer,
  validateFile,
  validateWord,
} from "../validation";

describe("validateAdmin", () => {
  const base = { username: "root", email: "root@example.com", password: "secret" };

  it("passes a complete create form", () => {
    expect(validateAdmin(base, false)).toEqual({});
  });

  it("requires username, email and password on create", () => {
    const errors = validateAdmin(
      { username: "", email: "", password: "" },
      false,
    );
    expect(errors).toHaveProperty("username");
    expect(errors).toHaveProperty("email");
    expect(errors).toHaveProperty("password");
  });

  it("rejects a malformed email", () => {
    expect(validateAdmin({ ...base, email: "nope" }, false)).toHaveProperty(
      "email",
    );
  });

  it("allows a blank password when editing", () => {
    expect(validateAdmin({ ...base, password: "" }, true)).toEqual({});
  });
});

describe("validateCustomer", () => {
  const base = {
    username: "cust",
    email: "c@example.com",
    password: "pw",
    point: "10",
    adminId: "3",
  };

  it("passes a complete form", () => {
    expect(validateCustomer(base, false)).toEqual({});
  });

  it("requires a positive adminId", () => {
    expect(validateCustomer({ ...base, adminId: "" }, false)).toHaveProperty(
      "adminId",
    );
    expect(validateCustomer({ ...base, adminId: "0" }, false)).toHaveProperty(
      "adminId",
    );
  });

  it("rejects a negative or non-integer point", () => {
    expect(validateCustomer({ ...base, point: "-1" }, false)).toHaveProperty(
      "point",
    );
    expect(validateCustomer({ ...base, point: "1.5" }, false)).toHaveProperty(
      "point",
    );
  });

  it("accepts an empty point (defaults server-side)", () => {
    expect(validateCustomer({ ...base, point: "" }, false)).toEqual({});
  });

  it("allows a blank password when editing", () => {
    expect(validateCustomer({ ...base, password: "" }, true)).toEqual({});
  });
});

describe("validateFile", () => {
  it("requires a name", () => {
    expect(validateFile({ name: "", detail: "" })).toHaveProperty("name");
    expect(validateFile({ name: "logo", detail: "" })).toEqual({});
  });
});

describe("validateWord", () => {
  it("requires the word", () => {
    expect(validateWord({ word: "", explain: "" })).toHaveProperty("word");
    expect(validateWord({ word: "   ", explain: "x" })).toHaveProperty("word");
  });

  it("passes with a word (explain optional)", () => {
    expect(validateWord({ word: "ephemeral", explain: "" })).toEqual({});
    expect(validateWord({ word: "ephemeral", explain: "short-lived" })).toEqual(
      {},
    );
  });
});

describe("validateCourse", () => {
  it("requires a name", () => {
    expect(validateCourse({ name: "" })).toHaveProperty("name");
    expect(validateCourse({ name: "Beginner" })).toEqual({});
  });
});

describe("validateChapter", () => {
  const base = { number: "1", name: "Greetings", courseId: "3" };

  it("passes a complete form", () => {
    expect(validateChapter(base)).toEqual({});
  });

  it("requires a non-negative integer number", () => {
    expect(validateChapter({ ...base, number: "" })).toHaveProperty("number");
    expect(validateChapter({ ...base, number: "-1" })).toHaveProperty("number");
    expect(validateChapter({ ...base, number: "1.5" })).toHaveProperty("number");
  });

  it("requires name and a positive courseId", () => {
    expect(validateChapter({ ...base, name: "" })).toHaveProperty("name");
    expect(validateChapter({ ...base, courseId: "" })).toHaveProperty("courseId");
    expect(validateChapter({ ...base, courseId: "0" })).toHaveProperty(
      "courseId",
    );
  });
});
