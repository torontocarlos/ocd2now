import { describe, it, expect, vi, beforeEach } from "vitest";

// Regression coverage for the ERR_TOO_MANY_REDIRECTS bug fixed in
// 9a83dab: when the auth.users INSERT trigger doesn't produce an
// ocd_users row, getCurrentUser must bootstrap one rather than return
// null (which made /welcome bounce to / and back).

type Fixture = {
  user: { id: string; email: string | null } | null;
  initialOcdUser: { id: string; email: string; onboarded_at: string | null } | null;
  insertedOcdUser: { id: string; email: string; onboarded_at: string | null } | null;
};

let FIXTURE: Fixture;
let insertCalls: Array<{ id: string; email: string }>;

vi.mock("../supabase/server", () => ({
  createClient: () => ({
    auth: {
      getUser: () => Promise.resolve({ data: { user: FIXTURE.user }, error: null }),
    },
    from(_table: string) {
      let isInsert = false;
      let insertPayload: { id: string; email: string } | null = null;

      const builder: any = {
        select() {
          return builder;
        },
        eq() {
          return builder;
        },
        insert(payload: { id: string; email: string }) {
          isInsert = true;
          insertPayload = payload;
          insertCalls.push(payload);
          return builder;
        },
        maybeSingle() {
          if (isInsert) {
            // Mimic the row Postgres returns after an insert. If the test
            // configured insertedOcdUser, return it; otherwise null.
            return Promise.resolve({
              data: FIXTURE.insertedOcdUser,
              error: null,
            });
          }
          return Promise.resolve({
            data: FIXTURE.initialOcdUser,
            error: null,
          });
        },
      };

      return builder;
    },
  }),
}));

import { getCurrentUser } from "./getCurrentUser";

describe("getCurrentUser", () => {
  beforeEach(() => {
    insertCalls = [];
    FIXTURE = {
      user: null,
      initialOcdUser: null,
      insertedOcdUser: null,
    };
  });

  it("returns null when there is no auth user", async () => {
    FIXTURE.user = null;
    const me = await getCurrentUser();
    expect(me).toBeNull();
    expect(insertCalls).toHaveLength(0);
  });

  it("returns the existing ocd_users row when one exists", async () => {
    FIXTURE.user = { id: "u1", email: "a@b.co" };
    FIXTURE.initialOcdUser = {
      id: "u1",
      email: "a@b.co",
      onboarded_at: "2026-05-01T00:00:00Z",
    };
    const me = await getCurrentUser();
    expect(me?.authId).toBe("u1");
    expect(me?.email).toBe("a@b.co");
    expect(me?.ocdUser.onboarded_at).toBe("2026-05-01T00:00:00Z");
    expect(insertCalls).toHaveLength(0);
  });

  it("self-heals: when the trigger didn't fire, inserts a row and returns it", async () => {
    FIXTURE.user = { id: "u-new", email: "new@example.com" };
    FIXTURE.initialOcdUser = null;
    FIXTURE.insertedOcdUser = {
      id: "u-new",
      email: "new@example.com",
      onboarded_at: null,
    };

    const me = await getCurrentUser();

    expect(insertCalls).toEqual([{ id: "u-new", email: "new@example.com" }]);
    expect(me?.authId).toBe("u-new");
    expect(me?.email).toBe("new@example.com");
    expect(me?.ocdUser.onboarded_at).toBeNull();
  });

  it("returns null if even the bootstrap insert produces no row", async () => {
    // Belt-and-suspenders: if the insert silently fails (RLS, etc.), we
    // still return null rather than throwing — the page-level redirect
    // handles the rest. This is the only branch that can still produce
    // null for an authenticated user.
    FIXTURE.user = { id: "u-stuck", email: "stuck@example.com" };
    FIXTURE.initialOcdUser = null;
    FIXTURE.insertedOcdUser = null;

    const me = await getCurrentUser();
    expect(me).toBeNull();
  });

  it("falls back to ocdUser.email if auth user has no email", async () => {
    FIXTURE.user = { id: "u1", email: null };
    FIXTURE.initialOcdUser = {
      id: "u1",
      email: "fallback@example.com",
      onboarded_at: null,
    };
    const me = await getCurrentUser();
    expect(me?.email).toBe("fallback@example.com");
  });
});
