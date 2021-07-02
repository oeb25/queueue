// @ts-ignore
import notificationSound from "./notification.wav";

import * as React from "react";
import * as gg from "./gqless";

export type RoomId = gg.Scalars["RoomId"];
export type TicketId = gg.Scalars["TicketId"];
export type Secret = gg.Scalars["Secret"];

export const App: React.FC<{}> = ({}) => {
  const params = getSearchParameters();

  const [roomId, setRoomId] = React.useState<null | RoomId>(
    (params["room"] as RoomId) || null
  );
  const [secret, setSecret] = React.useState<null | Secret>(
    (params["secret"] as Secret) || null
  );

  const query = gg.useQuery({ suspense: true });

  const room = roomId ? query.room({ id: roomId }) : void 0;
  const admin =
    room && room.isSecret({ secret })
      ? { secret: secret!, roomId: roomId! }
      : void 0;

  const [createRoom] = gg.useMutation(
    (mutation) => {
      const { roomId, secret } = mutation.createRoom;
      return { roomId, secret };
    },
    {
      onCompleted({ roomId, secret }) {
        roomId = roomId!;
        secret = secret!;

        window.history.pushState(
          {},
          "Room " + roomId,
          `/?${new URLSearchParams({ room: roomId, secret }).toString()}`
        );
        setRoomId(roomId);
        setSecret(secret);
      },
    }
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="flex flex-col items-center justify-center w-full max-w-2xl">
        <div className="flex flex-col items-center w-full p-12 text-white bg-gray-700 max-w-xg">
          {!room ? (
            <div className="grid gap-4 place-items-center">
              <p className="text-xl">
                Hello, welcome to <span className="font-bold">Queueue</span>
              </p>

              <p className="text-2xl text-center">
                Your teacher should have provided you with a link just for your
                queue!
              </p>

              <hr />

              <details className="transition-opacity opacity-10 hover:opacity-100">
                <summary className="cursor-pointer">
                  If you're a teacher looking to create a queue for your
                  students, click here!
                </summary>

                <div className="grid p-2 place-items-center">
                  <button
                    className="p-2 border rounded shadow"
                    onClick={() => createRoom()}
                  >
                    Create a new queue
                  </button>
                </div>
              </details>
            </div>
          ) : admin ? (
            <React.Suspense fallback="Loading...">
              <AdminView roomId={admin.roomId} secret={admin.secret} />
            </React.Suspense>
          ) : (
            <React.Suspense fallback="Loading...">
              <UserView roomId={roomId!} />
            </React.Suspense>
          )}
        </div>
      </div>
    </div>
  );
};

