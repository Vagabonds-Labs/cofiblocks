"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import React, { useState, type KeyboardEvent } from "react";
import Button from "./Button";

interface HeroProps {
	title: string;
	description: string;
	buttonText: string;
	buttonOnClick: (searchTerm: string) => void;
}

function Hero({ title, description, buttonText, buttonOnClick }: HeroProps) {
	const [searchTerm, setSearchTerm] = useState("");

	const handleSearchClick = () => {
		if (searchTerm.trim()) {
			buttonOnClick(searchTerm.trim());
		}
	};

	const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			handleSearchClick();
		}
	};

	return (
		<section
			className="mb-10 min-h-[50vh] bg-cover bg-center bg-no-repeat"
			style={{
				backgroundImage: "url('/images/bg.webp')",
			}}
		>
			<div className="flex min-h-[50vh] flex-col items-center justify-center bg-black bg-opacity-50 p-4 text-white">
				<h1 className="text-center text-3xl font-bold sm:text-4xl md:text-5xl lg:text-6xl">
					{title}
				</h1>
				<p className="mt-4 max-w-2xl text-center text-base sm:text-lg md:text-xl lg:text-2xl">
					{description}
				</p>
				<div className="mt-8 flex w-full max-w-md flex-col items-center justify-center gap-3 sm:flex-row">
					<div className="relative w-full max-w-xs">
						<input
							type="text"
							placeholder="Buscar..."
							aria-label="Search input"
							className="input input-bordered w-full pl-10 pr-4"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							onKeyPress={handleKeyPress}
						/>
						<MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
					</div>
					<Button onClick={handleSearchClick}>{buttonText}</Button>
				</div>
			</div>
		</section>
	);
}

export default Hero;
