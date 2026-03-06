export const getLocalStorageUsage = () => {
  let total = 0;
  for (let x in localStorage) {
    if (!localStorage.hasOwnProperty(x)) continue;
    // JS strings are UTF-16 (2 bytes per char)
    total += ((localStorage[x].length + x.length) * 2); 
  }
  return total;
};

export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// 5MB is a typical safe lower bound for localStorage across browsers
export const LOCAL_STORAGE_LIMIT = 5 * 1024 * 1024;
