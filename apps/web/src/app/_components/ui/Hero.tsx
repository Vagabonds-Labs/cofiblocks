"use client";

import React, { useState } from "react";
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
    buttonOnClick(searchTerm);
  };

  return (
    <div
      className="mb-10 h-2/4 bg-cover bg-center"
      style={{
        backgroundImage: "url('/images/bg.webp')",
      }}
    >
      <div className="flex h-full flex-col items-center justify-center bg-black bg-opacity-50 p-4">
        <h1 className="text-center text-5xl font-bold text-white">{title}</h1>
        <p className="mt-4 text-center text-xl text-white">{description}</p>
        <div className="mt-8 flex w-full max-w-md flex-row items-center justify-center gap-3">
          <input
            type="text"
            placeholder="Buscar..."
            className="input input-bordered w-full max-w-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button onClick={handleSearchClick}>{buttonText}</Button>
        </div>
      </div>
    </div>
  );
}

export default Hero;
