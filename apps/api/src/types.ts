declare global {
    namespace Express {
      export interface Request {
        token?:string
      }
    }
}

type signUpReq = {
    type : "signup",
    payload:{
        username:string,
        email:string,
        password:string,
        role:string
    }
}

type loginReq = {
    type: "signin",
    payload:{
        email:string,
        password:string
    }
}

type getMarkets = {
    type:"get_all_markets",
}

type getCategories = {
    type:"get_all_categories"
}

type getMarket = {
    type:"get_market",
    payload:{
        marketSymbol: string  
    }
}

type createMarket = {
    type:"create_market",
    payload:{
        token:string,
        symbol:string,
        endTime:Date,
        description:string,
        sourceOfTruth:string,
        categoryTitle:string
    }
}

type createCategory = {
    type:"create_category",
    payload:{
        token:string,
        title:string,
        icon:string,
        description:string
    }
}

type onRampInr = {
    type:"onramp_inr",
    payload:{
        token:string,
        amount: number
    }
}

type buyReq = {
    type:"buy",
    payload:{
        token:string,
        symbol:string,
        quantity:number,
        price:number,
        stockType:'YES'|"NO"
    }
}

type sellReq = {
    type : "sell",
    payload:{
        token: string,
        symbol:string,
        quantity:number,
        price:number,
        stockType:"YES"|"NO"
    }
}

type getOrderbook ={
    type: "get_orderbook",
    payload:{
        token: string,
        symbol:string
    }
}

type mintReq = {
    type:"mint",
    payload:{
        token: string,
        symbol:string,
        quantity:number,
        price:number,
    }
}

type getMe = {
    type: "get_me",
    payload:{
        token:string
    }
}

type cancelOrder= {
    type:"cancel_sell_order" | "cancel_buy_order",
    payload:{
        token:string,
        orderId:string,
        marketSymbol:string
    }
}

type getUserMarketOrders = {
    type:"get_user_market_orders",
    payload:{
        token: string,
        marketSymbol:string
    }
}

type getMarketTrades = {
    type:"get_market_trades",
    payload:{
        token:string,
        marketSymbol:string
    }
}



export type RequestPayload = signUpReq | loginReq | getMe |getCategories |getMarket | getMarketTrades | getUserMarketOrders | getOrderbook |cancelOrder | buyReq | sellReq | mintReq | onRampInr | getMarkets | createCategory | createMarket