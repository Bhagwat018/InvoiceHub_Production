export function launchImageLibrary(_options: any, callback?: (response: any) => void) {
  const response = { didCancel: true, assets: [] };
  if (callback) callback(response);
  return Promise.resolve(response);
}

export function launchCamera(_options: any, callback?: (response: any) => void) {
  const response = { didCancel: true, assets: [] };
  if (callback) callback(response);
  return Promise.resolve(response);
}
