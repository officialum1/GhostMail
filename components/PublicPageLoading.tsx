import PageLayout from '@/components/PageLayout';

export default function PublicPageLoading() {
  return (
    <PageLayout>
      <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-6 py-24">
        <div className="w-full max-w-3xl space-y-6 rounded-[28px] border border-white/10 bg-white/5 p-8 backdrop-blur">
          <div className="h-4 w-36 animate-pulse rounded-full bg-white/10" />
          <div className="h-10 w-2/3 animate-pulse rounded-full bg-white/10" />
          <div className="h-4 w-full animate-pulse rounded-full bg-white/10" />
          <div className="h-4 w-5/6 animate-pulse rounded-full bg-white/10" />
          <div className="grid gap-4 md:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-3xl border border-white/10 bg-white/5"
              />
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
