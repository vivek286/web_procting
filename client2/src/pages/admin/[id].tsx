// import Button from "@material-ui/core/Button"
// import IconButton from "@material-ui/core/IconButton"
// import TextField from "@material-ui/core/TextField"
// import AssignmentIcon from "@material-ui/icons/Assignment"
// import PhoneIcon from "@material-ui/icons/Phone"
import React, { useEffect, useRef, useState } from "react"
// import { CopyToClipboard } from "react-copy-to-clipboard"
import Peer from "simple-peer"
// import { Socket } from "socket.io";
import io from "socket.io-client"
// import "./App.css"


const socket = io.connect('http://localhost:5000');
function App() {
	const [ me, setMe ] = useState("")
	const [ stream, setStream ] = useState()
	const [ receivingCall, setReceivingCall ] = useState(false)
	const [ caller, setCaller ] = useState("")
	const [secon,setsecons]=useState(false);
	const [ callerSignal, setCallerSignal ] = useState()
	const [ callAccepted, setCallAccepted ] = useState(false)
	const [ idToCall, setIdToCall ] = useState("")
	const [ callEnded, setCallEnded] = useState(false)
	const [ name, setName ] = useState("")
    const [user_name,setuser_name]=useState("admin");
    const [users,setusers]=useState([{id:"",name:""}]);
	const myVideo = useRef()
	const userVideo = useRef()
	const connectionRef= useRef()
	const [peers, setPeers] = useState([]);
	const videoRef = useRef();
    const[room_id,setroom_id]=useState("");
	const [peerConnections, setPeerConnections] = useState([]);
	useEffect(() => {
        let curr_url=window.location.href;
         let temp=curr_url.split("admin/")[1];
         setroom_id(temp);
		 
        // alert(room_id);
         
        // socket.join(room_id);
 
		navigator.mediaDevices.getUserMedia({ video: true, audio: false }).then((stream) => {
			setStream(stream)
				myVideo.current.srcObject = stream
				 
		})
		// socket.emit("me",room_id);
	socket.on("me", (id:string) => {
			console.log("acception gme");
			setMe(id);
			
		})
         
        socket.on("roommembers",(data)=>{
            setusers(data); 
        })
		socket.on("callUser", (data) => { 
			console.log("In calluser useeffect");
			// alert(data.name+" is calling ");
			setReceivingCall(true)
			setCaller(data.from)
			setName(data.name)
			setCallerSignal(data.signal);
		})
	}, [peerConnections])
     

	const callUser = (id) => {
		const peer = new Peer({
			initiator: true,
			trickle: false,
			stream: stream
		})
		peer.on("signal", (data) => {
			console.log("in signal function line 54")
			socket.emit("callUser", {
				userToCall: id,
				signalData: data,
				from: me,
				name: name
			})
		})
		peer.on("stream", (stream) => {
			console.log("in line 63")
			let temp={
				peerId: name,
				stream: stream,
			  };
			  setPeerConnections(prevConnections => [...prevConnections, temp]);
				// userVideo.current.srcObject = stream
				
		})
		socket.on("callAccepted", (signal) => {
			console.log("in line 68");
			setCallAccepted(true)
			peer.signal(signal)
		})

		connectionRef.current = peer
	}

	const answerCall =() =>  {
		setCallAccepted(true)
		const peer = new Peer({
			initiator: false,
			trickle: false,
			stream: stream
		}) 
		peer.on("signal", (data) => {
			console.log("in line 84")
			socket.emit("answerCall", { signal: data, to: caller })
		})
		peer.on("stream", (stream) => {
			let temp={
				peerId: name,
				stream: stream,
			  };
			  setPeerConnections(prevConnections => [...prevConnections, temp]);
			console.log("in line 88");
			// userVideo.current.srcObject = stream
		})
		    
		peer.signal(callerSignal)
		
		connectionRef.current = peer
	}

	const leaveCall = () => {
		setCallEnded(true)
		connectionRef?.current?.destroy()
	}
 
	function handleNewConnection(peer) {
		// setPeerConnections(prevConnections => [...prevConnections, peer]);
		let video = document.getElementById(peer.peerId);
		console.log(video,"video html element")
			if (video) {
				video.srcObject = peer.stream;
				video.play();
			}
	}
    function call_admin(){
        
        for(let i=0;i<users.length;i++){
            if(users[i].name=="admin"){
                setIdToCall(users[i].id);
            }
        } 
        callUser(idToCall);
    }
	return (
		<>
			<h1 style={{ textAlign: "center", color: '#fff' }}>Skill Board Procting</h1>
		<div className="container">
			{/* {Object.keys(socket).length} */}
            {/* {soc} */}
            {JSON.stringify(users)}
			<div className="video-container">
				<div className="video">
					{stream &&  <video playsInline muted ref={myVideo} autoPlay style={{ width: "300px" }} />}
					Your video
				</div>
				<div className="video">
					{callAccepted && !callEnded ?

						<div className="video">
						{peerConnections.map(peer => (
							<div key={peer?.peerId}>
								 
								<br/>
								<video id={peer?.peerId} ref={peer?.streams}  autoPlay style={{ width: "300px",border:"4px"}}/>
						{peer.peerId}'s video
						{handleNewConnection(peer)}

							</div>
 
						
						))} 
						</div>:
					null
					}
					
				</div>
			
			</div>
			<div className="myId">
				
                <button
                onClick={()=>{

                    socket.emit("join_room",{room_id,me,user_name});

                }}
                
                
                >Start procting</button>
            
				
                {me}

				
				<div className="call-button">
					{callAccepted && !callEnded ? (
						<button  color="secondary" onClick={leaveCall}>
							End Call
						</button>
					) :null}
					
				</div>
			</div>
			<div>
				{(receivingCall && !callAccepted||(true)) ? (
					
						<div className="caller">
							{console.log(peerConnections)}
						<h1 >{name} is calling...</h1>
						<button  color="primary" onClick={answerCall}>
							Answer
						</button>
					</div>
				) : null}
			</div>
		</div>
		</>
	)
}

export default App
