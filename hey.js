const fs = require("fs")
const main = async (url) => {
	let times = 0;
	var writeStream = fs.createWriteStream("./hey.txt");
while (true) {
 const e = await fetch(url, {
	method: 'POST',
	headers: {
		cookie: ".ASPXAUTH=327A1ED710C23773E93D0D8A2EA988623C3D52FED8EF9E43DF31681C426689C9DCF17AB45CB719B215B39B0186A90ECCC4498B470AC51B1FE4485EA9E802C02EA072714C882F864B40ED9E7E08A43D6334DC94677E76CC3F3CE89B4E4464F4F750894E8A"
	}
 })
	.then(e => {
//		e.body.pipe(writeStream)
		console.log(e);
		process.exit(0);
	//	return e.text();
	})
	.then(() => console.log("Times: ", ++times))
		.catch(console.error)
}
}

const url = "https://ues.marmara.edu.tr/files/put/BB4A9809E38F4C7AB0D92B762C36F95F?attach=true";
main(url);
