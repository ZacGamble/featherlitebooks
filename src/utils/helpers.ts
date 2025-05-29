export const getInitials = (name: string | undefined | null): string => {
  if (!name) return 'NN'; // Not Named or No Name
  const nameParts = name.trim().split(' ');
  if (nameParts.length === 1) {
    return nameParts[0].substring(0, 2).toUpperCase();
  }
  const firstInitial = nameParts[0][0] || '';
  const lastInitial = nameParts[nameParts.length - 1][0] || '';
  return `${firstInitial}${lastInitial}`.toUpperCase();
};

// Example: Generate a unique ID (could be replaced with a library like uuid)
export const generateLocalId = (): string => {
  return `id_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
}; 