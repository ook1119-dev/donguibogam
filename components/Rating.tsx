import { StarIcon } from "@phosphor-icons/react/ssr";

export default function Rating({ rating, count }: { rating: number; count: number }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-0.5">
      <StarIcon size={15} weight="fill" className="text-[#FAB005]" />
      <span className="font-semibold text-ink">{rating.toFixed(1)}</span>
      <span className="text-gray-400">({count})</span>
    </span>
  );
}
