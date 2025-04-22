import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get user avatar URL from various sources, prioritizing Discord if available
 */
export const getUserAvatar = (user: any) => {
  // If user has Discord data with avatar
  if (user?.discord?.id && user?.discord?.avatar) {
    return `https://cdn.discordapp.com/avatars/${user.discord.id}/${user.discord.avatar}.png`;
  }
  
  // If user has a custom avatar URL
  if (user?.avatarUrl) {
    return user.avatarUrl;
  }
  
  // Default avatar - you can replace this with your app's default avatar
  return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.name || 'User');
};
