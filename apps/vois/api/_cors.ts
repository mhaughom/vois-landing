import { createCorsHandler } from '@li/shared/api/_cors';

export const { getCorsOrigin, setCorsHeaders } = createCorsHandler([
  'https://tryvois.com',
  'https://www.tryvois.com',
  'http://localhost:5173',
  'http://localhost:3100',
]);
