const express = require("express")
const http = require("http")
const app = express()
const server = http.createServer(app)
const io = require("socket.io")(server, {
	cors: {
		origin: "http://localhost:3000",
		methods: [ "GET", "POST" ]
	}
}) 
let id_room=new Map();
let all_connection=new Map();
let room_admins=new Map();
io.on("connection", (socket) => {
 
	socket.broadcast.emit("me", socket.id);
	// socket.on("me",(data)=>{
	// 	console.log("in me useeffect",data);
	// 	socket.to(data).emit("me",socket.id);
	// })
	console.log(socket.id,"new socket user");
	socket.on("join_room", (data) => {
		console.log(data);
		socket.join(data.room_id);
		// socket.username=data.user_name;
		let obj={
			id:data.me,
			name:data.user_name
		}  
		if(data.user_name=="admin"){
			room_admins.set(data.room_id,obj);
		}
		if(all_connection.get(data.room_id)==null){
			let temp=[obj];
			all_connection.set(data.room_id,temp);
		}else{
			let temp=all_connection.get(data.room_id);
			temp.push(obj);
			all_connection.set(data.room_id,temp);
			 
		}  
		
		id_room.set(socket.id,data.room_id);
		socket.broadcast.emit("roommembers",room_admins.get(data.room_id));
		// const clients = io.sockets.adapter.rooms.get(data.room_id);
		

	})
	// socket.on("save_username",(data)=>{

	// }) 
	socket.on("disconnect", () => {
		
		let leaving_id=socket.id;
		console.log(socket.id,"is leaving");
		socket.broadcast.emit("callEnded",socket.listen);
		// try{
		// 	let room_leaving=id_room.get(leaving_id);
		// let room_member=all_connection.get(room_leaving);
		// let temp=[];
		// for(const obj in room_member){
		// 	if(obj.id!=leaving_id)temp.push(obj);
		// 	else
		// 	console.log("user ",obj.name," is leaving room ",room_leaving," with id ",leaving_id);
		// }
		// all_connection.delete(room_leaving);
		// id_room.delete(leaving_id);
		// all_connection.set(room_leaving,temp);
		// 
		// }catch(e){
		// 	console.log(e)
		// }
		
		
	})
  
	socket.on("callUser", (data) => {
		// console.log(data,"in calluser");
		
		io.to(data.userToCall).emit("callUser", { signal: data.signalData, from: data.from, name: data.name })
	})

	socket.on("answerCall", (data) => {
		io.to(data.to).emit("callAccepted", data.signal)
	})
})

server.listen(5000, () => console.log("server is running on port 5000"))
