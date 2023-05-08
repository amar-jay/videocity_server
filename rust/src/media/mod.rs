use std::ops::Add;

use actix::Addr;
use mediasoup::worker_manager::WorkerManager;

use crate::server::Server;
pub struct MediaWorkerManager {
	worker_manager: WorkerManager,
}


impl MediaWorkerManager {
	pub fn new(worker_manager: WorkerManager) -> MediaWorkerManager {
		MediaWorkerManager {
			worker_manager,
		}
	}

	pub fn run(&mut self, addr: Addr<Server>) {
	}

	pub fn clear_workers(&mut self) {
	}

}