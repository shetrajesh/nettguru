
import { HttpInterceptorFn } from '@angular/common/http';

export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  const apiUrl = 'http://localhost:8080/api/';

  // Only intercept requests to our backend.
  if (!req.url.startsWith(apiUrl)) {
    return next(req);
  }

  // Read the CSRF token cookie.
  const match = document.cookie.match(
    /(?:^|;\s*)XSRF-TOKEN=([^;]*)/
  );

  const token = match ? decodeURIComponent(match[1]) : null;

  // Send cookies with backend requests and include the CSRF header
  // when a token cookie is available.
  const headers = token
    ? req.headers.set('X-XSRF-TOKEN', token)
    : req.headers;

  const apiRequest = req.clone({
    withCredentials: true,
    headers
  });

  return next(apiRequest);
};
