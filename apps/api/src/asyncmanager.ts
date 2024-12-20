import { createClient, RedisClientType } from "redis";
import {Consumer, Kafka} from "kafkajs";
import {RequestPayload} from "./types"
import {v4 as uuidv4} from 'uuid'

export class AsyncManager {
    private static instance : AsyncManager;
    private consumer: Consumer;
    private queue : RedisClientType;
    private messageHandlers : Map<string, (value:any) => void>;
    private isInitialized : boolean = false ;

    private constructor() {
        const kafka = new Kafka({
            clientId:'api-server',
            brokers:["localhost:9092"]
        });

        this.queue = createClient();   //mention redis url in case if the redis instance is running on any other port than 6379
        this.consumer = kafka.consumer({groupId:'api-server-group'});
        this.messageHandlers = new Map();
    }

    private async initialize(){
        if (this.isInitialized) return;

        try {
            await this.queue.connect();
            await this.consumer.connect();
            await this.consumer.subscribe({
                topic:"responses",
                fromBeginning: false
            })    

            await this.consumer.run({
                eachMessage: async ({message}) =>{
                    if(!message.key || !message.value) return;

                    const id = message.key.toString();

                    const handler = this.messageHandlers.get(id);

                    if(handler){
                        try {
                            const value = JSON.parse(message.value.toString());
                            handler(value);
                        } catch (error) {
                            console.error("Failed to parse the message", error);
                            handler({error:"Couldn't parse the response"});
                        }finally{
                            this.messageHandlers.delete(id);
                        }
                    }
                }
            });

            this.isInitialized = true;            
        } catch (error) {
            console.error("Initialization failed!");
            throw error;
        }
    }

    public static getInstance(): AsyncManager{
        if(!AsyncManager.instance){
            AsyncManager.instance = new AsyncManager();
        }
        return AsyncManager.instance;
    }

    public async sendAndAwait(request:RequestPayload): Promise<any>{
        if(!this.isInitialized){
            await this.initialize();
        }

        return new Promise(async (resolve,reject)=>{
            const id = uuidv4()

            const timeoutId = setTimeout(()=>{
                if(this.messageHandlers.has(id)){
                    this.messageHandlers.delete(id);
                    reject(new Error(`Request timed out for ${request.type}`));
                }
            },120000);

            this.messageHandlers.set(id, (value)=>{
                clearTimeout(timeoutId);
                resolve(value);
            })

            try {
                await this.queue.lPush('requests', JSON.stringify({
                    ...request,
                    id
                }));
            } catch (error) {
                clearTimeout(timeoutId);
                this.messageHandlers.delete(id);
                const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
                reject(new Error(`Failed to send request: ${errorMessage}`));
            }
        })
        
    }
}