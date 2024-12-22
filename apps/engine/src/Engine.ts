import { KafkaManager } from "./kafkaManager";
import {Category, Market, MarketStatus, Order, OrderBook, OrderStatus, Side, Trade, User } from "./types/inMemDb"
import {v4 as uuidv4} from 'uuid';
import * as bcrypt from 'bcrypt'
import * as jwt from "jsonwebtoken"

const secretKey = process.env.JWT_SECRET!

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
                
                case 'get_all_categories':
                    await this.handleGetAllCategories(request);
                    break;

                default:
                    throw new Error(`Unsupported request type :${request.type}`)           
            }
            
        } catch (error) {
            console.error("Error processing request:", error);
            throw error;
        }
    }

    private findUserByUsername(username:string): User | null{
        for (const user of this.usersMap.values()){
            if(user.username === username){
                return user
            }
        }
        return null;
    }

    private findUserByEmail(email:string): User | null {
        for (const user of this.usersMap.values()){
            if(user.email === email){
                return user
            }
        }
        return null;
    }

    private verifyToken(token:string): string{
        try {
            const decodedToken = jwt.verify(token, secretKey) as jwt.JwtPayload;
            if(!decodedToken.userId){
                throw new Error("Invalid token")
            }

            const user = this.usersMap.get(decodedToken.userId);
            if(!user){
                throw new Error('User not found')
            }

            return decodedToken.userId
            
        } catch (error) {
            if(error instanceof jwt.JsonWebTokenError){
                throw new Error('Invalid token')
            }
            throw error;
        }
    }

    private getCategoryfromTitle(title:string): Category| null{
        for (const category of this.categoriesMap.values()){
            if(category.title === title){
                return category
            }
        }
        return null;
    }

    private async handleSignUp(request:any){
        const {id} = request
        const {username, email, password, role} = request.payload;
        try {
            if(this.findUserByEmail(email)){
                throw new Error('User with this email already exits')
            }
            if(this.findUserByUsername(username)){
                throw new Error("Username already registered")
            }

            const userId = uuidv4()
            const hashedPassword = await bcrypt.hash(password,10)
            const newUser:User ={
                id:userId,
                username,
                email,
                password: hashedPassword,
                role,
                balance:{
                    INR:{
                        available:0,
                        locked:0
                    },
                    stocks:{}
                }
            }
            this.usersMap.set(userId, newUser)
            
            const responsePayload = {
                type: 'signup_response',
                data:{
                    success:true,
                    user:newUser,
                    message: "User created successfully!"
                }
            }

            await KafkaManager.getInstance().publishToKafkaStream({
                topic:"responses",
                messages:[{
                    key:id,
                    value: JSON.stringify(responsePayload)
                }]
            })
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "something went wrong";
            const responsePayload = {
                type:"signup_response",
                data:{
                    success:false,
                    message:errorMessage
                }
            }
            await KafkaManager.getInstance().publishToKafkaStream({
                topic:"responses",
                messages:[{
                    key:id,
                    value:JSON.stringify(responsePayload)
                }]
            })
        }

    }

    private async handleLogin(request:any){
        const {id} = request
        const {email, password} = request.payload;
        try {
           const user = this.findUserByEmail(email)
           if(!user){
            throw new Error("User not found");
           }

           const orginalPassword = await bcrypt.compare(password, user.password)

           if(!orginalPassword){
            throw new Error("Incorrect Password")
           }

           const token = jwt.sign({userId:user.id}, secretKey, { expiresIn: '1h' })

            const responsePayload = {
                type: 'signin_response',
                data:{
                    success:true,
                    token,
                    user,
                    message: "User created successfully!"
                }
            }

            await KafkaManager.getInstance().publishToKafkaStream({
                topic:"responses",
                messages:[{
                    key:id,
                    value: JSON.stringify(responsePayload)
                }]
            })
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "something went wrong";
            const responsePayload = {
                type:"signin_response",
                data:{
                    success:false,
                    message:errorMessage
                }
            }
            await KafkaManager.getInstance().publishToKafkaStream({
                topic:"responses",
                messages:[{
                    key:id,
                    value:JSON.stringify(responsePayload)
                }]
            })
        }
    }

    private async handleGetMe(request:any){
        const {id} = request
        const {token} = request.payload;
        try {
           const userId = this.verifyToken(token)
           const user = this.usersMap.get(userId)
           if(!user){
            throw new Error("User not found");
           }

            const responsePayload = {
                type: 'get_me_response',
                data:{
                    success:true,
                    user,
                    message: "Your details founds"
                }
            }

            await KafkaManager.getInstance().publishToKafkaStream({
                topic:"responses",
                messages:[{
                    key:id,
                    value: JSON.stringify(responsePayload)
                }]
            })
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "something went wrong";
            const responsePayload = {
                type:"get_me_response",
                data:{
                    success:false,
                    message:errorMessage
                }
            }
            await KafkaManager.getInstance().publishToKafkaStream({
                topic:"responses",
                messages:[{
                    key:id,
                    value:JSON.stringify(responsePayload)
                }]
            })
        }
    }

    private async handleGetAllMarkets(request:any){
        const {id} = request
        try {

           const allMarkets = Array.from(this.marketsMap.values())

            const responsePayload = {
                type: 'get_all_markets_response',
                data:{
                    success:true,
                    markets:allMarkets,
                    message: "Markets data found successfully!"
                }
            }

            await KafkaManager.getInstance().publishToKafkaStream({
                topic:"responses",
                messages:[{
                    key:id,
                    value: JSON.stringify(responsePayload)
                }]
            })
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "something went wrong";
            const responsePayload = {
                type:"get_all_markets_response",
                data:{
                    success:false,
                    message:errorMessage
                }
            }
            await KafkaManager.getInstance().publishToKafkaStream({
                topic:"responses",
                messages:[{
                    key:id,
                    value:JSON.stringify(responsePayload)
                }]
            })
        }
    }

    private async handleGetMarket(request:any){
        const {id} = request
        const {marketSymbol} = request.payload;
        try {

           const market = Array.from(this.marketsMap.values()).find(m=>m.symbol === marketSymbol);
           
           if(!market){
            const responsePayload = {
                type: 'get_market_response',
                data:{
                    success: false,
                    message:`Market with symbol '${marketSymbol}" not found!`
                }
            }
            await KafkaManager.getInstance().publishToKafkaStream({
                topic:"responses",
                messages:[{
                    key:id,
                    value:JSON.stringify(responsePayload)
                }]
            })
            return;
           }

            const responsePayload = {
                type: 'get_market_response',
                data:{
                    success:true,
                    market,
                    message: "Market data found successfully!"
                }
            }

            await KafkaManager.getInstance().publishToKafkaStream({
                topic:"responses",
                messages:[{
                    key:id,
                    value: JSON.stringify(responsePayload)
                }]
            })
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "something went wrong";
            const responsePayload = {
                type:"get_market_response",
                data:{
                    success:false,
                    message:errorMessage
                }
            }
            await KafkaManager.getInstance().publishToKafkaStream({
                topic:"responses",
                messages:[{
                    key:id,
                    value:JSON.stringify(responsePayload)
                }]
            })
        }
    }

    private async handleCreateMarket(request:any){
        const {id} = request;
        const{token, symbol, endTime, description, sourceOfTruth, categoryTitle} = request.payload;

        try {
            const userId = this.verifyToken(token);
            const user = this.usersMap.get(userId);

            if(!user){
                throw new Error("User not found")
            }

            if(user.role.toLocaleLowerCase() !== 'admin'){
                throw new Error("Unauthorized")
            }

            const category = this.getCategoryfromTitle(categoryTitle)
            if(!category){
                throw new Error("Category not found!")
            }

            const marketId = uuidv4()

            const newMarket:Market = {
                id:marketId,
                symbol,
                endTime,
                description,
                sourceOfTruth,
                categoryId:category.id,
                categoryTitle:category.title,
                status:MarketStatus.ACTIVE,
                createdBy:userId,
                lastYesPrice:5,
                lastNoPrice:5,
                totalVolume:0,
                timestamp:new Date()
            }

            this.marketsMap.set(marketId, newMarket)

            const responsePayload = {
                type: 'create_market_response',
                data:{
                    success:true,
                    market:newMarket,
                    message:"Marker created successfully"
                }
            }

            await KafkaManager.getInstance().publishToKafkaStream({
                topic:"responses",
                messages:[{
                    key:id,
                    value:JSON.stringify(responsePayload)
                }]
            })

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "something went wrong";
            const responsePayload = {
                type:"create_market_response",
                data:{
                    success:false,
                    message:errorMessage
                }
            }
            await KafkaManager.getInstance().publishToKafkaStream({
                topic:"responses",
                messages:[{
                    key:id,
                    value:JSON.stringify(responsePayload)
                }]
            })
        }
    }

    private async handleGetAllCategories(request:any){
            const {id} = request
        try {

           const allCategories = Array.from(this.categoriesMap.values())

            const responsePayload = {
                type: 'get_all_categories_response',
                data:{
                    success:true,
                    markets:allCategories,
                    message: "Categories data found successfully!"
                }
            }

            await KafkaManager.getInstance().publishToKafkaStream({
                topic:"responses",
                messages:[{
                    key:id,
                    value: JSON.stringify(responsePayload)
                }]
            })
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "something went wrong";
            const responsePayload = {
                type:"get_all_categories_response",
                data:{
                    success:false,
                    message:errorMessage
                }
            }
            await KafkaManager.getInstance().publishToKafkaStream({
                topic:"responses",
                messages:[{
                    key:id,
                    value:JSON.stringify(responsePayload)
                }]
            })
        }
    }
    private async handleCreateCategory(request:any){
        const {id} = request;
        const{token, title, icon, description} = request.payload;
        
        try {
            const userId = this.verifyToken(token);
            const user = this.usersMap.get(userId);

            if(!user){
                throw new Error("User not found")
            }

            if(user.role.toLocaleLowerCase() !== 'admin'){
                throw new Error("Unauthorized")
            }

            const category = this.getCategoryfromTitle(title)
            if(!category){
                throw new Error("Category not found!")
            }

            const categoryId = uuidv4()

            const newCategory:Category = {
                    id: categoryId,
                    title,
                    icon,
                    description
            }

            this.categoriesMap.set(categoryId, newCategory)

            const responsePayload = {
                type: 'create_category_response',
                data:{
                    success:true,
                    category:newCategory,
                    message:"Category created successfully"
                }
            }

            await KafkaManager.getInstance().publishToKafkaStream({
                topic:"responses",
                messages:[{
                    key:id,
                    value:JSON.stringify(responsePayload)
                }]
            })

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "something went wrong";
            const responsePayload = {
                type:"create_category_response",
                data:{
                    success:false,
                    message:errorMessage
                }
            }
            await KafkaManager.getInstance().publishToKafkaStream({
                topic:"responses",
                messages:[{
                    key:id,
                    value:JSON.stringify(responsePayload)
                }]
            })
        }
    }

    private async handleSellOrder(request:any){

    }
    private async handleBuyOrder(request:any){

    }
    private async handleOnrampInr(request:any){

    }


    private async handleCancelBuyOrder(request:any){

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