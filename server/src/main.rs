use std::{collections::HashMap, sync::Arc};

use async_graphql::{
    http::{playground_source, GraphQLPlaygroundConfig},
    Context, EmptySubscription, InputValueError, InputValueResult, Object, Scalar, ScalarType,
    Schema, SimpleObject, Value,
};
use async_std::sync::Mutex;
use tide::{
    http::{headers::HeaderValue, mime},
    security::{CorsMiddleware, Origin},
};
use uuid::Uuid;

macro_rules! id {
    ($name:ident) => {
        #[derive(Debug, Hash, PartialEq, Eq, PartialOrd, Ord, Clone, Copy)]
        struct $name(Uuid);

        impl $name {
            fn new() -> Self {
                $name(Uuid::new_v4())
            }
        }

        #[Scalar]
        impl ScalarType for $name {
            fn parse(value: Value) -> InputValueResult<Self> {
                match value {
                    Value::String(s) => Ok($name(Uuid::parse_str(&s).map_err(|_| {
                        InputValueError::custom(concat!("Invalid ", stringify!($name)))
                    })?)),
                    _ => Err(InputValueError::custom("Value must be string")),
                }
            }

            fn to_value(&self) -> Value {
                Value::String(self.0.to_string())
            }
        }
    };
}

id!(RoomId);
id!(TicketId);
id!(Secret);

#[derive(Debug, Default)]
struct Hub {
    rooms: HashMap<RoomId, Arc<Mutex<Room>>>,
}

#[derive(Debug)]
struct Room {
    queue: Vec<Ticket>,
    secret: Secret,
    is_open: bool,
}

#[derive(Debug)]
struct Ticket {
    id: TicketId,
    body: String,
    help: bool,
}

#[derive(Debug)]
enum TicketStatus {
    Helped,
    Queued { position: usize },
    NotInQueue,
}

impl Hub {
    fn new_room(&mut self) -> (RoomId, Secret) {
        let id = RoomId::new();
        let secret = Secret::new();

        self.rooms.insert(
            id,
            Arc::new(Mutex::new(Room {
                queue: vec![],
                secret,
                is_open: false,
            })),
        );

        (id, secret)
    }
    fn get_room(&self, id: RoomId) -> Option<Arc<Mutex<Room>>> {
        self.rooms.get(&id).cloned()
    }
}

impl Room {
    fn enter_queue(&mut self, body: String) -> TicketId {
        let id = TicketId::new();
        self.queue.push(Ticket {
            id,
            body,
            help: false,
        });
        id
    }
    fn get_ticket(&self, id: TicketId) -> Option<(usize, &Ticket)> {
        self.queue.iter().enumerate().find(|(_, t)| t.id == id)
    }
    fn get_ticket_mut(&mut self, id: TicketId) -> Option<(usize, &mut Ticket)> {
        self.queue.iter_mut().enumerate().find(|(_, t)| t.id == id)
    }
    fn get_ticket_status(&self, id: TicketId) -> TicketStatus {
        if let Some((position, t)) = self.get_ticket(id) {
            if t.help {
                TicketStatus::Helped
            } else {
                TicketStatus::Queued { position }
            }
        } else {
            TicketStatus::NotInQueue
        }
    }
    fn remove_from_queue(&mut self, id: TicketId) -> Option<Ticket> {
        let (i, _) = self.get_ticket(id)?;

        Some(self.queue.remove(i))
    }
    fn is_secret(&self, secret: Secret) -> bool {
        self.secret == secret
    }
    fn set_help(&mut self, id: TicketId, help: bool) -> Option<()> {
        self.get_ticket_mut(id)?.1.help = help;

        Some(())
    }
    fn is_open(&self) -> bool {
        self.is_open
    }
    fn set_open(&mut self, open: bool) {
        self.is_open = open;
    }
}

#[derive(Debug, Clone)]
struct State {
    hub: Arc<Mutex<Hub>>,
}

impl State {
    async fn get_room(&self, id: RoomId) -> tide::Result<Arc<Mutex<Room>>> {
        let hub = self.hub.lock().await;
        Ok(hub
            .get_room(id)
            .ok_or_else(|| tide::Error::from_str(401, "room does not exist"))?)
    }
}

#[async_std::main]
async fn main() -> tide::Result<()> {
    tide::log::with_level(tide::log::LevelFilter::Info);
    let cors = CorsMiddleware::new()
        .allow_methods("GET, POST, OPTIONS".parse::<HeaderValue>().unwrap())
        .allow_origin(Origin::from("*"))
        .allow_credentials(false);

    let hub = Arc::new(Mutex::new(Hub::default()));

    let schema = Schema::build(QueryRoot, MutationRoot, EmptySubscription)
        .data(State { hub })
        .finish();

    #[cfg(debug_assertions)]
    {
        std::fs::write("./schema.gql", schema.sdl()).expect("failed to write schema");
    }

    let mut app = tide::new();

    app.with(cors);

    app.at("/graphql")
        .post(async_graphql_tide::endpoint(schema));

    // enable graphql playground
    app.at("/").get(|_| async move {
        Ok(tide::Response::builder(tide::StatusCode::Ok)
            .body(tide::Body::from_string(playground_source(
                GraphQLPlaygroundConfig::new("/graphql"),
            )))
            .content_type(mime::HTML)
            .build())
    });

    let port = std::env::var("PORT").unwrap_or_else(|_| "8081".to_string());
    let host = std::env::var("HOST").unwrap_or_else(|_| "127.0.0.1".to_string());

    app.listen(format!("{}:{}", host, port)).await?;
    Ok(())
}

