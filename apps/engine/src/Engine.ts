import { KafkaManager } from "./kafkaManager";
import {Category, Market, MarketStatus, Order, OrderBook, OrderStatus, Side, Trade, User } from "./types/inMemDb"
import {v4 as uuidv4} from 'uuid';
import * as bcrypt from 'bcrypt'
import * as jwt from "jsonwebtoken"

const secret = process.env.JWT_SECRET!

export class Engine {
    private static instance : Engine;
    private usersMap: Map<string, User>;
    private marketsMap: Map<string, Market>;
    private categoriesMap: Map<string, Category>;
    private buyOrders: Map<string,Order[]>;
    private sellOrders: Map<string, Order[]>;
    private tradeHistory: Map<string, Trade[]>;

    private constructor(){
        this.usersMap = new Map()
        this.marketsMap = new Map()
        this.categoriesMap= new Map()
        this.buyOrders = new Map()
        this.sellOrders = new Map()
        this.tradeHistory = new Map()
    }

    public static getInstance(){
        if(!this.instance){
            this.instance = new Engine();
        }
        return this.instance
    }

    public async processReq(request : any){
        try {
            switch (request.type){
                case 'signup':
                    await this.handleSignUp(request);
                    break;
                
                case 'login':
                    await this.handleLogin(request);
                    break;
                
                case 'get_all_markets':
                    await this.handleGetAllMarkets(request);
                    break;
                case 'get_market':
                    await this.handleGetMarket(request);
                    break;

                case 'create_market':
                    await this.handleCreateMarket(request);
                    break;
                
                case 'create_category':
                    await this.handleCreateCategory(request);
                    break;
                
                case 'onramp_inr':
                    await this.handleOnrampInr(request);
                    break;

                case 'buy':
                    await this.handleBuyOrder(request);
                    break;
                
                case 'sell':
                    await this.handleSellOrder(request);
                    break;

                case 'get_orderbook':
                    await this.handleGetOrderbook(request);
                    break;
                
                case 'mint':
                    await this.handleMint(request);
                    break;
                
                case 'get_me':
                    await this.handleGetMe(request);
                    break;
                
                case 'cancel_buy_order':
                    await this.handleCancelBuyOrder(request);
                    break;

                case 'cancel_sell_order':
                    await this.handleSellOrder(request);
                    break;

                case 'get_user_market_orders':
                    await this.handleGetUserOrders(request);
                    break;
                
                case 'get_market_trades':
                    await this.handleGetMarketTrades(request);
                    break;

                default:
                    throw new Error(`Unsupported request type :${request.type}`)           
            }
            
        } catch (error) {
            console.error("Error processing request:", error);
            throw error;
        }
    }

    private async handleSignUp(request:any){

    }

    private async handleLogin(request:any){

    }

    private async handleGetAllMarkets(request:any){

    }

    private async handleGetMarket(request:any){

    }

    private async handleCreateMarket(request:any){

    }

    private async handleSellOrder(request:any){

    }
    private async handleBuyOrder(request:any){

    }
    private async handleOnrampInr(request:any){

    }
    private async handleCreateCategory(request:any){

    }
    private async handleCancelBuyOrder(request:any){

    }
    private async handleGetMe(request:any){

    }
    private async handleMint(request:any){

    }
    private async handleGetOrderbook(request:any){

    }
    private async handleGetMarketTrades(request:any){

    }
    private async handleGetUserOrders(request:any){

    }

}