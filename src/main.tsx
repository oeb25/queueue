import "./styles.css";

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as api from "./api";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";

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

  const [roomId, setRoomId] = React.useState<null | api.RoomId>(
    api.toRoomId(params["room"]) || null
  );
  const [secret, setSecret] = React.useState<null | string>(
    api.toRoomId(params["secret"]) || null
  );

  const { error, isLoading, data } = useQuery(
    ["join-room", roomId, secret],
    async () => {
      if (!roomId) return null;

      if (secret) {
        try {
          await api.joinRoomAsAdmin(roomId, secret);
          return { isAdmin: true, roomId, secret } as const;
        } catch (e) {
          console.error("Failed to login as admin", e);
        }
      } else {
        try {
          await api.joinRoom(roomId);
          return { isAdmin: false, roomId } as const;
        } catch (e) {
          console.error("Failed to join room as user", e);
        }
      }
    },
    {
      enabled: !!roomId,
    }
  );

  if (error) {
    return <h1>Error: {JSON.stringify(error)}</h1>;
  }
  if (isLoading) {
    return <h1>Loading....</h1>;
  }
  if (!data) {
    return (
      <div>
        <button
          onClick={async () => {
            const res = await api.createRoom();
            window.history.pushState(
              {},
              "Room " + res.roomId,
              `/?room=${res.roomId}&secret=${res.secret}`
            );
            setSecret(res.secret);
            setRoomId(res.roomId);
          }}
        >
          Create room
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="flex flex-col items-center justify-center w-full max-w-2xl">
        <div className="flex flex-col items-center w-full p-12 text-white bg-gray-700 max-w-xg">
          {data.isAdmin ? (
            <AdminView roomId={data.roomId} secret={data.secret} />
          ) : (
            <UserSmart roomId={data.roomId} />
          )}
        </div>
      </div>
    </div>
  );
};

const AdminView: React.FC<{ roomId: api.RoomId; secret: string }> = ({
  roomId,
  secret,
}) => {
  const { error, isLoading, data: queue, refetch: refetchQueue } = useQuery(
    ["queue", roomId, secret],
    () => api.getQueue(roomId, secret),
    { refetchInterval: 1000 }
  );

  if (error) {
    console.error(error);
    return <h1>ERROR! {JSON.stringify(error)}</h1>;
  }

  if ((isLoading && !queue) || !queue) {
    return <h1>Loading ...</h1>;
  }

  console.log(queue);

  const studentLink = window.location.href.split("?")[0] + `?room=${roomId}`;

  return (
    <div className="flex flex-col items-center">
      <h1 className="pb-2 text-lg text-center">
        Hello, welcome to <span className="italic">Queueue Admin</span> 👩‍💼
      </h1>
      <h1 className="pb-2 text-lg text-center">
        Student link:{" "}
        <span className="bg-transparent select-all">{studentLink}</span>
      </h1>
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
                <div>Group {q.groupName}</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    className={
                      "px-2 py-1 " + (q.help ? "bg-blue-700" : "bg-blue-500")
                    }
                    onClick={async () => {
                      if (q.help) {
                        await api.unhelp(roomId, q.id, secret);
                      } else {
                        await api.help(roomId, q.id, secret);
                      }

                      refetchQueue();
                    }}
                  >
                    {q.help ? "Unhelp" : "Help!"}
                  </button>
                  <button
                    className={
                      "px-2 py-1 " +
                      (q.help
                        ? "bg-gray-900"
                        : "bg-gray-800 cursor-not-allowed opacity-50")
                    }
                    onClick={async () => {
                      await api.removeFromQueue(roomId, q.id, secret);
                      refetchQueue();
                    }}
                    disabled={!q.help}
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

const UserSmart: React.FC<{ roomId: api.RoomId }> = ({ roomId }) => {
  const params = getSearchParameters();

  const [ticketId, setTicketId] = React.useState<api.TicketId | null>(
    api.toTicketId(params["ticket"]) || null
  );
  const ticketQuery = useQuery(
    ["ticket", roomId, ticketId],
    () => (ticketId ? api.getQueuePosition(roomId, ticketId) : null),
    { enabled: !!ticketId, refetchInterval: 1000 }
  );

  React.useEffect(() => {
    if (
      ticketQuery.error ||
      ticketQuery.isRefetchError ||
      ticketQuery.failureCount
    )
      setTicketId(null);
  }, [ticketQuery.error, ticketQuery.isRefetchError, ticketQuery.failureCount]);

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
      ticket={ticketQuery.data ?? null}
      leaveQueue={async () => {
        if (ticketId) {
          await api.leaveQueue(roomId, ticketId);
          setTicketId(null);
        }
      }}
      enterQueue={async (groupName) => {
        const ticketId = await api.enterQueue(roomId, groupName);
        setTicketId(ticketId);
      }}
    />
  );
};

const UserView: React.FC<{
  ticket: api.TicketStatus | null;
  leaveQueue: () => void;
  enterQueue: (groupName: string) => void;
}> = ({ ticket, leaveQueue, enterQueue }) => {
  const [groupName, setGroupName] = React.useState("");

  return (
    <>
      {ticket ? (
        <div className="flex flex-col items-center p-6">
          <p className="p-2 text-gray-400">Group {groupName}</p>
          {"helped" == ticket ? (
            <p className="p-2 pb-4 text-3xl text-center">
              It's your turn, help is on the way! 🎉
            </p>
          ) : (
            <>
              <p className="p-2 text-gray-300">Your position in queue:</p>
              <p className="text-8xl">{ticket.queued.position + 1}</p>
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
          <p>Enter your group number and join the queue!</p>
          <input
            className="p-10 text-xl text-center bg-transparent outline-none appearance-none no-spin"
            placeholder="Group nr"
            type="number"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
          <button>Join queue</button>
        </form>
      )}
    </>
  );
};

const container = document.createElement("div");
document.body.appendChild(container);

ReactDOM.render(<Root />, container);
