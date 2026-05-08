import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the server client BEFORE importing the unit under test.
type TableData = {
  ocd_invitations: { id: number; is_active: boolean }[];
  ocd_users: { id: string; last_invitation_id: number | null };
  ocd_sessions: { user_id: string; invitation_id: number; started_at: string }[];
};

let TABLE_DATA: TableData = {
  ocd_invitations: [],
  ocd_users: { id: "u1", last_invitation_id: null },
  ocd_sessions: [],
};

vi.mock("./supabase/server", () => ({
  createClient: () => makeFakeClient(),
}));

function makeFakeClient() {
  return {
    from(table: keyof TableData) {
      // Each `.from` chain returns an object that proxies select/eq/gte/single.
      // For our tests we don't need real filtering on user_id — the test
      // sets up exactly the data the code should see.
      const filters: { col: string; op: string; val: unknown }[] = [];

      const builder: any = {
        select() {
          return builder;
        },
        eq(col: string, val: unknown) {
          filters.push({ col, op: "eq", val });
          return builder;
        },
        gte(col: string, val: unknown) {
          filters.push({ col, op: "gte", val });
          return builder;
        },
        single() {
          if (table === "ocd_users") {
            return Promise.resolve({ data: TABLE_DATA.ocd_users, error: null });
          }
          return Promise.resolve({ data: null, error: null });
        },
        then(resolve: (value: { data: unknown; error: null }) => void) {
          if (table === "ocd_invitations") {
            const data = TABLE_DATA.ocd_invitations
              .filter((i) => i.is_active)
              .map((i) => ({ id: i.id }));
            resolve({ data, error: null });
            return;
          }
          if (table === "ocd_sessions") {
            const data = TABLE_DATA.ocd_sessions.map((s) => ({
              invitation_id: s.invitation_id,
            }));
            resolve({ data, error: null });
            return;
          }
          resolve({ data: null, error: null });
        },
      };

      return builder;
    },
  };
}

import { selectInvitation } from "./invitations";

describe("selectInvitation", () => {
  beforeEach(() => {
    TABLE_DATA = {
      ocd_invitations: Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        is_active: true,
      })),
      ocd_users: { id: "u1", last_invitation_id: null },
      ocd_sessions: [],
    };
  });

  it("returns one of the active invitation ids", async () => {
    const id = await selectInvitation("u1");
    expect([1, 2, 3, 4, 5, 6, 7, 8]).toContain(id);
  });

  it("never returns the user's last_invitation_id", async () => {
    TABLE_DATA.ocd_users.last_invitation_id = 3;
    for (let i = 0; i < 50; i++) {
      const id = await selectInvitation("u1");
      expect(id).not.toBe(3);
    }
  });

  it("prefers least-used invitations from the past 7 days", async () => {
    // Use ids 1, 2, 3 a lot. ids 4-8 not at all. Pool is least-used third
    // = ceil(8/3) = 2; sorted ascending by count, the front of the pool
    // should be invitations with count=0 (4, 5, 6, 7, 8).
    const fixedIso = "2026-05-08T12:00:00.000Z";
    TABLE_DATA.ocd_sessions = [
      ...Array.from({ length: 5 }, () => ({
        user_id: "u1",
        invitation_id: 1,
        started_at: fixedIso,
      })),
      ...Array.from({ length: 5 }, () => ({
        user_id: "u1",
        invitation_id: 2,
        started_at: fixedIso,
      })),
      ...Array.from({ length: 5 }, () => ({
        user_id: "u1",
        invitation_id: 3,
        started_at: fixedIso,
      })),
    ];

    for (let i = 0; i < 50; i++) {
      const id = await selectInvitation("u1");
      expect(id).toBeGreaterThanOrEqual(4);
    }
  });

  it("falls back to the full set if filtering would leave nothing", async () => {
    // Single invitation; user's last_invitation_id matches it. Algorithm
    // must still return something.
    TABLE_DATA.ocd_invitations = [{ id: 1, is_active: true }];
    TABLE_DATA.ocd_users.last_invitation_id = 1;
    const id = await selectInvitation("u1");
    expect(id).toBe(1);
  });
});
