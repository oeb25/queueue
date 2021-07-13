/**
 * GQLESS AUTO-GENERATED CODE: PLEASE DO NOT MODIFY MANUALLY
 */

export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export interface Scalars {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  RoomId: Opaque<string, "RoomId">;
  Secret: Opaque<string, "Secret">;
  TicketId: Opaque<string, "TicketId">;
}

export const scalarsEnumsHash: import("gqless").ScalarsEnumsHash = {
  Boolean: true,
  RoomId: true,
  Secret: true,
  String: true,
  TicketId: true,
  Int: true,
};
export const generatedSchema = {
  query: {
    __typename: { __type: "String!" },
    rooms: { __type: "[RoomObject!]!" },
    room: { __type: "RoomObject", __args: { id: "RoomId!" } },
    ticket: {
      __type: "TicketObject",
      __args: { roomId: "RoomId!", ticketId: "TicketId!" },
    },
  },
  mutation: {
    __typename: { __type: "String!" },
    createRoom: { __type: "CreateRoomResponse!" },
    enterQueue: {
      __type: "TicketObject!",
      __args: { roomId: "RoomId!", body: "String!" },
    },
    leaveQueue: {
      __type: "Boolean!",
      __args: { roomId: "RoomId!", ticketId: "TicketId!" },
    },
    setHelp: {
      __type: "Boolean!",
      __args: {
        roomId: "RoomId!",
        ticketId: "TicketId!",
        secret: "Secret!",
        help: "Boolean!",
      },
    },
    setOpen: {
      __type: "Boolean!",
      __args: { roomId: "RoomId!", secret: "Secret!", open: "Boolean!" },
    },
  },
  subscription: {},
  RoomObject: {
    __typename: { __type: "String!" },
    id: { __type: "RoomId!" },
    tickets: { __type: "[TicketObject!]!", __args: { secret: "Secret!" } },
    ticket: { __type: "TicketObject", __args: { id: "TicketId!" } },
    isSecret: { __type: "Boolean!", __args: { secret: "Secret" } },
    isOpen: { __type: "Boolean!" },
  },
  TicketObject: {
    __typename: { __type: "String!" },
    id: { __type: "TicketId!" },
    body: { __type: "String!" },
    status: { __type: "TicketStatus!" },
  },
  TicketStatus: {
    __typename: { __type: "String!" },
    position: { __type: "Int" },
    isBeingHelped: { __type: "Boolean!" },
    isInQueue: { __type: "Boolean!" },
  },
  CreateRoomResponse: {
    __typename: { __type: "String!" },
    roomId: { __type: "RoomId!" },
    secret: { __type: "Secret!" },
  },
} as const;

export interface Query {
  __typename: "Query" | undefined;
  rooms: Array<RoomObject>;
  room: (args: { id: Scalars["RoomId"] }) => Maybe<RoomObject>;
  ticket: (args: {
    roomId: Scalars["RoomId"];
    ticketId: Scalars["TicketId"];
  }) => Maybe<TicketObject>;
}

export interface Mutation {
  __typename: "Mutation" | undefined;
  createRoom: CreateRoomResponse;
  enterQueue: (args: {
    roomId: Scalars["RoomId"];
    body: Scalars["String"];
  }) => TicketObject;
  leaveQueue: (args: {
    roomId: Scalars["RoomId"];
    ticketId: Scalars["TicketId"];
  }) => ScalarsEnums["Boolean"];
  setHelp: (args: {
    roomId: Scalars["RoomId"];
    ticketId: Scalars["TicketId"];
    secret: Scalars["Secret"];
    help: Scalars["Boolean"];
  }) => ScalarsEnums["Boolean"];
  setOpen: (args: {
    roomId: Scalars["RoomId"];
    secret: Scalars["Secret"];
    open: Scalars["Boolean"];
  }) => ScalarsEnums["Boolean"];
}

export interface Subscription {
  __typename: "Subscription" | undefined;
}

export interface RoomObject {
  __typename: "RoomObject" | undefined;
  id: ScalarsEnums["RoomId"];
  tickets: (args: { secret: Scalars["Secret"] }) => Array<TicketObject>;
  ticket: (args: { id: Scalars["TicketId"] }) => Maybe<TicketObject>;
  isSecret: (args?: {
    secret?: Maybe<Scalars["Secret"]>;
  }) => ScalarsEnums["Boolean"];
  isOpen: ScalarsEnums["Boolean"];
}

export interface TicketObject {
  __typename: "TicketObject" | undefined;
  id: ScalarsEnums["TicketId"];
  body: ScalarsEnums["String"];
  status: TicketStatus;
}

export interface TicketStatus {
  __typename: "TicketStatus" | undefined;
  position?: Maybe<ScalarsEnums["Int"]>;
  isBeingHelped: ScalarsEnums["Boolean"];
  isInQueue: ScalarsEnums["Boolean"];
}

export interface CreateRoomResponse {
  __typename: "CreateRoomResponse" | undefined;
  roomId: ScalarsEnums["RoomId"];
  secret: ScalarsEnums["Secret"];
}

export interface SchemaObjectTypes {
  Query: Query;
  Mutation: Mutation;
  Subscription: Subscription;
  RoomObject: RoomObject;
  TicketObject: TicketObject;
  TicketStatus: TicketStatus;
  CreateRoomResponse: CreateRoomResponse;
}
export type SchemaObjectTypesNames =
  | "Query"
  | "Mutation"
  | "Subscription"
  | "RoomObject"
  | "TicketObject"
  | "TicketStatus"
  | "CreateRoomResponse";

export interface GeneratedSchema {
  query: Query;
  mutation: Mutation;
  subscription: Subscription;
}

export type MakeNullable<T> = {
  [K in keyof T]: T[K] | undefined;
};

export interface ScalarsEnums extends MakeNullable<Scalars> {}
