use std::{collections::HashMap, rc::Rc};
use crate::media::MediaWorkerManager;
use mediasoup::worker_manager::WorkerManager;

use actix::{Context, Actor, Arbiter, Running};
use async_rwlock::RwLock;

use crate::room::Room;

pub struct Server {
	pub rooms: HashMap<String, Room>,
	worker: Rc<RwLock<MediaWorkerManager>>,
	arbiter: HashMap<String, Arbiter>,
}


impl Server {
	pub async fn new() -> Server {
		let manager = WorkerManager::new();
		let worker = Rc::new(RwLock::new(MediaWorkerManager::new(manager)));
		let arbiter = HashMap::new();
		let rooms = HashMap::new();
		Server {
			rooms,
			worker, 
			arbiter,
		}
	}
}

impl Actor for Server {
	type Context = Context<Self>;

	fn started(&mut self, ctx: &mut Self::Context) {
		println!("Server actor is alive");
	}

	fn stopping(&mut self, ctx: &mut Self::Context) -> Running {
		println!("Server actor is stopped");

		Running::Stop
	}
}