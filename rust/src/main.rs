use actix::*;
use dotenv::dotenv;

type Result<T> = std::io::Result<T>;
#[actix_web::main]
async fn main() -> Result<()> {
    dotenv().ok();
    let port: String = env::var("PORT").unwrap();
    let addr: String = env::var("ADDR").unwrap();


    // HTTP Server with socket
    HttpServer::new(move || {})
        .bind(addr + ":" + port.as_str())
        .unwrap()
        .run()
        .await

}
