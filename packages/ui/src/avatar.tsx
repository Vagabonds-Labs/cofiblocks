import { createAvatar } from '@dicebear/core';
import { lorelei } from '@dicebear/collection';
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Default configuration for DiceBear avatars
const AVATAR_CONFIG = {
  backgroundColor: ['b6e3f4','c0aede','d1d4f9'],
  size: 32,
}

// Types
interface AvatarProps {
  address: string;
  size?: number;
  className?: string;
}

// Fallback component for loading and error states
const AvatarFallback = ({ size = 32, className = '' }: { size?: number, className?: string }) => (
  <div 
    className={`bg-gray-200 animate-pulse rounded-full ${className}`}
    style={{ width: size, height: size }}
  />
);

// Main Avatar component with client-side only rendering
const Avatar = dynamic<AvatarProps>(() => {
  const AvatarComponent = ({ address, size = 32, className = '' }: AvatarProps) => {
    const [avatarSvg, setAvatarSvg] = useState<string | null>(null);
    const [error, setError] = useState<boolean>(false);

    useEffect(() => {
      if (!address) {
        setError(true);
        return;
      }

      try {
        const avatar = createAvatar(lorelei, {
          ...AVATAR_CONFIG,
          seed: address.toLowerCase(),
          size: size,
        });

        setAvatarSvg(avatar.toString());
      } catch (err) {
        console.error('Failed to generate avatar:', err);
        setError(true);
      }
    }, [address, size]);

    if (error) {
      return <AvatarFallback size={size} className={className} />;
    }

    if (!avatarSvg) {
      return <AvatarFallback size={size} className={className} />;
    }

    return (
      <div 
        className={`rounded-full overflow-hidden ${className}`}
        style={{ width: size, height: size }}
        dangerouslySetInnerHTML={{ __html: avatarSvg }}
      />
    );
  };

  return AvatarComponent;
}, {
  ssr: false,
  loading: ({ size = 32, className = '' }) => <AvatarFallback size={size} className={className} />,
});

export default Avatar;