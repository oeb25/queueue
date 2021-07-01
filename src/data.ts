import { Chain, $, ValueTypes } from "./zeus";

export type RoomId = ValueTypes["RoomId"];
export type TicketId = ValueTypes["TicketId"];
export type Secret = ValueTypes["Secret"];

export const Gql = Chain(
  import.meta.env.API_URL || "http://localhost:8081/graphql"
);

export const toRoomId = (s: string) => s as RoomId;
export const toTicketId = (s: string) => s as TicketId;
export const toSecret = (s: string) => s as Secret;

export const createRoom = (args: {}) =>
  Gql.mutation(
    {
      createRoom: {
        roomId: true,
        secret: true,
      },
    },
    args
  );

export const adminViewQuery = (args: { roomId: RoomId; secret: Secret }) =>
  Gql.query(
    {
      room: [
        { id: $`roomId` },
        {
          id: true,
          isOpen: true,
          tickets: [
            { secret: $`secret` },
            {
              id: true,
              body: true,
              status: {
                isBeingHelped: true,
                isInQueue: true,
                position: true,
              },
            },
          ],
        },
      ],
    },
    args
  );

export const setHelpStatus = (args: {
  roomId: RoomId;
  secret: Secret;
  ticketId: TicketId;
  help: boolean;
}) =>
  Gql.mutation(
    {
      setHelp: [
        {
          help: $`help`,
          roomId: $`roomId`,
          ticketId: $`ticketId`,
          secret: $`secret`,
        },
        true,
      ],
    },
    args
  );

export const setOpen = (args: {
  roomId: RoomId;
  secret: Secret;
  open: boolean;
}) =>
  Gql.mutation(
    {
      setOpen: [
        {
          open: $`open`,
          roomId: $`roomId`,
          secret: $`secret`,
        },
        true,
      ],
    },
    args
  );

export const enterQueue = (args: { roomId: RoomId; body: string }) =>
  Gql.mutation(
    {
      enterQueue: [
        {
          roomId: $`roomId`,
          body: $`body`,
        },
        {
          id: true,
        },
      ],
    },
    args
  );

export const removeFromQueue = (args: { roomId: RoomId; ticketId: TicketId }) =>
  Gql.mutation(
    {
      leaveQueue: [
        {
          roomId: $`roomId`,
          ticketId: $`ticketId`,
        },
        true,
      ],
    },
    args
  );

export const queueQuery = (args: { roomId: RoomId }) =>
  Gql.query(
    {
      room: [
        {
          id: $`roomId`,
        },
        {
          isOpen: true,
        },
      ],
    },
    args
  );

export const ticketQuery = (args: { roomId: RoomId; ticketId: TicketId }) =>
  Gql.query(
    {
      room: [
        {
          id: $`roomId`,
        },
        {
          isOpen: true,
          ticket: [
            { id: $`ticketId` },
            {
              id: true,
              body: true,
              status: {
                isBeingHelped: true,
                isInQueue: true,
                position: true,
              },
            },
          ],
        },
      ],
    },
    args
  );

export const roomPermissions = (args: {
  roomId: RoomId;
  secret: Secret | null;
}) =>
  Gql.query(
    {
      room: [
        { id: $`roomId` },
        {
          isSecret: [{ secret: $`secret` }, true],
        },
      ],
    },
    args
  );

type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T;
export type QueryValue<T extends (...args: any) => any> = Awaited<
  ReturnType<T>
>;
