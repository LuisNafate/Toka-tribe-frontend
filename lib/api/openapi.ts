import swagger from "@/lib/api/swagger-output.json";

type HttpMethod = "get" | "post" | "put" | "patch" | "delete" | "options" | "head";

type OpenApiOperation = {
  operationId?: string;
  summary?: string;
  tags?: string[];
  security?: Array<Record<string, unknown>>;
  requestBody?: {
    required?: boolean;
    content?: {
      "application/json"?: {
        schema?: {
          $ref?: string;
          type?: string;
        };
      };
    };
  };
};

type OpenApiPathItem = Partial<Record<HttpMethod, OpenApiOperation>>;

type OpenApiSpec = {
  openapi: string;
  info?: {
    title?: string;
    version?: string;
    description?: string;
  };
  paths: Record<string, OpenApiPathItem>;
  components?: {
    schemas?: Record<string, OpenApiSchema>;
  };
};

type OpenApiSchema = {
  type?: string;
  properties?: Record<
    string,
    {
      type?: string;
      example?: unknown;
      items?: {
        type?: string;
      };
    }
  >;
};

export const tokaTribeOpenApi = swagger as OpenApiSpec;

export type ApiOperation = {
  id: string;
  method: Uppercase<HttpMethod>;
  path: string;
  operationId: string;
  summary: string;
  tag: string;
  secured: boolean;
  hasBody: boolean;
  requestSchemaRef?: string;
  requestSchemaName?: string;
  pathParamNames: string[];
};

const METHOD_ORDER: HttpMethod[] = ["get", "post", "put", "patch", "delete", "options", "head"];

function buildApiOperations(): ApiOperation[] {
  const operations: ApiOperation[] = [];

  for (const [path, pathItem] of Object.entries(tokaTribeOpenApi.paths)) {
    for (const method of METHOD_ORDER) {
      const operation = pathItem[method];
      if (!operation) continue;

      operations.push({
        id: `${method.toUpperCase()} ${path}`,
        method: method.toUpperCase() as Uppercase<HttpMethod>,
        path,
        operationId: operation.operationId ?? `${method}_${path}`,
        summary: operation.summary ?? "Sin resumen",
        tag: operation.tags?.[0] ?? "general",
        secured: Boolean(operation.security?.length),
        hasBody: Boolean(operation.requestBody),
        requestSchemaRef: operation.requestBody?.content?.["application/json"]?.schema?.$ref,
        requestSchemaName: operation.requestBody?.content?.["application/json"]?.schema?.$ref?.split("/").pop(),
        pathParamNames: Array.from(path.matchAll(/\{([^}]+)\}/g)).map((result) => result[1]),
      });
    }
  }

  return operations;
}

const API_OPERATIONS = Object.freeze(buildApiOperations());
const API_TAGS = Object.freeze(Array.from(new Set(API_OPERATIONS.map((operation) => operation.tag))).sort((a, b) => a.localeCompare(b)));

export function getApiOperations(): ApiOperation[] {
  return [...API_OPERATIONS];
}

export function getApiTags(): string[] {
  return [...API_TAGS];
}

export function getApiStats() {
  const securedCount = API_OPERATIONS.filter((op) => op.secured).length;
  const withBodyCount = API_OPERATIONS.filter((op) => op.hasBody).length;

  return {
    operationCount: API_OPERATIONS.length,
    endpointCount: Object.keys(tokaTribeOpenApi.paths).length,
    securedCount,
    withBodyCount,
    tagCount: API_TAGS.length,
  };
}

export function getOperationById(operationId: string): ApiOperation | undefined {
  return API_OPERATIONS.find((operation) => operation.operationId === operationId);
}

export function getRequestBodyTemplateBySchemaName(schemaName?: string): string {
  if (!schemaName) return "{}";

  const schema = tokaTribeOpenApi.components?.schemas?.[schemaName];
  if (!schema?.properties) return "{}";

  const template: Record<string, unknown> = {};

  for (const [key, property] of Object.entries(schema.properties)) {
    if (property.example !== undefined) {
      template[key] = property.example;
      continue;
    }

    if (property.type === "string") {
      template[key] = "";
      continue;
    }

    if (property.type === "number" || property.type === "integer") {
      template[key] = 0;
      continue;
    }

    if (property.type === "boolean") {
      template[key] = false;
      continue;
    }

    if (property.type === "array") {
      template[key] = [];
      continue;
    }

    template[key] = null;
  }

  return JSON.stringify(template, null, 2);
}
