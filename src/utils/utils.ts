import { IncomingMessage, ServerResponse } from "http";
import User from "../types/user.ts";
import { parse } from "url";

export function isUuid(userId: string) {
  const uuidv1Regex =
    /^[0-9A-F]{8}-[0-9A-F]{4}-[1][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
  const result = userId.match(uuidv1Regex);
  return result;
}

export function incorrectPath(res: ServerResponse) {
  res.writeHead(404, { "Content-Type": "application/json" });
  res.statusMessage = "Incorrect path. path starts with: /api/users";
  return res.end(JSON.stringify(res.statusMessage));
}

export function getDataFromReq(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      resolve(data);
    });
    req.on("error", (error) => {
      reject(error);
    });
  });
}

export function getPathName(req: IncomingMessage) {
  const parsedUrl = parse(req.url || "", true);
  return parsedUrl?.pathname || null;
}

export function validateUser(user: User): {
  isValid: boolean;
  errors: string[];
} {
  const allowAndRequiredFields = ["username", "age", "hobbies"];
  const errors: string[] = [];
  const extraFields = Object.keys(user).filter(
    (key) => !allowAndRequiredFields.includes(key)
  );
  if (extraFields.length > 0) {
    errors.push(`Extra fields are not allowed: ${extraFields.join(",")}`);
  }
  for (const field of allowAndRequiredFields) {
    if (!(field in user)) {
      errors.push(`Field ${field} is required`);
    }
  }

  if (typeof user.username !== "string") {
    errors.push("Field username must be a string");
  }
  if (
    typeof user.age !== "number" ||
    !Number.isInteger(user.age) ||
    user.age < 0
  ) {
    errors.push("Field age must be a number");
  }
  if (
    !Array.isArray(user.hobbies) ||
    !user.hobbies.every((hobby) => typeof hobby === "string")
  ) {
    errors.push("Field 'hobbies' must be an array of strings.");
  }
  const isValid: boolean = errors.length === 0 ? true : false;
  return {
    isValid: isValid,
    errors: errors,
  };
}
