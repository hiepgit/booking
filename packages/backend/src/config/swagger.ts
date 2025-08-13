import swaggerJSDoc, { Options } from 'swagger-jsdoc';

const options: Options = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'Healthcare Booking API',
      version: '0.0.0',
    },
    servers: [{ url: '/'}],
  },
  apis: [
    './src/routes/*.ts',
  ],
};

export const swaggerSpec = swaggerJSDoc(options);


