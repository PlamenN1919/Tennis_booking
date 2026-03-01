export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-emerald-900 border-t-[#c6f135] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/40 text-sm">Зареждане...</p>
      </div>
    </div>
  );
}
