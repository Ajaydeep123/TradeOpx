import { WebSocket, WebSocketServer } from "ws";
import {Consumer, Kafka} from 'kafkajs'

interface WebSocketClient extends WebSocket {
    subscribeMarkets: Set<string>
}

class WSServer {
    private static instance: WSServer;
    private wss: WebSocketServer;
    private consumer: Consumer;
    private clients: Set<WebSocketClient>;

    private constructor(){
        this.wss = new WebSocketServer({port:8080});
        this.clients = new Set()

        const kafka = new Kafka({
            clientId:'ws-server',
            brokers:["localhost:9092"]
        })

        this.consumer = kafka.consumer({
            groupId:"websocket-server-group"
        })

        this.initialize()
    }

    public static getInstance(){
        if(!this.instance){
            this.instance = new WSServer()
        }
        return this.instance;
    }

    private async initialize(){
        this.wss.on('connection', (ws: WebSocketClient)=>{
            console.log('client connected');
            ws.subscribeMarkets = new Set();
            this.clients.add(ws);

            ws.on('message',(message:string)=>{
                console.log("listening to message", message);
                try {
                    const data = JSON.parse(message);
                    console.log(data)
                    if(data.type === 'subscribe'){
                        console.log('subscribing', data.marketSymbol);
                        ws.subscribeMarkets.add(data.marketSymbol)
                        console.log('subscribed');
                    }else if (data.type === "unsubscribe"){
                        ws.subscribeMarkets.delete(data.marketSymbol)
                        console.log('unsubscribed');   
                    } 
                } catch (error) {
                    console.error('Error processing the ws message', error)
                }
            })

            ws.on('close', ()=>{
                this.clients.delete(ws);
                console.log("client disconnected");
            })
            
        })

        await this.consumer.connect();
        await this.consumer.subscribe({topics:['market-updates', 'orderbook-updates'], fromBeginning:false})

        await this.consumer.run({
            eachMessage: async ({topic,message}) => {
                console.log("topic", topic);
                if(!message.value || !message.key) return;

                const data = JSON.parse(message.value.toString());

                const marketSymbol = message.key.toString();
                this.broadcast(topic, data, marketSymbol)                
            }
        })
    }

    private async broadcast(topic:string, data:any, marketSymbol: string){
        this.clients.forEach(client =>{
            if(client.subscribeMarkets.has(marketSymbol)){
                console.log(client.subscribeMarkets);
                const payload = {
                    topic,
                    data
                }
                client.send(JSON.stringify(payload))         
            }
        })
    }  
}

async function main() {
    try {
        const wsServer = WSServer.getInstance();
    } catch (error) {
        console.error('Failed to start WebSocket server:', error);
    }
}