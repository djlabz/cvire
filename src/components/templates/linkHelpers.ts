export const getFriendlyLinkLabel = (url?: string, fallbackLabel = 'Website') => {
  if (!url) return '';
  const lower = url.toLowerCase();
  if (lower.includes('linkedin.com')) return 'LinkedIn';
  if (lower.includes('github.com')) return 'GitHub';
  if (lower.includes('portfolio')) return 'Portfolio';
  return fallbackLabel;
};

export const getFullUrl = (url?: string) => {
  if (!url) return '#';
  return url.startsWith('http') ? url : `https://${url}`;
};
