export default function Loading() {
  return (
    <div className="flex-center py-20">
      <div className="relative size-12">
        <div className="absolute inset-0 rounded-full border-4 border-app-green/20" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-app-green animate-spin" />
      </div>
    </div>
  );
}
