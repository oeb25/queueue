/**
 * GQty AUTO-GENERATED CODE: PLEASE DO NOT MODIFY MANUALLY
 */

export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
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

export const scalarsEnumsHash: import("gqty").ScalarsEnumsHash = {
  Boolean: true,
  Int: true,
  RoomId: true,
  Secret: true,
  String: true,
  TicketId: true,
};
export const generatedSchema = {
  CreateRoomResponse: {
    __typename: { __type: "String!" },
    roomId: { __type: "RoomId!" },
    secret: { __type: "Secret!" },
  },
  RoomObject: {
    __typename: { __type: "String!" },
    id: { __type: "RoomId!" },
    isOpen: { __type: "Boolean!" },
    isSecret: { __type: "Boolean!", __args: { secret: "Secret" } },
    ticket: { __type: "TicketObject", __args: { id: "TicketId!" } },
    tickets: { __type: "[TicketObject!]!", __args: { secret: "Secret!" } },
  },
  TicketObject: {
    __typename: { __type: "String!" },
    body: { __type: "String!" },
    id: { __type: "TicketId!" },
    status: { __type: "TicketStatus!" },
  },
  TicketStatus: {
    __typename: { __type: "String!" },
    isBeingHelped: { __type: "Boolean!" },
    isInQueue: { __type: "Boolean!" },
    position: { __type: "Int" },
  },
  mutation: {
    __typename: { __type: "String!" },
    createRoom: { __type: "CreateRoomResponse!" },
    enterQueue: {
      __type: "TicketObject!",
      __args: { body: "String!", roomId: "RoomId!" },
    },
    leaveQueue: {
      __type: "Boolean!",
      __args: { roomId: "RoomId!", ticketId: "TicketId!" },
    },
    setHelp: {
      __type: "Boolean!",
      __args: {
        help: "Boolean!",
        roomId: "RoomId!",
        secret: "Secret!",
        ticketId: "TicketId!",
      },
    },
    setOpen: {
      __type: "Boolean!",
      __args: { open: "Boolean!", roomId: "RoomId!", secret: "Secret!" },
    },
  },
  query: {
    __typename: { __type: "String!" },
    room: { __type: "RoomObject", __args: { id: "RoomId!" } },
    rooms: { __type: "[RoomObject!]!" },
    ticket: {
      __type: "TicketObject",
      __args: { roomId: "RoomId!", ticketId: "TicketId!" },
    },
  },
  subscription: {},
} as const;

export interface CreateRoomResponse {
  __typename?: "CreateRoomResponse";
  roomId: ScalarsEnums["RoomId"];
  secret: ScalarsEnums["Secret"];
}

export interface RoomObject {
  __typename?: "RoomObject";
  id: ScalarsEnums["RoomId"];
  isOpen: ScalarsEnums["Boolean"];
  isSecret: (args?: {
    secret?: Maybe<Scalars["Secret"]>;
  }) => ScalarsEnums["Boolean"];
  ticket: (args: { id: Scalars["TicketId"] }) => Maybe<TicketObject>;
  tickets: (args: { secret: Scalars["Secret"] }) => Array<TicketObject>;
}

export interface TicketObject {
  __typename?: "TicketObject";
  body: ScalarsEnums["String"];
  id: ScalarsEnums["TicketId"];
  status: TicketStatus;
}

export interface TicketStatus {
  __typename?: "TicketStatus";
  isBeingHelped: ScalarsEnums["Boolean"];
  isInQueue: ScalarsEnums["Boolean"];
  position?: Maybe<ScalarsEnums["Int"]>;
}

export interface Mutation {
  __typename?: "Mutation";
  createRoom: CreateRoomResponse;
  enterQueue: (args: {
    body: Scalars["String"];
    roomId: Scalars["RoomId"];
  }) => TicketObject;
  leaveQueue: (args: {
    roomId: Scalars["RoomId"];
    ticketId: Scalars["TicketId"];
  }) => ScalarsEnums["Boolean"];
  setHelp: (args: {
    help: Scalars["Boolean"];
    roomId: Scalars["RoomId"];
    secret: Scalars["Secret"];
    ticketId: Scalars["TicketId"];
  }) => ScalarsEnums["Boolean"];
  setOpen: (args: {
    open: Scalars["Boolean"];
    roomId: Scalars["RoomId"];
    secret: Scalars["Secret"];
  }) => ScalarsEnums["Boolean"];
}

export interface Query {
  __typename?: "Query";
  room: (args: { id: Scalars["RoomId"] }) => Maybe<RoomObject>;
  rooms: Array<RoomObject>;
  ticket: (args: {
    roomId: Scalars["RoomId"];
    ticketId: Scalars["TicketId"];
  }) => Maybe<TicketObject>;
}

export interface Subscription {
  __typename?: "Subscription";
}

export interface GeneratedSchema {
  query: Query;
  mutation: Mutation;
  subscription: Subscription;
}

export type MakeNullable<T> = {
  [K in keyof T]: T[K] | undefined;
};

export interface ScalarsEnums extends MakeNullable<Scalars> {}
