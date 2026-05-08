import Link from "next/link";

export const metadata = {
  title: "Why this app — OCD2Now",
};

export default function WhyPage() {
  return (
    <main className="min-h-dvh px-6 py-16">
      <article className="w-full max-w-prose mx-auto space-y-6 text-ink">
        <Link
          href="/"
          className="text-sm text-muted hover:text-ink underline-offset-4 hover:underline"
        >
          Back
        </Link>

        <h1 className="font-display text-3xl md:text-4xl">
          Why this app is the way it is
        </h1>

        <p>Most apps want you to stay. We want you to leave.</p>

        <p>
          OCD lives in loops. The thought arrives. The discomfort follows. The
          brain offers a way to neutralize the discomfort &mdash; wash, check,
          count, review, reassure. The compulsion is brain activity, doing
          what brains do. None of it was chosen.
        </p>

        <p>
          Anything you <em>do</em> to feel better in response to an intrusive
          thought can be absorbed by the OCD logic and turned into another
          compulsion. This is the central trap, and it&rsquo;s why so many
          self-help tools, mindfulness practices, and grounding apps quietly
          worsen OCD over time. The user starts opening the app every time the
          thought comes. Doing the exercise correctly. Feeling relief. The
          brain learns: thought &rarr; app &rarr; relief. The compulsion has
          just changed costume.
        </p>

        <p>We built OCD2Now to resist this.</p>

        <p>
          Sessions are short &mdash; 60 to 90 seconds. They end definitively.
          There is nothing to complete. There are no streaks, no badges, no
          graphs. The app does not get more elaborate as you use it more
          &mdash; it gets quieter. If you open it many times in a day, the app
          will gently notice that with you. If you cross a threshold, it will
          suggest you reach out to a person, not the app.
        </p>

        <p>
          The experiences inside are not techniques. They are sensory
          invitations. Sounds were already happening. Your eyes were already
          moving. The breath was already breathing itself. The app is just a
          quiet space to turn and notice.
        </p>

        <p>
          The framing matters. All tendencies &mdash; to do, to not do, to
          try, to control, even the reaching for this app &mdash; are
          involuntary brain processes. The brain is braining. Awareness
          unfolds on its own. The not-acting on a thought is also involuntary.
          There is nothing to do correctly because there is nothing being
          done.
        </p>

        <p>
          This app cannot replace evidence-based OCD treatment. Exposure and
          Response Prevention (ERP) and, in many cases, medication remain
          first-line care. If you have not had access to ERP, you should
          &mdash; and the bottom of this page links to resources.
        </p>

        <p>
          What this app <em>is</em> is a small piece of a larger practice
          called Presence Therapy. If something here lands for you,
          there&rsquo;s a fuller version &mdash; group sessions, in person, in
          Ajax, OHIP-covered. The link below opens that door, when
          you&rsquo;re ready.
        </p>

        <ul className="space-y-2 pt-4">
          <li>
            <a
              href="https://presencetherapy.ca/ocd"
              target="_blank"
              rel="noreferrer"
              className="underline-offset-4 underline text-accent hover:text-ink"
            >
              Learn more about Presence Therapy &rarr;
            </a>
          </li>
          <li>
            <a
              href="https://presencetherapy.ca/ocd-for-clinicians"
              target="_blank"
              rel="noreferrer"
              className="underline-offset-4 underline text-accent hover:text-ink"
            >
              ERP and OCD resources &rarr;
            </a>
          </li>
        </ul>
      </article>
    </main>
  );
}
