export const formatRelativeTime = (dateString: string | undefined): string => {
  if (!dateString) {
    return 'Data desconhecida';
  }

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return 'Data inválida';
  }

  const now = new Date();

  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);

  if (years > 0) {
    return years === 1 ? 'há 1 ano' : `há ${years} anos`;
  }
  if (months > 0) {
    return months === 1 ? 'há 1 mês' : `há ${months} meses`;
  }
  if (days > 0) {
    return days === 1 ? 'há 1 dia' : `há ${days} dias`;
  }
  if (hours > 0) {
    return hours === 1 ? 'há 1 hora' : `há ${hours} horas`;
  }
  if (minutes > 0) {
    return minutes === 1 ? 'há 1 minuto' : `há ${minutes} minutos`;
  }
  return seconds <= 5 ? 'agora' : `há ${seconds} segundos`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);

  return date.toLocaleDateString('pt-BR', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};
