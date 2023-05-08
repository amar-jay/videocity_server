#![allow(unused)]
use actix::{Addr, Actor, Arbiter };
use actix_files as fs;
use actix_web::{HttpServer, App, web, middleware::Logger, HttpResponse, Error, HttpRequest};
use actix_web_actors::ws;
use dotenv::dotenv;
use server::Server;
use session::Ws;

mod db;
mod room;
mod media;
mod server;
mod session;


// // websocket route entry point
fn ws_route(
    req: HttpRequest,
    stream: web::Payload,
    srv: web::Data<Addr<Server>>,
) -> Result<HttpResponse, Error> {
    ws::start(
        Ws {
            id: 0,
            session_id: 0,
            room: None,
            hb: std::time::Instant::now(),
            server_addr: srv.get_ref().clone(),
            is_login: false,
        },
        &req,
        stream,
    )
}

fn static_files() -> actix_files::Files {
    fs::Files::new("/static/", "./public/")
    .show_files_listing()
    .use_last_modified(true)
    .use_etag(true) 
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    let port: String = std::env::var("PORT").expect("$PORT variable not found");
    let addr: String = std::env::var("ADDR").expect("$ADDR variable not found");
    
    // spawn thread for actors
    let arbiter = Arbiter::new();
    let server_actor_addr = arbiter
    .exec(move || async move {
        let server = Server::new().await;
        server.start();
    })
    .await
    .unwrap()
    .await;


    // HTTP Server with socket
    HttpServer::new(move || {
        let logger = Logger::default();
        App::new()
        .wrap(logger)
            .data(server_actor_addr.clone())
            // .service(web::resource("/ws").to(ws_route)) // DO NOT FUCKING UNERSTAND WHY?
            .service(web::resource("/").to(|| HttpResponse::Ok().body("Hello")))
            // .service(static_files)

    })
        .bind(addr + ":" + port.as_str())
        .unwrap()
        .run()
        .await

}
