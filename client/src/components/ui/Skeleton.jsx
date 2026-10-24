export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse">
      <div className="h-4 bg-slate-200 rounded-lg w-1/3 mb-3"/>
      <div className="h-8 bg-slate-200 rounded-lg w-1/2 mb-2"/>
      <div className="h-3 bg-slate-100 rounded-lg w-2/3"/>
    </div>
  );
}

export function SkeletonRow({ cols = 6 }) {
  return (
    <tr className="animate-pulse">
      {Array(cols).fill(0).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-slate-200 rounded-lg"/>
        </td>
      ))}
    </tr>
  );
}

export function SkeletonTable({ rows = 5, cols = 6 }) {
  return (
    <>
      {Array(rows).fill(0).map((_, i) => (
        <SkeletonRow key={i} cols={cols} />
      ))}
    </>
  );
}
