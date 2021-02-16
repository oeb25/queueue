import "./styles.css";

import * as React from "react";
import * as ReactDOM from "react-dom";
import {
  QueryClient,
  QueryClientProvider,
  QueryObserverResult,
  useQuery,
} from "react-query";
import * as remote from "./data";
import { UnwrapPromise } from "./graphql-zeus";

const queryClient = new QueryClient();

function getSearchParameters() {
  var prmstr = window.location.search.substr(1);
  return prmstr != null && prmstr != "" ? transformToAssocArray(prmstr) : {};
}

function transformToAssocArray(prmstr: string) {
  var params: Record<string, string> = {};
  var prmarr = prmstr.split("&");
  for (var i = 0; i < prmarr.length; i++) {
    var tmparr = prmarr[i].split("=");
    params[tmparr[0]] = tmparr[1];
  }
  return params;
}

const Root: React.FC<{}> = ({}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
};

const App: React.FC<{}> = ({}) => {
  const params = getSearchParameters();

  const [roomId, setRoomId] = React.useState<null | remote.RoomId>(
    remote.toRoomId(params["room"]) || null
  );
  const [secret, setSecret] = React.useState<null | remote.Secret>(
    remote.toSecret(params["secret"]) || null
  );

  const { error, isLoading, data } = useQuery(
    ["join-room", roomId, secret],
    async () => {
      if (!roomId) return null;

      const res = await remote.roomPermissions({
        roomId,
        secret,
      });

      if (!res.room) {
        return "room does not exist" as const;
      }

      if (secret && res.room.isSecret) {
        return { isAdmin: true, roomId, secret } as const;
      } else {
        return { isAdmin: false, roomId } as const;
      }
    },
    {
      enabled: !!roomId,
      refetchInterval: 2000,
    }
  );

  if (error) {
    return <h1>Error: {JSON.stringify(error)}</h1>;
  }
  if (isLoading) {
    return <h1>Loading....</h1>;
  }
  if (data == "room does not exist") {
    setRoomId(null);
    setSecret(null);
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="flex flex-col items-center justify-center w-full max-w-2xl">
        <div className="flex flex-col items-center w-full p-12 text-white bg-gray-700 max-w-xg">
          {!data ? (
            <div className="grid gap-4 place-items-center">
              <p className="text-xl">
                Hello, welcome to <span className="font-bold">Queueue</span>
              </p>

              <p className="text-center">
                If you're a student, your teacher should have provided you with
                a link just for your queueue!
              </p>

              <hr />

              <p className="text-center">
                If you're a teacher looking to create a queueue for your
                students, click below!
              </p>

              <button
                className="p-2 border rounded shadow"
                onClick={async () => {
                  const res = await remote.createRoom({});
                  const {
                    createRoom: { roomId, secret },
                  } = res;

                  window.history.pushState(
                    {},
                    "Room " + roomId,
                    `/?room=${roomId}&secret=${secret}`
                  );
                  setSecret(secret);
                  setRoomId(roomId);
                }}
              >
                Create queueue
              </button>
            </div>
          ) : data.isAdmin ? (
            <AdminView roomId={data.roomId} secret={data.secret} />
          ) : (
            <UserSmart roomId={data.roomId} />
          )}
        </div>
      </div>
    </div>
  );
};

