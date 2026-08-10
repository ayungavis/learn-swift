import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { HomeLayout } from 'fumadocs-ui/layouts/home';

import { baseOptions } from '@/lib/layout.shared';
import { getPlayground } from '@/playgrounds/registry';

export const Route = createFileRoute('/playgrounds/$slug')({
  beforeLoad: ({ params }) => {
    if (getPlayground(params.slug) === undefined) throw notFound();
  },
  component: PlaygroundPage,
});

function PlaygroundPage(): React.JSX.Element {
  const { slug } = Route.useParams();
  const playground = getPlayground(slug);
  if (playground === undefined) {
    throw new Error(`Registered playground disappeared after route validation: ${slug}.`);
  }

  const Playground = playground.component;

  return (
    <HomeLayout {...baseOptions()}>
      <main className="mx-auto w-full max-w-[1500px] flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-fd-primary">Interactive playground</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{playground.title}</h1>
            <p className="mt-3 max-w-2xl leading-7 text-fd-muted-foreground">{playground.description}</p>
          </div>
          <Link
            className="text-sm font-semibold text-fd-primary underline underline-offset-4"
            to="/docs/$"
            params={{ _splat: 'native-stacks' }}
          >
            Read the VStack/HStack guide
          </Link>
        </div>
        <Playground />
      </main>
    </HomeLayout>
  );
}
