export default function AdminLoading() {
  return (
    <div className="p-8 lg:p-12 space-y-10 animate-pulse">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="h-10 w-64 bg-white/5 rounded-2xl"></div>
          <div className="h-6 w-96 bg-white/5 rounded-xl"></div>
        </div>
        <div className="h-12 w-32 bg-white/5 rounded-2xl"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-white/5 rounded-[32px]"></div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="h-96 bg-white/5 rounded-[40px]"></div>
        <div className="h-96 bg-white/5 rounded-[40px]"></div>
      </div>
    </div>
  );
}
