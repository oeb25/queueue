use std::{collections::HashMap, str::FromStr, sync::Arc};

use async_std::sync::Mutex;
use tide::Request;
use tide::{http::headers::HeaderValue, prelude::*};
// use http_types::headers::HeaderValue;
use tide::security::{CorsMiddleware, Origin};
use uuid::Uuid;

#[derive(Debug, Hash, PartialEq, Eq, PartialOrd, Ord, Serialize, Clone, Copy)]
#[serde(transparent)]
struct RoomId(Uuid);

impl RoomId {
    fn new() -> Self {
        RoomId(Uuid::new_v4())
    }
}

#[derive(Debug, Hash, PartialEq, Eq, PartialOrd, Ord, Serialize, Clone, Copy)]
#[serde(transparent)]
struct TicketId(Uuid);

impl TicketId {
    fn new() -> Self {
        TicketId(Uuid::new_v4())
    }
}

impl FromStr for RoomId {
    type Err = <Uuid as FromStr>::Err;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Ok(RoomId(s.parse()?))
    }
}
impl FromStr for TicketId {
    type Err = <Uuid as FromStr>::Err;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Ok(TicketId(s.parse()?))
    }
}

#[derive(Debug, Default)]
struct Hub {
    rooms: HashMap<RoomId, Arc<Mutex<Room>>>,
}

