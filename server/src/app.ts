import authRoute from "./routes/auth.route";

import express  , {Request , Response} from "express";

const app = express();

app.use(express.json());


app.use(
  "/api/auth",
  authRoute
);



app.get("/"  , (req : Request, res : Response)=>{
  res.send("Hi, Jexts here!")
})

export default app;
