const swaggerJSDoc = require("swagger-jsdoc");

const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "BEX API",
      version: "1.0.0",
      description: "Dokumentasi API untuk backend Express PostgreSQL JWT Starter."
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local development"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      },
      schemas: {
        ErrorResponse: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Invalid request body"
            }
          }
        },
        FieldErrorResponse: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Invalid request body"
            },
            errors: {
              type: "object",
              additionalProperties: {
                type: "array",
                items: {
                  type: "string"
                }
              },
              example: {
                email: ["Invalid email"]
              }
            }
          }
        },
        AuthUser: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1
            },
            name: {
              type: "string",
              example: "Demo User"
            },
            email: {
              type: "string",
              format: "email",
              example: "demo@example.com"
            },
            createdAt: {
              type: "string",
              format: "date-time"
            }
          }
        },
        AuthResponse: {
          type: "object",
          properties: {
            token: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            },
            refreshToken: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            },
            user: {
              $ref: "#/components/schemas/AuthUser"
            }
          }
        },
        UserResponse: {
          type: "object",
          properties: {
            username: {
              type: "string",
              example: "demouser"
            },
            nama: {
              type: "string",
              example: "Demo User"
            },
            email: {
              type: "string",
              format: "email",
              example: "demo@example.com"
            },
            active: {
              type: "string",
              enum: ["Y", "N"],
              example: "Y"
            },
            created_at: {
              type: "string",
              format: "date-time"
            },
            created_by: {
              type: "string",
              example: "admin"
            }
          }
        },
        CurrentUserResponse: {
          type: "object",
          properties: {
            user: {
              $ref: "#/components/schemas/AuthUser"
            }
          }
        }
      }
    }
  },
  apis: ["./src/app.js", "./src/routes/*.js"]
});

module.exports = swaggerSpec;
