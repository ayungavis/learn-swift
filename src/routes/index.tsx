import { createFileRoute, Link } from '@tanstack/react-router';
import { HomeLayout } from 'fumadocs-ui/layouts/home';

import { baseOptions } from '@/lib/layout.shared';
import { PLAYGROUNDS } from '@/playgrounds/registry';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home(): React.JSX.Element {
  return (
    <HomeLayout {...baseOptions()}>
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 py-16 sm:px-8 sm:py-24">
        <section className="max-w-3xl">
          <p className="mb-4 text-sm font-semibold text-fd-primary">React mental model, native SwiftUI</p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
            Learn layout by changing it.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-fd-muted-foreground">
            Read the native API, adjust a live browser simulation, and copy the equivalent
            VStack or HStack code into your SwiftUI project.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="rounded-lg bg-fd-primary px-4 py-2.5 text-sm font-semibold text-fd-primary-foreground"
              to="/docs/$"
              params={{ _splat: '' }}
            >
              Read the documentation
            </Link>
            <a
              className="rounded-lg border border-fd-border px-4 py-2.5 text-sm font-semibold"
              href="#playgrounds"
            >
              Browse playgrounds
            </a>
          </div>
        </section>

        <section className="mt-24" id="playgrounds">
          <div className="mb-8">
            <p className="text-sm font-semibold text-fd-primary">Playgrounds</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Practice one concept at a time.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {PLAYGROUNDS.map((playground) => (
              <Link
                className="group rounded-xl border border-fd-border bg-fd-card p-6 transition-colors hover:border-fd-primary"
                key={playground.slug}
                to="/playgrounds/$slug"
                params={{ slug: playground.slug }}
              >
                <h3 className="text-xl font-semibold group-hover:text-fd-primary">{playground.title}</h3>
                <p className="mt-2 leading-7 text-fd-muted-foreground">{playground.description}</p>
                <span className="mt-5 inline-block text-sm font-semibold text-fd-primary">Open playground →</span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </HomeLayout>
  );
}
