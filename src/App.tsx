// @ts-ignore
import notificationSound from "./notification.wav";

import * as React from "react";
import * as gg from "./gqless";
import * as Hero from "@graywolfai/react-heroicons";

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
    <div className="w-full text-white">
      <header className="p-4 mx-auto">
        <h1 className="text-2xl italic font-black text-center uppercase">
          Queueue
        </h1>
      </header>
      <main className="grid min-h-[70vh] w-full place-items-center">
        {!room ? (
          <LobbyView createRoom={createRoom} />
        ) : admin ? (
          <React.Suspense fallback="Loading...">
            <AdminView roomId={admin.roomId} secret={admin.secret} />
          </React.Suspense>
        ) : (
          <React.Suspense fallback="Loading...">
            <UserView roomId={roomId!} />
          </React.Suspense>
        )}
      </main>
    </div>
  );
};

const LobbyView: React.FC<{ createRoom: () => void }> = ({ createRoom }) => {
  return (
    <>
      <section className="p-2">
        <p className="max-w-sm text-2xl text-center">
          <p className="mb-3">
            Your teacher should have provided you with a link just for your
            queue!
          </p>
          <p>You will need to use that link.</p>
        </p>
      </section>
      <section className="p-2">
        <details className="h-32 text-center transition-opacity opacity-20 hover:opacity-100">
          <summary className="cursor-pointer focus:outline-none">
            If you're a teacher looking to create a queue for your students,
            click here!
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
      </section>
    </>
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
    <div className="flex flex-col items-center self-start space-y-4">
      <h1 className="-mt-2 text-lg text-center">
        🙋‍♂️ <span className="italic font-black uppercase">Admin</span> 👩‍💼
      </h1>
      <div className="text-sm text-center text-gray-400">
        <p>Student link:</p>
        <div className="w-full max-w-sm overflow-x-auto text-xs">
          <pre className="flex bg-transparent select-all">{studentLink}</pre>
        </div>
      </div>
      <div className="text-sm text-center">
        <p className="text-gray-400">The queue is currently: </p>
        <select
          className="px-4 py-2 font-bold bg-transparent text--center"
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
      </div>

      {tickets.length == 0 ? (
        <p className="text-3xl text-center">The queue is currently empty 📭</p>
      ) : (
        <div
          className="grid items-center w-full gap-2"
          style={{ gridTemplateColumns: "1fr 8em auto" }}
        >
          {tickets.map((q) => {
            const ticketId = q.id ?? ("0" as TicketId);
            const info = (JSON.parse(q.body || "null") as GroupInfo) || {
              name: "",
              room: "",
            };

            return (
              <React.Fragment key={ticketId}>
                <div className="text-xl text-center">
                  <span className="text-base text-gray-400">G</span>
                  {info.name} <span className="text-gray-700">/</span>{" "}
                  <span className="text-base text-gray-400">R</span>
                  {info.room}
                </div>
                <button
                  className={
                    "px-2 py-2 rounded border transition " +
                    (q.status.isBeingHelped
                      ? "bg-nord1 hover:bg-nord3 border-nord4"
                      : "hover:bg-nord2 border-nord3")
                  }
                  onClick={() =>
                    setHelp({
                      args: { help: !q.status.isBeingHelped, ticketId },
                    })
                  }
                >
                  {q.status.isBeingHelped
                    ? youAreHelping == ticketId
                      ? "You're helping"
                      : "Unhelp"
                    : "Help! 🙋‍♂️"}
                </button>
                <button
                  className={
                    "px-2 py-2 rounded transition " +
                    (q.status.isBeingHelped
                      ? "bg-nord10 hover:bg-nord11"
                      : "bg-nord1 cursor-not-allowed opacity-50")
                  }
                  onClick={() => removeFromQueue({ args: { ticketId } })}
                  disabled={!q.status.isBeingHelped}
                >
                  Remove
                </button>
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};

type GroupInfo = { name: string; room: string };

const Prefix = ({ children }: { children: JSX.Element }) => (
  <span className="text-sm text-gray-400">{children}</span>
);

const ViewGroupInfo = ({ info }: { info: GroupInfo }) => (
  <div className="text-xl text-center text-white">
    <span className="text-base text-gray-400">G</span>
    {info.name} <span className="text-gray-700">/</span>{" "}
    <span className="text-base text-gray-400">R</span>
    {info.room}
  </div>
);

const UserView: React.FC<{
  roomId: RoomId;
}> = ({ roomId }) => {
  const params = getSearchParameters();

  const [ticketId, setTicketId] = React.useState<TicketId | null>(
    (params["ticket"] as TicketId) || null
  );
  const [groupInfo, setGroupInfo] = React.useState({ name: "", room: "" });

  const query = gg.useQuery({
    suspense: true,
  });
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
    (mutation, { info }: { info: GroupInfo }) => {
      if (!roomId) return;

      const { id } = mutation.enterQueue({
        roomId,
        body: JSON.stringify({
          name: info.name.trim(),
          room: info.room.trim(),
        }),
      });
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
          <p className="p-2 text-2xl text-gray-400">
            <ViewGroupInfo info={JSON.parse(ticket.body || "")} />
          </p>
          {ticket.status.isBeingHelped ? (
            <p className="p-2 pb-4 text-3xl text-center">
              It's your turn, help is on the way! 🎉
            </p>
          ) : (
            <>
              <p className="p-2 text-gray-300">Your position in the queue:</p>
              <p className="text-8xl">{ticket.status.position! + 1}</p>
            </>
          )}
          <button
            onClick={() => leaveQueue()}
            className="flex items-center px-4 py-2 mt-4 space-x-2 font-bold transition border border-gray-600 rounded group hover:bg-nord1"
          >
            <Hero.ChevronDoubleLeftOutline className="w-4 h-4 transition group-hover:-translate-x-1" />
            <span>Leave queue</span>
          </button>
        </div>
      ) : (
        <form
          className="flex flex-col items-center w-full"
          onSubmit={async (e) => {
            e.preventDefault();

            if (!groupInfo.name.trim() || !groupInfo.room.trim()) {
              return;
            }

            enterQueue({ args: { info: groupInfo } });
          }}
        >
          {isOpen ? (
            <>
              <p>Enter your group number and room, and join the queue!</p>
              <label htmlFor="name" className="p-10 pb-4">
                {groupInfo.name && (
                  <span className="text-sm text-gray-400">G</span>
                )}
                <input
                  className="text-xl text-center bg-transparent outline-none"
                  style={
                    groupInfo.name.length == 0
                      ? void 0
                      : {
                          width: `${groupInfo.name.length + 1}ch`,
                        }
                  }
                  id="name"
                  placeholder="Group nr"
                  type="tel"
                  autoComplete="no"
                  value={groupInfo.name}
                  onChange={(e) =>
                    setGroupInfo((i) => ({ ...i, name: e.target.value }))
                  }
                />
              </label>
              <label htmlFor="room" className="p-10 pt-4">
                {groupInfo.room && (
                  <span className="text-sm text-gray-400">R</span>
                )}
                <input
                  className="text-xl text-center bg-transparent outline-none"
                  style={
                    groupInfo.room.length == 0
                      ? void 0
                      : {
                          width: `${groupInfo.room.length + 1}ch`,
                        }
                  }
                  id="room"
                  placeholder="Room"
                  type="text"
                  value={groupInfo.room}
                  onChange={(e) =>
                    setGroupInfo((i) => ({ ...i, room: e.target.value }))
                  }
                />
              </label>
              <button
                className="flex items-center px-4 py-2 space-x-2 font-bold border border-gray-600 rounded group disabled:opacity-50"
                disabled={!groupInfo}
              >
                <span>Join queue</span>
                <Hero.ChevronDoubleRightOutline className="w-4 h-4 transition group-hover:translate-x-1" />
              </button>
            </>
          ) : (
            <>
              <p className="my-2 text-xl text-center">
                This queue is currently closed {room?.isOpen}
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
