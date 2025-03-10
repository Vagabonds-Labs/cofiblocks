"use client";

import SkeletonLoader from "@repo/ui/skeleton";

function App() {
	return (
		<div className="flex items-center justify-center min-h-screen">
			<div className="flex flex-col space-y-4">
				<SkeletonLoader />
			</div>
		</div>
	);
}

export default App;
