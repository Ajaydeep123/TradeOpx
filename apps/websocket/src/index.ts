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

        this.consumer.on('consumer.crash', (error)=>{
            console.error('kafka consumer crashed', error);
            
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

    public async shutdown(){
        console.log('Initiating server shutdown......');

        for (const client of this.clients){
            client.close(1000, 'Shutting down the server ')
        }
        this.clients.clear();

        try {
            await this.consumer.disconnect();
        } catch (error) {
            console.error('Error disconnecting kafka consumer:', error);
        }

        this.wss.close((error)=>{
            if(error){
                console.error('Failed to close the websocket server:', error);
            }else{
                console.log('Server shutdown complete');
            }
        });
    }
}

async function main() {
    try {
        const wsServer = WSServer.getInstance();
        
        ['SIGINT', 'SIGTERM'].forEach(signal =>{
            process.on(signal, async()=>{
                console.log(`Received ${signal}, Initiating server shutdown...`);
                await wsServer.shutdown();
                process.exit(0);
            })
        })
    } catch (error) {
        console.error('Failed to start WebSocket server:', error);
    }
}