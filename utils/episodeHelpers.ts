export const isEpisodeAired = (airDate: string | null): boolean => {
  if (!airDate) {
    return false;
  }

  const today = new Date();

  // Bugünün tamamını yayınlanmış kabul ediyoruz
  today.setHours(23, 59, 59, 999);

  const releaseDate = new Date(`${airDate}T00:00:00`);

  return releaseDate <= today;
};