#[derive(Debug)]
struct Room {
    queue: Vec<Ticket>,
    secret: Uuid,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct Ticket {
    id: TicketId,
    group_name: String,
    help: bool,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
enum TicketStatus {
    Helped,
    Queued { position: usize },
}

impl Hub {
    fn new_room(&mut self) -> (RoomId, Uuid) {
        let id = RoomId::new();
        let secret = Uuid::new_v4();

        self.rooms.insert(
            id,
            Arc::new(Mutex::new(Room {
                queue: vec![],
                secret,
            })),
        );

        (id, secret)
    }
    fn get_room(&self, id: RoomId) -> Option<Arc<Mutex<Room>>> {
        self.rooms.get(&id).cloned()
    }
}

impl Room {
    fn enter_queue(&mut self, group_name: String) -> TicketId {
        let id = TicketId::new();
        self.queue.push(Ticket {
            id,
            group_name,
            help: false,
        });
        id
    }
    fn get_ticket_status(&self, id: TicketId) -> Option<TicketStatus> {
        let (position, t) = self.queue.iter().enumerate().find(|(_, t)| t.id == id)?;

        if t.help {
            Some(TicketStatus::Helped)
        } else {
            Some(TicketStatus::Queued { position })
        }
    }
    fn remove_from_queue(&mut self, id: TicketId) -> Option<Ticket> {
        let i = self.queue.iter().position(|t| t.id == id)?;

        Some(self.queue.remove(i))
    }
    fn is_secret(&self, secret: Uuid) -> bool {
        self.secret == secret
    }
    fn get_queue(&self) -> &[Ticket] {
        &self.queue
    }
    fn set_help(&mut self, id: TicketId, help: bool) -> Option<()> {
        let t = self.queue.iter_mut().find(|t| t.id == id)?;

        t.help = help;

        Some(())
    }
}

#[derive(Debug, Clone)]
struct State {
    hub: Arc<Mutex<Hub>>,
}

impl State {
    async fn get_room(&self, id: RoomId) -> tide::Result<Arc<Mutex<Room>>> {
        Ok(self
            .hub
            .lock()
            .await
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

    let mut app = tide::with_state(State { hub });

    app.with(cors);

    app.at("createRoom").post(create_room);

    let mut rooms = app.at("/room");
    let mut room = rooms.at("/:room");

    room.at("/join").post(join_room);
    room.at("/enter").post(enter_queue);

    room.at("/joinAdmin").post(join_room_as_admin);
    room.at("/getQueue").post(get_queue);

    let mut ticket = room.at("/:ticket");

    ticket.at("/leave").post(leave_queue);
    ticket.at("/position").post(get_queue_position);
    ticket.at("/help").post(help);
    ticket.at("/unhelp").post(unhelp);
    ticket.at("/remove").post(remove_from_queue);

    app.listen("127.0.0.1:8081").await?;
    Ok(())
}

/** User commands */

async fn create_room(req: Request<State>) -> tide::Result {
    let (room_id, secret) = req.state().hub.lock().await.new_room();

    Ok(json!({ "roomId": room_id, "secret": secret }).into())
}

async fn join_room(req: Request<State>) -> tide::Result {
    let room_id = req.param("room")?.parse()?;
    let _room = req.state().get_room(room_id).await?;

    Ok(json!({ "success": true }).into())
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct EnterQueueParams {
    group_name: String,
}

async fn enter_queue(mut req: Request<State>) -> tide::Result {
    let room_id = req.param("room")?.parse()?;
    let EnterQueueParams { group_name } = req.body_json().await?;
    let room = req.state().get_room(room_id).await?;
    let mut room = room.lock().await;

    let ticket = room.enter_queue(group_name);

    Ok(json!(ticket).into())
}
async fn leave_queue(req: Request<State>) -> tide::Result {
    let room_id = req.param("room")?.parse()?;
    let ticket_id = req.param("ticket")?.parse()?;
    let room = req.state().get_room(room_id).await?;
    let mut room = room.lock().await;

    room.remove_from_queue(ticket_id)
        .ok_or_else(|| tide::Error::from_str(401, "ticket is not in queue"))?;

    Ok(json!({ "success": true }).into())
}
async fn get_queue_position(req: Request<State>) -> tide::Result {
    let room_id = req.param("room")?.parse()?;
    let ticket_id = req.param("ticket")?.parse()?;
    let room = req.state().get_room(room_id).await?;
    let room = room.lock().await;

    let info = room
        .get_ticket_status(ticket_id)
        .ok_or_else(|| tide::Error::from_str(401, "ticket is not in queue"))?;

    Ok(json!(info).into())
}

/** Admin commands */

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct AdminBody {
    secret: Uuid,
}

async fn join_room_as_admin(mut req: Request<State>) -> tide::Result {
    println!("JOIN ADMIN!!!");

    let room_id = RoomId(uuid::Uuid::from_str(req.param("room")?)?);
    let AdminBody { secret } = req.body_json().await?;
    let room = req.state().get_room(room_id).await?;
    let room = room.lock().await;

    if !room.is_secret(secret) {
        return Err(tide::Error::from_str(401, "secret does not match"));
    }

    Ok(json!({ "success": true }).into())
}
async fn get_queue(mut req: Request<State>) -> tide::Result {
    let room_id = req.param("room")?.parse()?;
    let AdminBody { secret } = req.body_json().await?;
    let room = req.state().get_room(room_id).await?;
    let room = room.lock().await;

    if !room.is_secret(secret) {
        return Err(tide::Error::from_str(401, "secret does not match"));
    }

    let queue = room.get_queue();

    Ok(json!(queue).into())
}
async fn help(mut req: Request<State>) -> tide::Result {
    let room_id = req.param("room")?.parse()?;
    let ticket_id = req.param("ticket")?.parse()?;
    let AdminBody { secret } = req.body_json().await?;
    let room = req.state().get_room(room_id).await?;
    let mut room = room.lock().await;

    if !room.is_secret(secret) {
        return Err(tide::Error::from_str(401, "secret does not match"));
    }

    room.set_help(ticket_id, true)
        .ok_or_else(|| tide::Error::from_str(401, "ticket is not in queue"))?;

    Ok(json!({ "success": true }).into())
}
async fn unhelp(mut req: Request<State>) -> tide::Result {
    let room_id = req.param("room")?.parse()?;
    let ticket_id = req.param("ticket")?.parse()?;
    let AdminBody { secret } = req.body_json().await?;
    let room = req.state().get_room(room_id).await?;
    let mut room = room.lock().await;

    if !room.is_secret(secret) {
        return Err(tide::Error::from_str(401, "secret does not match"));
    }

    room.set_help(ticket_id, false)
        .ok_or_else(|| tide::Error::from_str(401, "ticket is not in queue"))?;

    Ok(json!({ "success": true }).into())
}
async fn remove_from_queue(mut req: Request<State>) -> tide::Result {
    let room_id = req.param("room")?.parse()?;
    let ticket_id = req.param("ticket")?.parse()?;
    let AdminBody { secret } = req.body_json().await?;
    let room = req.state().get_room(room_id).await?;
    let mut room = room.lock().await;

    if !room.is_secret(secret) {
        return Err(tide::Error::from_str(401, "secret does not match"));
    }

    room.remove_from_queue(ticket_id)
        .ok_or_else(|| tide::Error::from_str(401, "ticket is not in queue"))?;

    Ok(json!({ "success": true }).into())
}
