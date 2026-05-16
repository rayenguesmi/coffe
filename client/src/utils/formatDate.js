export const formatDate = (date) =>
  new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(date));

export const formatTime = (date) =>
  new Intl.DateTimeFormat('fr-FR', { timeStyle: 'short' }).format(new Date(date));
