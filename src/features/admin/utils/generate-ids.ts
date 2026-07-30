function slugifyFarmId(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24);
  return `farm-${slug || "new"}-${Date.now().toString(36)}`;
}

export function generateFarmId(name: string): string {
  return slugifyFarmId(name);
}

export function generateUserId(): string {
  return `user-owner-${Date.now().toString(36)}`;
}
