use actix::Addr;

use crate::{server::Server};
pub struct Room {
	id: String, 
	addr: Addr<Server>,
}

type Result<T> = std::io::Result<T>;

impl Room {
	pub fn new(id: String, addr: Addr<Server>) -> Result<Room> {
		Ok(
			Room {
				id,
				addr,
			}
		)
	}

	pub fn get_id(&self) -> String {
		self.id.clone()
	}

	pub fn create_webrtc_transport(&self) -> Result<()> {
		Ok(())
	}

	pub async fn notify_join_user(&self) -> Result<()> {
		Ok(())
	}

	pub async fn notify_leave_user(&self) -> Result<()> {
		Ok(())
	}

	pub async fn send_message(&self) -> Result<()> {
		Ok(())
	}
}
