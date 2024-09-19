import Button from "@repo/ui/button";
import { ArrowRightIcon } from "@heroicons/react/24/solid";

interface NFTCardProps {
  title: string;
  onDetailsClick?: () => void;
}

function NFTCard({ title, onDetailsClick }: NFTCardProps) {
  return (
    <div className="inline-flex h-47 w-36 flex-col items-start justify-between rounded-br-2xl rounded-tr-2xl bg-surface-primary-soft px-4 py-4 pl-6">
      <div className="inline-flex w-full items-start justify-start gap-1">
        <h2 className="text-content-title font-manrope text-2xl font-bold leading-[2.125rem]">
          {title}
        </h2>
      </div>
      <div className="inline-flex items-center justify-start gap-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={onDetailsClick}
          className="flex items-center gap-2"
        >
          Details
          <ArrowRightIcon className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

export default NFTCard;