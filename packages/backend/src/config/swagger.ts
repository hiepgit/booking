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
  apis: [],
};

export const swaggerSpec = swaggerJSDoc(options);


