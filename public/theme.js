try {
  const theme = localStorage.getItem('portfolio-theme');
  if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme;
  const motion = localStorage.getItem('portfolio-motion');
  if (motion === 'on') document.documentElement.dataset.motion = motion;
} catch { /* System preference works when storage is unavailable. */ }