struct QueryRoot;

#[Object]
impl QueryRoot {
    #[cfg(debug_assertions)]
    async fn rooms(&self, ctx: &Context<'_>) -> async_graphql::Result<Vec<RoomObject>> {
        Ok(ctx
            .data::<State>()?
            .hub
            .lock()
            .await
            .rooms
            .iter()
            .map(|(&id, r)| RoomObject {
                id,
                room: r.clone(),
            })
            .collect())
    }
    async fn room(
        &self,
        ctx: &Context<'_>,
        id: RoomId,
    ) -> async_graphql::Result<Option<RoomObject>> {
        if let Ok(room) = ctx.data::<State>()?.get_room(id).await {
            Ok(Some(RoomObject { id, room }))
        } else {
            Ok(None)
        }
    }
}

#[derive(Clone)]
struct RoomObject {
    id: RoomId,
    room: Arc<Mutex<Room>>,
}

#[Object]
impl RoomObject {
    async fn id(&self) -> RoomId {
        self.id
    }
    async fn tickets(&self, secret: Secret) -> async_graphql::Result<Vec<TicketObject>> {
        let room = self.room.lock().await;
        if !room.is_secret(secret) {
            return Err(async_graphql::Error::new("Secret is not correct"));
        }

        Ok(room
            .queue
            .iter()
            .map(|q| TicketObject {
                room_object: self.clone(),
                body: q.body.clone(),
                id: q.id,
            })
            .collect())
    }
    async fn ticket(&self, id: TicketId) -> async_graphql::Result<Option<TicketObject>> {
        let room = self.room.lock().await;

        Ok(room.get_ticket(id).map(|(_, q)| TicketObject {
            room_object: self.clone(),
            body: q.body.clone(),
            id: q.id,
        }))
    }
    async fn is_secret(&self, secret: Option<Secret>) -> bool {
        match secret {
            Some(secret) => self.room.lock().await.is_secret(secret),
            None => false,
        }
    }
    async fn is_open(&self) -> bool {
        let room = self.room.lock().await;

        room.is_open()
    }
}

struct TicketObject {
    room_object: RoomObject,
    id: TicketId,
    body: String,
}

#[Object]
impl TicketObject {
    async fn id(&self) -> TicketId {
        self.id
    }
    async fn body(&self) -> String {
        self.body.clone()
    }
    async fn status(&self) -> async_graphql::Result<TicketStatus> {
        let room = self.room_object.room.lock().await;
        let status = room.get_ticket_status(self.id);
        Ok(status)
    }
}

#[Object]
impl TicketStatus {
    async fn position(&self) -> Option<usize> {
        match self {
            TicketStatus::Queued { position } => Some(*position),
            _ => None,
        }
    }
    async fn is_being_helped(&self) -> bool {
        matches!(self, TicketStatus::Helped)
    }
    async fn is_in_queue(&self) -> bool {
        !matches!(self, TicketStatus::NotInQueue)
    }
}

struct MutationRoot;

#[Object]
impl MutationRoot {
    async fn create_room(&self, ctx: &Context<'_>) -> async_graphql::Result<CreateRoomResponse> {
        let (room_id, secret) = ctx.data::<State>()?.hub.lock().await.new_room();
        Ok(CreateRoomResponse { room_id, secret })
    }
    async fn enter_queue(
        &self,
        ctx: &Context<'_>,
        room_id: RoomId,
        body: String,
    ) -> async_graphql::Result<TicketObject> {
        let room_ref = ctx.data::<State>()?.get_room(room_id).await?;
        let ticket = room_ref.lock().await.enter_queue(body.clone());

        Ok(TicketObject {
            room_object: RoomObject {
                id: room_id,
                room: room_ref,
            },
            body,
            id: ticket,
        })
    }
    async fn leave_queue(
        &self,
        ctx: &Context<'_>,
        room_id: RoomId,
        ticket_id: TicketId,
    ) -> async_graphql::Result<bool> {
        let room = ctx.data::<State>()?.get_room(room_id).await?;
        let ticket = room.lock().await.remove_from_queue(ticket_id);

        Ok(ticket.is_some())
    }
    async fn set_help(
        &self,
        ctx: &Context<'_>,
        room_id: RoomId,
        ticket_id: TicketId,
        secret: Secret,
        help: bool,
    ) -> async_graphql::Result<bool> {
        let room = ctx.data::<State>()?.get_room(room_id).await?;
        let mut room = room.lock().await;
        if !room.is_secret(secret) {
            return Err(async_graphql::Error::new("Secret is not correct"));
        }

        let ticket = room.set_help(ticket_id, help);

        Ok(ticket.is_some())
    }
    async fn set_open(
        &self,
        ctx: &Context<'_>,
        room_id: RoomId,
        secret: Secret,
        open: bool,
    ) -> async_graphql::Result<bool> {
        let room = ctx.data::<State>()?.get_room(room_id).await?;
        let mut room = room.lock().await;
        if !room.is_secret(secret) {
            return Err(async_graphql::Error::new("Secret is not correct"));
        }

        room.set_open(open);

        Ok(open)
    }
}

#[derive(Debug, SimpleObject)]
struct CreateRoomResponse {
    room_id: RoomId,
    secret: Secret,
}
