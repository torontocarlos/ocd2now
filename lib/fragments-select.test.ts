import { describe, it, expect, vi, beforeEach } from "vitest";

// Mocked DB shape for selection tests. selectFragment only reads
// ocd_users.last_invitation_id and the past 7 days of
// ocd_sessions.invitation_id. Everything else (which fragments exist,
// durations, kinds) is in code under lib/fragments.ts.

type Fixture = {
  user: { id: string; last_invitation_id: number | null };
  recentSessions: { invitation_id: number | null }[];
};

let FIXTURE: Fixture;

// `server-only` throws at import time in a non-Next runtime; stub it so
// the unit under test can be loaded by vitest.
vi.mock("server-only", () => ({}));

vi.mock("./supabase/server", () => ({
  createClient: () => ({
    from(table: string) {
      const builder: any = {
        select() {
          return builder;
        },
        eq() {
          return builder;
        },
        gte() {
          return builder;
        },
        single() {
          return Promise.resolve({ data: FIXTURE.user, error: null });
        },
        then(resolve: (v: { data: unknown; error: null }) => void) {
          if (table === "ocd_sessions") {
            resolve({ data: FIXTURE.recentSessions, error: null });
            return;
          }
          resolve({ data: null, error: null });
        },
      };
      return builder;
    },
  }),
}));

import { selectFragment } from "./fragments-select";
import { listFragments } from "./fragments";

describe("selectFragment", () => {
  beforeEach(() => {
    FIXTURE = {
      user: { id: "u1", last_invitation_id: null },
      recentSessions: [],
    };
  });

  it("returns one of the fragment ids in the registry", async () => {
    const f = await selectFragment("u1");
    const allIds = listFragments().map((x) => x.id);
    expect(allIds).toContain(f.id);
  });

  it("never returns the user's last_invitation_id (works for invitations and still-text alike)", async () => {
    FIXTURE.user.last_invitation_id = 3;
    for (let i = 0; i < 50; i++) {
      const f = await selectFragment("u1");
      expect(f.id).not.toBe(3);
    }

    FIXTURE.user.last_invitation_id = 102;
    for (let i = 0; i < 50; i++) {
      const f = await selectFragment("u1");
      expect(f.id).not.toBe(102);
    }
  });

  it("can return a still-text fragment when the invitations have been heavily used", async () => {
    // Pile recent counts onto every invitation. The least-used third
    // should include still-text fragments (which have count = 0).
    for (const id of [1, 2, 3, 4, 5, 6, 7, 8]) {
      for (let i = 0; i < 5; i++) {
        FIXTURE.recentSessions.push({ invitation_id: id });
      }
    }

    const stillTextIds = listFragments()
      .filter((f) => f.kind === "still-text")
      .map((f) => f.id);

    let sawStillText = false;
    for (let i = 0; i < 30; i++) {
      const f = await selectFragment("u1");
      if (stillTextIds.includes(f.id)) {
        sawStillText = true;
        break;
      }
    }
    expect(sawStillText).toBe(true);
  });

  it("returns something valid when last_invitation_id is set", async () => {
    FIXTURE.user.last_invitation_id = 1;
    const f = await selectFragment("u1");
    expect(f.id).not.toBe(1);
  });
});
