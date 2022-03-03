
export function getToken() {
  return localStorage.getItem('token_key');
}

export function setToken(token) {
  return localStorage.setItem('token_key', token)
}

export function removeToken() {
  return localStorage.removeItem('token_key')
}
