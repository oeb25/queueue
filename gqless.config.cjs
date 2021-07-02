/**
 * @type {import("@gqless/cli").GQlessConfig}
 */
const config = {
  react: true,
  enumsAsStrings: true,
  scalarTypes: {
    DateTime: "string",
    RoomId: 'Opaque<string, "RoomId">',
    Secret: 'Opaque<string, "Secret">',
    TicketId: 'Opaque<string, "TicketId">',
  },
  introspection: { endpoint: "./schema.gql", headers: {} },
  destination: "./src/gqless/index.ts",
  subscriptions: false,
  javascriptOutput: false,
};

module.exports = config;
