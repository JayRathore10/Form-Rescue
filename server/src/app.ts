import { authRouter } from "./routes/auth.route";
import express  , {Request , Response} from "express";

const app = express();

app.use(express.json());




app.use("/uploads",express.static("uploads"));

app.get("/"  , (req : Request, res : Response)=>{
  res.send("Hi, Jexts here!")
})


app.use("/api/v1",authRouter);

export default app;
