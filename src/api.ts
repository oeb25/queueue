type Opaque<Type, Token = unknown> = Type & { readonly __opaque__: Token };

export type RoomId = Opaque<string, "Room">;
export type TicketId = Opaque<string, "Ticket">;

export const toRoomId = (s: string) => s as RoomId;
export const toTicketId = (s: string) => s as TicketId;

export type Ticket = { id: TicketId; help: boolean; groupName: string };
export type TicketStatus = "helped" | { queued: { position: number } };

/** User commands */

export type CreateRoomResponse = { roomId: RoomId; secret: string };

export const createRoom = () => apiRequest<CreateRoomResponse>("createRoom");

export const joinRoom = (room: RoomId) => roomRequest<boolean>(room, "join");
export const enterQueue = (room: RoomId, groupName: string) =>
  roomRequest<TicketId>(room, "enter", { groupName });
export const leaveQueue = (room: RoomId, ticket: TicketId) =>
  ticketRequest(room, ticket, "leave");
export const getQueuePosition = (room: RoomId, ticket: TicketId) =>
  ticketRequest<TicketStatus>(room, ticket, "position");

/** Admin commands */

export const joinRoomAsAdmin = (room: RoomId, secret: string) =>
  roomRequest<boolean>(room, "joinAdmin", { secret });
export const getQueue = (room: RoomId, secret: string) =>
  roomRequest<Ticket[]>(room, "getQueue", { secret });
export const help = (room: RoomId, ticket: TicketId, secret: string) =>
  ticketRequest(room, ticket, "help", { secret });
export const unhelp = (room: RoomId, ticket: TicketId, secret: string) =>
  ticketRequest(room, ticket, "unhelp", { secret });
export const removeFromQueue = (
  room: RoomId,
  ticket: TicketId,
  secret: string
) => ticketRequest(room, ticket, "remove", { secret });

/** Helpers */

const API_URL = "http://localhost:8081";

const apiRequest = <T>(at: string, options = {}) =>
  fetch(`${API_URL}/${at}`, {
    body: JSON.stringify(options),
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  }).then((res) => res.json() as Promise<T>);

const roomRequest = <T>(room: RoomId, at: string, options = {}) =>
  apiRequest<T>(`room/${room}/${at}`, options);

const ticketRequest = <T>(
  room: RoomId,
  ticket: TicketId,
  at: string,
  options = {}
) => roomRequest<T>(room, `${ticket}/${at}`, options);

joinRoom(toRoomId("123")).then((x) => console.log(x));
enterQueue(toRoomId("123"), "My group name").then((x) => console.log(x));
leaveQueue(toRoomId("123"), toTicketId("wow")).then((x) => console.log(x));
getQueuePosition(toRoomId("123"), toTicketId("wow")).then((x) =>
  console.log(x)
);
// enterQueue(toRoomId("123")).then((x) => console.log(x));
