const routes = {};

export function registerRoute(path, handler) {
  routes[path] = handler;
}

export function navigate(path) {
  window.location.hash = path.startsWith('#') ? path : `#${path}`;
}

export function getRoute() {
  const hash = window.location.hash.slice(1) || '/login';
  const [path, query] = hash.split('?');
  const params = {};
  if (query) {
    new URLSearchParams(query).forEach((v, k) => {
      params[k] = v;
    });
  }
  return { path, params };
}

export function startRouter(onRouteChange) {
  function handleRoute() {
    const { path, params } = getRoute();
    const handler = routes[path] || routes['/404'];
    if (handler) handler(params);
    if (onRouteChange) onRouteChange(path, params);
  }

  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}
