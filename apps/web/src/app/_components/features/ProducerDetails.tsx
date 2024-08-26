interface Producer {
	id: number;
	name: string;
	location: string;
	description: string;
}

interface ProducerDetailsProps {
	producer: Producer;
}

export default function ProducerDetails({ producer }: ProducerDetailsProps) {
	return (
		<div className="mb-8">
			<h1 className="text-3xl font-bold mb-4">{producer.name}</h1>
			<p className="text-lg mb-2">Location: {producer.location}</p>
			<p className="text-gray-700">{producer.description}</p>
		</div>
	);
}
