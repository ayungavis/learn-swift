import { Link } from '@tanstack/react-router';

export function NotFound(): React.JSX.Element {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm font-semibold text-fd-muted-foreground">404</p>
      <h1 className="text-3xl font-semibold tracking-tight">This page does not exist.</h1>
      <Link className="text-fd-primary underline underline-offset-4" to="/">
        Return to SwiftUI Layout Lab
      </Link>
    </main>
  );
}
