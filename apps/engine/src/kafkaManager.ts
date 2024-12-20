import { Kafka, Message, Producer } from "kafkajs";

interface kafkaMessage{
    topic: string
    messages: Message[];
}

export class KafkaManager {
    private producer: Producer
    private static instance: KafkaManager
    private isInitialized:boolean = false;


    private constructor(){
        const kafka = new Kafka({
            clientId:"engine",
            brokers:["localhost:9092"]
        });

        this.producer = kafka.producer();
    }
    
    private async initialize(){
        if(this.isInitialized) return;
        try {
            await this.producer.connect();
            this.isInitialized = true;
        } catch (error) {
            console.error("Failed to initialize kafkaManager:", error);
            throw error;
        }
    }

    public static async getInstance(){
        if(!this.instance){
            this.instance = new KafkaManager()
            await this.instance.initialize()
        }
        return this.instance
    }

    public async publishToKafkaStream(message:kafkaMessage){
        try {
            if(!this.isInitialized){
                await this.initialize();
            }
            await this.producer.send({
                topic:message.topic,
                messages:message.messages.map(msg=>({
                    key: msg.key,
                    value: typeof msg.value === 'string' ? msg.value : JSON.stringify(msg.value)
                }))
            })
            
        } catch (error) {
            console.error('Failed to send message to the stream:', error)
            throw error;
        }
    }
}
