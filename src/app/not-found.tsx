import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 lg:px-8">
      <h1 className="text-6xl font-extrabold text-slate-900 dark:text-slate-100">404</h1>
      <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
        This page could not be found.
      </p>
      <div className="mt-8">
        <Link
          href="/"
          className="inline-flex items-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
