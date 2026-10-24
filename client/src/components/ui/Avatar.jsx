import { getInitials } from "../../utils";

const colors = [
  "bg-violet-500","bg-indigo-500","bg-blue-500","bg-emerald-500",
  "bg-pink-500","bg-amber-500","bg-teal-500","bg-rose-500",
];

export default function Avatar({ name = "", src, size = "md" }) {
  const sizes = { sm:"w-8 h-8 text-xs", md:"w-10 h-10 text-sm", lg:"w-14 h-14 text-base", xl:"w-20 h-20 text-xl" };
  const color = colors[name.charCodeAt(0) % colors.length];
  if (src) return <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover ring-2 ring-white`}/>;
  return (
    <div className={`${sizes[size]} ${color} rounded-full flex items-center justify-center text-white font-bold ring-2 ring-white`}>
      {getInitials(name)}
    </div>
  );
}
