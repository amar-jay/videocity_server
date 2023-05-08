use actix::{Addr, Actor, StreamHandler};
use actix_web_actors::ws;
use crate::{room::Room, server::Server};

/// This is the websocket session, state is persisted across requests
pub struct Ws {
	pub id: i64,
	/// ought to be unique 	
	pub session_id: i64,
	pub room: Option<Room>,
	pub hb: std::time::Instant,
	pub server_addr: Addr<Server>,
	pub is_login: bool,
}

impl Actor for Ws {

	type Context = ws::WebsocketContext<Self>;


	fn started(&mut self, ctx: &mut Self::Context) {
		println!("Ws actor is alive from session");
	}

	fn stopping(&mut self, ctx: &mut Self::Context) -> actix::Running {
		println!("Ws actor is killed from session");
		actix::Running::Stop
	}
}

impl Ws {
	fn hb(&self, ctx: &mut ws::WebsocketContext<Self>) {}


}

type MessageResult = std::result::Result<ws::Message, ws::ProtocolError>;
impl StreamHandler<MessageResult> for Ws {
	fn handle(&mut self, msg: MessageResult, ctx: &mut Self::Context) {
		println!("Ws actor is handling message from session");
	}
}