const AdminView: React.FC<{ roomId: RoomId; secret: Secret }> = ({
  roomId,
  secret,
}) => {
  const query = gg.useQuery({
    suspense: true,
  });
  const refetch = gg.useRefetch();

  const room = query.room({ id: roomId });
  const tickets = room?.tickets({ secret });

  useInterval(() => {
    refetch(room);
  }, 1000);

  const lastCount = React.useRef(0);

  React.useEffect(() => {
    if (!tickets) return;
    if (lastCount.current < tickets.length) {
      const audio = new Audio(notificationSound);
      audio.play();
    }
    lastCount.current = tickets.length;
  }, [tickets?.length]);

  const [youAreHelping, setYouAreHelping] = React.useState<null | TicketId>(
    null
  );

  const studentLink = window.location.href.split("?")[0] + `?room=${roomId}`;

  if (!room || !tickets) {
    // TODO
    return null;
  }

  const [setOpen] = gg.useMutation(
    (mutation, { open }: { open: boolean }) => {
      mutation.setOpen({ roomId, secret, open });
    },
    { refetchQueries: [room] }
  );
  const [setHelp] = gg.useMutation(
    (mutation, { help, ticketId }: { help: boolean; ticketId: TicketId }) => {
      mutation.setHelp({ help, roomId, secret, ticketId });

      return { help, ticketId };
    },
    {
      refetchQueries: [tickets],
      onCompleted({ help, ticketId }) {
        if (help) {
          setYouAreHelping(ticketId);
        }
      },
    }
  );
  const [removeFromQueue] = gg.useMutation(
    (mutation, { ticketId }: { ticketId: TicketId }) => {
      mutation.leaveQueue({ roomId, ticketId });
    },
    { refetchQueries: [tickets] }
  );

  return (
    <div className="flex flex-col items-center">
      <h1 className="pb-2 text-lg text-center">
        Hello, welcome to <span className="italic">Queueue Admin</span> 👩‍💼
      </h1>
      <p className="py-2 text-sm text-center text-gray-400">
        Student link:{" "}
        <span className="bg-transparent select-all">{studentLink}</span>
      </p>
      <p className="pb-2">
        <span className="text-gray-300">Queue is: </span>
        <select
          className="font-bold bg-transparent"
          value={room.isOpen ? "open" : "closed"}
          onChange={(e) =>
            setOpen({ args: { open: e.target.value == "open" } }).catch(
              console.error
            )
          }
        >
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>
      </p>
      {tickets.length == 0 ? (
        <p className="text-3xl text-center">The queue is currently empty 📭</p>
      ) : (
        <div
          className="grid items-center gap-2"
          style={{ gridTemplateColumns: "1fr auto" }}
        >
          {tickets.map((q) => {
            const ticketId = q.id! ?? ("0" as TicketId);

            return (
              <React.Fragment key={ticketId}>
                <div>Group {q.body}</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    className={
                      "px-2 py-1 " +
                      (q.status.isBeingHelped ? "bg-blue-700" : "bg-blue-500")
                    }
                    onClick={() =>
                      setHelp({
                        args: { help: !q.status.isBeingHelped, ticketId },
                      })
                    }
                  >
                    {q.status.isBeingHelped
                      ? youAreHelping == ticketId
                        ? "You are helping"
                        : "Unhelp"
                      : "Help!"}
                  </button>
                  <button
                    className={
                      "px-2 py-1 " +
                      (q.status.isBeingHelped
                        ? "bg-gray-900"
                        : "bg-gray-800 cursor-not-allowed opacity-50")
                    }
                    onClick={() => removeFromQueue({ args: { ticketId } })}
                    disabled={!q.status.isBeingHelped}
                  >
                    Remove
                  </button>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};

const UserView: React.FC<{
  roomId: RoomId;
}> = ({ roomId }) => {
  const params = getSearchParameters();

  const [ticketId, setTicketId] = React.useState<TicketId | null>(
    (params["ticket"] as TicketId) || null
  );
  const [groupName, setGroupName] = React.useState("");

  const query = gg.useQuery({ suspense: true });
  const refetch = gg.useRefetch();

  const room = query.room({ id: roomId });
  const ticket = ticketId ? room?.ticket({ id: ticketId }) : void 0;
  const isOpen = room?.isOpen ?? false;

  // React.useEffect(() => {
  //   if (ticket && !ticket.status.isInQueue) setTicketId(null);
  // }, [ticket]);

  React.useEffect(() => {
    const search = new URLSearchParams({ room: roomId });
    if (ticketId) search.set("ticket", ticketId);
    if (params.secret) search.set("secret", params.secret);

    window.history.replaceState({}, "Queueue", "?" + search.toString());
  }, [ticketId]);

  const [leaveQueue] = gg.useMutation(
    (mutation) => {
      if (!roomId || !ticketId) return;

      mutation.leaveQueue({ roomId, ticketId });
    },
    {
      refetchQueries: [room],
      onCompleted() {
        setTicketId(null);
      },
    }
  );
  const [enterQueue] = gg.useMutation(
    (mutation, { groupName }: { groupName: string }) => {
      if (!roomId) return;

      const { id } = mutation.enterQueue({ roomId, body: groupName });
      return { id };
    },
    {
      refetchQueries: [room],
      onCompleted(data) {
        setTicketId(data?.id ?? null);
      },
    }
  );

  useInterval(() => refetch(room), 1000);

  return (
    <>
      {ticket ? (
        <div className="flex flex-col items-center p-6">
          <p className="p-2 text-gray-400">Group {ticket.body}</p>
          {ticket.status.isBeingHelped ? (
            <p className="p-2 pb-4 text-3xl text-center">
              It's your turn, help is on the way! 🎉
            </p>
          ) : (
            <>
              <p className="p-2 text-gray-300">Your position in queue:</p>
              <p className="text-8xl">{ticket.status.position! + 1}</p>
            </>
          )}
          <button onClick={() => leaveQueue()}>Leave queue</button>
        </div>
      ) : (
        <form
          className="flex flex-col items-center w-full"
          onSubmit={async (e) => {
            e.preventDefault();

            if (!groupName || Number.isNaN(parseInt(groupName))) {
              return;
            }

            enterQueue({ args: { groupName } });
            setGroupName("");
          }}
        >
          <h1 className="text-2xl text-center">
            Hello, welcome to <span className="font-bold">Queueue</span>
          </h1>
          {isOpen ? (
            <>
              <p>Enter your group number and join the queue!</p>
              <input
                className="p-10 text-xl text-center bg-transparent outline-none appearance-none no-spin"
                placeholder="Group nr"
                type="number"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
              <button>Join queue</button>
            </>
          ) : (
            <>
              <p className="my-2 text-xl text-center">
                This queue is currently closed
              </p>
              <p className="text-center">
                If you think this is a mistake, reach out to your teachers!
              </p>
            </>
          )}
        </form>
      )}
    </>
  );
};

function useInterval(callback: () => void, delay: number) {
  const savedCallback = React.useRef<() => void>();

  // Remember the latest callback.
  React.useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  React.useEffect(() => {
    function tick() {
      savedCallback.current!();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

function getSearchParameters() {
  return Object.fromEntries(new URLSearchParams(location.search));
}
