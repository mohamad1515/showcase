import test from "node:test";
import assert from "node:assert/strict";
import {
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import type { UserService } from "../user/user.service";
import { SessionService } from "./session.service";

interface Row {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: number;
}

const SECRET = "test-secret-with-enough-length-0123456789";

function makeRows(): Row[] {
  return [
    { id: 1, name: "Admin", email: "admin@test.dev", role: "ADMIN", is_active: 1 },
    { id: 2, name: "Sara", email: "sara@test.dev", role: "USER", is_active: 1 },
    { id: 3, name: "Off", email: "off@test.dev", role: "USER", is_active: 0 },
  ];
}

function makeUsers(rows: Row[]) {
  return {
    async findById(id: number) {
      const row = rows.find((item) => item.id === id);
      if (!row) throw new NotFoundException("User not found");
      return row;
    },
  } as unknown as UserService;
}

/** The service reads its configuration once, in the constructor. */
function createService(
  rows: Row[] = makeRows(),
  env: Record<string, string | undefined> = {},
) {
  const values = { NODE_ENV: undefined, JWT_SECRET: SECRET, JWT_EXPIRY: "1h", ...env };
  const previous = Object.fromEntries(
    Object.keys(values).map((key) => [key, process.env[key]]),
  );
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  try {
    return new SessionService(makeUsers(rows));
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

const req = (token?: string) => ({
  headers: token ? { authorization: `Bearer ${token}` } : {},
});

async function rejects(
  promise: Promise<unknown>,
  type: new (...args: never[]) => Error,
  message: string,
) {
  await assert.rejects(promise, (error: Error) => {
    assert.ok(error instanceof type, `expected ${type.name}, got ${error.constructor.name}`);
    assert.equal(error.message, message);
    return true;
  });
}

test("a signed token resolves to the user, with role and active state from the database", async () => {
  const session = createService();
  const user = await session.requireUser(req(session.signToken(2)));
  assert.deepEqual(user, {
    id: 2,
    name: "Sara",
    email: "sara@test.dev",
    role: "USER",
    isActive: true,
  });
});

test("no token, or a non-Bearer header, is rejected with 401", async () => {
  const session = createService();
  await rejects(session.requireUser(req()), UnauthorizedException, "Please sign in first.");
  await rejects(
    session.requireUser({ headers: { authorization: `Basic ${session.signToken(2)}` } }),
    UnauthorizedException,
    "Please sign in first.",
  );
});

test("forged, tampered and foreign tokens are rejected", async () => {
  const session = createService();
  const valid = session.signToken(2);
  const [payload, signature] = valid.split(".");
  const forgedPayload = Buffer.from(
    JSON.stringify({ sub: 1, exp: Date.now() + 3_600_000 }),
  ).toString("base64url");
  const otherSecret = createService(makeRows(), { JWT_SECRET: "another-secret-entirely-0123456789ab" });

  const bad: Record<string, string> = {
    "old unsigned base64 token": Buffer.from(`1:${Date.now()}`).toString("base64"),
    "garbage": "abc.def.ghi",
    "one part only": payload,
    "tampered signature": `${payload}.${signature.slice(0, -2)}AA`,
    "payload swapped to the admin id, old signature": `${forgedPayload}.${signature}`,
    "signed with a different secret": otherSecret.signToken(2),
  };
  for (const [label, token] of Object.entries(bad)) {
    await rejects(
      session.requireUser(req(token)),
      UnauthorizedException,
      "Invalid session.",
    );
    assert.equal(await session.optionalUser(req(token)), null, label);
  }
});

test("tokens expire after JWT_EXPIRY", async (t) => {
  const session = createService(makeRows(), { JWT_EXPIRY: "1h" });
  const token = session.signToken(2);
  const start = Date.now();

  t.mock.method(Date, "now", () => start + 59 * 60_000);
  assert.equal((await session.requireUser(req(token))).id, 2);

  t.mock.method(Date, "now", () => start + 61 * 60_000);
  await rejects(session.requireUser(req(token)), UnauthorizedException, "Invalid session.");
});

test("a valid token for a user that no longer exists is rejected", async () => {
  const session = createService();
  await rejects(session.requireUser(req(session.signToken(99))), UnauthorizedException, "Invalid session.");
});

test("a disabled user is rejected even with a valid token", async () => {
  const session = createService();
  await rejects(session.requireUser(req(session.signToken(3))), UnauthorizedException, "Your account is disabled.");
  assert.equal(await session.optionalUser(req(session.signToken(3))), null);
});

test("requireAdmin: USER gets 403, anonymous gets 401, ADMIN passes", async () => {
  const session = createService();
  await rejects(session.requireAdmin(req(session.signToken(2))), ForbiddenException, "Admin access required.");
  await rejects(session.requireAdmin(req()), UnauthorizedException, "Please sign in first.");
  assert.equal((await session.requireAdmin(req(session.signToken(1)))).role, "ADMIN");
});

test("the role is read from the database on every request, not from the token", async () => {
  const rows = makeRows();
  const session = createService(rows);
  const adminToken = session.signToken(1);
  assert.equal((await session.requireAdmin(req(adminToken))).id, 1);

  rows[0].role = "USER"; // demoted after the token was issued
  await rejects(session.requireAdmin(req(adminToken)), ForbiddenException, "Admin access required.");

  rows[1].role = "ADMIN"; // promoted after the token was issued
  assert.equal((await session.requireAdmin(req(session.signToken(2)))).role, "ADMIN");
});

test("optionalUser returns null without a valid session and never throws", async () => {
  const session = createService();
  assert.equal(await session.optionalUser(req()), null);
  assert.equal(await session.optionalUser(req("junk")), null);
  assert.equal((await session.optionalUser(req(session.signToken(2))))?.id, 2);
});

test("startup configuration: secret is required in production and JWT_EXPIRY is validated", () => {
  assert.throws(
    () => createService(makeRows(), { NODE_ENV: "production", JWT_SECRET: undefined }),
    /JWT_SECRET must be set/,
  );
  assert.doesNotThrow(() => createService(makeRows(), { NODE_ENV: "production" }));
  assert.throws(
    () => createService(makeRows(), { JWT_EXPIRY: "banana" }),
    /Invalid JWT_EXPIRY "banana"/,
  );
  for (const expiry of ["30s", "15m", "24h", "7d"]) {
    assert.doesNotThrow(() => createService(makeRows(), { JWT_EXPIRY: expiry }), expiry);
  }
});
