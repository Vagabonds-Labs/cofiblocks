import { ArrowRightIcon } from "@heroicons/react/24/solid";
import Button from "@repo/ui/button";

interface NFTCardProps {
<<<<<<< HEAD
  title: string;
  imageUrl: string;
  description: string;
  onDetailsClick?: () => void;
}

function NFTCard({ title, imageUrl, description, onDetailsClick }: NFTCardProps) {
  return (
    <div className="inline-flex h-auto w-60 flex-col items-start justify-between rounded-br-2xl rounded-tr-2xl bg-surface-primary-soft p-6 shadow-lg">
      {/* Image */}
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-40 object-cover rounded-md mb-4"
      />

      {/* Title */}
      <div className="inline-flex w-full items-start justify-start gap-1 mb-2">
        <h2 className="text-content-title font-manrope text-2xl font-bold leading-[2.125rem]">
          {title}
        </h2>
      </div>

      {/* Description */}
      <p className="text-content-body text-sm mb-4">{description}</p>

      {/* Button */}
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
=======
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
>>>>>>> 752680a5b5f3fab3a993aec764e691bad9e177fa
}

export default NFTCard;