const AdminView: React.FC<{ roomId: remote.RoomId; secret: remote.Secret }> = ({
  roomId,
  secret,
}) => {
  const { error, isLoading, data, refetch: refetchQueue } = useQuery(
    ["queueueue", roomId, secret],
    () => remote.adminViewQuery({ roomId, secret }),
    { refetchInterval: 1000 }
  );

  const [
    youAreHelping,
    setYouAreHelping,
  ] = React.useState<null | remote.TicketId>(null);

  if (error) {
    console.error(error);
    return <h1>ERROR! {JSON.stringify(error)}</h1>;
  }

  if ((isLoading && !data) || !data) {
    return <h1>Loading ...</h1>;
  }

  const studentLink = window.location.href.split("?")[0] + `?room=${roomId}`;

  if (!data.room) {
    // TODO
    return null;
  }

  const queue = data.room.tickets;

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
        <span className="text-gray-300">Queueue is: </span>
        <select
          className="font-bold bg-transparent"
          value={data.room.isOpen ? "open" : "closed"}
          onChange={async (e) => {
            await remote.setOpen({
              roomId,
              secret,
              open: e.target.value == "open",
            });
            refetchQueue();
          }}
        >
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>
      </p>
      {queue.length == 0 ? (
        <p className="text-3xl text-center">The queue is currently empty 📭</p>
      ) : (
        <div
          className="grid items-center gap-2"
          style={{ gridTemplateColumns: "1fr auto" }}
        >
          {queue.map((q) => {
            return (
              <React.Fragment key={q.id}>
                <div>Group {q.body}</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    className={
                      "px-2 py-1 " +
                      (q.status.isBeingHelped ? "bg-blue-700" : "bg-blue-500")
                    }
                    onClick={async () => {
                      if (!q.status.isBeingHelped) {
                        setYouAreHelping(q.id);
                      }

                      await remote.setHelpStatus({
                        roomId,
                        ticketId: q.id,
                        secret,
                        help: !q.status.isBeingHelped,
                      });

                      refetchQueue();
                    }}
                  >
                    {q.status.isBeingHelped
                      ? youAreHelping == q.id
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
                    onClick={async () => {
                      await remote.removeFromQueue({ roomId, ticketId: q.id });
                      refetchQueue();
                    }}
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

const UserSmart: React.FC<{ roomId: remote.RoomId }> = ({ roomId }) => {
  const params = getSearchParameters();

  const [ticketId, setTicketId] = React.useState<remote.TicketId | null>(
    remote.toTicketId(params["ticket"]) || null
  );
  const ticketQuery = useQuery(
    ["ticket", roomId, ticketId],
    async () => {
      const ticket = ticketId
        ? await remote.ticketQuery({ roomId, ticketId })
        : null;
      const res = ticket ?? (await remote.queueQuery({ roomId }));

      return {
        ...res,
        room: { ...res.room, ticket: ticket ? ticket.room?.ticket : void 0 },
      };
    },
    { refetchInterval: !!ticketId ? 1000 : 10000 }
  );

  const ticket =
    ticketQuery.data?.room && ticketQuery.data?.room.ticket
      ? ticketQuery.data?.room.ticket
      : null;

  React.useEffect(() => {
    if (ticket && !ticket.status.isInQueue) setTicketId(null);
  }, [ticket]);

  React.useEffect(() => {
    if (ticketId) {
      window.history.replaceState(
        {},
        "Queueue",
        `?room=${roomId}&ticket=${ticketId}`
      );
    } else {
      window.history.replaceState({}, "Queueue", `?room=${roomId}`);
    }
  }, [ticketId]);

  return (
    <UserView
      ticket={ticket}
      isOpen={ticketQuery.data?.room?.isOpen ?? false}
      leaveQueue={async () => {
        if (ticketId) {
          await remote.removeFromQueue({ roomId, ticketId });
          setTicketId(null);
        }
      }}
      enterQueue={async (groupName) => {
        const res = await remote.enterQueue({ roomId, body: groupName });
        setTicketId(res.enterQueue.id);
      }}
    />
  );
};

const UserView: React.FC<{
  ticket:
    | NonNullable<
        remote.QueryValue<typeof remote.ticketQuery>["room"]
      >["ticket"]
    | null;
  isOpen: boolean;
  leaveQueue: () => void;
  enterQueue: (groupName: string) => void;
}> = ({ ticket, isOpen, leaveQueue, enterQueue }) => {
  const [groupName, setGroupName] = React.useState("");

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

            enterQueue(groupName);
            setGroupName("");
          }}
        >
          <h1 className="text-2xl">
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

const container = document.createElement("div");
document.body.appendChild(container);

ReactDOM.render(<Root />, container);
