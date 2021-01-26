import "./styles.css";

import * as React from "react";
import * as ReactDOM from "react-dom";
import firebase from "firebase/app";
import "firebase/firestore";

// const API_KEY = "AIzaSyC2VtViBR69-QsXK_EpU42YqoL0QSZE_YQ";
// const PROJECT_ID = "queueue-bdafe";
// const SENDER_ID = "1041937679926";
// const APP_ID = "1:1041937679926:web:58522184c9a81cf2a0fa97";

// const firebaseConfig = {
//   apiKey: API_KEY,
//   authDomain: `${PROJECT_ID}.firebaseapp.com`,
//   databaseURL: `https://${PROJECT_ID}.firebaseio.com`,
//   projectId: PROJECT_ID,
//   storageBucket: `${PROJECT_ID}.appspot.com`,
//   messagingSenderId: SENDER_ID,
//   appId: APP_ID,
// };

const firebaseConfig = {
  apiKey: "AIzaSyC2VtViBR69-QsXK_EpU42YqoL0QSZE_YQ",
  authDomain: "queueue-bdafe.firebaseapp.com",
  projectId: "queueue-bdafe",
  // storageBucket: "queueue-bdafe.appspot.com",
  // messagingSenderId: "1041937679926",
  // appId: "1:1041937679926:web:58522184c9a81cf2a0fa97",
};

firebase.initializeApp(firebaseConfig);

const fs = firebase.firestore();

(async () => {
  console.log(fs.app);
  await fs.waitForPendingWrites();
  await fs.enableNetwork();
  const queueCollection = fs.collection("queue");

  console.log(await (await queueCollection.get()).docs);
})();

type FirestoreElement = { id: string } & Record<string, any>;

function useCollection<T>(
  name: string,
  query?: (fs: firebase.firestore.CollectionReference) => Promise<T>
) {
  const [collection, setCollection] = React.useState(() =>
    firebase.firestore().collection(name)
  );
  // const [data, setData] = React.useState<FirestoreElement[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [queryResult, setQueryResult] = React.useState<null | T>(null);

  React.useEffect(() => {
    const collection = firebase.firestore().collection(name);
    setCollection(collection);
    collection.onSnapshot(
      async (snapshot) => {
        // const collectionData = snapshot.docs.map((doc) => ({
        //   id: doc.id,
        //   ...doc.data(),
        // }));
        // setData(collectionData);
        if (query) {
          setQueryResult(await query(collection));
        }
      },
      (e) => setError(true)
    );
  }, [name, query]);

  return { collection, loading, error, queryResult };
}

type QueueEntry = { name: string; id: string };

const setStoredQueueEntry = (q: QueueEntry) => {
  localStorage.setItem("queue-entry", JSON.stringify(q));
};
const getStoredQueueEntry = (): null | QueueEntry =>
  JSON.parse(localStorage.getItem("queue-entry") || "null");

const App: React.FC<{}> = ({}) => {
  const query = React.useCallback(
    async (c: firebase.firestore.CollectionReference) => {
      return await c.orderBy("createdAt").get();
    },
    []
  );
  const { collection, queryResult } = useCollection("queue", query);
  const [groupName, setGroupName] = React.useState("");
  const [queueEntry, setQueueEntry] = React.useState<null | QueueEntry>(null);

  React.useEffect(() => {
    const old = getStoredQueueEntry();
    if (old) {
      setQueueEntry(old);
    }
  }, []);

  const isInQueue =
    (queryResult?.docs.findIndex((d) => d.id == queueEntry?.id) ?? -1) >= 0;

  const placeInQueue = queryResult?.docs
    .filter((d) => !d.data().helping)
    .findIndex((d) => d.id == queueEntry?.id);

  React.useEffect(() => {
    if (!queryResult) return;
    if (!isInQueue) setQueueEntry(null);
  }, [queryResult, placeInQueue]);

  const [isAdmin, setIsAdmin] = React.useState(
    window.location.hash == "#secret-code-123"
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="flex flex-col items-center justify-center w-full max-w-2xl">
        <div className="flex flex-col items-center w-full p-12 text-white bg-gray-700 max-w-xg">
          {/* <input
            type="checkbox"
            checked={isAdmin}
            onChange={(e) => setIsAdmin(e.target.checked)}
          /> */}
          {/* <button
            onClick={async () => {
              const next =
                1 +
                Math.max(
                  0,
                  ...(queryResult?.docs || []).map((d) => d.data().createdAt)
                );

              for (let i = next; i < next + 10; i++) {
                const doc = await collection.add({
                  name: groupName,
                  createdAt: i,
                });
              }
            }}
          >
            FILL EM UP!
          </button> */}
          {isAdmin ? (
            <div className="flex flex-col items-center">
              <h1 className="pb-2 text-lg text-center">
                Hello, welcome to <span className="italic">Queueue Admin</span>{" "}
                👩‍💼
              </h1>
              {!queryResult?.size ? (
                <p className="text-3xl text-center">
                  The queue is currently empty 📭
                </p>
              ) : (
                <div
                  className="grid items-center gap-2"
                  style={{ gridTemplateColumns: "1fr auto" }}
                >
                  {queryResult?.docs.map((doc) => {
                    const data = doc.data();
                    return (
                      <React.Fragment key={doc.id}>
                        <div>Group {data.name}</div>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            className={
                              "px-2 py-1 " +
                              (data.helping ? "bg-blue-700" : "bg-blue-500")
                            }
                            onClick={() => {
                              collection
                                .doc(doc.id)
                                .update("helping", !data.helping);
                            }}
                          >
                            {data.helping ? "Unhelp" : "Help!"}
                          </button>
                          <button
                            className={
                              "px-2 py-1 " +
                              (data.helping
                                ? "bg-gray-900"
                                : "bg-gray-800 cursor-not-allowed opacity-50")
                            }
                            onClick={() => {
                              collection.doc(doc.id).delete();
                            }}
                            disabled={!data.helping}
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
          ) : (
            <>
              {queueEntry ? (
                <div className="flex flex-col items-center p-6">
                  <p className="p-2 text-gray-400">Group {queueEntry.name}</p>
                  {queryResult?.docs.find((d) => d.id == queueEntry.id)?.data()
                    .helping ? (
                    <p className="p-2 pb-4 text-3xl text-center">
                      It's your turn, help is on the way! 🎉
                    </p>
                  ) : (
                    <>
                      <p className="p-2 text-gray-300">
                        Your position in queue:
                      </p>
                      <p className="text-8xl">
                        {typeof placeInQueue == "number"
                          ? placeInQueue + 1
                          : "..."}
                      </p>
                    </>
                  )}
                  <button
                    onClick={() => {
                      collection.doc(queueEntry!.id).delete();
                    }}
                  >
                    Leave queue
                  </button>
                </div>
              ) : (
                <form
                  className="flex flex-col items-center w-full"
                  onSubmit={async (e) => {
                    e.preventDefault();

                    if (!groupName || Number.isNaN(parseInt(groupName))) {
                      return;
                    }

                    const doc = await collection.add({
                      name: groupName,
                      createdAt:
                        1 +
                        Math.max(
                          0,
                          ...(queryResult?.docs || []).map(
                            (d) => d.data().createdAt
                          )
                        ),
                    });
                    setQueueEntry({ id: doc.id, name: groupName });
                    setStoredQueueEntry({ id: doc.id, name: groupName });
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
          )}
        </div>
      </div>
    </div>
  );
};

const container = document.createElement("div");
document.body.appendChild(container);

ReactDOM.render(<App />, container);
